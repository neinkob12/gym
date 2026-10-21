// Gym-Geräte aus Low-Poly-Bausteinen (in den Kenney-Paketen gibt es keine Fitnessgeräte).
// Koordinaten sind relativ zur Gym-Ecke wie im Prototyp; die Gruppe wird um GYM_OFFSET verschoben.

import * as THREE from "three";
import type { Equipment } from "../sim/game";
import { GYM_OFFSET } from "../sim/map";
import { B, HS, geo, mat, mesh } from "./kit";
import { PAL } from "./palette";

export interface EquipmentView {
  group: THREE.Group;
  update(e: Equipment, inUse: boolean, dt: number): void;
}

export function buildEquipment(e: Equipment): EquipmentView {
  const g = new THREE.Group();
  g.position.set(GYM_OFFSET.x, 0, GYM_OFFSET.y);
  const kind = e.def.kind;
  let update: EquipmentView["update"] = () => {};

  if (kind === "db") {
    B(g, 1.08, 2.08, 0.1, 0.5, 20, 0, PAL.metal); B(g, 2.82, 2.08, 0.1, 0.5, 20, 0, PAL.metal);
    B(g, 1.08, 2.1, 1.84, 0.5, 2, 5, PAL.metal); B(g, 1.08, 2.1, 1.84, 0.32, 2, 14, PAL.metal);
    for (let i = 0; i < 5; i++) {
      const x = 1.2 + i * 0.34;
      B(g, x, 2.12, 0.14, 0.08, 4, 16, PAL.plate); B(g, x + 0.05, 2.2, 0.04, 0.12, 2, 17, PAL.chrome); B(g, x, 2.32, 0.14, 0.08, 4, 16, PAL.plate);
    }
    let missing: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const x = 1.18 + i * 0.42, h = 5 + i;
      const parts = [B(g, x, 2.12, 0.18, 0.1, h, 7, PAL.plate), B(g, x + 0.06, 2.22, 0.06, 0.24, 2, 8, PAL.chrome), B(g, x, 2.46, 0.18, 0.1, h, 7, PAL.plate)];
      if (i === 2) missing = parts;
    }
    update = (_e, inUse) => { for (const m of missing) m.visible = !inUse; };
  } else if (kind === "bench") {
    B(g, 1.3, 5.42, 0.12, 0.16, 8, 0, PAL.metal); B(g, 2.58, 5.42, 0.12, 0.16, 8, 0, PAL.metal);
    B(g, 1.3, 5.42, 1.4, 0.16, 2, 6, PAL.metal);
    B(g, 1.12, 5.3, 1.76, 0.4, 3, 8, PAL.pad, PAL.padHi);
  } else if (kind === "lat") {
    B(g, 1.12, 8.15, 0.76, 1.7, 2, 0, PAL.metal);
    B(g, 1.18, 8.2, 0.18, 0.18, 48, 0, PAL.metal);
    B(g, 1.44, 8.22, 0.26, 0.24, 26, 2, PAL.chromeDk);
    B(g, 1.18, 8.2, 0.18, 1.0, 3, 46, PAL.metal);
    B(g, 1.32, 9.45, 0.08, 0.08, 10, 0, PAL.metal);
    B(g, 1.16, 9.3, 0.4, 0.42, 3, 10, PAL.pad, PAL.padHi);
    const bar = B(g, 0.92, 9.12, 0.72, 0.06, 2, 40, PAL.chrome);
    const cable = mesh(geo(0.02, 1, 0.02), mat(PAL.chromeDk), 1.27, 0, 9.15, g);
    update = (q, inUse) => {
      const z = inUse ? 40 - q.phase * 12 : 40;
      bar.position.y = (z + 1) * HS;
      const len = 46 * HS - z * HS;
      cable.scale.y = Math.max(0.01, len); cable.position.y = z * HS + len / 2;
    };
  } else if (kind === "rack") {
    for (const [x, y] of [[6.15, 2.15], [7.75, 2.15], [6.15, 3.75], [7.75, 3.75]] as const) B(g, x, y, 0.1, 0.1, 46, 1, PAL.metal);
    B(g, 6.15, 2.15, 1.7, 0.1, 3, 46, PAL.metal); B(g, 6.15, 3.75, 1.7, 0.1, 3, 46, PAL.metal);
    B(g, 6.15, 2.15, 0.1, 1.7, 3, 46, PAL.metal); B(g, 7.75, 2.15, 0.1, 1.7, 3, 46, PAL.metal);
    const idle = new THREE.Group(); g.add(idle);
    B(idle, 5.75, 2.93, 2.5, 0.05, 2, 28, PAL.chrome);
    B(idle, 5.92, 2.74, 0.1, 0.44, 16, 21, PAL.plate); B(idle, 6.04, 2.78, 0.06, 0.36, 12, 23, PAL.bumper);
    B(idle, 7.98, 2.74, 0.1, 0.44, 16, 21, PAL.plate); B(idle, 7.9, 2.78, 0.06, 0.36, 12, 23, PAL.bumper);
    update = (_e, inUse) => { idle.visible = !inUse; };
  } else if (kind === "tm") {
    const x = e.def.local.x;
    B(g, x + 0.18, 7.22, 0.64, 1.66, 3, 0, PAL.metal);
    const c = document.createElement("canvas"); c.width = 16; c.height = 64;
    const k = c.getContext("2d")!;
    k.fillStyle = PAL.belt; k.fillRect(0, 0, 16, 64); k.fillStyle = "#4a535f";
    for (let i = 0; i < 64; i += 8) k.fillRect(0, i, 16, 2);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1, 3);
    const belt = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1.56), new THREE.MeshLambertMaterial({ map: tex }));
    belt.rotation.x = -Math.PI / 2; belt.position.set(x + 0.5, 3 * HS + 0.003, 8.05); belt.receiveShadow = true; g.add(belt);
    B(g, x + 0.2, 7.26, 0.06, 0.06, 22, 3, PAL.metal); B(g, x + 0.74, 7.26, 0.06, 0.06, 22, 3, PAL.metal);
    B(g, x + 0.14, 7.18, 0.72, 0.22, 5, 25, PAL.metal);
    const screen = B(g, x + 0.3, 7.22, 0.4, 0.12, 1, 30, PAL.plate);
    B(g, x + 0.14, 7.5, 0.72, 0.04, 2, 22, PAL.chrome);
    update = (q, inUse, dt) => {
      const on = inUse && !q.broken;
      if (on) tex.offset.y -= dt * 2.2;
      screen.material = mat(on ? PAL.screen : PAL.plate);
    };
  } else {
    B(g, 8.3, 2.3, 0.4, 0.4, 22, 0, "#ffffff");
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.42, 12), new THREE.MeshLambertMaterial({ color: "#7fc1ff", transparent: true, opacity: 0.85 }));
    bottle.position.set(8.5, 22 * HS + 0.21, 2.5); g.add(bottle);
    B(g, 8.52, 2.68, 0.06, 0.04, 2, 14, "#e5484d"); B(g, 8.4, 2.68, 0.06, 0.04, 2, 14, "#3ea0ff");
  }
  return { group: g, update };
}

// Kantige Figuren auf Basis von Kenney "Blocky Characters", Outfits siehe outfits.ts.
// Übungen entstehen durch Überblenden zweier fertiger Animationen im Takt der Übung (z. B. Stehen <-> Sitzen).

import * as THREE from "three";
import type { Equipment, Person } from "../sim/game";
import { GYM_OFFSET } from "../sim/map";
import { character } from "./assets";
import { HS, geo, mat, mesh } from "./kit";
import { PAL } from "./palette";

const SCALE = 0.4;
/** Etwas kleinerer Kopf und längere Beine als im Original wirken erwachsener */
const HEAD = 0.085, LEGS = 1.12;
const CLIPS = ["idle", "walk", "sprint", "sit", "holding-both", "interact-right", "pick-up"] as const;
type ClipName = (typeof CLIPS)[number];

export class CharacterView {
  readonly root = new THREE.Group();
  private readonly model: THREE.Object3D;
  private readonly mixer: THREE.AnimationMixer;
  private readonly actions = new Map<ClipName, THREE.AnimationAction>();
  private readonly weights = new Map<ClipName, number>();
  private readonly dbL: THREE.Object3D;
  private readonly dbR: THREE.Object3D;
  private readonly barbell: THREE.Object3D;
  private readonly wrench: THREE.Object3D;

  constructor(p: Person) {
    this.root.rotation.order = "YXZ";
    const { scene, clips } = character(p.type, p.model);
    this.model = scene;
    this.model.scale.setScalar(SCALE);
    this.model.getObjectByName("head")?.scale.setScalar(HEAD);
    for (const n of ["leg-left", "leg-right"]) this.model.getObjectByName(n)?.scale.set(1, LEGS, 1);
    this.model.position.y = (LEGS - 1) * SCALE;
    this.root.add(this.model);
    this.mixer = new THREE.AnimationMixer(this.model);
    for (const name of CLIPS) {
      const clip = clips.find((c) => c.name === name);
      if (!clip) continue;
      const a = this.mixer.clipAction(clip);
      a.setEffectiveWeight(name === "idle" ? 1 : 0).play();
      this.actions.set(name, a);
      this.weights.set(name, name === "idle" ? 1 : 0);
    }
    const armL = this.model.getObjectByName("arm-left");
    const armR = this.model.getObjectByName("arm-right");

    const k = 1 / SCALE;
    // Hand sitzt am unteren Ende des Arms, mittig im Armquerschnitt
    const dumbbell = (arm: THREE.Object3D | undefined, side: number) => {
      const g = new THREE.Group();
      g.position.set(side * 0.2, -1.02, 0);
      mesh(geo(0.14 * k, 0.03 * k, 0.03 * k), mat(PAL.chrome), 0, 0, 0, g);
      mesh(geo(0.04 * k, 0.07 * k, 0.07 * k), mat(PAL.plate), 0.08 * k, 0, 0, g);
      mesh(geo(0.04 * k, 0.07 * k, 0.07 * k), mat(PAL.plate), -0.08 * k, 0, 0, g);
      (arm ?? this.model).add(g);
      return g;
    };
    this.dbL = dumbbell(armL, 1);
    this.dbR = dumbbell(armR, -1);
    this.barbell = new THREE.Group();
    this.barbell.position.set(0, 0.62, -0.12);
    mesh(geo(1.4, 0.035, 0.035), mat(PAL.chrome), 0, 0, 0, this.barbell);
    for (const s of [-1, 1]) {
      mesh(geo(0.05, 0.32, 0.32), mat(PAL.plate), s * 0.58, 0, 0, this.barbell);
      mesh(geo(0.035, 0.24, 0.24), mat(PAL.bumper), s * 0.53, 0, 0, this.barbell);
    }
    this.root.add(this.barbell);
    this.wrench = mesh(geo(0.03 * k, 0.03 * k, 0.18 * k), mat(PAL.chromeDk), -0.2, -1.02, 0.1, armR ?? this.model);
    this.model.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });
  }

  update(p: Person, eq: Equipment | null, dt: number) {
    const want: Partial<Record<ClipName, number>> = {};
    let yaw = p.yaw, y = 0, pitch = 0;
    this.dbL.visible = this.dbR.visible = this.barbell.visible = this.wrench.visible = false;
    let x = p.x, z = p.z;
    const phase = eq?.phase ?? 0;

    switch (p.pose) {
      case "run": yaw = Math.PI; want.sprint = 1; break;
      case "curl":
        yaw = 0; want.idle = 1 - phase; want["holding-both"] = phase; this.dbL.visible = this.dbR.visible = true;
        break;
      case "squat":
        // Kniebeuge: halb ins Sitzen überblenden
        yaw = 0; want.idle = 1 - phase * 0.65; want.sit = phase * 0.65; this.barbell.visible = true;
        break;
      case "bench":
        // auf der Bank liegen: Kopf Richtung Wand, Hanteln nach oben drücken
        x = GYM_OFFSET.x + 2.85; z = GYM_OFFSET.y + 5.5; y = 11 * HS + 0.25; yaw = Math.PI / 2; pitch = -Math.PI / 2;
        want["holding-both"] = 0.4 + phase * 0.6; want.idle = 0.6 - phase * 0.6; this.dbL.visible = this.dbR.visible = true;
        break;
      case "lat": yaw = Math.PI; y = 0.12; want.sit = 1; break;
      case "drink": yaw = Math.PI; want["interact-right"] = 1; break;
      case "repair": want["pick-up"] = 1; this.wrench.visible = true; break;
      default:
        if (p.moving) want.walk = 1; else want.idle = 1;
    }

    // Animationen weich überblenden
    for (const name of CLIPS) {
      const a = this.actions.get(name);
      if (!a) continue;
      const cur = this.weights.get(name) ?? 0, target = want[name] ?? 0;
      const w = cur + (target - cur) * Math.min(1, dt * 10);
      this.weights.set(name, w);
      a.setEffectiveWeight(w);
    }
    this.mixer.update(dt);

    this.root.position.set(x, y, z);
    this.root.rotation.set(pitch, yaw, 0);
  }

  dispose() {
    this.mixer.stopAllAction();
    this.root.removeFromParent();
    // Material gehört nur dieser Figur, die Textur wird geteilt und bleibt
    const body = this.model.getObjectByName("torso") as THREE.Mesh | undefined;
    (body?.material as THREE.Material | undefined)?.dispose();
  }
}

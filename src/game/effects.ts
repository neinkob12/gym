// Sprites und kurze Effekte: Sprechblasen-Icons, Geldscheine, Funkeln, Rauch, Markierungsring, Müll mit Pfeil.

import * as THREE from "three";
import type { BubbleIcon, Litter } from "../sim/game";
import { canvasTexture, geo, mat, mesh } from "./kit";
import { PAL } from "./palette";

function bubbleTex(icon: (k: CanvasRenderingContext2D) => void, bg = "#ffffff") {
  return canvasTexture((k) => {
    k.fillStyle = "rgba(0,0,0,.18)"; k.beginPath(); k.ellipse(64, 60, 50, 46, 0, 0, 7); k.fill();
    k.fillStyle = bg; k.beginPath(); k.ellipse(64, 54, 48, 44, 0, 0, 7); k.fill();
    k.beginPath(); k.moveTo(52, 92); k.lineTo(64, 116); k.lineTo(76, 92); k.fill();
    icon(k);
  });
}

export const ICONS: Record<BubbleIcon | "broken", THREE.Texture> = {
  wait: bubbleTex((k) => {
    k.fillStyle = "#f0a91c";
    k.beginPath(); k.moveTo(42, 28); k.lineTo(86, 28); k.lineTo(64, 54); k.closePath(); k.fill();
    k.beginPath(); k.moveTo(42, 80); k.lineTo(86, 80); k.lineTo(64, 54); k.closePath(); k.fill();
    k.fillStyle = "#24303c"; k.fillRect(38, 22, 52, 7); k.fillRect(38, 79, 52, 7);
  }),
  heart: bubbleTex((k) => { k.fillStyle = "#ff4d6d"; k.beginPath(); k.moveTo(64, 82); k.bezierCurveTo(20, 54, 34, 18, 64, 38); k.bezierCurveTo(94, 18, 108, 54, 64, 82); k.fill(); }),
  angry: bubbleTex((k) => { k.strokeStyle = "#ffffff"; k.lineWidth = 12; k.lineCap = "round"; k.beginPath(); k.moveTo(44, 34); k.lineTo(84, 74); k.moveTo(84, 34); k.lineTo(44, 74); k.stroke(); }, "#e5484d"),
  wrench: bubbleTex((k) => { k.strokeStyle = "#64707c"; k.lineWidth = 14; k.lineCap = "round"; k.beginPath(); k.moveTo(46, 74); k.lineTo(80, 40); k.stroke(); k.beginPath(); k.arc(82, 36, 12, 0, 7); k.stroke(); }),
  broken: bubbleTex((k) => { k.fillStyle = "#ffffff"; k.fillRect(57, 24, 14, 38); k.beginPath(); k.arc(64, 76, 8, 0, 7); k.fill(); }, "#e5484d"),
  spa: bubbleTex((k) => {
    k.fillStyle = "#3ea0ff"; k.beginPath(); k.ellipse(64, 66, 30, 14, 0, 0, 7); k.fill();
    k.strokeStyle = "#3ea0ff"; k.lineWidth = 6;
    for (const x of [50, 64, 78]) { k.beginPath(); k.moveTo(x, 50); k.quadraticCurveTo(x - 8, 40, x, 30); k.stroke(); }
  }),
};
const BILL = canvasTexture((k) => {
  k.fillStyle = "#1f8d4e"; k.fillRect(8, 30, 112, 68); k.fillStyle = "#33c46f"; k.fillRect(14, 36, 100, 56);
  k.fillStyle = "#1f8d4e"; k.font = "bold 44px sans-serif"; k.textAlign = "center"; k.textBaseline = "middle"; k.fillText("€", 64, 66);
});
const SMOKE = canvasTexture((k) => {
  const g = k.createRadialGradient(64, 64, 4, 64, 64, 60);
  g.addColorStop(0, "rgba(140,145,155,1)"); g.addColorStop(1, "rgba(140,145,155,0)");
  k.fillStyle = g; k.fillRect(0, 0, 128, 128);
});
const SPARK = canvasTexture((k) => {
  k.fillStyle = "#ffffff"; k.beginPath(); k.moveTo(64, 6);
  k.quadraticCurveTo(70, 58, 122, 64); k.quadraticCurveTo(70, 70, 64, 122); k.quadraticCurveTo(58, 70, 6, 64); k.quadraticCurveTo(58, 58, 64, 6); k.fill();
});

export function sprite(tex: THREE.Texture, size: number): THREE.Sprite {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  s.scale.setScalar(size);
  s.renderOrder = 10;
  return s;
}

interface Particle { obj: THREE.Object3D; t: number; life: number; v: THREE.Vector3; grow: number; ring?: boolean }

export class Effects {
  private readonly particles: Particle[] = [];
  readonly ring: THREE.Mesh;
  private readonly arrowMat = new THREE.MeshLambertMaterial({ color: PAL.trim, emissive: "#0e2a2a" });
  private readonly arrowGeo = new THREE.ConeGeometry(0.13, 0.26, 4);

  constructor(private readonly scene: THREE.Scene) {
    this.ring = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.9, 40), new THREE.MeshBasicMaterial({ color: PAL.accent, transparent: true, opacity: 0.85, depthWrite: false }));
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.visible = false;
    scene.add(this.ring);
  }

  private add(obj: THREE.Object3D, life: number, v: THREE.Vector3, grow = 0, ring = false) {
    this.scene.add(obj);
    this.particles.push({ obj, t: life, life, v, grow, ring });
  }

  bill(x: number, z: number) {
    const s = sprite(BILL, 0.42);
    s.position.set(x, 1.15, z);
    this.add(s, 1.2, new THREE.Vector3((Math.random() - 0.5) * 0.6, 1.2, 0));
  }

  smoke(x: number, z: number) {
    const s = sprite(SMOKE, 0.4);
    s.position.set(x + (Math.random() - 0.5) * 0.6, 0.6, z + (Math.random() - 0.5) * 0.6);
    this.add(s, 1.4, new THREE.Vector3(0, 0.6, 0), 0.3);
  }

  /** kurzer Funkel-Effekt statt einer Text-Meldung */
  sparkle(x: number, z: number, color = "#9ff3ea") {
    for (let i = 0; i < 9; i++) {
      const s = sprite(SPARK, 0.22);
      (s.material as THREE.SpriteMaterial).color.set(i % 3 === 0 ? "#ffffff" : color);
      const a = (i / 9) * Math.PI * 2;
      s.position.set(x, 0.15, z);
      this.add(s, 0.65, new THREE.Vector3(Math.cos(a) * 0.9, 0.6 + Math.random() * 0.6, Math.sin(a) * 0.9), -0.15);
    }
    const r = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.16, 28), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, depthWrite: false }));
    r.rotation.x = -Math.PI / 2; r.position.set(x, 0.02, z);
    this.add(r, 0.5, new THREE.Vector3(), 0, true);
  }

  /** Liegengelassenes Zeug mit hüpfendem Pfeil darüber */
  litterMesh(l: Litter): { item: THREE.Object3D; arrow: THREE.Mesh } {
    const g = new THREE.Group();
    g.position.set(l.tx + l.ox, 0, l.ty + l.oz);
    g.rotation.y = (l.id * 1.7) % Math.PI;
    if (l.kind === "db") {
      mesh(geo(0.24, 0.04, 0.04), mat(PAL.chrome), 0, 0.06, 0, g);
      mesh(geo(0.06, 0.12, 0.12), mat(PAL.plate), -0.12, 0.06, 0, g);
      mesh(geo(0.06, 0.12, 0.12), mat(PAL.plate), 0.12, 0.06, 0, g);
    } else if (l.kind === "towel") {
      mesh(geo(0.34, 0.03, 0.22), mat("#ffffff"), 0, 0.015, 0, g);
      mesh(geo(0.34, 0.032, 0.04), mat(PAL.accent), 0, 0.016, 0.07, g);
    } else {
      const b = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 8), mat("#5bc0ff"), 0, 0.05, 0, g);
      b.rotation.z = Math.PI / 2;
    }
    const arrow = new THREE.Mesh(this.arrowGeo, this.arrowMat);
    arrow.rotation.x = Math.PI;
    arrow.position.set(l.tx + l.ox, 0.6, l.ty + l.oz);
    this.scene.add(g, arrow);
    return { item: g, arrow };
  }

  update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!;
      p.t -= dt;
      const k = Math.max(0, p.t / p.life);
      p.obj.position.addScaledVector(p.v, dt);
      const m = (p.obj as THREE.Mesh | THREE.Sprite).material as THREE.Material & { opacity: number };
      if (p.ring) { p.obj.scale.setScalar(1 + (1 - k) * 4.5); m.opacity = k * 0.9; }
      else { m.opacity = Math.min(1, k * 2); if (p.grow) p.obj.scale.addScalar(p.grow * dt); }
      if (p.t <= 0) { this.scene.remove(p.obj); this.particles.splice(i, 1); }
    }
  }
}

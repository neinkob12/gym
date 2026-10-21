// Figur in der Szene: baut den Körper (figure.ts) und bewegt die Gelenke per Code.
// Jede Haltung ist eine Funktion der Zeit und der Übungsphase, Wechsel werden weich überblendet.

import * as THREE from "three";
import type { Equipment, Person } from "../sim/game";
import { GYM_OFFSET } from "../sim/map";
import { HIP_Y, HAND, LF, LS, LT, buildFigure, disposeFigure, type Rig } from "./figure";
import { HS, geo, mat, mesh } from "./kit";
import { lookFor, type Look } from "./look";
import { PAL } from "./palette";

/** Gelenkwinkel einer Haltung. Index 0 = links, 1 = rechts. */
interface Joints {
  bob: number; lean: number; head: number;
  thigh: [number, number]; knee: [number, number];
  sh: [number, number]; shOut: [number, number];
  elb: [number, number]; elbOut: [number, number];
}

const zero = (): Joints => ({ bob: 0, lean: 0, head: 0, thigh: [0, 0], knee: [0, 0], sh: [0, 0], shOut: [0, 0], elb: [0, 0], elbOut: [0, 0] });
const pair = (a: number): [number, number] => [a, a];

/** Hüfthöhe beim Beugen der Beine um den Winkel a (Knie doppelt gebeugt, Füße bleiben unter dem Körper) */
const crouchBob = (a: number) => (LT + LS) * (Math.cos(a) - 1);

export class CharacterView {
  readonly root = new THREE.Group();
  private readonly rig: Rig;
  private readonly look: Look;
  private readonly cur = zero();
  private t = Math.random() * 10;
  private readonly db: THREE.Object3D[];
  private readonly barbell: THREE.Object3D;
  private readonly wrench: THREE.Object3D;
  private readonly phone: THREE.Object3D | null;

  constructor(p: Person) {
    this.root.rotation.order = "YXZ";
    this.look = lookFor(p.type, p.model);
    this.rig = buildFigure(this.look);
    this.root.add(this.rig.root);

    const hand = -LF - HAND / 2;
    this.db = this.rig.elbow.map((e) => {
      const g = new THREE.Group();
      g.position.set(0, hand, 0.01);
      mesh(geo(0.16, 0.025, 0.025), mat(PAL.chrome), 0, 0, 0, g);
      for (const s of [1, -1]) mesh(geo(0.035, 0.08, 0.08), mat(PAL.plate), s * 0.075, 0, 0, g);
      e.add(g);
      return g;
    });
    this.barbell = new THREE.Group();
    this.barbell.position.set(0, this.rig.chestTop - 0.01, this.rig.chestD / 2 + 0.08);
    mesh(geo(1.4, 0.035, 0.035), mat(PAL.chrome), 0, 0, 0, this.barbell);
    for (const s of [-1, 1]) {
      mesh(geo(0.05, 0.32, 0.32), mat(PAL.plate), s * 0.58, 0, 0, this.barbell);
      mesh(geo(0.035, 0.24, 0.24), mat(PAL.bumper), s * 0.53, 0, 0, this.barbell);
    }
    this.rig.spine.add(this.barbell);
    this.wrench = mesh(geo(0.03, 0.03, 0.18), mat(PAL.chromeDk), 0, hand, 0.07, this.rig.elbow[1]);
    this.phone = this.look.phone ? mesh(geo(0.06, 0.012, 0.11), mat("#15191e"), 0, hand, 0.04, this.rig.elbow[0]) : null;
  }

  update(p: Person, eq: Equipment | null, dt: number) {
    this.t += dt;
    const t = this.t, m = this.look.muscle;
    const phase = eq?.phase ?? 0;
    const j = zero();
    const armsOut = 0.07 + 0.2 * m;
    j.shOut = pair(armsOut); j.elb = pair(0.12);
    let yaw = p.yaw, x = p.x, y = 0, z = p.z, pitch = 0;
    const show = { db: false, bar: false, wrench: false, phone: false };

    switch (p.pose) {
      case "run": {
        yaw = Math.PI;
        const w = t * 13;
        j.thigh = [0.75 * Math.sin(w), -0.75 * Math.sin(w)];
        j.knee = [0.35 + 0.9 * Math.max(0, Math.cos(w)), 0.35 + 0.9 * Math.max(0, -Math.cos(w))];
        j.sh = [-0.65 * Math.sin(w), 0.65 * Math.sin(w)];
        j.elb = pair(1.5); j.lean = 0.14; j.bob = -0.02 + 0.025 * Math.abs(Math.sin(w));
        break;
      }
      case "curl":
        yaw = 0;
        j.sh = pair(0.12); j.shOut = pair(0.08 + 0.1 * m); j.elb = pair(0.15 + 2.1 * phase); j.head = 0.08;
        show.db = true;
        break;
      case "squat": {
        yaw = 0;
        const a = 1.15 * phase;
        j.thigh = pair(a); j.knee = pair(2 * a); j.bob = crouchBob(a); j.lean = 0.45 * a;
        j.sh = pair(1.2); j.shOut = pair(0.35); j.elb = pair(2.1); j.head = -0.5 * a;
        show.bar = true;
        break;
      }
      case "bench":
        // auf dem Rücken liegen, Kopf Richtung Wand, Kurzhanteln nach oben drücken
        x = GYM_OFFSET.x + 2.45 + HIP_Y; z = GYM_OFFSET.y + 5.5; y = 11 * HS + this.rig.chestD / 2 + 0.01;
        yaw = Math.PI / 2; pitch = -Math.PI / 2;
        j.thigh = pair(0.35); j.knee = pair(1.75);
        j.sh = pair(0.75 + 0.82 * phase); j.shOut = pair(1.0 - 0.85 * phase); j.elb = pair(1.3 * (1 - phase));
        show.db = true;
        break;
      case "lat":
        yaw = Math.PI; y = 11 * HS + 0.07;
        j.thigh = pair(Math.PI / 2); j.knee = pair(Math.PI / 2); j.bob = -LT;
        j.sh = pair(2.85 - 1.15 * phase); j.shOut = pair(0.3 + 0.25 * phase); j.elb = pair(0.1 + 1.4 * phase); j.head = -0.2; j.lean = -0.05;
        break;
      case "drink":
        yaw = Math.PI;
        j.sh = [0.05, 1.45 + 0.1 * Math.sin(t * 2)]; j.elb = [0.12, 2.0]; j.shOut = [armsOut, 0.2]; j.head = -0.3;
        break;
      case "repair": {
        const a = 0.95;
        j.thigh = pair(a); j.knee = pair(2 * a); j.bob = crouchBob(a); j.lean = 0.55; j.head = 0.2;
        j.sh = [0.7, 1.0 + 0.4 * Math.sin(t * 11)]; j.elb = [0.6, 0.5]; j.shOut = pair(0.15);
        show.wrench = true;
        break;
      }
      default:
        if (p.moving) {
          const w = t * 8.5;
          j.thigh = [0.45 * Math.sin(w), -0.45 * Math.sin(w)];
          j.knee = [0.1 + 0.5 * Math.max(0, Math.cos(w)), 0.1 + 0.5 * Math.max(0, -Math.cos(w))];
          j.sh = [-0.4 * Math.sin(w), 0.4 * Math.sin(w)];
          j.elb = pair(0.3); j.lean = 0.04; j.bob = -0.012 * Math.abs(Math.cos(w));
          show.phone = !!this.phone && Math.sin(t * 0.4) > 0.2;
        } else {
          j.lean = 0.015 * Math.sin(t * 1.7); j.bob = 0.004 * Math.sin(t * 1.7);
          show.phone = !!this.phone;
          if (!this.phone && m > 0.75 && t % 9 < 1.8) {
            // Bodybuilder zeigt zwischendurch den Bizeps
            j.shOut = pair(1.45); j.elbOut = pair(1.7); j.elb = pair(0); j.head = -0.08;
          }
        }
        if (show.phone) { j.sh[0] = 0.9; j.elb[0] = 1.35; j.shOut[0] = 0.05; j.head = 0.3; }
    }

    this.blend(j, Math.min(1, dt * 12));
    this.apply();
    for (const d of this.db) d.visible = show.db;
    this.barbell.visible = show.bar;
    this.wrench.visible = show.wrench;
    if (this.phone) this.phone.visible = show.phone;

    this.root.position.set(x, y, z);
    this.root.rotation.set(pitch, yaw, 0);
  }

  private blend(j: Joints, k: number) {
    const c = this.cur;
    c.bob += (j.bob - c.bob) * k; c.lean += (j.lean - c.lean) * k; c.head += (j.head - c.head) * k;
    for (const key of ["thigh", "knee", "sh", "shOut", "elb", "elbOut"] as const) {
      for (const i of [0, 1]) c[key][i] += (j[key][i] - c[key][i]) * k;
    }
  }

  private apply() {
    const r = this.rig, c = this.cur;
    r.hips.position.y = HIP_Y + c.bob;
    r.spine.rotation.x = c.lean;
    r.head.rotation.x = c.head;
    for (const i of [0, 1]) {
      const s = i === 0 ? 1 : -1;
      r.thigh[i].rotation.x = -c.thigh[i];
      r.knee[i].rotation.x = c.knee[i];
      r.shoulder[i].rotation.set(-c.sh[i], 0, s * c.shOut[i]);
      r.elbow[i].rotation.set(-c.elb[i], 0, s * c.elbOut[i]);
    }
  }

  dispose() { this.root.removeFromParent(); disposeFigure(this.rig); }
}

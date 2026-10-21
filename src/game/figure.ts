// Eigene kantige Figuren aus Quadern mit Gelenken (Hüfte, Knie, Schulter, Ellbogen, Kopf).
// Jedes Körperteil ist ein einziges Mesh mit Vertexfarben, der Kopf trägt zusätzlich die Gesichtstextur.

import * as THREE from "three";
import { faceTexture, type Look } from "./look";
import { mat } from "./kit";

/** Maße in Welteinheiten */
export const LT = 0.24, LS = 0.22, SHOE = 0.05, LU = 0.2, LF = 0.16, HAND = 0.05;
export const HIP_Y = LT + LS + SHOE;

export interface Rig {
  root: THREE.Group;
  hips: THREE.Group;
  spine: THREE.Group;
  head: THREE.Group;
  thigh: [THREE.Group, THREE.Group];
  knee: [THREE.Group, THREE.Group];
  shoulder: [THREE.Group, THREE.Group];
  elbow: [THREE.Group, THREE.Group];
  /** Halbe Brustbreite und Brusttiefe, für Requisiten */
  chestW: number;
  chestD: number;
  chestTop: number;
}

const bodyMat = new THREE.MeshLambertMaterial({ vertexColors: true });
const headGeo = new THREE.BoxGeometry(0.2, 0.22, 0.2);
const faceMats = new Map<THREE.Texture, THREE.Material>();

/** Gibt die eigenen Geometrien einer Figur frei (Materialien und Texturen sind geteilt). */
export function disposeFigure(rig: Rig) {
  rig.root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && m.material === bodyMat) m.geometry.dispose(); });
}
const col = new THREE.Color();

/** Sammelt Quader mit Farben zu einem Mesh. Quader über Mittelpunkt und Größe. */
function parts() {
  const P: number[] = [], N: number[] = [], C: number[] = [];
  const quad = (v: number[][], n: number[]) => { for (const i of [0, 1, 2, 0, 2, 3]) { P.push(...v[i]!); N.push(...n); C.push(col.r, col.g, col.b); } };
  function box(cx: number, cy: number, cz: number, w: number, h: number, d: number, color: string, top?: string) {
    const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2, z0 = cz - d / 2, z1 = cz + d / 2;
    col.set(color);
    quad([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], [1, 0, 0]);
    quad([[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], [-1, 0, 0]);
    quad([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1]);
    quad([[x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]], [0, 0, -1]);
    quad([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], [0, -1, 0]);
    col.set(top ?? color);
    quad([[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]], [0, 1, 0]);
  }
  /** Senkrechter Abschnitt von yTop nach yBot */
  function seg(cx: number, cz: number, w: number, d: number, yTop: number, yBot: number, color: string) {
    if (yTop - yBot > 0.001) box(cx, (yTop + yBot) / 2, cz, w, yTop - yBot, d, color);
  }
  function build(parent: THREE.Object3D) {
    if (!P.length) return;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(C, 3));
    const m = new THREE.Mesh(g, bodyMat);
    m.castShadow = true;
    parent.add(m);
  }
  return { box, seg, build };
}

const group = (parent: THREE.Object3D, x = 0, y = 0, z = 0) => {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  return g;
};

export function buildFigure(l: Look): Rig {
  const m = l.muscle, f = l.female;
  const skin = l.skin;
  const chestW = (f ? 0.125 : 0.14) + 0.07 * m;
  const chestD = 0.15 + 0.05 * m;
  const waistW = (f ? 0.11 : 0.115) + 0.025 * m;
  const hipW = f ? waistW + 0.02 : waistW;
  const ua = 0.075 + 0.045 * m, fa = 0.066 + 0.03 * m;
  const th = 0.1 + 0.045 * m, sh = 0.085 + 0.025 * m;
  const absH = 0.12, chestH = 0.2, chestTop = 0.05 + absH + chestH;

  const covers = (t: typeof l.top) => l.top === t;
  const shortSleeve = covers("tee") || covers("polo");
  const longSleeve = covers("compression") || covers("hoodie") || covers("robe");
  const torsoCol = l.topCol;

  const root = new THREE.Group();
  const hips = group(root, 0, HIP_Y, 0);
  const spine = group(hips, 0, 0.05, 0);

  // Becken mit Hosenbund
  const pelvis = parts();
  const pantsCol = l.bottom === "robe" ? l.topCol : l.botCol;
  pelvis.box(0, 0, 0, hipW * 2 + 0.01, 0.12, chestD * 0.92, pantsCol);
  if (l.belt) pelvis.box(0, 0.045, 0, hipW * 2 + 0.03, 0.05, chestD * 0.92 + 0.02, "#2a2420");
  pelvis.build(hips);

  // Rumpf: Bauch, Brust, Nacken
  const body = parts();
  const absCol = covers("crop") || covers("bra") ? skin : torsoCol;
  body.box(0, absH / 2, 0, waistW * 2, absH, chestD * 0.9, absCol);
  if (absCol === skin) {
    // sichtbare Bauchmuskeln
    const line = new THREE.Color(skin).multiplyScalar(0.8).getStyle();
    body.box(0, absH / 2, chestD * 0.45 + 0.002, 0.008, absH * 0.8, 0.004, line);
    for (const y of [0.04, 0.08]) body.box(0, y, chestD * 0.45 + 0.002, waistW * 1.1, 0.006, 0.004, line);
  }
  const chestCol = covers("stringer") ? skin : torsoCol;
  const chestY = absH + chestH / 2;
  body.box(0, chestY, 0, chestW * 2, chestH, chestD, chestCol, covers("tank") || covers("stringer") || covers("bra") ? skin : undefined);
  if (covers("bra")) body.box(0, absH + chestH * 0.25, 0, chestW * 2 + 0.002, chestH * 0.5, chestD + 0.002, skin);
  if (covers("stringer")) {
    // Stringer: schmale Stoffbahnen vorne und hinten, Seiten frei
    body.box(0, chestY - 0.02, chestD / 2 + 0.004, chestW * 1.1, chestH - 0.04, 0.008, torsoCol);
    body.box(0, chestY - 0.02, -chestD / 2 - 0.004, chestW * 1.1, chestH - 0.04, 0.008, torsoCol);
    body.box(0, absH + chestH - 0.01, 0, 0.12, 0.02, chestD + 0.01, torsoCol);
  }
  if (covers("tank") || covers("compression") || covers("stringer") || covers("bra")) {
    // Brustlinie
    const line = new THREE.Color(chestCol).multiplyScalar(0.78).getStyle();
    body.box(0, absH + chestH * 0.5, chestD / 2 + 0.002, chestW * 1.3, 0.008, 0.004, line);
    body.box(0, absH + chestH * 0.72, chestD / 2 + 0.002, 0.008, chestH * 0.42, 0.004, line);
  }
  if (m > 0.55) {
    // Nackenmuskeln
    const trap = shortSleeve || longSleeve ? torsoCol : skin;
    body.box(0, chestTop + 0.015, -0.01, 0.12 + 0.12 * m, 0.03 + 0.03 * m, chestD * 0.6, trap);
  }
  body.box(0, chestTop + 0.03, 0, 0.09 + 0.03 * m, 0.06, 0.09, skin);
  if (covers("polo")) {
    body.box(0, chestTop + 0.01, 0, 0.14, 0.03, 0.12, l.accent);
    body.box(chestW * 0.5, absH + chestH * 0.7, chestD / 2 + 0.003, 0.03, 0.02, 0.004, l.accent);
  }
  if (covers("hoodie")) {
    body.box(0, chestTop + 0.03, -chestD / 2 - 0.01, 0.16, 0.08, 0.05, torsoCol);
    body.box(0, absH * 0.55, chestD * 0.45 + 0.004, waistW * 1.3, 0.06, 0.006, new THREE.Color(torsoCol).multiplyScalar(0.85).getStyle());
  }
  if (covers("robe")) {
    body.box(0, absH - 0.01, 0, waistW * 2 + 0.02, 0.03, chestD * 0.9 + 0.02, l.accent);
    body.box(0, absH + chestH * 0.75, chestD / 2 + 0.003, 0.05, chestH * 0.5, 0.004, skin);
  }
  if (covers("tee") || covers("compression") || covers("polo")) {
    body.box(-chestW * 0.45, absH + chestH * 0.72, chestD / 2 + 0.003, 0.03, 0.012, 0.004, l.accent);
  }
  body.build(spine);

  // Kopf
  const head = group(spine, 0, chestTop + 0.05, 0);
  buildHead(head, l);

  // Arme: Schulter, Oberarm, Ellbogen, Unterarm, Hand
  const shoulder: Rig["shoulder"] = [new THREE.Group(), new THREE.Group()];
  const elbow: Rig["elbow"] = [new THREE.Group(), new THREE.Group()];
  for (const i of [0, 1]) {
    const s = i === 0 ? 1 : -1;
    const sj = group(spine, s * (chestW + ua / 2 - 0.005), chestTop - 0.035, 0);
    const up = parts();
    const ds = ua + 0.03 + 0.025 * m;
    const sleeveCol = shortSleeve || longSleeve ? torsoCol : skin;
    up.box(s * 0.008, -0.01, 0, ds, ds * 0.8, ds, sleeveCol, covers("tank") || covers("bra") || covers("stringer") || covers("crop") ? skin : undefined);
    const sleeveEnd = shortSleeve ? -0.1 : longSleeve ? -LU : 0;
    up.seg(0, 0, ua, ua, -0.02, sleeveEnd, sleeveCol);
    up.seg(0, 0, ua, ua, Math.min(-0.02, sleeveEnd), -LU, skin);
    if (shortSleeve) up.box(0, sleeveEnd + 0.006, 0, ua + 0.012, 0.014, ua + 0.012, covers("polo") ? l.accent : sleeveCol);
    if (m > 0.4) up.box(0, -0.115, ua / 2, ua * 0.75, 0.08, 0.025 + 0.035 * m, longSleeve ? sleeveCol : skin);
    up.build(sj);
    const ej = group(sj, 0, -LU, 0);
    const lo = parts();
    const foreCol = longSleeve && !covers("robe") ? torsoCol : skin;
    lo.seg(0, 0, fa, fa, 0.01, covers("robe") ? -0.07 : -LF, covers("robe") ? torsoCol : foreCol);
    if (covers("robe")) lo.seg(0, 0, fa, fa, -0.07, -LF, skin);
    if (l.wristbands) lo.seg(0, 0, fa + 0.012, fa + 0.012, -LF + 0.035, -LF + 0.005, l.wristbands);
    lo.box(0, -LF - HAND / 2, 0.005, fa * 0.95, HAND, fa * 0.9, skin);
    lo.build(ej);
    shoulder[i] = sj; elbow[i] = ej;
  }

  // Beine: Oberschenkel, Knie, Unterschenkel, Schuh
  const thigh: Rig["thigh"] = [new THREE.Group(), new THREE.Group()];
  const knee: Rig["knee"] = [new THREE.Group(), new THREE.Group()];
  for (const i of [0, 1]) {
    const s = i === 0 ? 1 : -1;
    const tj = group(hips, s * (hipW - th / 2 + 0.01), -0.02, 0);
    const up = parts();
    const legCol = l.bottom === "robe" ? l.topCol : l.botCol;
    const coverTo = l.bottom === "bike" ? -0.14 : l.bottom === "shorts" ? -0.17 : -LT;
    const loose = l.bottom === "joggers" || l.bottom === "shorts" || l.bottom === "robe" ? 0.012 : 0;
    up.seg(0, 0, th + loose, th * 1.05 + loose, 0.02, coverTo, legCol);
    up.seg(0, 0, th, th * 1.05, coverTo, -LT, skin);
    if (m > 0.55) up.box(0, -0.1, th * 0.52, th * 0.7, 0.1, 0.02 + 0.02 * m, coverTo <= -0.13 ? legCol : skin);
    up.build(tj);
    const kj = group(tj, 0, -LT, 0);
    const lo = parts();
    const full = l.bottom === "joggers" || l.bottom === "leggings";
    lo.seg(0, 0, sh + (full ? loose : 0), sh + (full ? loose : 0), 0.01, -LS, full ? legCol : skin);
    if (!full && m > 0.35) lo.box(0, -0.07, -sh / 2 - 0.01, sh * 0.8, 0.08, 0.025, skin);
    if (l.bottom === "joggers") lo.seg(0, 0, sh + 0.006, sh + 0.006, -LS + 0.03, -LS, new THREE.Color(legCol).multiplyScalar(0.8).getStyle());
    if (l.socks) lo.seg(0, 0, sh + 0.004, sh + 0.004, -LS + 0.05, -LS, "#f4f6f8");
    lo.box(0, -LS - SHOE / 2 - 0.002, 0.03, sh + 0.02, SHOE, 0.15, l.shoe);
    lo.box(0, -LS - SHOE + 0.006, 0.03, sh + 0.024, 0.014, 0.154, l.sole);
    lo.build(kj);
    thigh[i] = tj; knee[i] = kj;
  }

  return { root, hips, spine, head, thigh, knee, shoulder, elbow, chestW, chestD, chestTop };
}

function buildHead(head: THREE.Group, l: Look) {
  const W = 0.2, H = 0.22, D = 0.2, y = 0.015 + H / 2;
  const skin = mat(l.skin);
  const tex = faceTexture(l);
  let face = faceMats.get(tex);
  if (!face) { face = new THREE.MeshLambertMaterial({ map: tex }); faceMats.set(tex, face); }
  const cube = new THREE.Mesh(headGeo, [skin, skin, skin, skin, face, skin]);
  cube.position.y = y;
  cube.castShadow = true;
  head.add(cube);

  const p = parts();
  const top = y + H / 2, hc = l.hairCol, e = 0.012;
  // Ohren
  p.box(W / 2 + 0.01, y - 0.01, -0.01, 0.02, 0.05, 0.04, l.skin);
  p.box(-W / 2 - 0.01, y - 0.01, -0.01, 0.02, 0.05, 0.04, l.skin);
  if (l.hair !== "bald") {
    const thick = l.hair === "buzz" ? 0.012 : 0.03;
    p.box(0, top + thick / 2, -0.004, W + e, thick, D + e * 0.6, hc);
    const backLen = l.hair === "long" ? H + 0.14 : l.hair === "buzz" ? H * 0.55 : H * 0.7;
    p.box(0, top - backLen / 2 + 0.005, -D / 2 - e / 2, W + e, backLen, e, hc);
    const sideLen = l.hair === "long" ? H + 0.02 : l.hair === "buzz" ? 0.05 : 0.07;
    for (const s of [1, -1]) p.box(s * (W / 2 + e / 2), top - sideLen / 2, -0.02, e, sideLen, D - 0.03, hc);
    if (l.hair === "quiff") p.box(0, top + 0.045, D * 0.18, W * 0.8, 0.04, D * 0.55, hc);
    if (l.hair === "bun") p.box(0, top + 0.05, -D * 0.25, 0.08, 0.07, 0.08, hc);
    if (l.hair === "ponytail") {
      p.box(0, top - 0.02, -D / 2 - 0.03, 0.06, 0.05, 0.05, hc);
      p.box(0, top - 0.12, -D / 2 - 0.035, 0.05, 0.16, 0.04, hc);
    }
  }
  if (l.headband) p.box(0, top - 0.035, 0, W + 0.02, 0.03, D + 0.02, l.headband);
  if (l.cap) {
    p.box(0, top + 0.025, -0.005, W + 0.024, 0.05, D + 0.02, l.cap);
    p.box(0, top + 0.006, D / 2 + 0.06, W * 0.85, 0.012, 0.12, l.cap);
  }
  if (l.headphones) {
    p.box(0, top + 0.03, 0, 0.03, 0.02, 0.03, "#1f2329");
    p.box(0, top + 0.035, 0, W + 0.05, 0.02, 0.03, "#1f2329");
    for (const s of [1, -1]) p.box(s * (W / 2 + 0.025), y, 0, 0.03, 0.08, 0.07, "#1f2329");
  }
  p.build(head);
}

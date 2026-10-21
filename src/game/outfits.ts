// Malt die Textur der kantigen Figuren (Kenney "Blocky Characters", alle mit gleichem UV-Layout).
// Gesicht und Haare stammen aus den Kenney-Texturen, Kleidung wird je nach Kundentyp per Code gemalt.

import * as THREE from "three";
import type { Person } from "../sim/game";
import { PAL } from "./palette";

/** Gesichter aus dem Paket, die als normale Gym-Gäste taugen */
export const FACES_MALE = ["c", "k", "i", "m", "q", "b"] as const;
export const FACES_FEMALE = ["e", "f", "n"] as const;
export const FACES = [...FACES_MALE, ...FACES_FEMALE];
export const JOSEF_FACE = "b";

type Top = "tee" | "tank" | "crop" | "polo" | "robe";
type Bottom = "pants" | "shorts" | "leggings" | "robe";
interface Outfit {
  top: Top; topCol: string; accent: string;
  bottom: Bottom; botCol: string;
  shoe: string; sole: string; socks: boolean; headband?: string;
}

// Rechtecke im 1024er-Layout der Kenney-Textur: [x, y, w, h]
type R = [number, number, number, number];
const TORSO = { top: [96, 688, 128, 96] as R, left: [0, 784, 96, 144] as R, front: [96, 784, 128, 144] as R, right: [224, 784, 96, 144] as R, back: [320, 784, 128, 144] as R, bottom: [96, 928, 128, 96] as R };
const ARMS = [480, 768];
const LEG_Y = 800, ARM_Y = 534;

const pick = <T,>(list: readonly T[], i: number) => list[((i % list.length) + list.length) % list.length]!;

function outfitFor(type: Person["type"], v: number, female: boolean): Outfit {
  switch (type) {
    case "staff":
      return { top: "polo", topCol: PAL.staff, accent: "#ffffff", bottom: "pants", botCol: "#2c3644", shoe: "#1f242b", sole: "#e9ecef", socks: false };
    case "bodybuilder":
      return { top: "tank", topCol: pick(["#22262c", "#3a4049", "#6e2433", "#2d3e5c"], v), accent: "#e9ecef", bottom: "shorts", botCol: pick(["#59616b", "#22262c", "#3a4049"], v + 1), shoe: "#22262c", sole: "#e9ecef", socks: true };
    case "cardio":
      return { top: "tee", topCol: pick(["#3b8fe0", "#14b8a6", "#e9ecef", "#2d3e5c"], v), accent: pick(["#22262c", "#ffffff"], v), bottom: female ? "leggings" : "shorts", botCol: "#22262c", shoe: pick(["#14b8a6", "#3b8fe0", "#e9ecef"], v + 2), sole: "#ffffff", socks: !female, headband: pick(["#e9ecef", "#3b8fe0", "#22262c"], v) };
    case "influencer": {
      const set = pick(["#b03a5b", "#1e2126", "#4a6688", "#6f5a8c"], v);
      return { top: female ? "crop" : "tee", topCol: set, accent: "#ffffff", bottom: female ? "leggings" : "pants", botCol: set, shoe: "#f4f6f8", sole: "#d5dade", socks: false };
    }
    case "wellness":
      return { top: "robe", topCol: pick(["#eef1f4", "#d9dee4"], v), accent: "#b8c0c9", bottom: "robe", botCol: "#eef1f4", shoe: "#f4f6f8", sole: "#cfd5db", socks: false };
    default:
      return { top: "tee", topCol: pick(["#9aa3ad", "#2d3e5c", "#4a6688", "#e9ecef", "#3a4049"], v), accent: "#ffffff", bottom: "pants", botCol: pick(["#3a4049", "#2d3e5c", "#22262c"], v + 1), shoe: "#f4f6f8", sole: "#b8c0c9", socks: false };
  }
}

/** Wählt für einen Kunden Gesicht und Variante, deterministisch aus Modellnummer und Typ. */
export function lookFor(type: Person["type"], model: number): { face: string; female: boolean; variant: number } {
  if (type === "staff") return { face: JOSEF_FACE, female: false, variant: 0 };
  const femaleShare = type === "influencer" || type === "cardio" ? 2 : type === "bodybuilder" ? 5 : 3;
  const female = model % femaleShare === 0;
  return { face: female ? pick(FACES_FEMALE, Math.floor(model / 2)) : pick(FACES_MALE, model), female, variant: model };
}

const cache = new Map<string, THREE.Texture>();

export function outfitTexture(faces: Map<string, HTMLImageElement>, type: Person["type"], model: number): THREE.Texture {
  const look = lookFor(type, model);
  const key = `${look.face}|${type}|${look.variant}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const img = faces.get(look.face);
  if (!img) throw new Error(`Gesicht fehlt: ${look.face}`);
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const k = c.getContext("2d", { willReadFrequently: true })!;
  k.scale(0.5, 0.5);
  k.imageSmoothingEnabled = true;
  k.drawImage(img, 0, 0, 512, 384, 0, 0, 512, 384);
  const sample = (x: number, y: number) => {
    const d = k.getImageData(x / 2, y / 2, 1, 1).data;
    return `rgb(${d[0]},${d[1]},${d[2]})`;
  };
  const skin = sample(192, 360);
  const hair = sample(448, 140);
  paintBody(k, outfitFor(type, look.variant, look.female), skin, hair, look.female);

  const t = new THREE.CanvasTexture(c);
  t.flipY = false;
  // Die UVs im Modell liegen teils außerhalb von 0..1 (Kenney-Export), daher wiederholen
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.LinearFilter;
  t.anisotropy = 4;
  cache.set(key, t);
  return t;
}

function rect(k: CanvasRenderingContext2D, col: string, r: R, dy = 0, h?: number) {
  k.fillStyle = col;
  k.fillRect(r[0], r[1] + dy, r[2], h ?? r[3] - dy);
}

function paintBody(k: CanvasRenderingContext2D, o: Outfit, skin: string, hair: string, female: boolean) {
  const shade = "rgba(0,0,0,0.16)", light = "rgba(255,255,255,0.18)";

  // Oberkörper
  const sides = [TORSO.left, TORSO.front, TORSO.right, TORSO.back];
  for (const r of sides) rect(k, o.topCol, r);
  rect(k, o.top === "tank" ? skin : o.topCol, TORSO.top);
  rect(k, o.topCol, TORSO.bottom);
  if (o.top === "tank") {
    // Armausschnitte und runder Halsausschnitt
    for (const r of [TORSO.left, TORSO.right]) rect(k, skin, r, 0, 34);
    k.fillStyle = skin;
    k.beginPath(); k.ellipse(160, 784, 34, 26, 0, 0, Math.PI); k.fill();
    k.fillRect(96, 784, 18, 22); k.fillRect(206, 784, 18, 22);
  } else if (o.top === "polo") {
    k.fillStyle = o.accent;
    k.beginPath(); k.moveTo(136, 784); k.lineTo(160, 806); k.lineTo(184, 784); k.closePath(); k.fill();
    k.fillStyle = shade; k.fillRect(157, 806, 6, 26);
    rect(k, o.accent, [184, 820, 22, 12]);
  } else if (o.top === "robe") {
    k.fillStyle = skin;
    k.beginPath(); k.moveTo(130, 784); k.lineTo(160, 836); k.lineTo(190, 784); k.closePath(); k.fill();
    k.strokeStyle = o.accent; k.lineWidth = 5;
    k.beginPath(); k.moveTo(130, 784); k.lineTo(160, 836); k.lineTo(190, 784); k.stroke();
    for (const r of sides) rect(k, o.accent, r, 96, 10);
  } else {
    // T-Shirt und Crop: Halsausschnitt, kleines Logo auf der Brust
    k.fillStyle = shade;
    k.beginPath(); k.ellipse(160, 784, 26, 14, 0, 0, Math.PI); k.fill();
    rect(k, o.accent, [180, 808, 18, 6]);
    rect(k, o.accent, [180, 816, 10, 4]);
  }
  if (o.top === "crop") for (const r of sides) rect(k, skin, r, 92, 34);

  // Hosenbund unten am Oberkörper
  const waist = o.bottom === "robe" ? o.topCol : o.botCol;
  for (const r of sides) rect(k, waist, r, 126);
  rect(k, waist, TORSO.bottom);
  for (const r of sides) rect(k, shade, r, 126, 4);

  // Lange Haare fallen bei Frauen über den Rücken
  if (female) {
    rect(k, hair, TORSO.back, 0, 62);
    rect(k, hair, TORSO.left, 0, 26);
    rect(k, hair, TORSO.right, 0, 26);
  }

  // Arme: oben Schulter, Seiten von Schulter (oben) bis Hand (unten)
  const sleeve = o.top === "tank" ? 0 : o.top === "robe" ? 140 : o.top === "polo" ? 48 : 40;
  for (const ax of ARMS) {
    rect(k, sleeve ? o.topCol : skin, [ax, ARM_Y, 64, 64]);
    rect(k, skin, [ax + 64, ARM_Y, 64, 64]);
    rect(k, skin, [ax, ARM_Y + 64, 256, 170]);
    if (sleeve) {
      rect(k, o.topCol, [ax, ARM_Y + 64, 256, sleeve]);
      rect(k, o.top === "polo" ? o.accent : shade, [ax, ARM_Y + 64 + sleeve - 5, 256, 5]);
    }
    rect(k, shade, [ax, ARM_Y + 64 + 150, 256, 2]);
  }

  // Beine: oben Hüfte, Unterseite Sohle, Seiten von Hüfte (oben) bis Fuß (unten)
  for (const lx of ARMS) {
    const top = o.bottom === "robe" ? o.botCol : o.botCol;
    rect(k, top, [lx, LEG_Y, 64, 64]);
    rect(k, o.sole, [lx + 64, LEG_Y, 64, 64]);
    const side: R = [lx, LEG_Y + 64, 256, 160];
    rect(k, skin, side);
    const len = o.bottom === "shorts" ? 62 : o.bottom === "robe" ? 80 : 138;
    rect(k, o.bottom === "robe" ? o.topCol : o.botCol, side, 0, len);
    if (o.bottom === "shorts") rect(k, shade, side, len - 5, 5);
    if (o.bottom === "leggings") rect(k, light, [lx + 60, LEG_Y + 64, 8, len]);
    if (o.bottom === "pants") rect(k, shade, side, len - 4, 4);
    if (o.socks) rect(k, "#f4f6f8", side, 120, 18);
    rect(k, o.shoe, side, 138, 22);
    rect(k, o.sole, side, 154, 6);
  }

  // Stirnband
  if (o.headband) for (let x = 0; x < 512; x += 128) rect(k, o.headband, [x, 150, 128, 12]);
}

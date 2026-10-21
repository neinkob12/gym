// Aussehen der Figuren: Körperbau, Frisur, Gesicht und Outfit, zufällig aber reproduzierbar je Kundentyp.

import * as THREE from "three";
import type { Person } from "../sim/game";
import { makeRng, pickOf, range, type Rng } from "../sim/rng";

export type Hair = "bald" | "buzz" | "short" | "quiff" | "mop" | "bun" | "ponytail" | "long";
export type Beard = "none" | "stubble" | "full" | "mustache";
export type Top = "tank" | "stringer" | "tee" | "compression" | "crop" | "bra" | "hoodie" | "polo" | "robe";
export type Bottom = "shorts" | "bike" | "joggers" | "leggings" | "robe";

export interface Look {
  female: boolean;
  /** 0 = schmal, 1 = Bodybuilder */
  muscle: number;
  skin: string;
  hairCol: string;
  hair: Hair;
  beard: Beard;
  eyes: "plain" | "glasses" | "shades";
  cap: string | null;
  headband: string | null;
  headphones: boolean;
  earbuds: boolean;
  top: Top;
  topCol: string;
  accent: string;
  /** kleines Logo am linken Ärmel statt auf der Brust */
  sleeveLogo: boolean;
  bottom: Bottom;
  botCol: string;
  socks: boolean;
  shoe: string;
  sole: string;
  belt: boolean;
  wristbands: string | null;
  phone: boolean;
}

const SKIN = ["#f3cfb0", "#e8b892", "#d29b70", "#b57a52", "#8d5a3b", "#64402a"];
const HAIR = ["#1d1b1a", "#2f2520", "#4a3123", "#6e4a2e", "#a07a4a", "#cfae6e", "#8c9096", "#7a2f22"];
const DARK = ["#1f2329", "#2c323a", "#3a4049", "#2d3e5c"];
const BRIGHT = ["#3b8fe0", "#14b8a6", "#e9ecef", "#b03a5b", "#6f5a8c", "#4a6688", "#6e2433"];
const SHOES = ["#f4f6f8", "#1f2329", "#3b8fe0", "#14b8a6", "#b03a5b", "#9aa3ad"];

const chance = (r: Rng, p: number) => r() < p;

/** Josef, 18, nach Foto: braune Wuschelfrisur mit Pony, Brille, AirPods, schwarzes Shirt, Handgelenkbandagen */
export const JOSEF: Look = {
  female: false, muscle: 0.6, skin: "#ecc2a2", hairCol: "#4a3123", hair: "mop", beard: "none", eyes: "glasses",
  cap: null, headband: null, headphones: false, earbuds: true, top: "tee", topCol: "#17191d", accent: "#ffffff", sleeveLogo: true,
  bottom: "joggers", botCol: "#2e3238", socks: false, shoe: "#1f2329", sole: "#e9ecef", belt: false, wristbands: "#101215", phone: false,
};

export function lookFor(type: Person["type"], seed: number): Look {
  if (type === "staff") return JOSEF;
  const r = makeRng(seed * 7919 + type.length * 104729);
  const femaleShare = { anfaenger: 0.45, bodybuilder: 0.2, cardio: 0.55, influencer: 0.6, wellness: 0.5 }[type];
  const female = chance(r, femaleShare);
  const hairCol = pickOf(r, HAIR);
  const l: Look = {
    female, muscle: 0.3, skin: pickOf(r, SKIN), hairCol,
    hair: female ? pickOf(r, ["ponytail", "bun", "long", "long", "short"] as const) : pickOf(r, ["buzz", "short", "quiff", "bald", "short", "mop"] as const),
    beard: female ? "none" : pickOf(r, ["none", "none", "stubble", "full", "mustache"] as const),
    eyes: "plain", cap: null, headband: null, headphones: false, earbuds: false,
    top: "tee", topCol: pickOf(r, DARK), accent: "#ffffff", sleeveLogo: false, bottom: "joggers", botCol: pickOf(r, DARK),
    socks: false, shoe: pickOf(r, SHOES), sole: "#d5dade", belt: false, wristbands: null, phone: false,
  };
  if (l.shoe === "#f4f6f8") l.sole = "#b8c0c9";
  switch (type) {
    case "anfaenger":
      l.muscle = range(r, [0.05, 0.35]);
      l.top = pickOf(r, ["tee", "tee", "hoodie"] as const);
      l.topCol = pickOf(r, [...DARK, "#9aa3ad", "#4a6688", "#e9ecef"]);
      l.bottom = pickOf(r, ["joggers", "shorts"] as const);
      l.eyes = chance(r, 0.3) ? "glasses" : "plain";
      if (female) l.bottom = pickOf(r, ["leggings", "joggers"] as const);
      break;
    case "bodybuilder":
      l.muscle = range(r, [female ? 0.6 : 0.8, 1]);
      l.top = female ? pickOf(r, ["bra", "tank"] as const) : pickOf(r, ["tank", "stringer", "stringer", "compression"] as const);
      l.topCol = pickOf(r, [...DARK, "#6e2433", "#9aa3ad"]);
      l.bottom = female ? "leggings" : pickOf(r, ["shorts", "joggers"] as const);
      l.belt = chance(r, 0.6);
      l.wristbands = chance(r, 0.5) ? pickOf(r, ["#1f2329", "#e9ecef", "#b03a5b"]) : null;
      l.socks = l.bottom === "shorts";
      if (!female) l.hair = pickOf(r, ["buzz", "bald", "short", "buzz"] as const);
      if (!female && chance(r, 0.4)) l.beard = "full";
      break;
    case "cardio":
      l.muscle = range(r, [0.25, 0.5]);
      l.top = female ? pickOf(r, ["bra", "tee", "crop"] as const) : pickOf(r, ["tee", "compression", "tank"] as const);
      l.topCol = pickOf(r, BRIGHT);
      l.bottom = female ? pickOf(r, ["bike", "leggings"] as const) : "shorts";
      l.botCol = pickOf(r, DARK);
      l.headband = chance(r, 0.5) ? pickOf(r, ["#e9ecef", "#3b8fe0", "#1f2329", "#14b8a6"]) : null;
      l.headphones = !l.headband && chance(r, 0.5);
      l.earbuds = !l.headband && !l.headphones && chance(r, 0.5);
      l.shoe = pickOf(r, ["#3b8fe0", "#14b8a6", "#b03a5b", "#f4f6f8"]);
      l.sole = "#ffffff";
      l.socks = !female;
      break;
    case "influencer": {
      l.muscle = range(r, [0.5, 0.75]);
      const set = pickOf(r, ["#b03a5b", "#1f2329", "#4a6688", "#6f5a8c", "#e9ecef", "#2f5d50"]);
      l.top = female ? pickOf(r, ["bra", "crop"] as const) : pickOf(r, ["compression", "stringer", "tank"] as const);
      l.topCol = set; l.botCol = set === "#e9ecef" ? "#9aa3ad" : set;
      l.bottom = female ? "leggings" : "joggers";
      l.shoe = "#f4f6f8"; l.sole = "#d5dade";
      l.eyes = chance(r, 0.35) ? "shades" : "plain";
      l.cap = !female && chance(r, 0.4) ? pickOf(r, ["#1f2329", "#e9ecef"]) : null;
      l.phone = true;
      if (!female && l.beard === "mustache") l.beard = "stubble";
      break;
    }
    case "wellness":
      l.muscle = range(r, [0.1, 0.3]);
      l.top = "robe"; l.topCol = pickOf(r, ["#eef1f4", "#d9dee4"]); l.accent = "#b8c0c9";
      l.bottom = "robe"; l.botCol = l.topCol;
      l.shoe = "#f4f6f8"; l.sole = "#cfd5db";
      if (female) l.hair = pickOf(r, ["bun", "bun", "ponytail"] as const);
      break;
  }
  return l;
}

// --- Gesicht als kleine Canvas-Textur für die Vorderseite des Kopfes ---

const faceCache = new Map<string, THREE.Texture>();

export function faceTexture(l: Look): THREE.Texture {
  const key = [l.skin, l.hairCol, l.hair, l.beard, l.eyes, l.female, l.muscle > 0.75].join("|");
  const hit = faceCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const k = c.getContext("2d")!;
  const shade = new THREE.Color(l.skin).multiplyScalar(0.82).getStyle();
  k.fillStyle = l.skin; k.fillRect(0, 0, 128, 128);

  // Haaransatz vorne
  k.fillStyle = l.hairCol;
  const fringe = { bald: 0, buzz: 12, short: 20, quiff: 22, mop: 30, bun: 18, ponytail: 18, long: 24 }[l.hair];
  if (fringe) k.fillRect(0, 0, 128, fringe);
  if (l.hair === "mop") {
    // fransiger Pony bis knapp über die Brille
    for (const [x, w, h] of [[0, 18, 14], [16, 20, 10], [34, 16, 16], [52, 22, 8], [72, 18, 14], [92, 20, 9], [110, 18, 16]] as const) k.fillRect(x, 30, w, h);
  }
  if (l.hair === "long") { k.fillRect(0, 0, 14, 84); k.fillRect(114, 0, 14, 84); }
  if (l.hair === "quiff") k.fillRect(10, 20, 44, 6);

  // Augenbrauen, beim Bodybuilder grimmig schräg
  const tough = l.muscle > 0.75;
  k.fillStyle = l.hairCol === "#cfae6e" ? "#8a6a3a" : l.hairCol;
  const brow = (x: number, dir: number) => {
    k.save(); k.translate(x, 48); k.rotate(tough ? dir * 0.18 : dir * -0.05); k.fillRect(-14, -3, 28, l.female ? 5 : 7); k.restore();
  };
  brow(38, 1); brow(90, -1);

  // Augen
  k.fillStyle = "#1d2228";
  k.fillRect(31, 56, 12, 14); k.fillRect(85, 56, 12, 14);
  k.fillStyle = "#ffffff";
  k.fillRect(37, 58, 4, 4); k.fillRect(91, 58, 4, 4);
  if (l.female) { k.fillStyle = "#1d2228"; k.fillRect(27, 54, 6, 4); k.fillRect(95, 54, 6, 4); }

  // Nase und Mund
  k.fillStyle = shade; k.fillRect(58, 64, 12, 20);
  k.fillStyle = l.female ? "#a5454f" : "#5a2e2a";
  if (tough) k.fillRect(50, 96, 28, 5);
  else { k.fillRect(48, 94, 32, 5); k.fillRect(44, 90, 6, 6); k.fillRect(78, 90, 6, 6); }

  // Bart
  if (l.beard === "full" || l.beard === "stubble") {
    k.globalAlpha = l.beard === "stubble" ? 0.32 : 1;
    k.fillStyle = l.hairCol;
    k.beginPath(); k.moveTo(6, 70); k.lineTo(22, 84); k.lineTo(106, 84); k.lineTo(122, 70); k.lineTo(122, 128); k.lineTo(6, 128); k.closePath(); k.fill();
    k.globalAlpha = 1;
    k.fillStyle = l.skin; k.fillRect(46, 92, 36, 10);
    k.fillStyle = "#5a2e2a"; k.fillRect(50, 95, 28, 4);
  } else if (l.beard === "mustache") {
    k.fillStyle = l.hairCol; k.fillRect(42, 84, 44, 8);
  }

  // Brille oder Sonnenbrille
  if (l.eyes === "glasses") {
    k.strokeStyle = "#1d2228"; k.lineWidth = 4;
    k.strokeRect(24, 52, 26, 22); k.strokeRect(78, 52, 26, 22); k.fillStyle = "#1d2228"; k.fillRect(50, 60, 28, 4);
  } else if (l.eyes === "shades") {
    k.fillStyle = "#15191e"; k.fillRect(22, 52, 34, 20); k.fillRect(72, 52, 34, 20); k.fillRect(56, 56, 16, 4);
    k.fillStyle = "rgba(255,255,255,.35)"; k.fillRect(26, 55, 10, 4); k.fillRect(76, 55, 10, 4);
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  faceCache.set(key, t);
  return t;
}

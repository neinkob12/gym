import { GYM_OFFSET, type Tile } from "./map";

export type EqKind = "db" | "bench" | "lat" | "rack" | "tm" | "water";
export type Pose = "stand" | "curl" | "bench" | "lat" | "squat" | "run" | "drink" | "repair";

export interface EquipmentDef {
  id: string;
  kind: EqKind;
  /** Kacheln in Weltkoordinaten */
  tiles: Tile[];
  /** Kachel, von der aus das Gerät betreten wird */
  appr: Tile;
  /** Position der Figur beim Training (Welteinheiten) */
  use: { x: number; z: number };
  pose: Pose;
  /** Gerät relativ zur Gym-Ecke, für die 3D-Modelle */
  local: { x: number };
}

// Ursprünglich im Prototyp relativ zur Gym-Ecke (1, 2) und in 32-px-Einheiten definiert
const RAW: { id: string; kind: EqKind; tiles: Tile[]; appr: Tile; use: [number, number]; pose: Pose }[] = [
  { id: "db", kind: "db", tiles: [[1, 2], [2, 2]], appr: [1, 3], use: [48, 120], pose: "curl" },
  { id: "bench", kind: "bench", tiles: [[1, 5], [2, 5]], appr: [1, 6], use: [64, 186], pose: "bench" },
  { id: "lat", kind: "lat", tiles: [[1, 8], [1, 9]], appr: [2, 9], use: [48, 310], pose: "lat" },
  { id: "rack", kind: "rack", tiles: [[6, 2], [7, 2], [6, 3], [7, 3]], appr: [6, 4], use: [224, 116], pose: "squat" },
  { id: "tm1", kind: "tm", tiles: [[5, 7], [5, 8]], appr: [5, 9], use: [176, 278], pose: "run" },
  { id: "tm2", kind: "tm", tiles: [[7, 7], [7, 8]], appr: [7, 9], use: [240, 278], pose: "run" },
  { id: "water", kind: "water", tiles: [[8, 2]], appr: [8, 3], use: [272, 112], pose: "drink" },
];

export const EQUIPMENT_DEFS: readonly EquipmentDef[] = RAW.map((r) => ({
  id: r.id,
  kind: r.kind,
  tiles: r.tiles.map(([x, y]) => [x + GYM_OFFSET.x, y + GYM_OFFSET.y] as const),
  appr: [r.appr[0] + GYM_OFFSET.x, r.appr[1] + GYM_OFFSET.y] as const,
  use: { x: r.use[0] / 32 + GYM_OFFSET.x, z: (r.use[1] - 8) / 32 + GYM_OFFSET.y },
  pose: r.pose,
  local: { x: r.tiles[0]![0] },
}));

export function bounds(def: EquipmentDef) {
  const xs = def.tiles.map((t) => t[0]), ys = def.tiles.map((t) => t[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  return { x0, x1, y0, y1, cx: (x0 + x1 + 1) / 2, cz: (y0 + y1 + 1) / 2 };
}

// Grundriss des Grundstücks. Eine Kachel = 1 Welteinheit; x nach rechts unten, y (in 3D: z) nach links unten.
//
// Spalten: Wand | 8 (Wellness, Ausbau West, Umkleide) | Wand | 8 (Ausbau Nord, Gym, Lobby) | Wand | 6 (Kurs, Bar, Personal) | Wand
// Zeilen:  Wand | 10 | Wand | 10 (Gym-Zeile) | Wand | 5 (Lobby-Zeile) | Wand | Gehweg | Wiese
//
// Zeichen: '#' Wand/Flur, '.' Kraftraum, ',' Lobby, 'o' Gehweg, 'r' Wiese, '-' Durchgang zu einer Baufläche,
// Buchstaben = gesperrte Bauflächen (siehe REGIONS).

export const COLS = 26;
export const ROWS = 31;

export type Tile = readonly [number, number];

export interface Region {
  key: string;
  lvl: number;
  cost: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const grid: string[][] = Array.from({ length: ROWS }, () => Array<string>(COLS).fill("#"));
function fill(x0: number, y0: number, x1: number, y1: number, c: string) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) grid[y]![x] = c;
}
fill(1, 1, 8, 10, "x"); fill(10, 1, 17, 10, "n"); fill(19, 1, 24, 10, "k");
fill(1, 12, 8, 21, "w"); fill(10, 12, 17, 21, "."); fill(19, 12, 24, 21, "b");
fill(1, 23, 8, 27, "u"); fill(10, 23, 17, 27, ","); fill(19, 23, 24, 27, "f");
fill(13, 22, 14, 22, "."); fill(13, 28, 14, 28, ",");
fill(0, 29, COLS - 1, 29, "o"); fill(0, 30, COLS - 1, 30, "r");

export const OPENINGS: readonly Tile[] = [[9, 5], [18, 5], [4, 11], [14, 11], [21, 11], [9, 16], [18, 16], [9, 25], [18, 25]];
for (const [x, y] of OPENINGS) grid[y]![x] = "-";

export const MAP: readonly string[] = grid.map((r) => r.join(""));

export function at(x: number, y: number): string {
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return " ";
  return MAP[y]![x]!;
}
export const isWall = (c: string) => c === "#";
export const isActive = (c: string) => c === "." || c === ",";

const REGION_DEFS: Record<string, { lvl: number; cost: number }> = {
  u: { lvl: 2, cost: 2500 },
  b: { lvl: 3, cost: 6000 },
  w: { lvl: 4, cost: 9000 },
  k: { lvl: 5, cost: 14000 },
  n: { lvl: 6, cost: 20000 },
  f: { lvl: 7, cost: 26000 },
  x: { lvl: 8, cost: 40000 },
};
export const REGIONS: Record<string, Region> = {};
for (const [key, d] of Object.entries(REGION_DEFS)) REGIONS[key] = { key, ...d, x0: 99, y0: 99, x1: -1, y1: -1 };
for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
  const r = REGIONS[at(x, y)];
  if (!r) continue;
  r.x0 = Math.min(r.x0, x); r.y0 = Math.min(r.y0, y); r.x1 = Math.max(r.x1, x); r.y1 = Math.max(r.y1, y);
}
export const regionCenter = (r: Region) => ({ x: (r.x0 + r.x1 + 1) / 2, z: (r.y0 + r.y1 + 1) / 2 });

/** Ecke des Kraftraums; Geräte sind relativ dazu definiert */
export const GYM_OFFSET = { x: 9, y: 10 } as const;
export const CHECKIN: Tile = [16, 24];
export const JOSEF_HOME: Tile = [17, 25];
export const DESK: readonly Tile[] = [[17, 23], [17, 24]];
export const PLANTS: readonly Tile[] = [[10, 21], [17, 21], [10, 27], [7, 30], [20, 30]];
export const WAIT_TILES: readonly Tile[] = [[12, 16], [13, 16], [12, 18], [13, 18], [12, 19], [15, 20], [15, 15], [13, 14]];
export const STREET_ROW = 29;

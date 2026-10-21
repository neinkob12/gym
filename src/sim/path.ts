import { at, type Tile } from "./map";

export const tileKey = (x: number, y: number) => x + "," + y;

export type Walkable = (x: number, y: number) => boolean;

/** Begehbar sind Kraftraum, Lobby und Gehweg, außer Kacheln mit Geräten, Tresen oder Pflanzen. */
export function makeWalkable(blocked: ReadonlySet<string>): Walkable {
  return (x, y) => ".,o".includes(at(x, y)) && !blocked.has(tileKey(x, y));
}

/** Breitensuche auf dem Raster (4 Richtungen). Das Ziel darf blockiert sein (z. B. ein Gerät). */
export function findPath(walkable: Walkable, sx: number, sy: number, tx: number, ty: number): Tile[] | null {
  if (sx === tx && sy === ty) return [];
  const prev = new Map<string, Tile | null>([[tileKey(sx, sy), null]]);
  const queue: Tile[] = [[sx, sy]];
  for (let i = 0; i < queue.length; i++) {
    const [x, y] = queue[i]!;
    if (x === tx && y === ty) break;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = x + dx, ny = y + dy, k = tileKey(nx, ny);
      if (prev.has(k)) continue;
      if (!(nx === tx && ny === ty) && !walkable(nx, ny)) continue;
      prev.set(k, [x, y]);
      queue.push([nx, ny]);
    }
  }
  if (!prev.has(tileKey(tx, ty))) return null;
  const path: Tile[] = [];
  let cur: Tile | null = [tx, ty];
  while (cur && !(cur[0] === sx && cur[1] === sy)) {
    path.unshift(cur);
    cur = prev.get(tileKey(cur[0], cur[1])) ?? null;
  }
  return path;
}

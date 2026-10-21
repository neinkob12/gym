// Böden, Wände, Fassade und feste Deko des Grundstücks.

import * as THREE from "three";
import { COLS, MAP, OPENINGS, REGIONS, ROWS, at, isActive, isWall, regionCenter } from "../sim/map";
import { B, cyl, faceBuilder, geo, mat, mesh, shade } from "./kit";
import { PAL } from "./palette";

const WT = 0.2, TALL = 1.2, LOW = 0.22, CAP = 0.05, FT = 0.28;

function floorColor(c: string, x: number, y: number): string {
  const a = (x + y) & 1;
  if (c === ".") return PAL.hall[a]!;
  if (c === ",") return PAL.lobby[a]!;
  if (c === "o") return PAL.walk[a]!;
  if (c === "r") return PAL.grass[a]!;
  if (c === "#" || c === "-") return PAL.corridor;
  return PAL.lot[a]!;
}

export function buildStructure(scene: THREE.Scene): THREE.Group {
  const root = new THREE.Group();
  scene.add(root);

  const floor = faceBuilder();
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    floor.face([[x, 0, y], [x, 0, y + 1], [x + 1, 0, y + 1], [x + 1, 0, y]], [0, 1, 0], floorColor(MAP[y]![x]!, x, y));
  }
  root.add(floor.build());

  // Wände wie bei Hotel Tycoon: kräftig, helle Kappe, Sockelleiste. Hinten hoch, wenn dahinter eine Baufläche liegt.
  const wb = faceBuilder();
  const wall = (x0: number, z0: number, x1: number, z1: number, h: number, inner: string, innerSide: string, outer: string) => {
    wb.box(x0, 0, z0, x1, h, z1, (k) => (k === "top" ? null : k === innerSide ? inner : outer));
    wb.box(x0 - 0.015, h, z0 - 0.015, x1 + 0.015, h + CAP, z1 + 0.015, (k) => (k === "top" ? PAL.cap : shade(PAL.cap, 0.88)));
  };
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    const c = at(x, y);
    const room = isActive(c), lot = !!REGIONS[c];
    if (!room && !lot) continue;
    for (const [dx, dy] of [[0, -1], [-1, 0], [0, 1], [1, 0]] as const) {
      if (!isWall(at(x + dx, y + dy))) continue;
      const x0 = dx === 1 ? x + 1 - WT : x, x1 = dx === -1 ? x + WT : x + 1;
      const z0 = dy === 1 ? y + 1 - WT : y, z1 = dy === -1 ? y + WT : y + 1;
      if (lot) { wb.box(x0, 0, z0, x1, 0.06, z1, (k) => (k === "top" ? PAL.cap : PAL.lotEdge)); continue; }
      const back = dx === -1 || dy === -1;
      const h = back && REGIONS[at(x + 2 * dx, y + 2 * dy)] ? TALL : LOW;
      const innerSide = dx === 1 ? "-x" : dx === -1 ? "+x" : dy === 1 ? "-z" : "+z";
      const col = c === "." ? PAL.wall : PAL.wallLobby;
      wall(x0, z0, x1, z1, h, col, innerSide, shade(col, 0.82));
      const bx0 = dx === -1 ? x1 : dx === 1 ? x0 - 0.012 : x0, bx1 = dx === -1 ? x1 + 0.012 : dx === 1 ? x0 : x1;
      const bz0 = dy === -1 ? z1 : dy === 1 ? z0 - 0.012 : z0, bz1 = dy === -1 ? z1 + 0.012 : dy === 1 ? z0 : z1;
      wb.box(bx0, 0, bz0, bx1, 0.07, bz1, () => PAL.base);
    }
  }
  // Außenfassade: hinten hoch mit Fenstern, vorne niedrig
  for (let x = 0; x < COLS; x++) {
    if (isWall(at(x, 0))) wall(x, 0, x + 1, FT, 1.45, PAL.facade, "+z", PAL.facade);
    if (isWall(at(x, 28))) wall(x, 29 - FT, x + 1, 29, 0.32, PAL.facade, "-z", PAL.facade);
  }
  for (let y = 0; y < 29; y++) {
    wall(0, y, FT, y + 1, 1.45, PAL.facade, "+x", PAL.facade);
    wall(COLS - FT, y, COLS, y + 1, 0.32, PAL.facade, "-x", PAL.facade);
  }
  const walls = wb.build();
  walls.castShadow = true;
  root.add(walls);

  const deco = new THREE.Group();
  root.add(deco);
  const glass = new THREE.MeshLambertMaterial({ color: PAL.glass, emissive: "#0d2233" });
  for (let x = 2; x < COLS - 1; x += 3) {
    mesh(geo(1.1, 0.62, 0.04), mat(PAL.cap), x + 0.5, 0.82, FT + 0.01, deco);
    mesh(geo(1.0, 0.54, 0.05), glass, x + 0.5, 0.82, FT + 0.012, deco);
    mesh(geo(0.04, 0.54, 0.06), mat(PAL.cap), x + 0.5, 0.82, FT + 0.015, deco);
  }
  for (let y = 2; y < 28; y += 3) {
    mesh(geo(0.04, 0.62, 1.1), mat(PAL.cap), FT + 0.01, 0.82, y + 0.5, deco);
    mesh(geo(0.05, 0.54, 1.0), glass, FT + 0.012, 0.82, y + 0.5, deco);
    mesh(geo(0.06, 0.54, 0.04), mat(PAL.cap), FT + 0.015, 0.82, y + 0.5, deco);
  }
  // Türrahmen zwischen Gym und Lobby und am Eingang
  for (const z of [22.5, 28.5]) {
    mesh(geo(0.12, 0.95, 0.24), mat(PAL.door), 13.06, 0.475, z, deco);
    mesh(geo(0.12, 0.95, 0.24), mat(PAL.door), 14.94, 0.475, z, deco);
    mesh(geo(2, 0.14, 0.24), mat(PAL.door), 14, 1.0, z, deco);
    mesh(geo(1.6, 0.1, 0.26), mat(PAL.trim), 14, 1.0, z, deco);
  }
  // Zierleiste, Spiegel, Poster im Kraftraum; Hebeplattform; Fußmatte
  B(deco, 10.2, 12.2, 7.8, 0.02, 2, 13, PAL.trim);
  B(deco, 10.2, 12.2, 0.02, 9.8, 2, 13, PAL.trim);
  B(deco, 11.9, 12.2, 2.6, 0.04, 20, 13, PAL.metal);
  B(deco, 12.0, 12.22, 2.4, 0.04, 18, 14, PAL.mirror);
  B(deco, 10.2, 17.2, 0.04, 1.0, 12, 16, PAL.trim);
  B(deco, 10.2, 13.6, 0.04, 0.8, 12, 16, PAL.poster);
  B(deco, 15.05, 12.15, 1.9, 1.8, 1, 0, PAL.platform);
  B(deco, 13.1, 28.1, 1.8, 0.8, 0.4, 0, PAL.mat);
  // Absperrungen vor den Bauflächen
  for (const [x, y] of OPENINGS) {
    const alongZ = isWall(at(x, y - 1));
    const a = alongZ ? [x + 0.5, y + 0.12] : [x + 0.12, y + 0.5];
    const b = alongZ ? [x + 0.5, y + 0.88] : [x + 0.88, y + 0.5];
    cyl(deco, 0.04, 0.4, a[0]!, 0.2, a[1]!, PAL.chromeDk);
    cyl(deco, 0.04, 0.4, b[0]!, 0.2, b[1]!, PAL.chromeDk);
    mesh(geo(alongZ ? 0.03 : 0.76, 0.03, alongZ ? 0.76 : 0.03), mat("#e5484d"), x + 0.5, 0.34, y + 0.5, deco);
  }
  // Schild auf jeder Baufläche
  for (const r of Object.values(REGIONS)) {
    const c = regionCenter(r);
    cyl(deco, 0.04, 0.9, c.x - 0.35, 0.45, c.z, "#7d8794");
    cyl(deco, 0.04, 0.9, c.x + 0.35, 0.45, c.z, "#7d8794");
    mesh(geo(1.0, 0.5, 0.06), mat("#ffffff"), c.x, 0.95, c.z, deco);
    mesh(geo(0.9, 0.1, 0.07), mat(PAL.trim), c.x, 1.12, c.z, deco);
  }
  return root;
}

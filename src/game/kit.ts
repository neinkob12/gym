// Gemeinsame 3D-Helfer: zwischengespeicherte Geometrien und Materialien, Quader im alten Pixelmaß, Flächen-Bauer.

import * as THREE from "three";

/** Höhen aus den 2D-Entwürfen waren in Pixeln; 28 px entsprechen einer Welteinheit. */
export const HS = 1 / 28;

const geoCache = new Map<string, THREE.BoxGeometry>();
const matCache = new Map<string, THREE.MeshLambertMaterial>();

export function geo(w: number, h: number, d: number): THREE.BoxGeometry {
  const k = `${w.toFixed(3)}|${h.toFixed(3)}|${d.toFixed(3)}`;
  let g = geoCache.get(k);
  if (!g) { g = new THREE.BoxGeometry(w, h, d); geoCache.set(k, g); }
  return g;
}

export function mat(color: string): THREE.MeshLambertMaterial {
  let m = matCache.get(color);
  if (!m) { m = new THREE.MeshLambertMaterial({ color }); matCache.set(color, m); }
  return m;
}

export function mesh(g: THREE.BufferGeometry, m: THREE.Material | THREE.Material[], x: number, y: number, z: number, parent?: THREE.Object3D) {
  const o = new THREE.Mesh(g, m);
  o.position.set(x, y, z);
  o.castShadow = true;
  o.receiveShadow = true;
  parent?.add(o);
  return o;
}

/** Quader: Grundriss in Kacheln (fx, fy, w, d), Höhe und Sockel in alten Pixeln. */
export function B(parent: THREE.Object3D, fx: number, fy: number, w: number, d: number, hpx: number, zpx: number, color: string, top?: string) {
  const h = Math.max(0.01, hpx * HS);
  const m = top ? [mat(color), mat(color), mat(top), mat(color), mat(color), mat(color)] : mat(color);
  return mesh(geo(w, h, d), m, fx + w / 2, zpx * HS + h / 2, fy + d / 2, parent);
}

export function cyl(parent: THREE.Object3D, r: number, h: number, x: number, y: number, z: number, color: string, seg = 10) {
  return mesh(new THREE.CylinderGeometry(r, r, h, seg), mat(color), x, y, z, parent);
}

export function shade(hex: string, f: number): string {
  return "#" + new THREE.Color(hex).multiplyScalar(f).getHexString();
}

type Face = "top" | "+x" | "-x" | "+z" | "-z";

/** Sammelt viele Quaderflächen mit Vertexfarben in einem einzigen Mesh (spart Draw Calls). */
export function faceBuilder() {
  const P: number[] = [], N: number[] = [], C: number[] = [];
  const col = new THREE.Color();
  function face(v: number[][], n: number[], c: string) {
    col.set(c);
    for (const i of [0, 1, 2, 0, 2, 3]) { P.push(...v[i]!); N.push(...n); C.push(col.r, col.g, col.b); }
  }
  function box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, colorFor: (f: Face) => string | null) {
    const faces: [Face, number[][], number[]][] = [
      ["top", [[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]], [0, 1, 0]],
      ["+x", [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], [1, 0, 0]],
      ["-x", [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], [-1, 0, 0]],
      ["+z", [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1]],
      ["-z", [[x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]], [0, 0, -1]],
    ];
    for (const [k, v, n] of faces) { const c = colorFor(k); if (c) face(v, n, c); }
  }
  function build(): THREE.Mesh {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(C, 3));
    const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true }));
    m.receiveShadow = true;
    return m;
  }
  return { face, box, build };
}

/** Zeichnet ein Bild in eine Canvas-Textur (für Sprites). */
export function canvasTexture(draw: (k: CanvasRenderingContext2D) => void, size = 128): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

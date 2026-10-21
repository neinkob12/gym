// Lädt die CC0-Modelle von Kenney (public/models) einmal und liefert Kopien.

import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { Person } from "../sim/game";
import { FACES, outfitTexture } from "./outfits";

/** Alle kantigen Figuren teilen Geometrie und Animationen, nur die Textur unterscheidet sich. */
const CHARACTER_BASE = "blocky/character-c";

const FILES = {
  blocky: ["character-c"],
  cars: ["sedan", "suv", "taxi", "van", "hatchback-sports", "suv-luxury", "delivery"],
  city: ["low-detail-building-a", "low-detail-building-c", "low-detail-building-e", "low-detail-building-g", "low-detail-building-wide-a", "low-detail-building-wide-b"],
  furniture: ["pottedPlant", "plantSmall1", "plantSmall2", "plantSmall3", "computerScreen", "trashcan", "rugDoormat", "chairDesk", "coatRackStanding"],
  nature: ["tree_default", "tree_oak", "tree_detailed", "tree_small", "plant_bush", "plant_bushLarge", "flower_redA", "flower_yellowA"],
} as const;

const loaded = new Map<string, GLTF>();
const faces = new Map<string, HTMLImageElement>();

export async function loadAssets(onProgress: (done: number, total: number) => void): Promise<void> {
  const loader = new GLTFLoader();
  const jobs = Object.entries(FILES).flatMap(([dir, names]) => names.map((n) => `${dir}/${n}`));
  const images = new THREE.ImageLoader();
  let done = 0;
  const total = jobs.length + FACES.length;
  const faceJobs = FACES.map(async (f) => {
    faces.set(f, await images.loadAsync(`${import.meta.env.BASE_URL}models/blocky/Textures/texture-${f}.png`));
    onProgress(++done, total);
  });
  await Promise.all([...faceJobs, ...jobs.map(async (key) => {
    const gltf = await loader.loadAsync(`${import.meta.env.BASE_URL}models/${key}.glb`);
    gltf.scene.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    loaded.set(key, gltf);
    onProgress(++done, total);
  })]);
}

/** Kopie eines statischen Modells, auf eine Zielgröße (größte Kante in Welteinheiten) skaliert. */
export function model(key: string, size?: number): THREE.Object3D {
  const g = loaded.get(key);
  if (!g) throw new Error(`Modell fehlt: ${key}`);
  const o = g.scene.clone(true);
  if (size) {
    const box = new THREE.Box3().setFromObject(o), s = box.getSize(new THREE.Vector3());
    o.scale.setScalar(size / Math.max(s.x, s.y, s.z));
  }
  return o;
}

/** Kopie einer animierten Figur mit passendem Outfit samt ihrer Animationen. */
export function character(type: Person["type"], index: number): { scene: THREE.Object3D; clips: THREE.AnimationClip[] } {
  const g = loaded.get(CHARACTER_BASE)!;
  const scene = g.scene.clone(true);
  const material = new THREE.MeshStandardMaterial({ map: outfitTexture(faces, type, index), roughness: 0.9, metalness: 0 });
  scene.traverse((o) => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = material; });
  return { scene, clips: g.animations };
}

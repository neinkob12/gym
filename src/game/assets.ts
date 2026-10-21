// Lädt die CC0-Modelle von Kenney (public/models) einmal und liefert Kopien.

import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";

export const CHARACTER_FILES = [
  "character-male-a", "character-female-a", "character-male-b", "character-female-b", "character-male-c", "character-female-c",
  "character-male-d", "character-female-d", "character-male-e", "character-female-e", "character-male-f", "character-female-f",
] as const;

const FILES = {
  characters: CHARACTER_FILES,
  cars: ["sedan", "suv", "taxi", "van", "hatchback-sports", "suv-luxury", "delivery"],
  city: ["low-detail-building-a", "low-detail-building-c", "low-detail-building-e", "low-detail-building-g", "low-detail-building-wide-a", "low-detail-building-wide-b"],
  furniture: ["pottedPlant", "plantSmall1", "plantSmall2", "plantSmall3", "computerScreen", "trashcan", "rugDoormat", "chairDesk", "coatRackStanding"],
  nature: ["tree_default", "tree_oak", "tree_detailed", "tree_small", "plant_bush", "plant_bushLarge", "flower_redA", "flower_yellowA"],
} as const;

const loaded = new Map<string, GLTF>();

export async function loadAssets(onProgress: (done: number, total: number) => void): Promise<void> {
  const loader = new GLTFLoader();
  const jobs = Object.entries(FILES).flatMap(([dir, names]) => names.map((n) => `${dir}/${n}`));
  let done = 0;
  await Promise.all(jobs.map(async (key) => {
    const gltf = await loader.loadAsync(`${import.meta.env.BASE_URL}models/${key}.glb`);
    gltf.scene.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    loaded.set(key, gltf);
    onProgress(++done, jobs.length);
  }));
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

/** Kopie einer animierten Figur samt ihrer Animationen. */
export function character(index: number): { scene: THREE.Object3D; clips: THREE.AnimationClip[] } {
  const g = loaded.get(`characters/${CHARACTER_FILES[index % CHARACTER_FILES.length]}`)!;
  return { scene: cloneSkinned(g.scene), clips: g.animations };
}

// Lädt die CC0-Modelle von Kenney (public/models) einmal und liefert Kopien. Figuren bauen wir selbst (figure.ts).

import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

const FILES = {
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

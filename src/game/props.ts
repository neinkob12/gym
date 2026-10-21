// Einrichtung: Rezeption, Pflanzen, Flecken auf dem Boden.

import * as THREE from "three";
import { makeRng, range } from "../sim/rng";
import { PLANTS } from "../sim/map";
import { model } from "./assets";
import { B } from "./kit";
import { PAL } from "./palette";

export function buildProps(scene: THREE.Scene) {
  const root = new THREE.Group();
  scene.add(root);

  // Rezeption mit Bildschirm und Stuhl
  B(root, 17.12, 23.08, 0.76, 1.84, 16, 0, PAL.deskFace, PAL.deskTop);
  const screen = model("furniture/computerScreen", 0.45);
  screen.position.set(17.5, 16 / 28, 23.8); screen.rotation.y = -Math.PI / 2;
  root.add(screen);
  const chair = model("furniture/chairDesk", 0.6);
  chair.position.set(17.7, 0, 24.6); chair.rotation.y = -Math.PI / 2;
  root.add(chair);
  const bin = model("furniture/trashcan", 0.35);
  bin.position.set(10.4, 0, 24.5);
  root.add(bin);
  const coat = model("furniture/coatRackStanding", 1.0);
  coat.position.set(10.5, 0, 23.4);
  root.add(coat);

  for (const [x, y] of PLANTS) {
    const p = model(y >= 29 ? "nature/plant_bush" : "furniture/pottedPlant", y >= 29 ? 0.7 : 0.8);
    p.position.set(x + 0.5, 0, y + 0.5);
    root.add(p);
  }

  // Flecken als Zeichen für den Ranz, fest verteilt
  const rng = makeRng(7);
  const stain = new THREE.MeshBasicMaterial({ color: "#7a6640", transparent: true, opacity: 0.16, depthWrite: false });
  for (let i = 0; i < 14; i++) {
    const s = new THREE.Mesh(new THREE.CircleGeometry(range(rng, [0.08, 0.18]), 10), stain);
    s.rotation.x = -Math.PI / 2;
    s.position.set(range(rng, [10.3, 17.7]), 0.006, i < 10 ? range(rng, [12.3, 21.7]) : range(rng, [23.3, 27.7]));
    root.add(s);
  }
  return root;
}

// Umgebung: Wiese, Straßen, Parkplatz, fahrende und parkende Autos (Kenney Car Kit), Nachbarhäuser (City Kit), Bäume (Nature Kit).

import * as THREE from "three";
import { model } from "./assets";
import { mat } from "./kit";
import { PAL } from "./palette";

interface MovingCar { obj: THREE.Object3D; dir: 1 | -1; speed: number }

export class City {
  private readonly cars: MovingCar[] = [];

  constructor(scene: THREE.Scene) {
    const root = new THREE.Group();
    scene.add(root);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), mat(PAL.pavement));
    ground.rotation.x = -Math.PI / 2; ground.position.set(13, -0.02, 15); ground.receiveShadow = true;
    root.add(ground);

    const strip = (x0: number, z0: number, x1: number, z1: number, c: string, y = 0.004) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), mat(c));
      m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); m.receiveShadow = true;
      root.add(m);
    };
    strip(-30, 31.2, 60, 34.6, PAL.road); strip(26.4, -30, 29.8, 31.2, PAL.road);
    strip(-30, 34.6, 60, 35.6, PAL.sidewalk); strip(26, -30, 26.4, 31.2, PAL.sidewalk);
    for (let x = -28; x < 58; x += 2) strip(x, 32.84, x + 1.1, 32.96, PAL.roadLine, 0.008);
    for (let z = -28; z < 30; z += 2) strip(28.04, z, 28.16, z + 1.1, PAL.roadLine, 0.008);
    for (let i = 0; i < 6; i++) strip(12.6 + i * 0.4, 31.3, 12.85 + i * 0.4, 34.5, PAL.roadLine, 0.008);

    // Parkplatz rechts
    strip(29.8, 16, 37.5, 31.2, PAL.parking, 0.006);
    for (let i = 0; i <= 8; i++) { strip(34.6, 17 + i * 1.5, 37.3, 17.07 + i * 1.5, PAL.roadLine, 0.01); strip(29.9, 17 + i * 1.5, 31.2, 17.07 + i * 1.5, PAL.roadLine, 0.01); }
    const carNames = ["sedan", "suv", "taxi", "van", "hatchback-sports", "suv-luxury", "delivery"];
    for (let i = 0; i < 7; i++) {
      if (i === 3) continue;
      const c = this.place(root, `cars/${carNames[i]!}`, 36, 17.75 + i * 1.5, 1.35);
      c.rotation.y = -Math.PI / 2;
    }
    for (let i = 0; i < 4; i++) {
      const obj = this.place(root, `cars/${carNames[(i * 2 + 1) % carNames.length]!}`, -15 + i * 16, i % 2 ? 33.6 : 32.2, 1.35);
      const dir: 1 | -1 = i % 2 ? -1 : 1;
      obj.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      this.cars.push({ obj, dir, speed: 1.6 + (i % 3) * 0.4 });
    }

    // Nachbarhäuser hinter dem Grundstück
    const houses: [string, number, number, number, number][] = [
      ["low-detail-building-wide-a", -5, 6, 7, Math.PI / 2], ["low-detail-building-c", -5, 15, 6, Math.PI / 2], ["low-detail-building-wide-b", -5, 24, 7, Math.PI / 2],
      ["low-detail-building-a", 4, -5, 6, 0], ["low-detail-building-e", 12, -5, 6, 0], ["low-detail-building-g", 20, -5, 6, 0],
      ["low-detail-building-c", 34, 6, 6, -Math.PI / 2],
    ];
    for (const [name, x, z, size, rot] of houses) this.place(root, `city/${name}`, x, z, size).rotation.y = rot;

    // Bäume, Büsche, Blumen
    const trees = ["tree_default", "tree_oak", "tree_detailed", "tree_small"];
    [[2.5, 30.6], [6, 30.6], [21, 30.6], [24.5, 30.6], [-4, 36.4], [4, 36.4], [10, 36.4], [17, 36.4], [23, 36.4], [38.8, 17], [38.8, 22], [38.8, 27], [33, 15.2]]
      .forEach(([x, z], i) => this.place(root, `nature/${trees[i % trees.length]!}`, x!, z!, 1.6).rotation.y = i * 1.3);
    for (const z of [3, 9, 15, 21, 27]) this.place(root, "nature/plant_bushLarge", 26.2, z, 0.8);
    [[1, 30.4], [9, 30.5], [18, 30.4], [25, 30.5]].forEach(([x, z], i) => this.place(root, `nature/${i % 2 ? "flower_redA" : "flower_yellowA"}`, x!, z!, 0.45));
  }

  private place(parent: THREE.Object3D, key: string, x: number, z: number, size: number) {
    const o = model(key, size);
    o.position.set(x, 0, z);
    parent.add(o);
    return o;
  }

  update(dt: number) {
    for (const c of this.cars) {
      c.obj.position.x += c.dir * c.speed * dt;
      if (c.obj.position.x > 45) c.obj.position.x = -18;
      if (c.obj.position.x < -18) c.obj.position.x = 45;
    }
  }
}

// Renderer, Szene, isometrische Kamera und Licht inklusive Tag/Nacht.

import * as THREE from "three";
import { PAL } from "./palette";

/** Etwas steiler als klassisch iso (35°), dadurch wirkt das Gym im Hochformat "nach hinten gestreckt". */
const ELEV = (40 * Math.PI) / 180;
const VIEW_H = 9;
const CAM_DIR = new THREE.Vector3(1, Math.SQRT2 * Math.tan(ELEV), 1).normalize();
const RIGHT = new THREE.Vector3(1, 0, -1).normalize();
/** Bildschirm-oben entspricht dieser Richtung auf dem Boden */
export const FWD = new THREE.Vector3(-1, 0, -1).normalize();

export class Stage {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 400);
  readonly target = new THREE.Vector3(13.2, 0, 17.6);
  zoom = 1;
  width = 1;
  height = 1;
  private goal: THREE.Vector3 | null = null;
  private readonly sun = new THREE.DirectionalLight("#fff3df", 1.75);
  private readonly hemi = new THREE.HemisphereLight("#ffffff", "#9f907c", 1.6);
  private readonly roomLights: THREE.PointLight[] = [];
  private readonly ray = new THREE.Raycaster();
  private readonly groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  constructor(readonly canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene.background = new THREE.Color(PAL.bg);

    const s = this.sun;
    s.castShadow = true;
    s.shadow.mapSize.set(2048, 2048);
    Object.assign(s.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 120 });
    s.shadow.bias = -0.0008;
    s.target.position.set(13, 0, 15);
    s.position.set(-1, 30, 25);
    this.scene.add(this.hemi, s, s.target, new THREE.AmbientLight("#ffffff", 0.2));
    // Deckenlicht in Kraftraum und Lobby, nachts an
    for (const [x, z] of [[12, 14.5], [15.5, 14.5], [12, 19], [15.5, 19], [13.8, 25.5]] as const) {
      const l = new THREE.PointLight("#fff1d6", 0, 8, 1.2);
      l.position.set(x, 2.2, z);
      this.scene.add(l);
      this.roomLights.push(l);
    }
  }

  resize() {
    this.width = this.canvas.clientWidth || window.innerWidth;
    this.height = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(this.width, this.height, false);
    this.updateCamera();
  }

  updateCamera() {
    const a = this.width / Math.max(1, this.height);
    Object.assign(this.camera, { left: -VIEW_H * a, right: VIEW_H * a, top: VIEW_H, bottom: -VIEW_H, zoom: this.zoom });
    this.camera.updateProjectionMatrix();
    this.target.x = Math.max(-2, Math.min(30, this.target.x));
    this.target.z = Math.max(-2, Math.min(32, this.target.z));
    this.camera.position.copy(this.target).addScaledVector(CAM_DIR, 80);
    this.camera.lookAt(this.target);
  }

  center() {
    this.goal = null;
    this.target.set(13.2, 0, 17.6);
    this.zoom = Math.max(0.6, Math.min(1.8, this.width / 380));
    this.updateCamera();
  }

  panBy(dx: number, dy: number) {
    this.goal = null;
    const wpp = (2 * VIEW_H) / this.zoom / this.height;
    this.target.addScaledVector(RIGHT, -dx * wpp);
    this.target.addScaledVector(FWD, (dy * wpp) / Math.sin(ELEV));
    this.updateCamera();
  }

  zoomTo(z: number) { this.zoom = Math.max(0.45, Math.min(3, z)); this.updateCamera(); }

  /** Fährt weich zu einem Punkt. screenShift > 0 schiebt ihn auf dem Bildschirm nach oben (Platz für Menüs). */
  flyTo(x: number, z: number, screenShift = 0) {
    const shift = ((VIEW_H / this.zoom) * screenShift) / Math.sin(ELEV);
    this.goal = new THREE.Vector3(x, 0, z).addScaledVector(FWD, -shift);
  }

  stopFlying() { this.goal = null; }

  toScreen(x: number, y: number, z: number): [number, number] {
    const v = new THREE.Vector3(x, y, z).project(this.camera);
    return [((v.x + 1) / 2) * this.width, ((1 - v.y) / 2) * this.height];
  }

  groundAt(sx: number, sy: number): THREE.Vector3 | null {
    this.ray.setFromCamera(new THREE.Vector2((sx / this.width) * 2 - 1, -((sy / this.height) * 2 - 1)), this.camera);
    return this.ray.ray.intersectPlane(this.groundPlane, new THREE.Vector3());
  }

  /** hour: 0..24 */
  setTimeOfDay(hour: number) {
    let dark = 0;
    if (hour >= 22 || hour < 5) dark = 1;
    else if (hour >= 19) dark = (hour - 19) / 3;
    else if (hour < 7) dark = 1 - (hour - 5) / 2;
    this.sun.intensity = 1.75 - dark * 0.95;
    this.hemi.intensity = 1.6 - dark * 0.4;
    this.hemi.color.set(dark > 0.5 ? "#c9d6ff" : "#ffffff");
    for (const l of this.roomLights) l.intensity = dark * 9;
    (this.scene.background as THREE.Color).set(PAL.bg).lerp(new THREE.Color(PAL.night), dark * 0.45);
  }

  update(dt: number) {
    if (!this.goal) return;
    this.target.lerp(this.goal, Math.min(1, dt * 6));
    if (this.target.distanceTo(this.goal) < 0.02) this.goal = null;
    this.updateCamera();
  }

  render() { this.renderer.render(this.scene, this.camera); }
}

// Hält die 3D-Szene synchron zum Spielzustand und beantwortet "was wurde angetippt?".

import * as THREE from "three";
import { T } from "../content/strings";
import { bounds } from "../sim/equipment";
import { eqById, type Game, type Person } from "../sim/game";
import { REGIONS, at, regionCenter } from "../sim/map";
import { CharacterView } from "./characters";
import { City } from "./city";
import { Effects, ICONS, sprite } from "./effects";
import { buildEquipment, type EquipmentView } from "./equipmentModels";
import { PAL } from "./palette";
import { buildProps } from "./props";
import { Stage } from "./stage";
import { buildStructure } from "./structure";

export type Pick =
  | { type: "litter"; id: number }
  | { type: "josef" }
  | { type: "person"; person: Person }
  | { type: "equipment"; id: string }
  | { type: "region"; key: string }
  | { type: "gym" }
  | { type: "none" };

export class GameView {
  readonly stage: Stage;
  readonly effects: Effects;
  private readonly city: City;
  private readonly equipment = new Map<string, EquipmentView>();
  private readonly people = new Map<number, CharacterView>();
  private readonly bubbles = new Map<number, THREE.Sprite>();
  private readonly brokenMarks = new Map<string, THREE.Sprite>();
  private readonly litter = new Map<number, { item: THREE.Object3D; arrow: THREE.Mesh }>();
  private readonly overlay: CanvasRenderingContext2D;
  private speech: { text: string; t: number } | null = null;
  private time = 0;

  constructor(canvas: HTMLCanvasElement, private readonly overlayCanvas: HTMLCanvasElement, g: Game) {
    this.stage = new Stage(canvas);
    this.overlay = overlayCanvas.getContext("2d")!;
    const scene = this.stage.scene;
    buildStructure(scene);
    buildProps(scene);
    this.city = new City(scene);
    this.effects = new Effects(scene);
    for (const e of g.equipment) {
      const v = buildEquipment(e);
      scene.add(v.group);
      this.equipment.set(e.def.id, v);
    }
  }

  resize() {
    this.stage.resize();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.overlayCanvas.width = Math.round(this.stage.width * dpr);
    this.overlayCanvas.height = Math.round(this.stage.height * dpr);
  }

  say(text: string, seconds = 3.4) { this.speech = { text, t: seconds }; }

  select(eqId: string | null) {
    const ring = this.effects.ring;
    ring.visible = !!eqId;
    if (!eqId) return;
    const b = bounds(this.equipmentDef(eqId));
    ring.position.set(b.cx, 0.02, b.cz);
    ring.scale.setScalar(Math.max(b.x1 - b.x0 + 1, b.y1 - b.y0 + 1) * 0.75);
  }

  private game: Game | null = null;
  private equipmentDef(id: string) { return eqById(this.game!, id).def; }

  sync(g: Game, dt: number) {
    this.game = g;
    this.time += dt;
    const scene = this.stage.scene;
    this.stage.setTimeOfDay(g.minutes / 60);

    for (const e of g.equipment) {
      const user = e.userId !== null ? g.people.find((p) => p.id === e.userId) : undefined;
      this.equipment.get(e.def.id)!.update(e, !!user && user.state === "using", dt);
      let mark = this.brokenMarks.get(e.def.id);
      if (e.broken && !e.queued) {
        if (!mark) { mark = sprite(ICONS.broken, 0.5); scene.add(mark); this.brokenMarks.set(e.def.id, mark); }
        const b = bounds(e.def), top = e.def.kind === "lat" || e.def.kind === "rack" ? 1.95 : e.def.kind === "tm" ? 1.25 : 1.0;
        mark.position.set(b.cx, top + 0.15 + Math.sin(this.time * 3) * 0.04, b.cz);
        if (Math.random() < dt * 2.5) this.effects.smoke(b.cx, b.cz);
      } else if (mark) { scene.remove(mark); this.brokenMarks.delete(e.def.id); }
    }

    // Figuren anlegen, bewegen, entfernen
    const alive = new Set<number>();
    for (const p of [...g.people, g.josef]) {
      alive.add(p.id);
      let v = this.people.get(p.id);
      if (!v) { v = new CharacterView(p); scene.add(v.root); this.people.set(p.id, v); }
      v.update(p, p.eqId ? eqById(g, p.eqId) : null, dt);
      let b = this.bubbles.get(p.id);
      if (p.bubble) {
        if (!b || b.userData.icon !== p.bubble.icon) {
          if (b) scene.remove(b);
          b = sprite(ICONS[p.bubble.icon], 0.42); b.userData.icon = p.bubble.icon;
          scene.add(b); this.bubbles.set(p.id, b);
        }
        b.position.set(p.x, 1.45, p.z);
      } else if (b) { scene.remove(b); this.bubbles.delete(p.id); }
    }
    for (const [id, v] of this.people) if (!alive.has(id)) {
      v.dispose(); this.people.delete(id);
      const b = this.bubbles.get(id); if (b) { scene.remove(b); this.bubbles.delete(id); }
    }

    // Müll
    const ids = new Set(g.litter.map((l) => l.id));
    for (const l of g.litter) if (!this.litter.has(l.id)) this.litter.set(l.id, this.effects.litterMesh(l));
    for (const [id, m] of this.litter) {
      if (!ids.has(id)) { scene.remove(m.item, m.arrow); this.litter.delete(id); continue; }
      m.arrow.position.y = 0.55 + Math.abs(Math.sin(this.time * 4 + id)) * 0.15;
      m.arrow.rotation.y = this.time * 2;
    }

    if (this.speech && (this.speech.t -= dt) <= 0) this.speech = null;
    this.city.update(dt);
    this.effects.update(dt);
    this.stage.update(dt);
    this.stage.render();
    this.drawOverlay(g);
  }

  pick(sx: number, sy: number, g: Game): Pick {
    const st = this.stage;
    let best: number | null = null, bestD = 34;
    for (const l of g.litter) {
      const a = st.toScreen(l.tx + l.ox, 0.05, l.ty + l.oz), b = st.toScreen(l.tx + l.ox, 0.6, l.ty + l.oz);
      const d = Math.min(Math.hypot(a[0] - sx, a[1] - sy), Math.hypot(b[0] - sx, b[1] - sy));
      if (d < bestD) { bestD = d; best = l.id; }
    }
    if (best !== null) return { type: "litter", id: best };

    for (const p of [g.josef, ...g.people]) {
      const f = st.toScreen(p.x, 0, p.z), h = st.toScreen(p.x, 1.05, p.z);
      if (Math.abs(sx - f[0]) < 16 && sy < f[1] + 4 && sy > h[1] - 4) return p.staff ? { type: "josef" } : { type: "person", person: p };
    }

    const gp = st.groundAt(sx, sy);
    if (!gp) return { type: "none" };
    // Geräte stehen hoch: auch Punkte etwas weiter hinten zählen
    for (const e of g.equipment) {
      const b = bounds(e.def);
      for (const back of [0, 0.5, 1]) {
        if (Math.abs(gp.x - back - b.cx) < (b.x1 - b.x0 + 1) / 2 + 0.2 && Math.abs(gp.z - back - b.cz) < (b.y1 - b.y0 + 1) / 2 + 0.2) return { type: "equipment", id: e.def.id };
      }
    }
    const tx = Math.floor(gp.x), ty = Math.floor(gp.z);
    if (at(tx, ty) === ".") return { type: "gym" };
    for (const r of Object.values(REGIONS)) if (tx >= r.x0 && tx <= r.x1 && ty >= r.y0 && ty <= r.y1) return { type: "region", key: r.key };
    return { type: "none" };
  }

  private drawOverlay(g: Game) {
    const k = this.overlay, st = this.stage;
    const dpr = this.overlayCanvas.width / Math.max(1, st.width);
    k.setTransform(dpr, 0, 0, dpr, 0, 0);
    k.clearRect(0, 0, st.width, st.height);
    k.textAlign = "center"; k.textBaseline = "middle";
    for (const r of Object.values(REGIONS)) {
      const c = regionCenter(r);
      const [sx, sy] = st.toScreen(c.x, 1.55, c.z);
      if (sx < -100 || sx > st.width + 100 || sy < -40 || sy > st.height + 40) continue;
      const name = T.regions[r.key] ?? r.key;
      k.font = "800 12.5px Manrope, system-ui, sans-serif";
      const w = Math.max(k.measureText(name).width, 72) + 22;
      k.fillStyle = "rgba(34,39,46,.92)"; roundRect(k, sx - w / 2, sy - 20, w, 38, 6); k.fill();
      k.fillStyle = "#f3f5f7"; k.fillText(name, sx, sy - 8);
      k.font = "700 10.5px Manrope, system-ui, sans-serif"; k.fillStyle = PAL.trim;
      k.fillText(`AB LEVEL ${r.lvl}`, sx, sy + 8);
    }
    if (this.speech) {
      const j = g.josef;
      const [sx, sy0] = st.toScreen(j.x, 1.3, j.z);
      k.font = "600 13px Manrope, system-ui, sans-serif";
      const maxW = Math.min(230, st.width - 32);
      const lines: string[] = []; let ln = "";
      for (const w of this.speech.text.split(" ")) {
        const test = ln ? ln + " " + w : w;
        if (k.measureText(test).width > maxW - 22 && ln) { lines.push(ln); ln = w; } else ln = test;
      }
      lines.push(ln);
      const bw = Math.min(maxW, Math.max(...lines.map((l) => k.measureText(l).width)) + 22), bh = lines.length * 17 + 14;
      const bx = Math.max(16, Math.min(st.width - 16 - bw, sx - bw / 2)), by = sy0 - bh - 10;
      k.globalAlpha = Math.min(1, this.speech.t * 3);
      k.fillStyle = "rgba(0,0,0,.14)"; roundRect(k, bx, by + 3, bw, bh, 7); k.fill();
      k.fillStyle = "#ffffff"; roundRect(k, bx, by, bw, bh, 7); k.fill();
      k.beginPath(); k.moveTo(sx - 7, by + bh); k.lineTo(sx + 7, by + bh); k.lineTo(sx, by + bh + 8); k.fill();
      k.fillStyle = "#1d232b"; k.textAlign = "left";
      lines.forEach((l, i) => k.fillText(l, bx + 11, by + 15 + i * 17));
      k.textAlign = "center"; k.globalAlpha = 1;
    }
  }
}

function roundRect(k: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  k.beginPath(); k.moveTo(x + r, y); k.arcTo(x + w, y, x + w, y + h, r); k.arcTo(x + w, y + h, x, y + h, r);
  k.arcTo(x, y + h, x, y, r); k.arcTo(x, y, x + w, y, r); k.closePath();
}

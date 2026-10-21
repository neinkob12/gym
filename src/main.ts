// Einstieg: Modelle laden, Spielstand laden, Szene und Oberfläche verbinden, Spielschleife.

import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import "./ui/styles.css";
import { T } from "./content/strings";
import { loadAssets } from "./game/assets";
import { GameView, type Pick } from "./game/view";
import { introDone, loadSave, markIntroDone, writeSave } from "./lib/storage";
import { tapFeedback } from "./lib/haptics";
import { cleanLitter, createGame, eqById, needsRepair, requestRepair, step, takeEvents, toSave, type Game } from "./sim/game";
import { REGIONS } from "./sim/map";
import { bounds } from "./sim/equipment";
import { CONFIG } from "./sim/config";
import { $, Ui } from "./ui/ui";

async function boot() {
  $("loader-text").textContent = T.loading;
  try {
    await loadAssets((done, total) => { $("loader-bar").style.width = `${(done / total) * 100}%`; });
  } catch (err) {
    console.error(err);
    $("loader-text").textContent = T.loadFailed;
    return;
  }

  const save = await loadSave();
  let game: Game = createGame(Date.now(), save);
  const view = new GameView($<HTMLCanvasElement>("gl"), $<HTMLCanvasElement>("overlay"), game);
  let speed = 1;

  const ui = new Ui(() => game, {
    focusEquipment(id) {
      view.select(id);
      if (!id) return;
      const b = bounds(eqById(game, id).def);
      view.stage.flyTo(b.cx, b.cz, 0.55);
    },
    focusPoint(x, z) { view.stage.flyTo(x, z); },
    onAction() { tapFeedback(true); },
  });

  view.resize();
  view.stage.center();
  window.addEventListener("resize", () => view.resize());
  $("loader").hidden = true;

  if (!(await introDone())) ui.intro(() => { void markIntroDone(); });

  // ---------- Eingabe: ziehen, zwei Finger zoomen, tippen ----------
  const canvas = $<HTMLCanvasElement>("gl");
  const pointers = new Map<number, { x: number; y: number }>();
  let gesture: { pinch: boolean; lx: number; ly: number; sx: number; sy: number; t: number; moved: boolean; d: number; z: number } | null = null;
  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    view.stage.stopFlying();
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.values()];
    if (pts.length === 1) gesture = { pinch: false, lx: e.clientX, ly: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), moved: false, d: 0, z: view.stage.zoom };
    else if (pts.length === 2) gesture = { pinch: true, lx: 0, ly: 0, sx: 0, sy: 0, t: 0, moved: true, d: Math.hypot(pts[0]!.x - pts[1]!.x, pts[0]!.y - pts[1]!.y), z: view.stage.zoom };
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId) || !gesture) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.values()];
    if (!gesture.pinch && pts.length === 1) {
      if (Math.hypot(e.clientX - gesture.sx, e.clientY - gesture.sy) > 6) gesture.moved = true;
      view.stage.panBy(e.clientX - gesture.lx, e.clientY - gesture.ly);
      gesture.lx = e.clientX; gesture.ly = e.clientY;
    } else if (gesture.pinch && pts.length === 2) {
      view.stage.zoomTo((gesture.z * Math.hypot(pts[0]!.x - pts[1]!.x, pts[0]!.y - pts[1]!.y)) / gesture.d);
    }
  });
  const end = (e: PointerEvent) => {
    if (!pointers.delete(e.pointerId)) return;
    if (gesture && !gesture.pinch && !gesture.moved && performance.now() - gesture.t < 400 && pointers.size === 0) {
      const r = canvas.getBoundingClientRect();
      onTap(view.pick(e.clientX - r.left, e.clientY - r.top, game));
    }
    if (pointers.size === 0) gesture = null;
    else if (pointers.size === 1) { const [p] = [...pointers.values()]; gesture = { pinch: false, lx: p!.x, ly: p!.y, sx: p!.x, sy: p!.y, t: 0, moved: true, d: 0, z: view.stage.zoom }; }
  };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  canvas.addEventListener("wheel", (e) => { e.preventDefault(); view.stage.zoomTo(view.stage.zoom * Math.exp(-e.deltaY * 0.0015)); }, { passive: false });

  function onTap(p: Pick) {
    switch (p.type) {
      case "litter": if (cleanLitter(game, p.id)) tapFeedback(); return;
      case "josef": ui.toast(T.josefInfo); return;
      case "person": {
        const type = p.person.type;
        if (type === "staff") return;
        const wants = CONFIG.customerTypes[type].wants.map((k) => T.eq[k as keyof typeof T.eq].name);
        ui.toast(`${T.customers[type]}: ${type === "wellness" ? T.wantsSauna : T.wants([...new Set(wants)].join(", "))}`);
        return;
      }
      case "equipment": {
        const e = eqById(game, p.id);
        if (e.def.kind === "water") { ui.toast(T.water); return; }
        if (needsRepair(e) && !e.queued) {
          if (requestRepair(game, p.id)) { tapFeedback(); ui.toast(T.josefRepairs(T.eq[e.def.kind].the)); }
          return;
        }
        ui.openSheet("eq", p.id);
        return;
      }
      case "gym": ui.openSheet("eq"); return;
      case "region": { const r = REGIONS[p.key]!; ui.toast(T.regionLocked(T.regions[r.key] ?? r.key, r.lvl)); return; }
      default:
        if (ui.sheetOpen) { ui.closeSheet(); ui.closeMgmt(); }
    }
  }

  // ---------- Buttons ----------
  $("speed").addEventListener("click", () => { speed = speed === 1 ? 3 : 1; });
  $("center").addEventListener("click", () => view.stage.center());
  $("btn-build").addEventListener("click", () => ($("mgmt").hidden ? ui.openMgmt("rooms") : ui.closeMgmt()));
  $("btn-staff").addEventListener("click", () => ui.openMgmt("team"));
  $("btn-stats").addEventListener("click", () => ui.toast(T.statsSoon));
  $("btn-alerts").addEventListener("click", () => {
    const e = game.equipment.find((q) => q.broken && !q.queued);
    if (!e) { ui.toast(T.noAlerts); return; }
    const b = bounds(e.def);
    view.stage.flyTo(b.cx, b.cz);
    ui.toast(T.brokenAlert(T.eq[e.def.kind].name));
  });
  $("clean").addEventListener("click", () => {
    const t = view.stage.target;
    const l = [...game.litter].sort((a, b) => Math.hypot(a.tx - t.x, a.ty - t.z) - Math.hypot(b.tx - t.x, b.ty - t.z))[0];
    if (!l) return;
    view.stage.zoomTo(Math.max(view.stage.zoom, 1.6));
    view.stage.flyTo(l.tx + l.ox, l.ty + l.oz);
  });

  // ---------- Spielereignisse ----------
  function handleEvents() {
    for (const ev of takeEvents(game)) {
      switch (ev.type) {
        case "paid": view.effects.bill(ev.x, ev.z); break;
        case "cleaned": view.effects.sparkle(ev.x, ev.z); break;
        case "repaired": { const b = bounds(eqById(game, ev.eqId).def); view.effects.sparkle(b.cx, b.cz, "#8cc4ff"); break; }
        case "broke": view.say(T.josefBroke(T.eq[eqById(game, ev.eqId).def.kind].name)); break;
        case "nag": view.say(T.josefNag); break;
        case "review": {
          const pool = T.reviews[ev.topic];
          ui.review(ev.stars, pool[Math.floor(Math.random() * pool.length)]!, T.customers[ev.by]);
          break;
        }
        case "levelUp": ui.toast(T.levelUp(ev.level)); tapFeedback(true); break;
        case "campaignEnded": ui.toast(T.campaignEnded(T.campaigns[ev.id].name)); break;
      }
    }
  }

  // ---------- Speichern: alle 10 s und beim Verlassen ----------
  const persist = () => void writeSave(toSave(game));
  setInterval(persist, 10000);
  document.addEventListener("visibilitychange", () => { if (document.hidden) persist(); });
  // Zum Testen: #neu in der Adresse startet einen frischen Spielstand
  if (location.hash === "#neu") { game = createGame(Date.now()); persist(); }

  let prev = performance.now();
  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;
    const sdt = dt * speed;
    step(game, sdt);
    handleEvents();
    view.sync(game, sdt);
    ui.update(dt, speed);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

void boot();

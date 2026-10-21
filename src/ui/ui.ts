// HUD, Raum-Menü, Bau- und Verwaltungsmenü, Josef-Dialog und Hinweise.

import { T } from "../content/strings";
import { CONFIG, type CampaignId } from "../sim/config";
import {
  canUpgrade, eqById, hourOf, startCampaign, upgrade, upgradeCost, type Equipment, type Game,
} from "../sim/game";
import { REGIONS, regionCenter } from "../sim/map";
import { EQ_ICON } from "./icons";

export const $ = <E extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as E;

export interface UiHooks {
  /** Kamera zu einem Gerät fahren und es markieren (null = Markierung weg) */
  focusEquipment(id: string | null): void;
  focusPoint(x: number, z: number): void;
  onAction(): void;
}

export class Ui {
  private sheetTab: "eq" | "team" = "eq";
  private mgmtTab: "rooms" | "team" | "ads" = "rooms";
  private selected = "bench";
  private toastT = 0;
  private reviewT = 0;
  private last: Record<string, string | number> = {};

  constructor(private readonly game: () => Game, private readonly hooks: UiHooks) {
    for (const el of document.querySelectorAll<HTMLElement>("[data-t]")) {
      const v = (T as Record<string, unknown>)[el.dataset.t!];
      if (typeof v === "string") el.textContent = v;
    }
    for (const el of document.querySelectorAll<HTMLElement>("[data-label]")) el.setAttribute("aria-label", T.aria[el.dataset.label!] ?? "");

    $("sheet-close").addEventListener("click", () => this.closeSheet());
    $("mgmt-close").addEventListener("click", () => this.closeMgmt());
    $("tab-btn-eq").addEventListener("click", () => { this.sheetTab = "eq"; this.renderSheet(); this.hooks.focusEquipment(this.selected); });
    $("tab-btn-team").addEventListener("click", () => { this.sheetTab = "team"; this.renderSheet(); this.hooks.focusEquipment(null); });
    for (const b of document.querySelectorAll<HTMLElement>("[data-mtab]")) {
      b.addEventListener("click", () => { this.mgmtTab = b.dataset.mtab as Ui["mgmtTab"]; this.renderMgmt(); });
    }
    $("card-upgrade").addEventListener("click", () => {
      if (upgrade(this.game(), this.selected)) { this.hooks.onAction(); this.renderSheet(); }
    });
    swipeToClose($("sheet"), () => this.closeSheet());
    swipeToClose($("mgmt"), () => this.closeMgmt());
  }

  // ---------- Hinweise ----------
  toast(text: string) {
    const el = $("toast");
    el.textContent = text; el.hidden = false; this.toastT = 2.6;
    this.placeToasts();
  }

  review(stars: number, text: string, by: string) {
    const el = $("review");
    el.replaceChildren();
    const st = document.createElement("span"); st.className = "rev-stars"; st.textContent = "★".repeat(stars) + "☆".repeat(5 - stars);
    const tx = document.createElement("span"); tx.textContent = `„${text}“`;
    const who = document.createElement("span"); who.className = "rev-who"; who.textContent = T.reviewBy(by);
    el.append(st, tx, who); el.hidden = false; this.reviewT = 3.4;
    this.placeToasts();
  }

  /** Hinweise sitzen unten über den Buttons, bei offenem Menü direkt über dessen Karteireitern. */
  private placeToasts() {
    const open = [$("sheet"), $("mgmt")].find((x) => !x.hidden);
    const base = open ? open.offsetHeight + 46 : null;
    $("toast").style.bottom = base ? `${base}px` : "";
    $("review").style.bottom = base ? `${base + 54}px` : "";
  }

  // ---------- Raum-Menü ----------
  openSheet(tab: "eq" | "team" = "eq", eqId?: string) {
    this.closeMgmt();
    this.sheetTab = tab;
    if (eqId) this.selected = eqId;
    $("sheet").hidden = false;
    this.renderSheet();
    this.placeToasts();
    if (tab === "eq") this.hooks.focusEquipment(this.selected);
  }

  closeSheet() { $("sheet").hidden = true; this.hooks.focusEquipment(null); this.placeToasts(); }
  get sheetOpen() { return !$("sheet").hidden || !$("mgmt").hidden; }

  private renderSheet() {
    const g = this.game();
    $("tab-btn-eq").setAttribute("aria-pressed", String(this.sheetTab === "eq"));
    $("tab-btn-team").setAttribute("aria-pressed", String(this.sheetTab === "team"));
    $("tab-eq").hidden = this.sheetTab !== "eq";
    $("tab-team").hidden = this.sheetTab !== "team";

    const e = eqById(g, this.selected), txt = T.eq[e.def.kind], cost = upgradeCost(e);
    $("card-icon").innerHTML = `${EQ_ICON[e.def.kind]}<span class="lvl-badge">LV ${e.level}</span>`;
    $("card-title").textContent = txt.name;
    $("card-desc").textContent = `${txt.desc} ${T.condition(Math.round(e.wear))}`;
    const btn = $<HTMLButtonElement>("card-upgrade");
    if (!canUpgrade(e)) { $("card-cost").textContent = T.maxedCost; btn.disabled = true; btn.textContent = T.maxed; }
    else { $("card-cost").textContent = `${cost.toLocaleString("de-DE")} €`; btn.disabled = g.money < cost; btn.textContent = g.money < cost ? T.tooExpensive : T.upgrade; }

    const grid = $("eq-grid");
    grid.replaceChildren();
    for (const q of g.equipment) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "tile";
      b.setAttribute("aria-pressed", String(q.def.id === this.selected));
      b.setAttribute("aria-label", `${T.eq[q.def.kind].name}, Level ${q.level}`);
      b.innerHTML = `${EQ_ICON[q.def.kind]}<span class="n">${q.level}</span>`;
      b.addEventListener("click", () => { this.selected = q.def.id; this.hooks.focusEquipment(q.def.id); this.renderSheet(); });
      grid.append(b);
    }
    const icons = ["leg", "cable", "deco"] as const;
    T.lockedSlots.forEach((l, i) => {
      const d = document.createElement("div");
      d.className = "tile locked"; d.title = `${l.name} ${T.fromLevel(l.lvl)}`;
      d.innerHTML = `${EQ_ICON[icons[i]!]}<span class="n">Lv ${l.lvl}</span>`;
      grid.append(d);
    });

    const team = $("tab-team");
    team.replaceChildren(...T.staffRows.slice(0, 4).map((r) => row(r.initial, r.locked ? "#5f6873" : "#3b8fe0", r.name, r.role, chip(r.pay), r.locked)));
  }

  // ---------- Bau- und Verwaltungsmenü ----------
  openMgmt(tab?: Ui["mgmtTab"]) {
    this.closeSheet();
    if (tab) this.mgmtTab = tab;
    $("mgmt").hidden = false;
    this.renderMgmt();
    this.placeToasts();
  }

  closeMgmt() { $("mgmt").hidden = true; this.placeToasts(); }

  private renderMgmt() {
    const g = this.game();
    for (const b of document.querySelectorAll<HTMLElement>("[data-mtab]")) b.setAttribute("aria-pressed", String(b.dataset.mtab === this.mgmtTab));
    const body = $("mgmt-body");
    body.replaceChildren();
    body.className = this.mgmtTab === "rooms" ? "room-grid" : "list";

    if (this.mgmtTab === "rooms") {
      $("mgmt-title").textContent = T.rooms;
      const gym = roomCell(T.gym, T.active(g.equipment.length), true);
      gym.addEventListener("click", () => this.openSheet("eq"));
      body.append(gym);
      for (const r of Object.values(REGIONS).sort((a, b) => a.lvl - b.lvl)) {
        const cell = roomCell(T.regions[r.key] ?? r.key, `LV ${r.lvl} · ${r.cost.toLocaleString("de-DE")} €`, false);
        cell.addEventListener("click", () => { this.closeMgmt(); const c = regionCenter(r); this.hooks.focusPoint(c.x, c.z); });
        body.append(cell);
      }
    } else if (this.mgmtTab === "team") {
      $("mgmt-title").textContent = T.team;
      body.append(...T.staffRows.map((r) => row(r.initial, r.locked ? "#5f6873" : "#3b8fe0", r.name, r.role, chip(r.pay), r.locked)));
    } else {
      $("mgmt-title").textContent = T.ads;
      const hint = document.createElement("p");
      hint.className = "hint";
      hint.textContent = g.campaign ? T.campaignRunning(T.campaigns[g.campaign.id].name) : T.campaignHint;
      body.append(hint);
      for (const c of CONFIG.campaigns) {
        const locked = g.level < c.minLevel, running = g.campaign?.id === c.id, txt = T.campaigns[c.id];
        let action: HTMLElement;
        if (locked) action = chip(T.fromLevel(c.minLevel));
        else if (running) action = chip(T.running);
        else {
          const b = document.createElement("button");
          b.type = "button"; b.className = "btn"; b.textContent = `${c.cost} €`;
          b.disabled = g.money < c.cost || !!g.campaign;
          b.addEventListener("click", () => this.start(c.id, c.cost));
          action = b;
        }
        body.append(row(EQ_ICON.megaphone, locked ? "#5f6873" : "#14b8a6", txt.name, txt.text, action, locked));
      }
    }
  }

  private start(id: CampaignId, cost: number) {
    if (!startCampaign(this.game(), id)) return;
    this.hooks.onAction();
    this.toast(T.campaignStarted(T.campaigns[id].name, cost));
    this.renderMgmt();
  }

  // ---------- Josef-Dialog ----------
  intro(onDone: () => void) {
    let i = 0;
    const show = () => {
      $("dialog-text").textContent = T.intro[i]!;
      $("dialog-dots").textContent = `${i + 1} / ${T.intro.length}`;
      $("dialog-next").textContent = i === T.intro.length - 1 ? T.letsGo : T.next;
    };
    $("dialog").hidden = false;
    show();
    $("dialog-next").onclick = () => {
      if (++i >= T.intro.length) { $("dialog").hidden = true; onDone(); return; }
      show();
    };
  }

  // ---------- jedes Bild ----------
  update(dt: number, speed: number) {
    const g = this.game();
    const set = (id: string, v: string) => { if (this.last[id] !== v) { $(id).textContent = v; this.last[id] = v; } };
    set("money", Math.floor(g.money).toLocaleString("de-DE"));
    set("ruf", (Math.round(g.rating * 10) / 10).toLocaleString("de-DE", { minimumFractionDigits: 1 }));
    set("lvl", String(g.level));
    const lo = CONFIG.levelXp[g.level - 1] ?? 0, hi = CONFIG.levelXp[g.level] ?? lo + 1;
    $("xpbar").style.width = `${Math.min(100, ((g.xp - lo) / (hi - lo)) * 100)}%`;
    const mm = Math.floor(g.minutes % 60);
    set("clock", `${String(hourOf(g)).padStart(2, "0")}:${String(Math.floor(mm / 10) * 10).padStart(2, "0")}`);
    set("speed-badge", `${speed}×`);
    const ad = g.campaign ? T.adChip(Math.floor(g.campaign.minutesLeft / 60), Math.floor(g.campaign.minutesLeft % 60)) : "";
    set("ad-text", ad);
    $("ad-chip").hidden = !g.campaign;
    set("litter-count", String(g.litter.length));
    $("clean").hidden = g.litter.length === 0;
    const alerts = g.equipment.filter((e) => e.broken && !e.queued).length;
    set("alert-dot", String(alerts));
    $("alert-dot").hidden = alerts === 0;

    if (!$("sheet").hidden && this.sheetTab === "eq") {
      set("kpi-income", Math.round(CONFIG.arrivalsPerHour(hourOf(g)) * CONFIG.dayPassPrice * (g.campaign?.mult ?? 1)).toLocaleString("de-DE"));
      set("kpi-guests", String(g.people.filter((p) => !["in", "leave", "gone"].includes(p.state)).length));
      const tools = g.equipment.filter((e) => e.def.kind !== "water");
      set("kpi-cond", `${Math.round(tools.reduce((a, e) => a + e.wear, 0) / tools.length)} %`);
      this.refreshCard(eqById(g, this.selected));
    }
    if (this.toastT > 0 && (this.toastT -= dt) <= 0) $("toast").hidden = true;
    if (this.reviewT > 0 && (this.reviewT -= dt) <= 0) $("review").hidden = true;
  }

  /** Kosten-Knopf aktuell halten, ohne das ganze Menü neu zu bauen */
  private refreshCard(e: Equipment) {
    const btn = $<HTMLButtonElement>("card-upgrade"), g = this.game();
    if (!canUpgrade(e)) return;
    const can = g.money >= upgradeCost(e);
    if (btn.disabled === can) { btn.disabled = !can; btn.textContent = can ? T.upgrade : T.tooExpensive; }
  }
}

function chip(text: string) {
  const s = document.createElement("span");
  s.className = "btn ghost"; s.textContent = text;
  return s;
}

function row(face: string, color: string, title: string, sub: string, action: HTMLElement, locked: boolean) {
  const d = document.createElement("div");
  d.className = "person" + (locked ? " locked" : "");
  const f = document.createElement("div");
  f.className = "face"; f.style.background = color; f.innerHTML = face;
  const t = document.createElement("div");
  const b = document.createElement("b"); b.textContent = title;
  const s = document.createElement("span"); s.textContent = sub;
  t.append(b, s);
  d.append(f, t, action);
  return d;
}

function roomCell(name: string, sub: string, active: boolean) {
  const b = document.createElement("button");
  b.type = "button"; b.className = "room" + (active ? " on" : "");
  const n = document.createElement("b"); n.textContent = name;
  const s = document.createElement("span"); s.textContent = sub;
  b.append(n, s);
  return b;
}

/** Nach unten wischen schließt ein Menü, kurzes Ziehen federt zurück. */
function swipeToClose(el: HTMLElement, close: () => void) {
  let start: number | null = null, dy = 0, dragged = false;
  el.addEventListener("pointerdown", (e) => { start = e.clientY; dy = 0; dragged = false; });
  el.addEventListener("pointermove", (e) => {
    if (start === null) return;
    dy = Math.max(0, e.clientY - start);
    if (!dragged && dy > 8) { dragged = true; el.classList.add("dragging"); try { el.setPointerCapture(e.pointerId); } catch { /* egal */ } }
    if (dragged) el.style.transform = `translateY(${dy}px)`;
  });
  const end = () => {
    if (start === null) return;
    start = null;
    el.classList.remove("dragging");
    if (!dragged) return;
    el.classList.add("snap");
    if (dy > Math.min(110, el.offsetHeight * 0.25)) {
      el.style.transform = "translateY(100%)";
      setTimeout(() => { el.classList.remove("snap"); el.style.transform = ""; close(); }, 180);
    } else {
      el.style.transform = "";
      setTimeout(() => el.classList.remove("snap"), 180);
    }
  };
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);
  // ein Wisch soll keinen Button auslösen
  el.addEventListener("click", (e) => { if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false; } }, true);
}

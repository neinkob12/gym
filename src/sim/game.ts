// Spielzustand und Simulation. Reines TypeScript ohne Grafik, damit es testbar bleibt.

import { CONFIG, type CampaignId, type CustomerType } from "./config";
import { EQUIPMENT_DEFS, bounds, type EquipmentDef, type Pose } from "./equipment";
import { CHECKIN, COLS, DESK, JOSEF_HOME, PLANTS, STREET_ROW, WAIT_TILES, type Tile } from "./map";
import { findPath, makeWalkable, tileKey, type Walkable } from "./path";
import { makeRng, pickOf, range, type Rng } from "./rng";

export interface Equipment {
  def: EquipmentDef;
  level: number;
  wear: number;
  broken: boolean;
  queued: boolean;
  userId: number | null;
  /** 0..1, Bewegungsphase der aktuellen Übung */
  phase: number;
}

export type BubbleIcon = "wait" | "heart" | "angry" | "wrench" | "spa";
export type PersonState =
  | "in" | "checkin" | "toEq" | "mount" | "using" | "toWait" | "waiting" | "leave" | "gone"
  | "idle" | "toJob" | "repair" | "home";

export interface Person {
  id: number;
  staff: boolean;
  type: CustomerType | "staff";
  /** Seed fürs Aussehen der Figur */
  model: number;
  x: number;
  z: number;
  yaw: number;
  path: Tile[];
  moving: boolean;
  state: PersonState;
  timer: number;
  mood: number;
  sets: number;
  thirsty: boolean;
  eqId: string | null;
  useT: number;
  patience: number;
  retry: number;
  waited: boolean;
  sawBroken: boolean;
  reason: "wellness" | "angry" | "broken" | null;
  bubble: { icon: BubbleIcon; t: number } | null;
  pose: Pose;
  from: { x: number; z: number } | null;
}

export type LitterKind = "db" | "towel" | "bottle";
export interface Litter { id: number; tx: number; ty: number; kind: LitterKind; ox: number; oz: number }

export interface Campaign { id: CampaignId; mult: number; minutesLeft: number }

export type ReviewTopic = "good" | "mess" | "wait" | "broken" | "wellness";
export type GameEvent =
  | { type: "paid"; x: number; z: number; amount: number }
  | { type: "cleaned"; x: number; z: number }
  | { type: "repaired"; eqId: string }
  | { type: "broke"; eqId: string }
  | { type: "review"; stars: number; topic: ReviewTopic; by: CustomerType }
  | { type: "levelUp"; level: number }
  | { type: "nag" }
  | { type: "campaignEnded"; id: CampaignId };

export interface Game {
  minutes: number;
  day: number;
  money: number;
  rating: number;
  xp: number;
  level: number;
  cleaned: number;
  equipment: Equipment[];
  people: Person[];
  josef: Person;
  litter: Litter[];
  campaign: Campaign | null;
  jobs: string[];
  events: GameEvent[];
  nextId: number;
  nagT: number;
  reviewT: number;
  rng: Rng;
  walkable: Walkable;
}

/** Was gespeichert wird. Kunden werden beim Laden neu erzeugt. */
export interface SaveData {
  v: 1;
  minutes: number;
  day: number;
  money: number;
  rating: number;
  xp: number;
  level: number;
  cleaned: number;
  equipment: { id: string; level: number; wear: number; broken: boolean }[];
  litter: Omit<Litter, "id">[];
  campaign: Campaign | null;
}

/** Zufallswert fürs Aussehen der Kunden (Körperbau, Frisur, Outfit) */
const CUSTOMER_MODELS = 100000;
const center = (t: Tile) => ({ x: t[0] + 0.5, z: t[1] + 0.5 });
export const eqById = (g: Game, id: string) => g.equipment.find((e) => e.def.id === id)!;

function newPerson(g: Game, staff: boolean, type: Person["type"], tile: Tile): Person {
  const c = center(tile);
  return {
    id: g.nextId++, staff, type, model: staff ? 0 : Math.floor(g.rng() * CUSTOMER_MODELS), x: c.x, z: c.z, yaw: 0, path: [],
    moving: false, state: staff ? "idle" : "in", timer: 0, mood: 0, sets: 0, thirsty: false, eqId: null, useT: 0,
    patience: 0, retry: 0, waited: false, sawBroken: false, reason: null, bubble: null, pose: "stand", from: null,
  };
}

export function createGame(seed = Date.now(), save?: SaveData | null): Game {
  const rng = makeRng(seed);
  const blocked = new Set<string>();
  for (const d of EQUIPMENT_DEFS) for (const t of d.tiles) blocked.add(tileKey(t[0], t[1]));
  for (const t of [...DESK, ...PLANTS]) blocked.add(tileKey(t[0], t[1]));

  const g: Game = {
    minutes: CONFIG.startHour * 60, day: 1, money: CONFIG.startMoney, rating: CONFIG.startRating, xp: 0, level: 1, cleaned: 0,
    equipment: EQUIPMENT_DEFS.map((def) => ({
      def, level: 1, wear: def.kind === "water" ? 100 : range(rng, CONFIG.equipment.startWear), broken: false, queued: false, userId: null, phase: 0,
    })),
    people: [], josef: null as unknown as Person, litter: [], campaign: null, jobs: [], events: [], nextId: 1,
    nagT: 40, reviewT: 0, rng, walkable: makeWalkable(blocked),
  };
  g.josef = newPerson(g, true, "staff", JOSEF_HOME);

  if (save) {
    applySave(g, save);
  } else {
    // Geerbter Zustand: ein Laufband ist tot, überall liegt Zeug
    Object.assign(eqById(g, "tm2"), { wear: 0, broken: true });
    const start: [number, number, LitterKind][] = [[12, 14, "db"], [13, 19, "towel"], [11, 17, "bottle"], [15, 25, "towel"], [12, 21, "db"], [14, 26, "bottle"]];
    for (const [x, y, k] of start) addLitter(g, x, y, k);
  }
  // ein paar Kunden sind schon da
  const tiles: Tile[] = [[12, 16], [13, 18], [11, 14], [15, 15], [16, 20]];
  tiles.forEach((t, i) => {
    const p = spawnCustomer(g, "anfaenger");
    Object.assign(p, center(t), { path: [], state: "checkin", timer: 0.01 + i * 0.3 });
  });
  return g;
}

export function toSave(g: Game): SaveData {
  return {
    v: 1, minutes: g.minutes, day: g.day, money: g.money, rating: g.rating, xp: g.xp, level: g.level, cleaned: g.cleaned,
    equipment: g.equipment.map((e) => ({ id: e.def.id, level: e.level, wear: e.wear, broken: e.broken })),
    litter: g.litter.map(({ id: _id, ...rest }) => rest),
    campaign: g.campaign,
  };
}

function applySave(g: Game, s: SaveData) {
  Object.assign(g, { minutes: s.minutes, day: s.day, money: s.money, rating: s.rating, xp: s.xp, level: s.level, cleaned: s.cleaned, campaign: s.campaign });
  for (const e of s.equipment) {
    const eq = g.equipment.find((q) => q.def.id === e.id);
    if (eq) Object.assign(eq, { level: e.level, wear: e.wear, broken: e.broken });
  }
  for (const l of s.litter) g.litter.push({ ...l, id: g.nextId++ });
}

function addLitter(g: Game, tx: number, ty: number, kind: LitterKind) {
  g.litter.push({ id: g.nextId++, tx, ty, kind, ox: range(g.rng, [0.25, 0.75]), oz: range(g.rng, [0.25, 0.75]) });
}

function pickType(g: Game): CustomerType {
  let r = g.rng() * 100;
  for (const [k, v] of Object.entries(CONFIG.customerTypes) as [CustomerType, { weight: number }][]) {
    r -= v.weight;
    if (r <= 0) return k;
  }
  return "anfaenger";
}

function spawnCustomer(g: Game, type = pickType(g)): Person {
  const fromLeft = g.rng() < 0.5;
  const p = newPerson(g, false, type, [fromLeft ? 0 : COLS - 1, STREET_ROW]);
  p.yaw = fromLeft ? Math.PI / 2 : -Math.PI / 2;
  p.sets = CONFIG.setsPerVisit[0] + Math.floor(g.rng() * (CONFIG.setsPerVisit[1] - CONFIG.setsPerVisit[0] + 1));
  p.thirsty = g.rng() < CONFIG.thirstChance;
  p.path = findPath(g.walkable, fromLeft ? 0 : COLS - 1, STREET_ROW, CHECKIN[0], CHECKIN[1]) ?? [];
  g.people.push(p);
  return p;
}

const tileOf = (p: Person): Tile => [Math.floor(p.x), Math.floor(p.z)];
function goTo(g: Game, p: Person, t: Tile) { p.path = findPath(g.walkable, ...tileOf(p), t[0], t[1]) ?? []; }
function setBubble(p: Person, icon: BubbleIcon, t = 2.2) { p.bubble = { icon, t }; }

function freeEquipment(g: Game, kinds: readonly string[]): Equipment | null {
  const free = g.equipment.filter((e) => kinds.includes(e.def.kind) && e.userId === null && !e.broken);
  return free.length ? pickOf(g.rng, free) : null;
}

function claim(g: Game, p: Person, e: Equipment) {
  e.userId = p.id; p.eqId = e.def.id; p.state = "toEq"; goTo(g, p, e.def.appr);
}

function nextActivity(g: Game, p: Person) {
  if (p.type === "wellness") {
    setBubble(p, "spa", 2.5); p.mood += CONFIG.mood.noWellness; p.reason = "wellness";
    return leave(g, p);
  }
  if (p.sets > 0) {
    const wants = CONFIG.customerTypes[p.type as CustomerType].wants;
    const e = freeEquipment(g, wants);
    if (e) return claim(g, p, e);
    if (!p.sawBroken && g.equipment.some((q) => (wants as readonly string[]).includes(q.def.kind) && q.broken)) {
      p.sawBroken = true; p.mood += CONFIG.mood.sawBroken; p.reason = "broken";
    }
    p.state = "toWait"; p.patience = CONFIG.patience; p.waited = true;
    return goTo(g, p, pickOf(g.rng, WAIT_TILES));
  }
  if (p.thirsty) {
    p.thirsty = false;
    const water = g.equipment.find((e) => e.def.kind === "water")!;
    if (water.userId === null) return claim(g, p, water);
  }
  leave(g, p);
}

function leave(g: Game, p: Person) {
  p.state = "leave"; p.pose = "stand";
  goTo(g, p, [g.rng() < 0.5 ? COLS - 1 : 0, STREET_ROW]);
}

function finishVisit(g: Game, p: Person) {
  const mess = Math.min(CONFIG.litter.maxPenalty, g.litter.length * CONFIG.litter.penaltyPerItem);
  const score = Math.max(1, Math.min(5, CONFIG.mood.baseScore + p.mood - mess));
  g.rating = g.rating * (1 - CONFIG.ratingBlend) + score * CONFIG.ratingBlend;
  if (g.reviewT <= 0 && g.rng() < CONFIG.reviewChance) {
    let topic: ReviewTopic = "good";
    if (p.reason === "wellness") topic = "wellness";
    else if (p.reason === "angry") topic = "wait";
    else if (p.reason === "broken") topic = "broken";
    else if (mess >= 0.75) topic = "mess";
    else if (score < 3.8 && p.waited) topic = "wait";
    g.events.push({ type: "review", stars: Math.round(score), topic, by: p.type as CustomerType });
    g.reviewT = CONFIG.reviewCooldown;
  }
}

function walk(p: Person, dt: number): boolean {
  const next = p.path[0];
  if (!next) { p.moving = false; return true; }
  const c = center(next);
  const dx = c.x - p.x, dz = c.z - p.z, d = Math.hypot(dx, dz), sp = CONFIG.walkSpeed * dt;
  p.moving = true;
  if (d > 0.001) {
    const diff = Math.atan2(Math.sin(Math.atan2(dx, dz) - p.yaw), Math.cos(Math.atan2(dx, dz) - p.yaw));
    p.yaw += diff * Math.min(1, dt * 12);
  }
  if (d <= sp) { p.x = c.x; p.z = c.z; p.path.shift(); } else { p.x += (dx / d) * sp; p.z += (dz / d) * sp; }
  return false;
}

function dropLitter(g: Game, e: Equipment, p: Person) {
  const [ax, ay] = e.def.appr;
  const spots = ([[ax, ay], [ax + 1, ay], [ax, ay + 1], [ax - 1, ay]] as Tile[])
    .filter(([x, y]) => g.walkable(x, y) && !g.litter.some((l) => l.tx === x && l.ty === y));
  if (!spots.length) return;
  const [tx, ty] = pickOf(g.rng, spots);
  const kind: LitterKind = p.type === "bodybuilder" || e.def.kind === "db" ? "db" : pickOf(g.rng, ["towel", "bottle", "towel"] as const);
  addLitter(g, tx, ty, kind);
}

function updateCustomer(g: Game, p: Person, dt: number) {
  if (p.bubble && (p.bubble.t -= dt) <= 0) p.bubble = null;
  switch (p.state) {
    case "in":
      if (walk(p, dt)) { p.state = "checkin"; p.timer = 0.8; p.yaw = Math.PI / 2; }
      break;
    case "checkin":
      if ((p.timer -= dt) <= 0) {
        g.money += CONFIG.dayPassPrice; g.xp += CONFIG.xpPerVisit;
        g.events.push({ type: "paid", x: p.x, z: p.z, amount: CONFIG.dayPassPrice });
        nextActivity(g, p);
      }
      break;
    case "toEq":
      if (walk(p, dt)) { p.state = "mount"; p.timer = 0.35; p.from = { x: p.x, z: p.z }; }
      break;
    case "mount": {
      const e = eqById(g, p.eqId!), k = 1 - Math.max(0, (p.timer -= dt)) / 0.35;
      p.x = p.from!.x + (e.def.use.x - p.from!.x) * k; p.z = p.from!.z + (e.def.use.z - p.from!.z) * k;
      p.moving = true;
      if (p.timer <= 0) {
        p.moving = false; p.pose = e.def.pose; p.useT = 0; p.state = "using";
        p.timer = e.def.kind === "water" ? CONFIG.drinkDuration : range(g.rng, CONFIG.setDuration);
        if (e.def.kind === "water") p.mood += CONFIG.mood.water;
      }
      break;
    }
    case "using": {
      const e = eqById(g, p.eqId!);
      p.useT += dt; e.phase = (Math.sin(p.useT * 2.2) + 1) / 2;
      if ((p.timer -= dt) > 0) break;
      p.pose = "stand"; e.userId = null; p.eqId = null;
      if (e.def.kind !== "water") {
        const lvl = e.level - 1;
        e.wear -= range(g.rng, CONFIG.equipment.wearPerSet) / (1 + CONFIG.equipment.levelDurability * lvl);
        p.mood += CONFIG.equipment.levelMood * lvl;
        if (e.wear <= 0) { e.wear = 0; e.broken = true; g.events.push({ type: "broke", eqId: e.def.id }); }
        p.sets--;
        if (g.rng() < CONFIG.litter.dropChance) dropLitter(g, e, p);
        if (p.sets === 0 && p.mood > -0.5 && g.rng() < 0.4) setBubble(p, "heart", 1.6);
      }
      Object.assign(p, center(e.def.appr));
      nextActivity(g, p);
      break;
    }
    case "toWait":
      if (walk(p, dt)) { p.state = "waiting"; p.yaw = 0; p.retry = 0.8; }
      break;
    case "waiting": {
      p.patience -= dt; p.retry -= dt;
      if (!p.bubble && p.patience < CONFIG.impatientBubbleBelow) setBubble(p, "wait", 1.2);
      if (p.retry <= 0) {
        p.retry = 0.8;
        const e = freeEquipment(g, CONFIG.customerTypes[p.type as CustomerType].wants);
        if (e) { p.mood += CONFIG.mood.waitedAndGotIt; claim(g, p, e); break; }
      }
      if (p.patience <= 0) { setBubble(p, "angry", 2.4); p.mood += CONFIG.mood.leftAngry; p.reason = "angry"; leave(g, p); }
      break;
    }
    case "leave":
      if (walk(p, dt)) { p.state = "gone"; finishVisit(g, p); }
      break;
    default:
      break;
  }
}

function updateJosef(g: Game, dt: number) {
  const j = g.josef;
  if (j.bubble && (j.bubble.t -= dt) <= 0) j.bubble = null;
  if ((g.nagT -= dt) <= 0 && g.litter.length >= CONFIG.josefNagLitter) { g.events.push({ type: "nag" }); g.nagT = CONFIG.josefNagEvery; }
  switch (j.state) {
    case "idle": {
      j.yaw = 0; j.pose = "stand";
      const id = g.jobs.shift();
      if (id) { j.eqId = id; j.state = "toJob"; goTo(g, j, eqById(g, id).def.appr); }
      break;
    }
    case "toJob":
      if (walk(j, dt)) {
        const b = bounds(eqById(g, j.eqId!).def);
        j.state = "repair"; j.timer = CONFIG.equipment.repairSeconds; j.pose = "repair"; setBubble(j, "wrench", CONFIG.equipment.repairSeconds);
        j.yaw = Math.atan2(b.cx - j.x, b.cz - j.z);
      }
      break;
    case "repair":
      if ((j.timer -= dt) <= 0) {
        const e = eqById(g, j.eqId!);
        Object.assign(e, { wear: 100, broken: false, queued: false });
        g.events.push({ type: "repaired", eqId: e.def.id });
        j.pose = "stand"; j.eqId = null; j.state = "home"; goTo(g, j, JOSEF_HOME);
      }
      break;
    case "home":
      if (walk(j, dt)) j.state = "idle";
      break;
    default:
      break;
  }
}

export const hourOf = (g: Game) => Math.floor(g.minutes / 60) % 24;

/** Simuliert dt Sekunden Spielzeit (bei Tempo 1 = echte Sekunden). */
export function step(g: Game, dt: number) {
  g.minutes += dt * CONFIG.gameMinutesPerSecond;
  if (g.minutes >= 24 * 60) { g.minutes -= 24 * 60; g.day++; }
  g.reviewT -= dt;

  let mult = 1;
  if (g.campaign) {
    mult = g.campaign.mult;
    if ((g.campaign.minutesLeft -= dt * CONFIG.gameMinutesPerSecond) <= 0) {
      g.events.push({ type: "campaignEnded", id: g.campaign.id }); g.campaign = null;
    }
  }
  const live = g.people.filter((p) => p.state !== "gone").length;
  const perSecond = CONFIG.arrivalsPerHour(hourOf(g)) * mult * (CONFIG.gameMinutesPerSecond / 60);
  if (live < CONFIG.maxCustomers && g.rng() < perSecond * dt) spawnCustomer(g);

  for (const p of g.people) updateCustomer(g, p, dt);
  g.people = g.people.filter((p) => p.state !== "gone");
  updateJosef(g, dt);

  const xp = CONFIG.levelXp;
  while (g.level < xp.length && g.xp >= xp[g.level]!) { g.level++; g.events.push({ type: "levelUp", level: g.level }); }
}

// ---------- Aktionen des Spielers ----------

export function cleanLitter(g: Game, id: number): boolean {
  const i = g.litter.findIndex((l) => l.id === id);
  if (i < 0) return false;
  const [l] = g.litter.splice(i, 1);
  g.cleaned++; g.rating = Math.min(5, g.rating + CONFIG.litter.ratingPerClean);
  g.events.push({ type: "cleaned", x: l!.tx + l!.ox, z: l!.ty + l!.oz });
  return true;
}

export function needsRepair(e: Equipment) { return e.def.kind !== "water" && (e.broken || e.wear < CONFIG.equipment.warnBelow); }

export function requestRepair(g: Game, eqId: string): boolean {
  const e = eqById(g, eqId);
  if (!needsRepair(e) || e.queued) return false;
  e.queued = true; g.jobs.push(eqId);
  return true;
}

export function upgradeCost(e: Equipment): number {
  return Math.round(CONFIG.equipment.upgradeBase * Math.pow(CONFIG.equipment.upgradeGrowth, e.level - 1));
}
export const canUpgrade = (e: Equipment) => e.def.kind !== "water" && e.level < CONFIG.equipment.maxLevel;

export function upgrade(g: Game, eqId: string): boolean {
  const e = eqById(g, eqId), cost = upgradeCost(e);
  if (!canUpgrade(e) || g.money < cost) return false;
  g.money -= cost; e.level++;
  e.wear = Math.min(100, e.wear + CONFIG.equipment.repairWearBonus); e.broken = false;
  return true;
}

export function startCampaign(g: Game, id: CampaignId): boolean {
  const c = CONFIG.campaigns.find((x) => x.id === id);
  if (!c || g.campaign || g.money < c.cost || g.level < c.minLevel) return false;
  g.money -= c.cost;
  g.campaign = { id, mult: c.mult, minutesLeft: c.hours * 60 };
  return true;
}

export function takeEvents(g: Game): GameEvent[] {
  const ev = g.events; g.events = [];
  return ev;
}

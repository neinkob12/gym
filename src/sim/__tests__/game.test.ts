import { describe, expect, it } from "vitest";
import { CONFIG } from "../config";
import {
  cleanLitter, createGame, eqById, requestRepair, startCampaign, step, takeEvents, toSave, upgrade, upgradeCost,
} from "../game";
import { CHECKIN, COLS, STREET_ROW, at } from "../map";
import { findPath } from "../path";

const run = (g: ReturnType<typeof createGame>, seconds: number, dt = 0.05) => {
  for (let t = 0; t < seconds; t += dt) step(g, dt);
};

describe("Karte und Wege", () => {
  it("vom Gehweg führt ein Weg zur Rezeption", () => {
    const g = createGame(1);
    const path = findPath(g.walkable, 0, STREET_ROW, CHECKIN[0], CHECKIN[1]);
    expect(path).not.toBeNull();
    expect(path!.at(-1)).toEqual(CHECKIN);
  });

  it("jedes Gerät ist von seiner Zugangskachel erreichbar", () => {
    const g = createGame(1);
    for (const e of g.equipment) {
      expect(findPath(g.walkable, COLS - 1, STREET_ROW, e.def.appr[0], e.def.appr[1]), e.def.id).not.toBeNull();
    }
  });

  it("Bauflächen sind nicht begehbar", () => {
    const g = createGame(1);
    expect(at(4, 15)).toBe("w");
    expect(g.walkable(4, 15)).toBe(false);
  });
});

describe("Start im Ranz-Gym", () => {
  it("startet mit kaputtem Laufband, Müll und schlechtem Ruf", () => {
    const g = createGame(2);
    expect(eqById(g, "tm2").broken).toBe(true);
    expect(g.litter.length).toBe(6);
    expect(g.rating).toBeCloseTo(CONFIG.startRating);
  });
});

describe("Simulation", () => {
  it("Kunden zahlen beim Einchecken", () => {
    const g = createGame(3);
    const before = g.money;
    run(g, 5);
    expect(g.money).toBeGreaterThan(before);
    expect(takeEvents(g).some((e) => e.type === "paid")).toBe(true);
  });

  it("Geräte verschleißen langsam durch Nutzung", () => {
    const g = createGame(4);
    const bench = eqById(g, "bench");
    bench.wear = 80;
    run(g, 120);
    expect(bench.wear).toBeLessThan(80);
    // bei 1 bis 2 % pro Satz kann ein Gerät in 2 Minuten nicht von 80 auf 0 fallen
    expect(bench.wear).toBeGreaterThan(40);
  });

  it("die Uhr läuft rund um die Uhr weiter", () => {
    const g = createGame(5);
    run(g, (8 * 60) / CONFIG.gameMinutesPerSecond, 0.5);
    expect(g.day).toBe(2);
    expect(Math.floor(g.minutes / 60)).toBe(0);
  });
});

describe("Aktionen", () => {
  it("Aufräumen entfernt Müll und hebt den Ruf", () => {
    const g = createGame(6);
    const id = g.litter[0]!.id, r = g.rating;
    expect(cleanLitter(g, id)).toBe(true);
    expect(g.litter.some((l) => l.id === id)).toBe(false);
    expect(g.rating).toBeGreaterThan(r);
    expect(cleanLitter(g, id)).toBe(false);
  });

  it("Josef repariert ein kaputtes Gerät", () => {
    const g = createGame(7);
    expect(requestRepair(g, "tm2")).toBe(true);
    expect(requestRepair(g, "tm2")).toBe(false);
    run(g, 30);
    const tm = eqById(g, "tm2");
    expect(tm.broken).toBe(false);
    expect(tm.wear).toBe(100);
  });

  it("intakte Geräte brauchen keine Reparatur", () => {
    const g = createGame(8);
    eqById(g, "rack").wear = 90;
    expect(requestRepair(g, "rack")).toBe(false);
  });

  it("Verbessern kostet Geld und erhöht das Level", () => {
    const g = createGame(9);
    const e = eqById(g, "bench"), cost = upgradeCost(e);
    g.money = cost;
    expect(upgrade(g, "bench")).toBe(true);
    expect(e.level).toBe(2);
    expect(g.money).toBe(0);
    expect(upgrade(g, "bench")).toBe(false);
    expect(upgradeCost(e)).toBeGreaterThan(cost);
  });

  it("nur eine Werbekampagne gleichzeitig", () => {
    const g = createGame(10);
    g.money = 1000;
    expect(startCampaign(g, "flyer")).toBe(true);
    expect(startCampaign(g, "social")).toBe(false);
    expect(startCampaign(g, "influencer")).toBe(false);
  });
});

describe("Speichern", () => {
  it("ein Spielstand lässt sich wiederherstellen", () => {
    const g = createGame(11);
    g.money = 1234; eqById(g, "rack").level = 3; cleanLitter(g, g.litter[0]!.id);
    const restored = createGame(12, JSON.parse(JSON.stringify(toSave(g))));
    expect(restored.money).toBe(1234);
    expect(eqById(restored, "rack").level).toBe(3);
    expect(restored.litter.length).toBe(g.litter.length);
  });
});

// Alle sichtbaren Texte. Englisch folgt als zweite Datei mit gleicher Struktur.

import type { CampaignId, CustomerType } from "../sim/config";
import type { EqKind } from "../sim/equipment";
import type { ReviewTopic } from "../sim/game";

export const T = {
  loading: "Lade Gym …",
  loadFailed: "Das Spiel konnte nicht geladen werden. Bitte neu starten.",
  build: "BAUEN",
  clean: "Aufräumen",
  open247: "24/7",
  close: "Schließen",
  equipment: "Geräte",
  staff: "Mitarbeiter",
  rooms: "Räume",
  team: "Team",
  ads: "Werbung",
  gym: "Kraftraum",
  upgrade: "Verbessern",
  tooExpensive: "Zu wenig Geld",
  maxed: "Fertig",
  maxedCost: "Maximal ausgebaut",
  running: "läuft",
  next: "Weiter",
  letsGo: "Los geht's",
  kpiIncome: "€/h",
  kpiGuests: "Gäste",
  kpiCondition: "Zustand",
  active: (n: number) => `aktiv · ${n} Geräte`,
  fromLevel: (lvl: number) => `ab LV ${lvl}`,
  condition: (pct: number) => `Zustand ${pct} %.`,
  campaignHint: "Immer eine Kampagne gleichzeitig. Mehr Kunden heißt auch mehr Andrang an den Geräten.",
  campaignRunning: (name: string) => `Läuft: ${name}. Danach kannst du die nächste Kampagne starten.`,
  campaignStarted: (name: string, cost: number) => `${name} gestartet: −${cost} € für Werbung.`,
  campaignEnded: (name: string) => `${name} ist ausgelaufen.`,
  adChip: (h: number, m: number) => `Werbung · ${h}:${String(m).padStart(2, "0")} Std.`,
  levelUp: (lvl: number) => `Level ${lvl} erreicht!`,
  regionLocked: (name: string, lvl: number) => `${name}: ab Level ${lvl} freischaltbar.`,
  josefRepairs: (name: string) => `Josef kümmert sich um ${name}.`,
  noAlerts: "Keine offenen Meldungen.",
  brokenAlert: (name: string) => `${name} ist kaputt. Tipp drauf, Josef repariert es.`,
  statsSoon: "Statistik mit Trainingsplänen und Stammkunden kommt bald.",
  water: "Wasserspender: kostenlos, macht Kunden glücklich.",
  josefInfo: "Josef, 18. Sein Vater trainiert hier seit Jahren. Zuverlässig wie ein Uhrwerk.",
  wantsSauna: "will in die Sauna",
  wants: (list: string) => `will ${list}`,
  reviewBy: (who: string) => `Bewertung von ${who}`,
  josefTitle: "Josef",
  aria: { staff: "Mitarbeiter", stats: "Statistik", alerts: "Meldungen", speed: "Tempo umschalten", center: "Kamera zentrieren", close: "Schließen" } as Record<string, string>,
  josefSub: "18, dein erster Mitarbeiter",

  eq: {
    db: { name: "Kurzhantelablage", the: "die Kurzhantelablage", desc: "Kurzhanteln von 2 bis 30 kg. Beliebt bei Bodybuildern und Anfängern." },
    bench: { name: "Flachbank", the: "die Flachbank", desc: "Fürs Bankdrücken. Höheres Level hält länger, Kunden sind zufriedener." },
    lat: { name: "Latzug", the: "den Latzug", desc: "Latzug für den Rücken. Anfänger lieben Maschinen." },
    rack: { name: "Langhantel-Rack", the: "das Rack", desc: "Rack für Kniebeugen. Das Herz jeder Muckibude." },
    tm: { name: "Laufband", the: "das Laufband", desc: "Für Cardio-Fans. Alte Bänder gehen schneller kaputt." },
    water: { name: "Wasserspender", the: "den Wasserspender", desc: "Kostenloses Wasser. Durstige Kunden trinken nach dem Training." },
  } satisfies Record<EqKind, { name: string; the: string; desc: string }>,

  lockedSlots: [
    { name: "Beinpresse", lvl: 2 },
    { name: "Kabelzug-Turm", lvl: 3 },
    { name: "Spiegel und Pflanzen", lvl: 2 },
  ],

  regions: { u: "Umkleide", b: "Protein Bar", w: "Ausbau West", k: "Kursraum", n: "Ausbau Nord", f: "Personalraum", x: "Wellness" } as Record<string, string>,

  customers: {
    anfaenger: "Anfänger", bodybuilder: "Bodybuilder", cardio: "Cardio und Kurse", influencer: "Influencer", wellness: "Wellness-Gast",
  } satisfies Record<CustomerType, string>,

  staffRows: [
    { name: "Josef", role: "Allrounder · repariert, hilft überall", pay: "80 € / Tag", initial: "J", locked: false },
    { name: "Reinigungskraft", role: "räumt automatisch auf", pay: "ab LV 2", initial: "R", locked: true },
    { name: "Rezeption", role: "mehr Mitgliedschaften", pay: "ab LV 2", initial: "Z", locked: true },
    { name: "Personal Trainer", role: "betreut Anfänger, hält Kurse", pay: "ab LV 3", initial: "T", locked: true },
    { name: "Techniker", role: "wird bei Defekten gerufen", pay: "pro Einsatz", initial: "W", locked: true },
  ],

  campaigns: {
    flyer: { name: "Flyer im Viertel", text: "+30 % Kunden für 2 Std." },
    social: { name: "Social-Media-Post", text: "+60 % Kunden für 6 Std." },
    influencer: { name: "Influencer-Kooperation", text: "+120 % Kunden für 12 Std." },
  } satisfies Record<CampaignId, { name: string; text: string }>,

  reviews: {
    good: ["Top Geräte, super Stimmung!", "Josef ist der Beste.", "Keine Wartezeit, gerne wieder.", "Wird langsam richtig gut hier."],
    mess: ["Überall liegen Hanteln rum.", "Handtücher auf dem Boden, eklig.", "Räumt hier keiner auf?"],
    wait: ["Ewig aufs Gerät gewartet.", "Zu voll zur Feierabendzeit.", "Zu wenig Laufbänder!"],
    broken: ["Laufband kaputt, schon wieder.", "Die Geräte sind älter als ich."],
    wellness: ["Wo ist die Sauna?!", "Kein Wellness, schade."],
  } satisfies Record<ReviewTopic, string[]>,

  josefNag: "Da liegt viel Zeug rum. Tipp auf die Sachen mit dem Pfeil!",
  josefBroke: (name: string) => `${name} ist hin. Tipp drauf, ich repariere es.`,

  intro: [
    "Hey, ich bin Josef! Dein Onkel hat dir die alte Muckibude vermacht. Ja, die sieht genau so aus, wie sie riecht.",
    "Hier hat früher sogar eine echte Bodybuilding-Legende trainiert. Mein Vater auch, seit ich denken kann.",
    "Siehst du die blauen Pfeile? Da liegt Zeug rum. Tipp direkt drauf, dann räumst du es weg.",
    "Kaputte Geräte haben ein rotes Ausrufezeichen. Tipp drauf, dann repariere ich sie. Tipp auf den Boden, um den Kraftraum zu verwalten.",
  ],
};

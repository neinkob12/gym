// Alle Balancing-Werte. Keine Zahlen für Spielregeln außerhalb dieser Datei.

export const CONFIG = {
  /** Spielminuten pro echter Sekunde bei Tempo 1 (1 Spielstunde = 15 s) */
  gameMinutesPerSecond: 4,
  startHour: 16,
  startMoney: 300,
  startRating: 2.1,

  dayPassPrice: 12,
  xpPerVisit: 10,
  /** XP-Schwelle, ab der Level n+1 erreicht ist (Index = aktuelles Level - 1) */
  levelXp: [0, 600, 1500, 3000, 5000, 8000, 12000, 17000, 24000],

  maxCustomers: 16,
  /** Ankünfte pro Spielstunde nach Uhrzeit, 24/7 geöffnet */
  arrivalsPerHour(hour: number): number {
    if (hour < 6 || hour >= 23) return 0.8;
    if (hour < 9) return 4;
    if (hour < 16) return 2.5;
    if (hour < 21) return 7.5;
    return 2.5;
  },
  /** Kacheln pro Sekunde */
  walkSpeed: 1.2,

  setsPerVisit: [1, 3] as const,
  setDuration: [8, 12] as const,
  drinkDuration: 2.2,
  thirstChance: 0.55,
  patience: 13,
  impatientBubbleBelow: 6,

  equipment: {
    startWear: [40, 75] as const,
    /** Verschleiß in Prozent pro Satz, wird durch Level geteilt */
    wearPerSet: [0.8, 2.2] as const,
    levelDurability: 0.35,
    levelMood: 0.12,
    warnBelow: 30,
    maxLevel: 5,
    upgradeBase: 120,
    upgradeGrowth: 1.8,
    repairSeconds: 2.6,
    repairWearBonus: 35,
  },

  litter: { dropChance: 0.38, ratingPerClean: 0.03, penaltyPerItem: 0.25, maxPenalty: 1.5 },

  mood: {
    baseScore: 4.6,
    water: 0.3,
    waitedAndGotIt: -0.4,
    leftAngry: -2,
    sawBroken: -0.6,
    noWellness: -1.6,
  },
  ratingBlend: 0.14,
  reviewChance: 0.08,
  reviewCooldown: 20,
  josefNagEvery: 75,
  josefNagLitter: 6,

  campaigns: [
    { id: "flyer", mult: 1.3, hours: 2, cost: 60, minLevel: 1 },
    { id: "social", mult: 1.6, hours: 6, cost: 250, minLevel: 1 },
    { id: "influencer", mult: 2.2, hours: 12, cost: 900, minLevel: 3 },
  ],

  customerTypes: {
    anfaenger: { wants: ["lat", "tm", "db", "bench"], weight: 34 },
    bodybuilder: { wants: ["rack", "bench", "db"], weight: 25 },
    cardio: { wants: ["tm"], weight: 22 },
    influencer: { wants: ["db", "rack"], weight: 8 },
    wellness: { wants: [], weight: 11 },
  },
} as const;

export type CustomerType = keyof typeof CONFIG.customerTypes;
export type CampaignId = (typeof CONFIG.campaigns)[number]["id"];

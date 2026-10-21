// Spielstand lokal speichern. Capacitor Preferences nutzt in der iOS-App den nativen Speicher, im Browser localStorage.

import { Preferences } from "@capacitor/preferences";
import type { SaveData } from "../sim/game";

const KEY = "gym-tycoon-save-v1";
const INTRO_KEY = "gym-tycoon-intro-done";

export async function loadSave(): Promise<SaveData | null> {
  try {
    const { value } = await Preferences.get({ key: KEY });
    if (!value) return null;
    const data = JSON.parse(value) as SaveData;
    return data.v === 1 ? data : null;
  } catch {
    return null;
  }
}

export async function writeSave(data: SaveData): Promise<void> {
  try { await Preferences.set({ key: KEY, value: JSON.stringify(data) }); } catch { /* Speichern darf das Spiel nie anhalten */ }
}

export async function introDone(): Promise<boolean> {
  try { return (await Preferences.get({ key: INTRO_KEY })).value === "1"; } catch { return false; }
}

export async function markIntroDone(): Promise<void> {
  try { await Preferences.set({ key: INTRO_KEY, value: "1" }); } catch { /* egal */ }
}

# Gym Tycoon

Handyspiel: Du erbst die heruntergekommene Muckibude deines Onkels und machst daraus das beste Gym der Stadt.
Low-Poly-3D, isometrisch, Hochformat, Idle-Tycoon.

Status: **E1 Fundament** (spielbar im Browser und als iPhone-App über Xcode).

## Starten

```bash
npm install
npm run dev      # im Browser, auch im gleichen WLAN am Handy
npm run check    # Typen, Lint, Tests, Build
npm run ios      # bauen und in Xcode öffnen (Mac), Anleitung: docs/XCODE.md
```

## Aufbau

| Ordner / Datei | Wofür |
| --- | --- |
| `src/sim/` | Spiellogik ohne Grafik (Kunden, Geräte, Geld, Ruf, Werbung, Speichern), mit Tests |
| `src/game/` | Three.js: Kamera, Licht, Gebäude, Geräte, Figuren, Stadt, Effekte |
| `src/ui/` | HUD, Raum-Menü, Bau-Menü, Josef-Dialog, Hinweise |
| `src/content/strings.ts` | alle sichtbaren Texte |
| `public/models/` | CC0-Modelle von Kenney (Figuren, Autos, Häuser, Möbel, Natur) |
| `ios/` | Xcode-Projekt (Capacitor) |
| `docs/` | Spielkonzept, Technik, Roadmap, Recherche, Xcode-Anleitung |
| `prototypes/` | Wegwerf-Prototypen aus der Planung |

## Doku

| Datei | Wofür |
| --- | --- |
| `docs/GAME_DESIGN.md` | Das Spielkonzept, alle Entscheidungen |
| `docs/TECH_STACK.md` | Technik, Begründung, was du einrichten musst |
| `docs/ROADMAP.md` | Etappen bis TestFlight und Store |
| `docs/XCODE.md` | Spiel aufs iPhone bringen |
| `docs/RECHERCHE.md` | Vorlagen, Balancing-Wissen, Quellen |
| `docs/VERGLEICH_HOTEL_TYCOON.md` | Prototyp vs. Vorbild vs. Endversion |
| `docs/OFFENE_FRAGEN.md` | Was noch entschieden werden muss |

3D-Modelle: [Kenney](https://kenney.nl), CC0 (siehe `public/models/LICENSE-kenney.txt`).

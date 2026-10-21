# Gym Tycoon: Regeln für Claude Code

Handyspiel (iOS zuerst): Du erbst die Muckibude deines Onkels und baust sie zum besten Gym der Stadt aus.
Low-Poly-3D, isometrisch, Hochformat, Vorbild für Darstellung und Bedienung: Hotel Empire Tycoon.

## Vor jeder Session lesen

- `docs/GAME_DESIGN.md`: alle Spielentscheidungen
- `docs/TECH_STACK.md`: Technik und Ordner
- `docs/ROADMAP.md`: Etappen, was als Nächstes dran ist

## Technik

- Vite + TypeScript (strict) + Three.js, Oberfläche als DOM in `src/ui/`, Capacitor für iOS (`ios/`, Swift Package Manager).
- `src/sim/` ist reine Spiellogik ohne Three.js und ohne DOM. Jede neue Regel bekommt einen Test in `src/sim/__tests__/`.
- Alle Balancing-Werte nur in `src/sim/config.ts`.
- Alle sichtbaren Texte nur in `src/content/strings.ts`.
- 3D-Modelle: Kenney CC0 in `public/models/` (Lizenz liegt daneben). Gym-Geräte bauen wir selbst in `src/game/equipmentModels.ts`.
- Prüfen vor jedem Push: `npm run check` (Typen, Lint, Tests, Build). Grün oder nicht pushen.
- Am Handy testen: `docs/XCODE.md`.

## Gestaltung (entschieden)

- Palette Anthrazit (`src/game/palette.ts`, CSS-Variablen in `src/ui/styles.css`). Kein Beige, kein Orange, kein grelles Grün.
- HUD kantig und ruhig, kleine Radien, keine Pastell-Icon-Kreise.
- Menüs fahren von unten hoch, passen ohne Scrollen, lassen sich nach unten wegwischen.
- Feedback lieber als kurzer Effekt (Funkeln, Geldschein) als als Text. Hinweise unten, nie mitten im Bild.

## Kommunikation

- Antworte auf Deutsch, kurz, mit klaren nächsten Schritten (der Nutzer hat ADHS).
- Keine Gedankenstriche (em dashes) in Texten, Doku oder Commits.
- Widersprich, wenn etwas keinen Sinn ergibt. Bei Unklarheit eine konkrete Rückfrage statt raten.

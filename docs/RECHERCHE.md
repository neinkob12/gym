# Recherche: Vorlagen, Wissen, Hilfen

Stand 21.10.2026. Was uns beim Aufbau hilft und wie wir es nutzen.

## Vorlagen und Code

- [Phaser 4 TypeScript Template (michaelpwest)](https://michaelpwest.itch.io/phaser-typescript-template): Phaser 4 + TypeScript + Vite + Capacitor, MIT-Lizenz, mit Befehlen für iOS- und Android-Deploy. **Gute Basis für E1**, das Beispielspiel (Plattformer) fliegt raus.
- [Idle Tycoon Manager (React + TS)](https://d0mega.itch.io/idle-tycoon-manager) und [Idle Template Bundle](https://d0mega.itch.io/idle-template-bundle): kostenpflichtige Idle-Vorlagen mit Offline-Fortschritt. Nur als Referenz für Systeme, nicht als Basis.
- Ein fertiges Open-Source-Repo "Idle Tycoon + Phaser + Mobile" gibt es nicht. Wir bauen die Tycoon-Systeme selbst auf dem Template auf.

## Game Design und Balancing

- [The Math of Idle Games, Teil I](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i) und [Teil II](https://www.gamedeveloper.com/game-platforms/the-math-of-idle-games-part-ii) (Anthony Pecorella, AdVenture Capitalist): Wachstum, Kosten, Prestige, mit Tabellen-Modellen. Grundlage für `config.ts`.
- [Balancing Tips: Idle Idol](https://gamedeveloper.com/design/balancing-tips-how-we-managed-math-on-idle-idol): warum "einfach exponentiell" sich schnell schlecht anfühlt.
- [Making a hit idle game: 8 Lessons from Kolibri Games](https://www.gameanalytics.com/blog/making-a-hit-idle-game-eight-lessons-from-kolibri-games) und [Kolibri: vom MVP zu 70 Mio. Installs](https://www.pocketgamer.biz/feature/70431/how-kolibri-went-from-minimal-viable-product-to-70-million-installs-for-its-idle-games/) (Idle Miner Tycoon): "Ein Idle-Spiel ist eine Tabelle mit Spiel-Oberfläche", Engpässe zwischen Stufen, "pay or wait".

Was wir daraus übernehmen:
- Balancing zuerst als Tabelle denken, dann in `config.ts`.
- Jede Stufe hat einen klaren Engpass (zu wenig Geräte, zu dreckig, zu wenig Personal), den der Spieler lösen muss.
- Früh am Handy mit echten Testern spielen, MVP klein halten.

## Handy und Deploy

- [Phaser: Bring your Phaser game to iOS and Android with Capacitor](https://phaser.io/tutorials/bring-your-phaser-game-to-ios-and-android-with-capacitor) und [Capacitor Games Guide](https://capacitorjs.com/docs/v7/guides/games): offizieller Weg.
- iOS ohne eigenen Mac: [Capawesome iOS CI/CD](https://capawesome.io/blog/ci-cd-for-ios-apps/) und [Capgo: Capacitor iOS mit Codemagic](https://capgo.app/blog/automatic-capacitor-ios-build-codemagic/). Laut Capawesome braucht Apple für Einreichungen inzwischen Xcode 26, das erledigt der Cloud-Build.
- [Phaser 4 Downloads](https://phaser.io/download/phaser4): v4.1.0 "Salusa" vom 30.04.2026 ist die aktuelle stabile Version.

## Claude-Skills für Spiele

Community-Skills, die wir uns vor E1 anschauen (nicht ungeprüft installieren, erst lesen):
- [opusgamelabs/game-creator: phaser](https://claudemarketplaces.com/skills/opusgamelabs/game-creator/phaser) und [make-game](https://claudemarketplaces.com/skills/opusgamelabs/game-creator/make-game): Architektur mit Szenen, EventBus, GameState; verlangt Spielplan vor Code (passt zu uns).
- [phaserjs/phaser Skills](https://claudemarketplaces.com/skills/phaserjs/phaser/v4-new-features), u. a. Phaser-4-Neuerungen und [Setup inkl. Pixel-Art-Konfiguration](https://claudemarketplaces.com/skills/phaserjs/phaser/game-setup-and-config). Herkunft auf der Verzeichnis-Seite nicht bestätigt.
- [chongdashu/phaserjs-oakwoods](https://cdn.jsdelivr.net/gh/chongdashu/phaserjs-oakwoods@main/README.md): Phaser-Skill plus Playwright-Test-Skill. Interessant für automatische Handy-Screenshots.

Empfehlung: Vor E1 den Phaser-4-Skill und den Playwright-Skill lesen und, wenn sie taugen, ins Repo unter `.claude/skills/` übernehmen.

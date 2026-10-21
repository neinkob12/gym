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

## Heller Stil: wie andere es machen

- Kairosoft-Spiele (z. B. Game Dev Story, Venture Towns) nutzen helle, bunte Pixel Art, teils isometrisch, teils von oben, mit sehr einheitlichem Stil über alle Spiele ([TouchArcade zu Cafeteria Nipponica](https://toucharcade.com/?p=107554), [Everyeye zu Venture Towns](https://www.everyeye.it/articoli/recensione-venture-towns-15720.html), [Apple Story zu Game Dev Story](https://apps.apple.com/pk/story/id1484316385)).
- Theme Hospital: 2D-Sprites in isometrischer Ansicht, klare Sprites und Animationen, Räume als feste Grundrisse im Raster ([Geeky Hobbies Review](https://www.geekyhobbies.com/theme-hospital-retro-video-game-review/), [Best DOS Games](https://bestdosgames.com/games/theme-hospital)).
- Gym-Konkurrenz zum Anschauen: [Idle Planet: Gym Tycoon](https://www.crazygames.com/game/idle-planet-gym-tycoon), [Fitness Club Tycoon](https://apps.apple.com/app/id1611726111). Ein isometrisches Pixel-Art-Gym im hellen Stil haben wir nicht gefunden, das ist eine Lücke.
- Übernommen: helle Böden, weiße Wände, zwei Akzentfarben, dunkle Kontur um Figuren, hintere Wände hoch und vordere abgeschnitten.

## Decompilte oder nachgebaute Tycoon-Spiele

- [OpenRCT2](https://en.wikipedia.org/wiki/OpenRCT2): Nachbau von RollerCoaster Tycoon 2, Lizenz GPLv3, braucht die Original-Spieldateien.
- [CorsixTH](https://github.com/damsweb/CorsixTH): Nachbau der Theme-Hospital-Engine, lädt die Original-Grafiken und -Sounds, braucht eine gekaufte Kopie. Lizenzangaben in den Quellen widersprüchlich, im Repo prüfen.

Was das für uns heißt:
- **Grafiken und Sounds** aus diesen Spielen dürfen wir nicht nutzen. Sie gehören weiter den Rechteinhabern, die Projekte liefern sie bewusst nicht mit.
- **Code** von OpenRCT2 (GPLv3) dürfen wir nicht in unser Spiel kopieren, sonst müsste unser ganzes Spiel GPL werden, und GPL verträgt sich schlecht mit dem App Store.
- **Lesen und lernen** ist erlaubt und sinnvoll: wie Besucher-KI, Personal, Pfadfindung, Raum-Logik und Warteschlangen gelöst sind. Wir schreiben es dann selbst neu.
- Echte Decompilate kommerzieller Spiele nutzen wir gar nicht, auch nicht als Vorlage.

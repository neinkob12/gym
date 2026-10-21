# Tech Stack

Entscheidung für Gym Tycoon. Anforderungen: Hochformat-Handyspiel, viele laufende Figuren auf einer Pixel-Karte,
spielbar per TestFlight auf dem iPhone, Web-Version über Vercel.

## Entscheidung

| Bereich | Wahl | Warum |
| --- | --- | --- |
| Sprache | TypeScript (strict) | wie in deinen anderen Projekten |
| Engine | **Phaser 4** (aktuell 4.1) | echte 2D-Engine: Sprites, Animationen, Kamera mit Zoom, Tiefensortierung, Pixel-Art-Modus. Läuft im Browser, also direkt auf Vercel. |
| Build | **Vite** | schnell, gleiches Setup wie Matcha Maker |
| Menüs | HTML/CSS-Overlay mit **Preact** | Einstellen-Menü, Shop, Statistik sind Listen und Karten. Das ist mit HTML viel einfacher und schärfer als in der Engine. |
| Spiellogik | reines TypeScript in `src/sim/`, ohne Phaser | testbar, und Offline-Einnahmen lassen sich ohne Grafik durchrechnen |
| Tests | **Vitest** | |
| Speichern | `localStorage` im Web, `@capacitor/preferences` auf dem Handy | lokal, kein Login |
| Handy-App | **Capacitor** | packt das Web-Spiel als echte iOS- und Android-App |
| iOS-Build | **Codemagic** (oder GitHub Actions auf macOS) nach **TestFlight** | du brauchst dafür keinen eigenen Mac |
| Web | **Vercel** | jeder Push gibt eine Vorschau-URL, die du sofort am Handy öffnen kannst |
| Pixel Art | **per Code erzeugt**: Node-Skripte zeichnen Sprites und schreiben PNG-Spritesheets + JSON-Atlas | einheitlicher Stil, beliebig viele Varianten (Figuren-Baukasten) |
| Sound | generierte Chiptune-Effekte (jsfxr-Stil), Musik später | |
| Sprachen | eigene `strings.de.ts` / `strings.en.ts` | |
| Später | RevenueCat (In-App-Käufe), AdMob (Rewarded Ads) über Capacitor-Plugins | erst wenn das Spiel steht |

## Warum nicht React Native, Godot oder Unity

- **Vercel** ist ein Web-Hoster. Ein Web-Spiel mit Capacitor erfüllt Vercel und TestFlight mit derselben Codebasis.
- Godot und Unity würden auch gehen, aber neue Sprache, schwereres Tooling, und die Web-Builds sind groß und langsam auf dem Handy.
- Phaser hat einen offiziellen Weg zu iOS und Android über Capacitor (Tutorial in `RECHERCHE.md`).

## Was du einrichten musst

1. **Apple Developer Account** (99 USD pro Jahr). Ohne geht kein TestFlight. Hat manchmal Wartezeit, also früh beantragen.
2. **App Store Connect**: App-Eintrag anlegen, API-Key für den Cloud-Build erstellen.
3. **Codemagic**-Konto (kostenloses Kontingent reicht am Anfang), mit dem GitHub-Repo verbinden.
4. **Vercel**-Projekt mit dem Repo verbinden (Vite wird automatisch erkannt).
5. Später: Google Play Console (25 USD einmalig) für Android-Tests.

## Geplante Ordnerstruktur

```
src/
  sim/          # Spielregeln ohne Grafik: Kunden, Geräte, Wirtschaft, Zeit
    config.ts   # ALLE Balancing-Werte
    __tests__/
  game/         # Phaser-Szenen, Rendering, Kamera, Eingabe
  ui/           # Preact-Menüs (Personal, Shop, Statistik, Einstellungen)
  content/      # Texte DE/EN, Kunden- und Mitarbeiterdaten
  art/          # Pixel-Zeichenfunktionen (Quelle der Sprites)
scripts/
  build-art.ts  # rendert src/art nach public/sprites/*.png + Atlas
public/sprites/
docs/
prototypes/
```

## Regeln, die von Anfang an gelten

- Alle Balancing-Werte nur in `src/sim/config.ts`.
- Spiellogik importiert nie Phaser oder Preact.
- Spielzeit wird aus Zeitstempeln berechnet, damit Offline-Fortschritt stimmt.
- Sichtbare Texte nur in den String-Dateien.
- Erst am Handy testen, dann als fertig melden.

# Tech Stack

Entscheidung für Gym Tycoon. Anforderungen: Hochformat-Handyspiel, viele laufende Figuren in einer isometrischen 3D-Szene,
spielbar per TestFlight auf dem iPhone, Web-Version über Vercel.

## Entscheidung

| Bereich | Wahl | Warum |
| --- | --- | --- |
| Sprache | TypeScript (strict) | wie in deinen anderen Projekten |
| Engine | **Three.js** | 3D im Browser mit orthografischer Iso-Kamera, Licht und Schatten. Passt zum Low-Poly-Look (Hotel Empire Tycoon). Läuft auf Vercel und per Capacitor auf dem Handy. Prototyp nutzt r128, im echten Projekt die aktuelle Version per npm. |
| Build | **Vite** | schnell, gleiches Setup wie Matcha Maker |
| Menüs | HTML/CSS-Overlay mit **Preact** | Einstellen-Menü, Shop, Statistik sind Listen und Karten. Das ist mit HTML viel einfacher und schärfer als in der Engine. |
| Spiellogik | reines TypeScript in `src/sim/`, ohne Three.js | testbar, und Offline-Einnahmen lassen sich ohne Grafik durchrechnen |
| Tests | **Vitest** | |
| Speichern | `localStorage` im Web, `@capacitor/preferences` auf dem Handy | lokal, kein Login |
| Handy-App | **Capacitor** | packt das Web-Spiel als echte iOS- und Android-App |
| iOS-Build | **Codemagic** (oder GitHub Actions auf macOS) nach **TestFlight** | du brauchst dafür keinen eigenen Mac |
| Web | **Vercel** | jeder Push gibt eine Vorschau-URL, die du sofort am Handy öffnen kannst |
| Grafik | **Low-Poly per Code**: Geräte und Figuren aus einfachen 3D-Formen, Farben aus einer Palette. Später optional Modelle aus Blender (glTF) | einheitlicher Stil, Figuren-Baukasten mit beliebig vielen Varianten, keine Zeichenarbeit nötig |
| Sound | fröhliche Casual-Effekte (Kasse, Hanteln, Laufband), Musik später | passt zum 3D-Look besser als Chiptune |
| Sprachen | eigene `strings.de.ts` / `strings.en.ts` | |
| Später | RevenueCat (In-App-Käufe), AdMob (Rewarded Ads) über Capacitor-Plugins | erst wenn das Spiel steht |

## Warum nicht React Native, Godot oder Unity

- **Vercel** ist ein Web-Hoster. Ein Web-Spiel mit Capacitor erfüllt Vercel und TestFlight mit derselben Codebasis.
- Godot und Unity würden auch gehen, aber neue Sprache, schwereres Tooling, und die Web-Builds sind groß und langsam auf dem Handy.
- Capacitor packt jedes Web-Spiel, also auch Three.js, als iOS- und Android-App (Phaser-Tutorial in `RECHERCHE.md` gilt sinngemäß).
- Phaser war die erste Wahl für Pixel Art. Mit dem Wechsel zum 3D-Look ist Three.js besser, weil Licht, Schatten und Kamera direkt mitkommen.

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
  game/         # Three.js: Szene, Kamera, Licht, Eingabe
  ui/           # Preact-Menüs (Personal, Shop, Statistik, Einstellungen)
  content/      # Texte DE/EN, Kunden- und Mitarbeiterdaten
  models/       # Low-Poly-Bausteine für Geräte, Figuren, Stadt
docs/
prototypes/
```

## Regeln, die von Anfang an gelten

- Alle Balancing-Werte nur in `src/sim/config.ts`.
- Spiellogik importiert nie Three.js oder Preact.
- Spielzeit wird aus Zeitstempeln berechnet, damit Offline-Fortschritt stimmt.
- Sichtbare Texte nur in den String-Dateien.
- Erst am Handy testen, dann als fertig melden.

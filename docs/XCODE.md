# Gym Tycoon auf dein iPhone bringen (Xcode, kostenlos)

Einmal einrichten dauert ca. 30 Minuten (vor allem der Xcode-Download). Danach reicht ein Klick auf "Run".

## Einmalig

1. **Xcode** aus dem Mac App Store installieren (groß, ca. 10 GB). Einmal öffnen und die Zusatzkomponenten installieren lassen.
2. **Node.js** installieren (Version 22 oder neuer): https://nodejs.org
3. In Xcode: **Settings, Accounts, "+", Apple ID**. Deine normale Apple-ID reicht, kein bezahlter Account nötig.
4. Auf dem iPhone den **Entwicklermodus** einschalten: Einstellungen, Datenschutz und Sicherheit, ganz unten "Entwicklermodus", an. Das iPhone startet neu.
5. Repo holen und Abhängigkeiten installieren:
   ```bash
   git clone https://github.com/neinkob12/gym.git
   cd gym
   npm install
   ```

## Jedes Mal, wenn du die neueste Version spielen willst

1. Neuesten Stand holen: `git pull`
2. Bauen und Xcode öffnen:
   ```bash
   npm run ios
   ```
3. iPhone per Kabel an den Mac, entsperren, "Diesem Computer vertrauen".
4. In Xcode oben dein **iPhone als Ziel** auswählen.
5. Beim ersten Mal: links auf **App**, Reiter **Signing & Capabilities**, bei **Team** deine Apple-ID wählen. Falls Xcode meckert, die **Bundle Identifier** leicht ändern (z. B. `de.neinkob.gymtycoon.jakob`).
6. **Run** (Play-Knopf oben links). Die App startet auf dem iPhone.
7. Beim allerersten Start sagt das iPhone "Nicht vertrauenswürdiger Entwickler": Einstellungen, Allgemein, VPN und Geräteverwaltung, deine Apple-ID, "Vertrauen".

## Gut zu wissen

- Mit kostenloser Apple-ID läuft die App **7 Tage**. Danach einfach wieder **Run** in Xcode drücken. Der Spielstand bleibt erhalten.
- Du kannst höchstens 3 eigene Apps gleichzeitig so installieren.
- Für TestFlight (andere Leute einladen, keine 7-Tage-Grenze) brauchst du später den Apple Developer Account (99 USD pro Jahr).

## Ohne Xcode zwischendurch testen

- `npm run dev` startet das Spiel im Browser. Mit `--host` (ist schon eingestellt) erscheint eine Netzwerk-Adresse, die du im gleichen WLAN direkt am iPhone in Safari öffnen kannst.
- Sobald Vercel verbunden ist: Link am iPhone öffnen, "Teilen, Zum Home-Bildschirm". Dann startet das Spiel im Vollbild mit eigenem Icon.

## Hilfreich beim Testen

- `#neu` an die Adresse anhängen (im Browser) startet einen frischen Spielstand.
- Das Spiel speichert alle 10 Sekunden und beim Verlassen der App.

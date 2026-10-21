# Gym Tycoon: Game Design

Arbeitstitel: **Gym Tycoon**. Stand: Planung, 21.10.2026. Quelle: 50-Fragen-Runde plus Nachträge.
Diese Datei ist die Wahrheit. Ändert sich eine Entscheidung, wird sie hier geändert.

## 1. Pitch

Du erbst von deinem Onkel eine heruntergekommene Muckibude. Alte Geräte, Dreck, kaputte Bereiche, schlechte Bewertungen.
Mit Josef, dem einzigen Mitarbeiter, räumst du auf, reparierst, stellst Personal ein, kaufst bessere Geräte und schaltest
Protein Bar, Kursraum und Wellness frei. Ziel: aus dem Ranz-Gym das beste Gym der Stadt machen.

Handyspiel im Hochformat, Low-Poly-3D in isometrischer Ansicht, Idle-Tycoon mit aktivem Start.

## 2. Story und Ton

- Der Onkel hat das Gym jahrzehntelang geführt und zuletzt verfallen lassen. Hier hat früher eine echte Bodybuilding-Legende trainiert (siehe Abschnitt 11, Promi-Tag).
- **Josef**, ca. 18, war der Mitarbeiter vom Onkel. Sein Vater trainiert hier, seit er denken kann. Extrem zuverlässig, immer an deiner Seite, führt durchs Tutorial. Später wird sein Sprite nach einem Foto gestaltet (offene Frage).
- Ton: humorvoll, deutsche Gym-Kultur, Sprüche statt Ernst. Keine Gewaltverherrlichung (Schlägereien bleiben cartoonig).

## 3. Kern-Loop

1. Kunden kommen rein, checken an der Rezeption ein, zahlen.
2. Sie trainieren an Geräten, die zu ihrem Typ passen, trinken am Wasserspender, gehen wieder.
3. Nutzung erzeugt Verschleiß und Dreck. Wartezeiten, Dreck und Defekte senken die Zufriedenheit.
4. Zufriedenheit wird zu Bewertungen, Bewertungen zu Ruf, Ruf und Erfahrung zu Level.
5. Level schaltet Geräte, Bereiche und Personal frei. Geld bezahlt sie.

Sessions: am Anfang 10 bis 20 Minuten aktiv (aufräumen, reparieren, umbauen), später kurze Check-ins von 2 bis 5 Minuten.

## 4. Startzustand: das Ranz-Gym

- Startgeräte: Flachbank, Kurzhantelablage, Laufband (2, eins davon kaputt), Latzug/Kabelzug, Langhantel-Rack, Wasserspender.
- Alle Geräte alt und abgenutzt (Zustand 15 bis 50 %), verschleißen aber langsam.
- Boden mit Flecken und Rissen, Wände vergilbt, herumliegende Hanteln, Handtücher, Flaschen.
- Ruf startet bei ca. 2 Sternen, am Anfang deutlich mehr Beschwerden.
- Bereiche sind abgesperrt und dunkel: Umkleide, Protein Bar, Kursraum, Wellness.
- Geräte-Upgrades sind **keine** Stufen derselben Maschine. "Besser" heißt: alte Geräte durch echte bessere Modelle ersetzen (z. B. alte Flachbank durch verstellbare Bank, Seilzugturm durch Doppel-Kabelzug).

## 5. Ansicht, Bedienung, Zeit

- Isometrische 3D-Ansicht, eine große Karte. Das Start-Gym liegt in der Mitte, Ausbauflächen in Gym-Größe links (West) und hinten (Nord), dazu Umkleide, Protein Bar, Kursraum, Personalraum und Wellness als Bauflächen mit Schild. Wischen zum Scrollen, Pinch zum Zoomen.
- Feste Gebäudekarte, Bereiche werden per Level freigeschaltet und dann gekauft.
- Bauen: freies Raster, Geräte ziehen, drehen, verschieben. Deko frei (Spiegel, Pflanzen, Poster, Licht, Boden) mit Ambiente-Bonus.
- **24/7 geöffnet.** Tag/Nacht-Zyklus mit Stoßzeiten: früh morgens mittel, tagsüber ruhig, Feierabend-Rush 16 bis 21 Uhr, nachts wenige Nachteulen.
- Offline-Einnahmen beim Wiederkommen, gedeckelt (Vorschlag: 8 Stunden).

## 6. Kunden

Fünf Typen, alle aus einem Figuren-Baukasten (Körperform, Hautfarbe, Frisur, Outfit, Accessoire), männlich und weiblich:

| Typ | Will | Besonderheit |
| --- | --- | --- |
| Anfänger | Maschinen, Laufband, Trainer | brauchen Hilfe, mögen Ordnung |
| Bodybuilder | Rack, Bank, Kurzhanteln, Supplements | lassen am häufigsten Hanteln liegen |
| Cardio und Kurse | Laufband, Rad, Kurse | Kurse und Cardio sind ein Typ |
| Wellness-Gast | Sauna, Pool, Massage | gehen enttäuscht, solange Wellness gesperrt ist |
| Influencer/Promi | Spiegel, freie Gewichte | selten, großer Ruf-Effekt |

- Einnahmen: Tagespass und Mitgliedschaft. Zufriedene Tagesgäste werden Mitglieder, unzufriedene kündigen.
- Preise einstellbar: Tagespass, Mitgliedsbeitrag und Abo-Stufen (z. B. Basic, Premium mit Wellness, VIP).
- Feedback: Sprechblasen-Icons (warten, glücklich, sauer, Wellness fehlt) plus seltene Sterne-Bewertungen mit kurzen Texten. Wenig Meldungen: nur was wirklich Handeln braucht, poppt auf.
- Belegtes Gerät: anstehen, Geduld sinkt, irgendwann sauer gehen.
- Kunde antippen zeigt Typ und Wünsche.

### Trainingspläne und Stammkunden (Nachtrag)

- Jeder Mitglieds-Kunde hat einen sichtbaren Trainingsplan, z. B. Push/Pull/Beine, Ganzkörper 3x, Cardio 5x.
- Der Plan bestimmt, an welchen Tagen und zu welchen Uhrzeiten er kommt und welche Geräte er braucht.
- Statistik-Screen: Verteilung der Trainingspläne (welcher Plan wie oft), Auslastung pro Gerät und Uhrzeit, **Stammkunden-Liste** (wer am öftesten kommt, mit Name und Besuchszahl).
- Nutzen fürs Spiel: Man sieht, welche Geräte fehlen (z. B. "Montag 18 Uhr: Bänke voll, 40 % Push-Pläne").

## 7. Wartung und Sauberkeit

- Geräte verschleißen langsam durch Nutzung (im Prototyp ca. 1 bis 2 % pro Satz, höheres Level hält länger). Unter 30 % wackeln sie (gelbes Ausrufezeichen), bei 0 % kaputt (Rauch, rotes Ausrufezeichen).
- Reparieren: Gerät antippen. Am Anfang macht Josef das, später ein **Techniker auf Abruf** (wird gerufen und pro Einsatz bezahlt, nicht angestellt).
- Dreck: liegengelassene Hanteln, Handtücher, Flaschen, Müll, Umkleide und Duschen verschmutzen schnell.
- Aufräumen: anfangs per Tippen. Jeder Gegenstand hat einen hüpfenden orangen Pfeil, oben zeigt ein Button "Aufräumen: N" die Anzahl und schwenkt die Kamera zum nächsten Teil. Später räumen Reinigungskräfte automatisch.
- Folgen: schlechte Bewertungen, weniger Neukunden, Kündigungen. Kein Game Over.

## 8. Mitarbeiter

- Rollen: Rezeption, Reinigung, Personal Trainer (halten auch Kurse), Barista (Protein Bar), Wellness-Personal (Bademeister, Masseur/Physio). Techniker nur auf Abruf.
- Tiefe: mittel. Gehalt, 1 bis 2 Werte (z. B. Tempo, Können), Level-Up durch Erfahrung. Keine Müdigkeit, keine Schichtpläne.
- Einstellen über einen **festen Katalog** mit sehr übersichtlichem Menü, orientiert an bekannten Tycoons (Karten mit Porträt, Rolle, Werten, Gehalt, großer Einstellen-Button, Filter nach Rolle).
- Persönlichkeit: Name plus kurze Sprüche. Feste Gym-Stereotypen als Charaktere (Details in `OFFENE_FRAGEN.md`, Charakter-Runde).
- Mitarbeiter-Art: männlich und weiblich, aus dem Baukasten mit eigenen Uniform-Farben.

## 9. Bereiche und Angebote

| Bereich | Inhalt | Freischaltung (Vorschlag) |
| --- | --- | --- |
| Kraftraum | Startgeräte, später mehr Geräte | Start |
| Rezeption/Lobby | Check-in, Mitgliedschaften | Start |
| Umkleide/Duschen | Pflicht für Zufriedenheit ab mittlerem Level | Level 2 |
| Protein Bar | Shakes, Riegel, Supplements (Kreatin, Pre-Workout, BCAA) | Level 3 |
| Kursraum | Trainer wird dem Raum zugeordnet, Kurse laufen dann automatisch | Level 5 |
| Wellness | Sauna, Dampfbad, Whirlpool, Pool, Massage/Physio | Level 8+ |

- **Protein Bar**: Barista verkauft automatisch, du füllst das Lager nach. Leeres Lager heißt verpasste Verkäufe.
- **Kurse**: kein eigener Stundenplan. Trainer dem Kursraum zuordnen, fertig.

## 10. Wirtschaft und Fortschritt

- Währungen: Geld plus seltene Premium-Währung (Arbeitstitel "Gold-Hanteln"), auch ohne Echtgeld verdienbar.
- Laufende Kosten: Gehälter, Techniker-Einsätze, Ware für die Protein Bar. (Keine Miete, kein Strom.)
- Levelsystem: Erfahrung durch Besuche und Zufriedenheit. Level schaltet frei, Geld bezahlt.
- Motivation: Tagesaufgaben, Login-Belohnungen, Meilenstein-Ziele pro Level.
- Mehrere Standorte: nicht in V1. Erst ein Gym.

## 11. Ereignisse

- **Promi-Tag (fester Story-Moment, z. B. Tag 8)**: Die Legende, die früher im Gym trainiert hat, kommt vorbei. Zufrieden heißt großer Ruf-Boost. Empfehlung: fiktive Figur, eindeutig inspiriert, aber mit eigenem Namen (siehe `OFFENE_FRAGEN.md`).
- **Stromausfall / Wasserrohrbruch**: selten. Bereich fällt aus, Techniker muss kommen.
- **Kunden-Drama**: Streit ums Gerät, Handy-Blockierer. Wenn es zu voll ist, gelegentlich eine Rangelei (cartoonig, Staubwolke, beide gehen sauer).
- Saisonale Events (Neujahrsvorsätze, Summer Body, Black Friday): erst nach V1.

## 12. Monetarisierung

- TestFlight-Version erst ohne, sobald das Spiel steht, testweise eingebaut.
- Später: Rewarded Ads (freiwillig, z. B. "2x Einnahmen für 1 Stunde") und In-App-Käufe (Premium-Währung, Kosmetik).

## 13. Präsentation

- Stil: **Low-Poly-3D, hell und freundlich**, Vorbild Hotel Empire Tycoon (Codigames). Kein Pixel Art mehr. Flach schattierte Formen, sanfte Schatten, kräftige Raumfarben (z. B. Mint im Kraftraum, Pfirsich in der Lobby), dicke Wände mit hellen Kappen.
- Kamera: **isometrisch**, etwas steiler als klassisch (ca. 40° statt 35°), damit sich das Gym im Hochformat nach hinten streckt. Hintere Wände des eigenen Gyms hoch, alle anderen niedrig geschnitten.
- Umgebung: Das Gym steht in einer kleinen Stadt mit Straßen, fahrenden Autos, Bäumen und Nachbarhäusern.
- Farben: Palette **Anthrazit** (gewählt): helle, graue Böden, anthrazitfarbene Wände, Akzent Blau, Level-System Türkis. Kein Beige, kein Orange, kein grelles Grün.
- Schrift: Manrope (clean, gut lesbar), keine verspielte Spieleschrift.
- HUD: kompakte, kantige Anthrazit-Leisten (kleiner Radius), Werte als Text statt bunter Icon-Kreise, gefüllte schlichte Symbole. Bedienung nach dem Raster von Hotel Empire Tycoon: Geld, Uhrzeit, laufende Werbung und Aufräumen links oben; Bewertung und Level rechts oben; runde Buttons rechts (Mitarbeiter, Statistik, Meldungen); unten rechts Tempo, Zentrieren und der große Button "Bauen".
- Alle Menüs fahren von unten hoch, Tabs sitzen wie Karteireiter auf der Kante, Buttons geben beim Drücken nach. **Alles passt ohne Scrollen.**
- Raum antippen öffnet unten das Raum-Menü: Kennzahlen, Karte des gewählten Geräts (Level, Beschreibung, Kosten, "Verbessern") und ein Raster aller Geräte mit Level-Zahl. Tabs "Geräte" und "Mitarbeiter".
- "Bauen" öffnet das Bau- und Verwaltungsmenü: Räume (freikaufen), Mitarbeiter, Werbung (Kampagnen wie Flyer, Social Media, Influencer; immer nur eine gleichzeitig).
- **Geräte leveln von Anfang an** (Level 1 bis 5, höheres Level hält länger und macht Kunden zufriedener). Später kommen zusätzlich echte bessere Modelle als neue Geräte.
- **Nur eine Währung** (Geld) in V1. Keine zweite Ressource wie die Energie bei Hotel Tycoon.
- Feedback ohne Text-Meldungen, wo es geht: Aufräumen und Reparieren zeigen einen kurzen Funkel-Effekt, Bezahlen fliegende Geldscheine. Hinweise erscheinen unten über den Buttons, nie mitten im Bild.
- Menüs lassen sich per Wischen nach unten schließen.
- Wände wie bei Hotel Tycoon: kräftig mit heller Kappe und Sockelleiste, Außenfassade ums Grundstück (hinten hoch mit Fenstern, vorne niedrig), Türrahmen an Durchgängen.
- Nachts sind die Räume beleuchtet, nur die Umgebung wird dunkler.
- Animationen nach Vorbild: Leute laufen und trainieren sichtbar, Geldscheine fliegen beim Bezahlen hoch, kaputte Geräte rauchen.
- Animationen: Laufen in jede Richtung, eigene Trainings-Pose pro Gerät (Bankdrücken, Kniebeugen, Curls, Latzug, Laufen, Trinken).
- Sound: fröhliche Casual-Musik plus Gym-Geräusche (Hanteln, Laufband, Kasse).
- Sprachen: Deutsch und Englisch von Anfang an.
- Speichern: lokal auf dem Gerät, kein Login. Cloud-Save später.
- Tutorial: Josef führt durch die ersten Minuten.

## 14. Nicht in V1

Mehrere Standorte, saisonale Events, Cloud-Save, Kältekammer/Eisbad, Merch, sichtbare Upgrade-Stufen derselben Maschine.

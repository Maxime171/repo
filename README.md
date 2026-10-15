# KI-Kalender

Ein persönlicher Kalender, der Aufgaben auf die freie Zeit zwischen deinen Terminen verteilt, und für Gruppen gemeinsame Lücken findet.

## Starten

```bash
npm install
npm run dev
```

Dann im Browser http://localhost:5173 öffnen.

## Was der Prototyp kann

- **Mein Tag:** Termine eintragen, Aufgaben mit Dauer und Priorität erfassen (z. B. `Referat 1,5h !`). Der Planer verteilt sie nach Priorität auf freie Lücken, ohne die eingestellte Zeit für Aufgaben zu überschreiten.
- **Gruppe:** Für mehrere Personen die belegten Zeiten eintragen; die App zeigt Zeiten, an denen alle frei sind.

Daten bleiben im Browser (localStorage).

## Nächste Schritte

- KI-Eingabe in normaler Sprache (Claude API über ein kleines Backend)
- Google- und Apple-Kalender anbinden
- Gruppen per Link einladen

## Entwicklung

```bash
npm test        # Tests der Planungslogik
npm run build   # Typprüfung und Build
```

Die Logik liegt in `src/lib/` (Lücken berechnen, Tag planen, gemeinsame Lücken finden, Eingabe lesen).

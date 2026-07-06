# Teil C – Schritt 2: Frontend mit Backend verbinden

## Ausgangslage

Das Backend (Express-Server + SQLite-Datenbank) aus Schritt 1 war fertig und
funktionierte bereits (Routen: `GET /tasks`, `POST /tasks`, `PUT /tasks/:id`,
`DELETE /tasks/:id`).

Als Frontend sollte ursprünglich der bestehende Code aus **Teil B (Lovable)**
weiterverwendet werden. Das Ziel: aus der reinen State-/localStorage-Lösung
von Teil B eine echte Verbindung zur eigenen Datenbank machen.

## Problem: Lovable-Code ließ sich nicht übernehmen

Beim Versuch, den Lovable-Code zu exportieren und anzupassen, traten mehrere
technische Hürden auf:

1. **GitHub-Verbindung fehlgeschlagen** – die Konnektoren-Suche in Lovable
   fand den GitHub-Eintrag nicht (vermutlich ein Bug), obwohl er in der Liste
   sichtbar war.
2. **Kopieren aus dem Chat-Fenster zerstörte den Code** – JSX-Tags
   (`<div>`, `<Checkbox>`, `<Dialog>` usw.) gingen beim Copy-Paste aus dem
   gerenderten Chat verloren, weil der Browser sie als echtes HTML
   interpretierte statt als Text.
3. **Tageslimit der kostenlosen Lovable-Credits erreicht** – ein Upgrade auf
   den kostenpflichtigen Plan (25 €/Monat) war nicht nötig und wurde bewusst
   vermieden.

## Entscheidung: Eigenes, einfaches Frontend statt React-Export

Da der Lovable-Code auf **React** basiert und für ein funktionierendes Build
eine komplette React-Umgebung (Vite, node_modules, Router usw.) nötig gewesen
wäre, wurde entschieden, das Frontend stattdessen mit **einfachem
HTML + JavaScript** neu umzusetzen – mit der gleichen Funktionalität wie in
Teil B:

- Aufgaben anzeigen (`GET /tasks`)
- Neue Aufgabe anlegen (`POST /tasks`)
- Aufgabe abhaken (`PUT /tasks/:id`)
- Aufgabe löschen (`DELETE /tasks/:id`)

**Begründung für die Doku/Prüfung:** Die Aufgabenstellung fordert eine
verteilte App aus mehreren Modulen, die man vollständig versteht – nicht
zwingend die 1:1-Wiederverwendung des Lovable-Codes. Die Kernfunktionalität
von Teil B (Liste, Checkbox, Löschen, Hinzufügen) bleibt inhaltlich identisch.
Der ursprüngliche Lovable/React-Code wird zusätzlich als Referenz ins Repo
gelegt, um den Bezug zu Teil B zu dokumentieren.

## Technisches Problem beim Testen: CORS

Beim ersten Öffnen der `frontend.html` (als lokale Datei, `file:///...`) kam
die Fehlermeldung "Server nicht erreichbar". Grund: Browser blockieren aus
Sicherheitsgründen Anfragen von einer lokalen Datei an einen Server auf
`localhost`, wenn der Server das nicht ausdrücklich erlaubt (**CORS** –
Cross-Origin Resource Sharing).

**Lösung:** In `index.js` wurde direkt nach `app.use(express.json());`
folgender Code ergänzt:

```js
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
```

Das sagt dem Browser: Anfragen von außerhalb (auch von einer lokalen Datei)
sind für diesen Server erlaubt.

## Ergebnis

Nach Einfügen der CORS-Zeilen und Neustart des Servers (`node index.js`)
funktioniert die Verbindung:

- `frontend.html` lädt die Aufgaben live aus der SQLite-Datenbank
- Neue Aufgaben, Abhaken und Löschen wirken sich direkt auf die Datenbank aus
- **Wichtigster Test:** Nach Neuladen der Seite (F5) bleiben die Aufgaben
  erhalten – im Gegensatz zu Teil B, wo alles beim Neuladen verloren ging

Damit ist die verteilte App aus drei Modulen (Frontend, Backend, Datenbank)
funktionsfähig, die über HTTP miteinander kommunizieren.

## Nächste Schritte

- [ ] Frontend-Code (`frontend.html`) Zeile für Zeile verstehen und erklären
      können
- [ ] Lovable/React-Code als Referenz ins Repo legen (`docs/referenz-teil-b/`)
- [ ] Restliche Dokumentation der Backend-Schritte (POST/PUT/DELETE) ergänzen

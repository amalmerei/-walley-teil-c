# Teil C – Schritt 2: Frontend mit Backend verbinden

Diese Datei beschreibt die sieben Schritte, in denen das Frontend mit dem
bereits fertigen Backend verbunden wurde – in genau der Reihenfolge, in der
sie tatsächlich passiert sind.

## Die sieben Schritte im Überblick

1. Backend bauen
2. Backend testen
3. Versuch: Lovable-Code direkt nutzen (gescheitert)
4. Entscheidung: eigenes Frontend bauen
5. Frontend zum ersten Mal getestet (Fehler)
6. CORS-Problem gelöst
7. Frontend erfolgreich getestet

---

## Schritt 1: Backend bauen

Das Backend (`index.js`) wurde in **Cursor** erstellt. Es besteht aus einem
**Express-Server** und einer **SQLite-Datenbank** (`walley.db`) und stellt
vier Routen bereit:

| Route | Bedeutung |
|---|---|
| `GET /tasks` | alle Aufgaben abrufen |
| `POST /tasks` | neue Aufgabe anlegen |
| `PUT /tasks/:id` | Aufgabe abhaken |
| `DELETE /tasks/:id` | Aufgabe löschen |

Zu diesem Zeitpunkt gab es noch keine Webseite, die diese Routen benutzt –
nur das Backend selbst.

## Schritt 2: Backend testen

Der Server wurde über das Terminal gestartet (`node index.js`) und mit dem
Befehl `curl` getestet – zum Beispiel `curl http://localhost:3000/tasks`.
Das Backend funktionierte bereits einwandfrei, bevor überhaupt an ein
Frontend gedacht wurde.

## Schritt 3: Versuch, den Lovable-Code direkt zu nutzen (gescheitert)

Als Frontend sollte ursprünglich der bestehende Code aus Teil B (Lovable)
weiterverwendet werden. Das ist aus drei Gründen gescheitert:

1. **GitHub-Verbindung fehlgeschlagen** – die Konnektoren-Suche in Lovable
   fand den GitHub-Eintrag nicht (vermutlich ein Bug), obwohl er in der
   Liste sichtbar war.
2. **Kopieren aus dem Chat-Fenster zerstörte den Code** – JSX-Tags
   (`<div>`, `<Checkbox>`, `<Dialog>` usw.) gingen beim Copy-Paste aus dem
   gerenderten Chat verloren, weil der Browser sie als echtes HTML
   interpretierte statt als Text.
3. **Tageslimit der kostenlosen Lovable-Credits erreicht** – ein Upgrade
   auf den kostenpflichtigen Plan (25 €/Monat) war nicht nötig und wurde
   bewusst vermieden.

## Schritt 4: Entscheidung, ein eigenes Frontend zu bauen

Da der Lovable-Code auf React basiert und für ein funktionierendes Build
eine komplette React-Umgebung (Vite, node_modules, Router usw.) nötig
gewesen wäre, wurde stattdessen ein einfaches HTML + JavaScript-Frontend
gebaut (`frontend.html`) – mit derselben Funktionalität wie in Teil B:
Aufgaben anzeigen, anlegen, abhaken, löschen.

Der originale Lovable-Code liegt zur Referenz in
[`docs/referenz-teil-b/`](referenz-teil-b/index.tsx).

## Schritt 5: Frontend zum ersten Mal getestet – Fehler

Beim ersten Öffnen der `frontend.html` als lokale Datei (`file:///...`) kam
die Fehlermeldung **"Server nicht erreichbar"**.

## Schritt 6: CORS-Problem gelöst

Grund für den Fehler: Browser blockieren aus Sicherheitsgründen Anfragen
von einer lokalen Datei an einen Server auf `localhost`, wenn der Server
das nicht ausdrücklich erlaubt (**CORS** – Cross-Origin Resource Sharing).

**Lösung:** In `index.js` wurde über das Terminal (per `sed`-Befehl,
nicht über die Cursor-Oberfläche) direkt nach `app.use(express.json());`
folgender Code ergänzt:

```js
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
```

Das sagt dem Browser: Anfragen von außerhalb (auch von einer lokalen
Datei) sind für diesen Server erlaubt.

## Schritt 7: Frontend erfolgreich getestet

Nach Einfügen der CORS-Zeilen und Neustart des Servers funktionierte die
Verbindung zwischen Frontend und Backend:

- `frontend.html` lud die Aufgaben live aus der SQLite-Datenbank
- Neue Aufgaben, Abhaken und Löschen wirkten sich direkt auf die Datenbank
  aus
- **Wichtigster Test:** Nach Neuladen der Seite blieben die Aufgaben
  erhalten – im Gegensatz zu Teil B, wo alles beim Neuladen verloren ging

Dieser Schritt bildete die Grundlage für die vollständige, fünf Module
umfassende Architektur, die anschließend aufgebaut wurde (Details dazu in
[`03-verteilte-architektur.md`](03-verteilte-architektur.md)).

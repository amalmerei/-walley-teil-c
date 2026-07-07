# Walley's Pet Task Tracker – Teil C

**Amal Merei · Matrikel 107771 · Softwaretechnik (BHT MIB 20 S26)**

## Projektbeschreibung

Walley's Pet Task Tracker ist eine App zur Verwaltung von Pflegeaufgaben
für meinen Hund Walley (Gassi gehen, füttern, Fellpflege usw.). Die
App-Idee stammt aus Teil A (GUI-Entwurf mit Google Stitch) und Teil B
(funktionierender Prototyp mit Lovable). Teil C baut diese Idee zu einem
verteilten System mit dauerhafter Datenspeicherung aus.

Die vollständige Dokumentation zu Teil A (GUI-Entwurf mit Google Stitch)
und Teil B (funktionierender Prototyp mit Lovable) liegt als PDF in
`docs/teil-a-und-b/`. Hinweis: Die Online-Vorschau von GitHub kann diese
PDF nicht direkt anzeigen – bitte über den Download-Button herunterladen.

## Ziel des Projekts

In Teil B wurden alle Aufgaben nur im Browser-Speicher gehalten – beim
Neuladen der Seite gingen sämtliche Änderungen verloren. Ziel von Teil C
war es,

1. eine **echte Datenbank** einzuführen, damit Aufgaben dauerhaft
   gespeichert bleiben, und
2. die Anwendung als **verteiltes System** aus mehreren unabhängigen
   Programmen umzusetzen, die über HTTP miteinander kommunizieren – nicht
   als ein einzelnes Frontend-Backend-Bundle.

## Die verteilte Architektur

Die App besteht aus **fünf unabhängigen Prozessen**, die jeweils einzeln
gestartet werden müssen und über HTTP-Anfragen miteinander kommunizieren:

| Prozess | Datei | Port | Aufgabe |
|---|---|---|---|
| Backend | `index.js` | 3000 | Verwaltet Aufgaben in einer SQLite-Datenbank; stellt die Routen `GET/POST/PUT/DELETE /tasks` bereit |
| Frontend-Server | `frontend-server.js` | 5050 | Liefert die Bedienoberfläche (`frontend.html`) an den Browser aus |
| Stats-Service | `stats-service.js` | 4000 | Fragt selbst beim Backend nach und berechnet den Fortschritt ("X von Y erledigt") |
| Notification-Service | `notification-service.js` | 4100 | Fragt selbst beim Backend nach und ermittelt überfällige Aufgaben |
| Health-Service | `health-service.js` | 4200 | Prüft, ob Backend, Stats- und Notification-Service erreichbar sind |

**Warum das "verteilt" ist:** Jeder dieser fünf Prozesse läuft unabhängig.
Keiner teilt sich Code oder Speicher mit einem anderen – die
Kommunikation läuft ausschließlich über HTTP-Netzwerkanfragen. Wird ein
Prozess beendet, laufen die anderen unbeeinflusst weiter.

**Start aller fünf Prozesse** (jeweils in einem eigenen Terminal-Fenster):

```bash
node index.js
node frontend-server.js
node stats-service.js
node notification-service.js
node health-service.js
```

Anschließend die App im Browser öffnen: **http://localhost:5050**

Vorher einmalig die benötigten Pakete installieren (Node.js muss
installiert sein):

```bash
npm install
```

Vollständige Erklärung mit Architektur-Diagramm und Screenshots aller
laufenden Prozesse: [`docs/03-verteilte-architektur.md`](docs/03-verteilte-architektur.md)

## Projektstruktur

```
walley-teil-c/
├── index.js                   # Backend (Express + SQLite)
├── frontend.html               # Frontend-Oberfläche (HTML/JS)
├── frontend-server.js          # Frontend-Server
├── stats-service.js            # Stats-Service
├── notification-service.js     # Notification-Service
├── health-service.js           # Health-Service
├── walley.png                  # Foto von Walley
├── walley.db                   # SQLite-Datenbankdatei
├── package.json
├── package-lock.json
├── node_modules/
└── docs/
    ├── 01-werkzeuge.md
    ├── 02-frontend-verbindung.md
    ├── 03-verteilte-architektur.md
    ├── Screenshots/
    └── referenz-teil-b/
```

## Hinweis zur weiteren Dokumentation

Detaillierte Erläuterungen liegen im Ordner `docs/`:

- [`01-werkzeuge.md`](docs/01-werkzeuge.md) – verwendete Werkzeuge
  (Cursor, Claude Code) mit Installationsnachweis
- [`02-frontend-verbindung.md`](docs/02-frontend-verbindung.md) – wie
  Frontend und Backend verbunden wurden, welche Probleme dabei auftraten
  (u. a. mit dem ursprünglich geplanten Lovable-Code) und wie sie gelöst
  wurden
- [`03-verteilte-architektur.md`](docs/03-verteilte-architektur.md) – die
  fünf Module im Detail, mit Screenshots und Live-Tests
- [`docs/referenz-teil-b/`](docs/referenz-teil-b/) – der originale
  Lovable-Code aus Teil B, nur als Referenz, nicht Teil des lauffähigen
  Systems

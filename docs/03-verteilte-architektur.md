# Teil C – Walley's Pet Task Tracker: Die verteilte Architektur

**Amal Merei · Matrikel 107771 · Softwaretechnik (BHT MIB 20 S26)**

## Überblick

Teil C baut auf der Funktionalität von Teil B (Lovable, React) auf, ersetzt
die dortige rein lokale Speicherung (State/Browser) aber durch eine **echte,
verteilte Architektur** mit dauerhafter Datenspeicherung.

Die App besteht aus **fünf unabhängigen Programmen (Prozessen)**, die jeweils
einzeln gestartet werden müssen und über HTTP-Anfragen miteinander
kommunizieren:

```
┌─────────────────────┐
│  Frontend-Server     │  Port 5050 – liefert die HTML-Oberfläche aus
│  (frontend-server.js)│
└──────────┬───────────┘
           │ HTTP-Anfragen vom Browser aus
           ▼
┌─────────────────────┐        ┌──────────────────────┐
│  Backend             │◄───────│  Stats-Service         │  Port 4000
│  (index.js)          │        │  (stats-service.js)    │  berechnet Fortschritt
│  Port 3000            │        └──────────────────────┘
│  + SQLite-Datenbank   │
│  (walley.db)          │        ┌──────────────────────┐
│                        │◄───────│  Notification-Service │  Port 4100
│                        │        │  (notification-       │  prüft überfällige
│                        │        │   service.js)          │  Aufgaben
└─────────────────────┘        └──────────────────────┘
           ▲                              ▲
           │                              │
           └──────────────┬───────────────┘
                          │
                ┌──────────────────────┐
                │  Health-Service        │  Port 4200
                │  (health-service.js)   │  prüft, ob alle
                └──────────────────────┘  anderen Services laufen
```

**Warum das "verteilt" ist:** Jedes dieser fünf Programme läuft als eigener,
unabhängiger Prozess. Keines der Programme teilt sich Code oder Speicher mit
einem anderen – sie reden ausschließlich über **HTTP-Netzwerkanfragen**
miteinander, genau wie es in einer klassischen verteilten Systemarchitektur
der Fall ist. Wird eines der Programme beendet, laufen die anderen
unabhängig weiter.

---

## Die fünf Module im Detail

### 1. Backend (`index.js`) – Port 3000

Das zentrale Modul. Verwaltet die Aufgaben in einer SQLite-Datenbank
(`walley.db`) und stellt vier HTTP-Routen bereit:

| Route | Zweck |
|---|---|
| `GET /tasks` | alle Aufgaben abrufen |
| `POST /tasks` | neue Aufgabe anlegen |
| `PUT /tasks/:id` | Aufgabe abhaken/zurücksetzen |
| `DELETE /tasks/:id` | Aufgabe löschen |

Jede Aufgabe besitzt: `title`, `completed`, `dueTime`, `category`, `priority`.

**Start:** `node index.js`

Nachweis: Abfrage aller Aufgaben direkt über die Kommandozeile
(`curl http://localhost:3000/tasks`), die zeigt, dass der Server läuft und
echte Daten aus der Datenbank liefert.

![Backend Terminal](Screenshots/backend-terminal.png)

---

### 2. Frontend-Server (`frontend-server.js`) – Port 5050

Ein eigenständiger, zweiter Server-Prozess, der ausschließlich die
`frontend.html` (HTML/JavaScript-Oberfläche) an den Browser ausliefert. Dies
ist der entscheidende Unterschied zur ursprünglichen Umsetzung: Das Frontend
ist **kein** lokal geöffnetes Dokument mehr, sondern ein selbst laufendes
Programm, das unabhängig vom Backend gestartet werden muss.

Die HTML-Seite selbst enthält JavaScript, das per `fetch()` HTTP-Anfragen an
Backend, Stats-Service und Notification-Service schickt.

**Start:** `node frontend-server.js`

![Frontend-Server Terminal](Screenshots/frontend-server-terminal.png)

Die App selbst im Browser, erreichbar unter `http://localhost:5050`:

![App im Browser](Screenshots/app-im-browser.png)

---

### 3. Stats-Service (`stats-service.js`) – Port 4000

Ein separater Prozess, der **selbst** eine HTTP-Anfrage an das Backend
schickt (`GET http://localhost:3000/tasks`), die Anzahl erledigter Aufgaben
berechnet, und nur das fertige Ergebnis zurückgibt.

Damit übernimmt das Frontend die Fortschrittsberechnung nicht mehr selbst,
sondern bezieht sie von einem dritten, unabhängigen Dienst.

**Start:** `node stats-service.js`

Nachweis über `curl http://localhost:4000/stats`:

![Stats-Service Terminal](Screenshots/stats-service-terminal.png)

---

### 4. Notification-Service (`notification-service.js`) – Port 4100

Prüft ebenfalls über eine eigene Anfrage an das Backend, welche Aufgaben
bereits überfällig sind (Uhrzeit ist vorbei, aber `completed` ist `false`).
Das Ergebnis wird im Frontend als rote Warnung angezeigt.

**Start:** `node notification-service.js`

Nachweis über `curl http://localhost:4100/overdue`:

![Notification-Service Terminal](Screenshots/notification-service-terminal.png)

---

### 5. Health-Service (`health-service.js`) – Port 4200

Fragt bei allen anderen Services (Backend, Stats, Notification) an, ob sie
erreichbar sind, und gibt eine Übersicht zurück. Dies entspricht dem in der
Praxis üblichen Monitoring/Health-Checking verteilter Systeme.

**Start:** `node health-service.js`

Nachweis über `curl http://localhost:4200/health` – zeigt, dass alle drei
überwachten Services gleichzeitig online sind:

![Health-Service Terminal](Screenshots/health-service-terminal.png)

---

## Live-Test: Zusammenspiel der Services beim Abhaken

Um zu zeigen, dass Frontend, Backend, Stats-Service und Notification-Service
nicht nur einzeln laufen, sondern auch live zusammenarbeiten, wurde eine
überfällige Aufgabe in der App abgehakt.

**Vorher:** Aufgabe "Evening medication" ist noch nicht erledigt.

![Vor dem Abhaken](Screenshots/persistenz-vorher.png)

**Nachher:** Nach dem Anklicken der Checkbox ist die Aufgabe durchgestrichen,
der Fortschritt hat sich erhöht (Wert vom Stats-Service), und die Anzahl
überfälliger Aufgaben in der roten Warnung ist gesunken (Wert vom
Notification-Service).

![Nach dem Abhaken](Screenshots/persistenz-nachher.png)

Das zeigt: Eine einzelne Nutzeraktion im Frontend löst automatisch neue
Anfragen an **drei unterschiedliche, unabhängige Backend-Prozesse** aus
(Backend selbst, Stats-Service, Notification-Service), deren Antworten
sofort in der Oberfläche aktualisiert werden.

---

## Test der Persistenz (dauerhafte Speicherung)

Anders als bei Teil B (Lovable), wo alle Änderungen beim Neuladen der Seite
verloren gingen, bleiben die Daten in Teil C dauerhaft erhalten, da sie in
der SQLite-Datenbank gespeichert werden.

Eine neue Aufgabe "Brush teeth" wurde mit Uhrzeit 20:00, Kategorie "Health"
und Priorität "High" angelegt.

![Neue Aufgabe hinzugefügt](Screenshots/neue-aufgabe-hinzugefuegt.png)

Anschließend wurde die Seite manuell neu geladen (Cmd+R im Browser). Sowohl
die neu angelegte Aufgabe "Brush teeth" als auch die zuvor abgehakte
Aufgabe sind weiterhin unverändert vorhanden:

![Zustand nach dem Neuladen](Screenshots/nach-neuladen.png)

Dies belegt, dass die Änderungen tatsächlich in der Datenbank gespeichert
wurden und nicht nur im flüchtigen Speicher des Browsers lagen.

---

## Zusammenfassung: Fünf unabhängige, gleichzeitig laufende Prozesse

Die Screenshots oben belegen zusammen, dass alle fünf Module gleichzeitig
und unabhängig voneinander liefen:

- Backend antwortet auf Port 3000 mit echten Datenbankeinträgen
- Frontend-Server liefert die Oberfläche auf Port 5050 aus
- Stats-Service berechnet auf Port 4000 den Fortschritt, indem er selbst
  beim Backend nachfragt
- Notification-Service berechnet auf Port 4100 überfällige Aufgaben,
  ebenfalls durch eigene Anfrage beim Backend
- Health-Service prüft auf Port 4200 den Online-Status aller anderen Dienste

Jeder dieser Prozesse musste einzeln mit einem eigenen `node ...`-Befehl
gestartet werden – es handelt sich um fünf getrennte Programme, nicht um
ein einzelnes Frontend-Backend-Bundle.

---

## Werkzeuge

Details zu den verwendeten Werkzeugen (Cursor, Claude Code) und zur
Arbeitsweise über das Terminal: siehe [`01-werkzeuge.md`](01-werkzeuge.md).

## Bezug zu Teil B

Die App-Idee und die Kernfunktionalität (Aufgaben mit Titel, Uhrzeit,
Kategorie, Priorität; anlegen, abhaken, löschen) stammen aus Teil B
(Lovable/React). Da sich der originale Lovable-Code aus technischen Gründen
nicht direkt exportieren und weiterverwenden ließ, wurde das Frontend für
Teil C mit einfachem HTML/JavaScript neu umgesetzt – inhaltlich identisch,
aber jetzt über HTTP mit dem eigenen Backend verbunden statt nur im
Browser-Speicher zu arbeiten. Der originale Lovable-Code liegt zur Referenz
in `docs/referenz-teil-b/` (siehe dort).

---

## Was genau zwischen den Ports übertragen wird

Um die Kommunikation zwischen den Prozessen konkret sichtbar zu machen,
hier die tatsächlichen Anfragen und Antworten zwischen den Ports, jeweils
live per curl getestet:

### Frontend-Server (5050) → Backend (3000)

Das Frontend (ausgeliefert von Port 5050) schickt eine HTTP-GET-Anfrage
an Port 3000:
Port 3000 antwortet mit der kompletten Aufgabenliste als JSON-Text:

![Port 3000 – alle Aufgaben](Screenshots/port-3000-tasks.png)

Das Frontend empfängt diesen Text und baut daraus die sichtbare
Aufgabenliste im Browser auf.

### Stats-Service (4000) → Backend (3000)

Der Stats-Service schickt selbst eine Anfrage an Port 3000 (dieselbe
Route wie oben, GET /tasks), erhält dieselbe JSON-Liste zurück, zählt
darin die Aufgaben mit completed: true, und gibt nur das verdichtete
Ergebnis zurück:

![Port 4000 – Fortschritt](Screenshots/port-4000-stats.png)

Port 4000 sendet also nicht die komplette Liste weiter, sondern nur eine
berechnete Zusammenfassung – der Stats-Service verarbeitet die Daten, die
er von Port 3000 bekommt, bevor er sie weitergibt.

### Notification-Service (4100) → Backend (3000)

Genauso fragt der Notification-Service bei Port 3000 die komplette
Aufgabenliste ab, vergleicht das Feld dueTime jeder Aufgabe mit der
aktuellen Uhrzeit, und gibt nur die überfälligen Aufgaben zurück:

![Port 4100 – überfällige Aufgaben](Screenshots/port-4100-overdue.png)

### Health-Service (4200) → Backend (3000), Stats-Service (4000), Notification-Service (4100)

Der Health-Service schickt an alle drei anderen Ports jeweils eine
einfache Anfrage und prüft nur, ob eine Antwort zurückkommt. Das Ergebnis
fasst den Online-Status aller drei zusammen:

![Port 4200 – Online-Status aller Services](Screenshots/port-4200-health.png)

### Zusammengefasst

| Von Port | An Port | Was wird geschickt | Was kommt zurück |
|---|---|---|---|
| 5050 (Frontend) | 3000 (Backend) | GET/POST/PUT/DELETE-Anfragen | komplette Aufgabenliste bzw. einzelne Aufgabe als JSON |
| 4000 (Stats) | 3000 (Backend) | GET-Anfrage für alle Aufgaben | komplette Aufgabenliste als JSON |
| 4100 (Notification) | 3000 (Backend) | GET-Anfrage für alle Aufgaben | komplette Aufgabenliste als JSON |
| 4200 (Health) | 3000, 4000, 4100 | einfache GET-Anfragen | jeweils eine Antwort oder Zeitüberschreitung |

Jeder Pfeil in dieser Tabelle ist eine eigenständige Netzwerkanfrage
zwischen zwei unabhängigen Prozessen – keine dieser Kommunikationen
passiert innerhalb eines einzelnen Programms, sondern immer über HTTP
zwischen getrennt laufenden Servern. Die Screenshots oben zeigen jeweils
den curl-Befehl und die tatsächliche, live erhaltene Antwort.

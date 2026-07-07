# Teil C – Werkzeuge und Installation

Amal Merei · Matrikel 107771 · Softwaretechnik (BHT MIB 20 S26)

## Verwendete Werkzeuge

### Hauptwerkzeug: Cursor

Cursor ist ein VS-Code-Klon mit eingebauter KI-Unterstützung.

Installation: Cursor wurde bereits vor Beginn von Teil C installiert
(heruntergeladen von cursor.com).

![Cursor Installer](Screenshots/cursor-installer.png)
![Terminal zeigt Cursor.app installiert](Screenshots/cursor-app-installiert.png)

Cursor wurde genutzt, um den Projektordner walley-teil-c anzulegen und die
erste Version von index.js (Backend) zu erstellen:

![Cursor mit walley-teil-c](Screenshots/cursor-mit-projekt.png)

Alle node- und npm-Befehle (Server starten, Pakete installieren) sowie
spätere Änderungen am bestehenden Code wurden über das separate
macOS-Terminal ausgeführt, nicht über die grafische Cursor-Oberfläche. Der
Grund: Die Bearbeitung direkt in Cursor führte wiederholt zu
Verwechslungen (z. B. versehentlich falsche Datei geöffnet, Verwechslung
mit dem separaten "Cursor Agents"-Fenster für KI-Chats). Das Arbeiten
direkt im Terminal mit gezielten Befehlen (z. B. sed für einzelne
Textänderungen) erwies sich als zuverlässiger.

### Zweites Werkzeug: Claude Code

Claude Code ist ein CLI-Werkzeug (Kommandozeilen-Programm) von Anthropic,
das KI-gestützte Code-Bearbeitung direkt im Terminal ermöglicht. Es wurde
zusätzlich installiert und benutzt, als Nachweis für das zweite geforderte
Tool.

![Claude Code Installation erfolgreich](Screenshots/claude-code-installation.png)

Claude Code wurde direkt im Projektordner walley-teil-c gestartet:

![Claude Code Sicherheitsabfrage im Projektordner](Screenshots/claude-code-sicherheitsabfrage.png)

Als erster Test wurde Claude Code gebeten, eine Datei zu erstellen und
wieder auszulesen:

![Claude Code erstellt und liest test.txt](Screenshots/claude-code-test-txt.png)

Anschließend wurde Claude Code auch für echte Projektarbeit genutzt, zum
Beispiel zum Erstellen der package.json:

![Claude Code erstellt package.json](Screenshots/claude-code-package-json.png)

## Fazit

Cursor diente als Ausgangspunkt für die Entwicklung von Teil C – zum
Anlegen des Projekts und zur ersten Erstellung des Backends. Der Großteil
der eigentlichen Entwicklungsarbeit (Server starten, Pakete installieren,
spätere Code-Änderungen) erfolgte danach über das macOS-Terminal, da die
Bearbeitung direkt in der Cursor-Oberfläche wiederholt zu Verwechslungen
führte. Claude Code wurde parallel installiert und sowohl an einem
einfachen Testfall (test.txt) als auch an echter Projektarbeit
(package.json) erprobt.

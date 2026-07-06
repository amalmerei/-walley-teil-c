const express = require('express');
const Database = require('better-sqlite3');

const app = express();
const PORT = 3000;

const db = new Database('walley.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0
  )
`);

// Neue Spalten für Uhrzeit und Kategorie ergänzen (falls sie noch nicht existieren)
try { db.exec("ALTER TABLE tasks ADD COLUMN dueTime TEXT DEFAULT '12:00'"); } catch (e) {}
try { db.exec("ALTER TABLE tasks ADD COLUMN category TEXT DEFAULT 'walk'"); } catch (e) {}
try { db.exec("ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'medium'"); } catch (e) {}

function rowToTask(row) {
  return {
    id: row.id,
    title: row.title,
    completed: Boolean(row.completed),
    dueTime: row.dueTime || '12:00',
    category: row.category || 'walk',
    priority: row.priority || 'medium',
  };
}

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get('/', (req, res) => {
  res.send('Hallo Walley');
});

app.get('/tasks', (req, res) => {
  const rows = db.prepare('SELECT * FROM tasks').all();
  res.json(rows.map(rowToTask));
});

app.post('/tasks', (req, res) => {
  const { title, dueTime, category, priority } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Titel ist erforderlich' });
  }

  const result = db
    .prepare('INSERT INTO tasks (title, completed, dueTime, category, priority) VALUES (?, 0, ?, ?, ?)')
    .run(title.trim(), dueTime || '12:00', category || 'walk', priority || 'medium');

  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(rowToTask(row));
});

app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const result = db
    .prepare('UPDATE tasks SET completed = NOT completed WHERE id = ?')
    .run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Aufgabe nicht gefunden' });
  }

  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.json(rowToTask(row));
});

app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Aufgabe nicht gefunden' });
  }

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});

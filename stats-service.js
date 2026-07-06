const express = require('express');

const app = express();
const PORT = 4000;
const BACKEND_URL = 'http://localhost:3000';

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get('/stats', async (req, res) => {
  try {
    const response = await fetch(`${BACKEND_URL}/tasks`);
    const tasks = await response.json();
    const done = tasks.filter((t) => t.completed).length;
    const total = tasks.length;
    res.json({ done, total, text: `${done} von ${total} erledigt` });
  } catch (err) {
    res.status(500).json({ error: 'Backend nicht erreichbar' });
  }
});

app.listen(PORT, () => {
  console.log(`Stats-Service läuft auf http://localhost:${PORT}`);
});

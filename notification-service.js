const express = require('express');

const app = express();
const PORT = 4100;
const BACKEND_URL = 'http://localhost:3000';

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get('/overdue', async (req, res) => {
  try {
    const response = await fetch(`${BACKEND_URL}/tasks`);
    const tasks = await response.json();

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const overdue = tasks.filter((t) => !t.completed && t.dueTime < currentTime);

    res.json({
      count: overdue.length,
      tasks: overdue.map((t) => t.title),
    });
  } catch (err) {
    res.status(500).json({ error: 'Backend nicht erreichbar' });
  }
});

app.listen(PORT, () => {
  console.log(`Notification-Service läuft auf http://localhost:${PORT}`);
});

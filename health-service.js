const express = require('express');

const app = express();
const PORT = 4200;

const SERVICES = {
  backend: 'http://localhost:3000',
  stats: 'http://localhost:4000/stats',
  notification: 'http://localhost:4100/overdue',
};

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get('/health', async (req, res) => {
  const results = {};

  for (const [name, url] of Object.entries(SERVICES)) {
    try {
      const response = await fetch(url);
      results[name] = response.ok ? 'online' : 'error';
    } catch (err) {
      results[name] = 'offline';
    }
  }

  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Health-Service läuft auf http://localhost:${PORT}`);
});

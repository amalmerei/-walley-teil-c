const express = require('express');
const path = require('path');

const app = express();
const PORT = 5050;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend-Server läuft auf http://localhost:${PORT}`);
});

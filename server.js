const express = require('express');
const conectarDB = require('./db');

const app = express();

// conectar ao banco
conectarDB();

app.get('/', (req, res) => {
  res.send('Servidor rodando com MongoDB 🚀');
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
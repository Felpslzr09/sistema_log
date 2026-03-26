const mongoose = require('mongoose');

const uri = "mongodb+srv://felipelzr08_db_user:db_HZe7sin1C1s0RxxU@cluster0.izebelh.mongodb.net/test";

async function conectarDB() {
  try {
    await mongoose.connect(uri);
    console.log("🔥 MongoDB conectado!");
  } catch (erro) {
    console.log("❌ Erro:", erro);
  }
}

module.exports = conectarDB;
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
app.use(express.json());

// Conexão com o MongoDB
mongoose;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define a porta a partir da variável de ambiente ou 5000 como padrão
const PORT = process.env.PORTA || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

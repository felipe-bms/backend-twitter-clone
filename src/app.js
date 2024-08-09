const express = require("express");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const Joi = require("joi");

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
app.use(express.json());

let db;
let usersCollection;
let tweetsCollection;

const connectDB = async () => {
  try {
    const client = new MongoClient(process.env.DATABASE_URL);

    await client.connect();
    console.log("Connected successfully to MongoDB");

    db = client.db(); // Usa o nome do banco de dados da connection string

    // Inicializa as coleções
    usersCollection = db.collection("users");
    tweetsCollection = db.collection("tweets");

    console.log("Collections initialized: users, tweets");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Encerra o processo se a conexão falhar
  }
};

// Schemas de validação com Joi

const userSchema = Joi.object({
  username: Joi.string().required(),
  avatar: Joi.string().uri().required(), // Certifica que o avatar seja uma URL válida
});

const tweetSchema = Joi.object({
  username: Joi.string().required(),
  tweet: Joi.string().required(),
});

// Rota POST /sign-up para cadastrar (logar) um usuário
app.post("/sign-up", async (req, res) => {
  try {
    const { error } = userSchema.validate(req.body);

    if (error) {
      return res.status(422).send(error.details[0].message);
    }

    const { username, avatar } = req.body;

    // Verifica se o nome de usuário já existe
    const existingUser = await usersCollection.findOne({ username });

    if (existingUser) {
      return res.status(409).send("Username already exists");
    }

    // Insere o novo usuário na coleção
    await usersCollection.insertOne({ username, avatar });

    res.status(201).send("User logged in successfully");
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

// Rota POST /tweets para criar um tweet
app.post("/tweets", async (req, res) => {
  try {
    const { error } = tweetSchema.validate(req.body);

    if (error) {
      return res.status(422).send(error.details[0].message);
    }

    const { username, tweet } = req.body;

    // Verifica se o usuário existe pelo username
    const existingUser = await usersCollection.findOne({ username });

    if (!existingUser) {
      return res
        .status(401)
        .send("Este usuário não está cadastrado! Ação não autorizada.");
    }

    // Insere o novo tweet na coleção
    await tweetsCollection.insertOne({ username, tweet });

    res.status(201).send("Tweet criado com sucesso");
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

// Rota GET /tweets para obter todos os tweets com avatar
app.get("/tweets", async (req, res) => {
  try {
    // Pega todos os tweets da coleção
    const tweets = await tweetsCollection.find().toArray();

    // Adiciona o avatar de cada usuário no tweet correspondente
    const tweetsWithAvatar = tweets.map(async (tweet) => {
      const user = await usersCollection.findOne({ username: tweet.username });
      return {
        _id: tweet._id,
        username: tweet.username,
        tweet: tweet.tweet,
        avatar: user?.avatar || null, // Adiciona o avatar ou null se não encontrado
      };
    });

    // Resolve todas as promessas
    const resolvedTweets = await Promise.all(tweetsWithAvatar);

    // Retorna os tweets em ordem decrescente (do mais recente ao mais antigo)
    res.status(200).json(resolvedTweets.reverse());
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("Failed to connect to database", err));

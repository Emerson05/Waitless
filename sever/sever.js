const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Configuração do banco de dados
const MONGODB_URI = 'mongodb://127.0.0.1/waitless'; // URL do MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro de conexão com o MongoDB:'));
db.once('open', () => {
  console.log('Conectado ao banco de dados MongoDB');
});

// Definição do modelo de dados
const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
});
const User = mongoose.model('User', userSchema);

// Middleware
app.use(express.json());
app.use(cors());

// Rota para autenticar o login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verifica se o usuário existe no banco de dados
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found'  });
    }

    // Verifica se a senha está correta
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid password'  });
    }

    return res.status(200).json({ message: 'Login successful',validacao: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

// Rota para salvar o cadastro
app.post('/cadastro', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Verifica se o email já está cadastrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists', validacao: true });
    }

    // Cria um novo usuário
    const newUser = new User({ fullName, email, password });
    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

// Inicia o servidor
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});

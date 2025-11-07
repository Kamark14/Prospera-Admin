require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do Pool de Conexões MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Teste de Conexão
pool.getConnection()
    .then(connection => {
        console.log('Conexão com o banco de dados MySQL estabelecida com sucesso!');
        connection.release();
    })
    .catch(err => {
        console.error('Erro ao conectar ao banco de dados MySQL:', err.message);
        console.error('Verifique se o servidor MySQL está rodando e as credenciais em .env estão corretas.');
    });

// Rota de Teste
app.get('/', (req, res) => {
    res.send('Backend Prospera Admin está rodando!');
});

// Importar e usar as rotas
const userRoutes = require('./routes/userRoutes')(pool);
const adminRoutes = require('./routes/adminRoutes')(pool);
const goalRoutes = require('./routes/goalRoutes')(pool);
const authRoutes = require('./routes/authRoutes')(pool);

app.use(authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/goals', goalRoutes);

// Iniciar o servidor
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});


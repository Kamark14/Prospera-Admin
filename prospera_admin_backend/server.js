require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Servir frontend estático para evitar problemas de CORS ao abrir via file://
app.use(express.static(path.join(__dirname, '..', 'prospera_admin_frontend', 'admin_frontend', 'admin')));

// Configuração do Pool de Conexões MySQL (Promise Pool)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// Teste de Conexão
pool.getConnection()
  .then(conn => {
    console.log('Conectado ao banco MySQL');
    conn.release();
    // monta rotas aqui
    const userRoutes = require('./routes/userRoutes')(pool);
    app.use('/api/users', userRoutes);
    const adminRoutes = require('./routes/adminRoutes')(pool);
    const goalRoutes = require('./routes/goalRoutes')(pool);
    const authRoutes = require('./routes/authRoutes')(pool);
    const reportRoutes = require('./routes/reportRoutes')(pool);
    app.use('/api/reports', reportRoutes);
  })
  .catch(err => {
    console.error('Erro ao conectar com DB:', err);
    process.exit(1);
  });

// Garantir coluna de registro de usuário existe (ajusta schema se necessário)
async function ensureSchemaAndStart() {
    try {
        // Teste de conexão
        const connection = await pool.getConnection();
        console.log('Conexão com o banco de dados MySQL estabelecida com sucesso!');
        connection.release();

        // Verifica/Cria coluna Usuario_Registro antes de expor as rotas
        const dbName = process.env.DB_DATABASE;
        const [cols] = await pool.query(
            'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
            [dbName, 'usuario', 'Usuario_Registro']
        );

        if (!cols || cols.length === 0) {
            console.log('Coluna `Usuario_Registro` não encontrada em `usuario`. Tentando criar coluna...');
            try {
                await pool.query("ALTER TABLE usuario ADD COLUMN Usuario_Registro DATETIME DEFAULT CURRENT_TIMESTAMP");
                console.log('Coluna `Usuario_Registro` criada com sucesso.');
            } catch (alterErr) {
                console.error('Falha ao criar coluna `Usuario_Registro`:', alterErr.message);
                console.error('Crie manualmente no banco caso falta de permissão: ALTER TABLE usuario ADD COLUMN Usuario_Registro DATETIME DEFAULT CURRENT_TIMESTAMP');
            }
        }

        // Importar e usar as rotas APÓS garantir o schema
        const userRoutes = require('./routes/userRoutes')(pool);
        const adminRoutes = require('./routes/adminRoutes')(pool);
        const goalRoutes = require('./routes/goalRoutes')(pool);
        const authRoutes = require('./routes/authRoutes')(pool);
        const reportRoutes = require('./routes/reportRoutes')(pool);

        app.use(authRoutes);
        app.use('/api/users', userRoutes);
        app.use('/api/admins', adminRoutes);
        app.use('/api/goals', goalRoutes);
        app.use('/api/reports', reportRoutes);

        // Iniciar o servidor só depois de tudo
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });

    } catch (err) {
        console.error('Erro durante inicialização:', err);
    }
}

ensureSchemaAndStart();

// Servir a página principal do painel (frontend)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'prospera_admin_frontend', 'admin_frontend', 'admin', 'admin.html'));
});


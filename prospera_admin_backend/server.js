require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
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
    .then(connection => {
        console.log('Conexão com o banco de dados MySQL estabelecida com sucesso!');
        connection.release();
    })
    .catch(err => {
        console.error('Erro ao conectar ao banco de dados MySQL:', err.message);
        console.error('Verifique se o servidor MySQL está rodando e as credenciais em .env estão corretas.');
    });

// Garantir coluna de registro de usuário existe (ajusta schema se necessário)
(async () => {
    try {
        const dbName = process.env.DB_DATABASE;
        // Verifica se a coluna Usuario_Registro existe
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
                console.error('Se o usuário do DB não tiver permissão ALTER TABLE, crie a coluna manualmente:');
                console.error("ALTER TABLE usuario ADD COLUMN Usuario_Registro DATETIME DEFAULT CURRENT_TIMESTAMP");
            }
        }
    } catch (err) {
        console.error('Erro ao verificar/criar coluna Usuario_Registro:', err.stack || err);
    }
})();

// Servir a página principal do painel (frontend)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'prospera_admin_frontend', 'admin_frontend', 'admin', 'admin.html'));
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
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});


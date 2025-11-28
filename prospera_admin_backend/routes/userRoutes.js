const express = require('express');
module.exports = (pool) => {
    const router = express.Router();

    async function hasColumn(table, column) {
        const db = process.env.DB_DATABASE;
        const [r] = await pool.query(
            "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND COLUMN_NAME=?",
            [db, table, column]
        );
        return r[0].cnt > 0;
    }

    // Endpoint de contagem e estatísticas rápidas
    router.get('/count', async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT COUNT(*) AS total FROM usuario');
            res.json({ total: rows[0].total });
        } catch (err) {
            console.error('Erro ao buscar contagem de usuários:', err);
            res.status(500).json({ message: 'Falha ao buscar contagem de usuários', error: err.message });
        }
    });

    // Endpoint para usuários recentes (últimos 10)
    router.get('/recent', async (req, res) => {
        try {
            const hasRegistro = await hasColumn('usuario', 'Usuario_Registro');
            const orderBy = hasRegistro ? 'Usuario_Registro' : 'Usuario_Id';
            const [rows] = await pool.query(
                `SELECT Usuario_Id, Usuario_Nome, Usuario_Email, ${orderBy} AS Usuario_Registro FROM usuario ORDER BY ${orderBy} DESC LIMIT 10`
            );
            res.json(rows);
        } catch (err) {
            console.error('Erro ao buscar usuários recentes:', err);
            res.status(500).json({ message: 'Falha ao buscar usuários recentes', error: err.message });
        }
    });

    // Rota para obter todos os usuários (READ)
    router.get('/', async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT Usuario_Id, Usuario_Nome, Usuario_Email FROM usuario ORDER BY Usuario_Id DESC');
            res.json(rows);
        } catch (err) {
            console.error('Erro ao buscar lista de usuários:', err);
            res.status(500).json({ message: 'Falha ao buscar usuários', error: err.message });
        }
    });

    return router;
};


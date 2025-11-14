const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    // Endpoint de contagem e estatísticas rápidas
    router.get('/count', async (req, res) => {
        try {
            const [rowsTotal] = await pool.query('SELECT COUNT(*) as total FROM usuario');
            const [rowsNew] = await pool.query("SELECT COUNT(*) as new7days FROM usuario WHERE Usuario_Registro >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
            const totalRow = rowsTotal[0] || { total: 0 };
            const newRow = rowsNew[0] || { new7days: 0 };
            res.json({ total: totalRow.total, new7days: newRow.new7days });
        } catch (err) {
            console.error('Erro ao buscar contagem de usuários:', err.stack || err);
            res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
        }
    });

    // Endpoint para usuários recentes (últimos 10)
    router.get('/recent', async (req, res) => {
        try {
            const [rows] = await pool.query(`
                SELECT Usuario_Id, Usuario_Nome, Usuario_Email, DATE_FORMAT(Usuario_Registro, '%Y-%m-%d %H:%i:%s') as Usuario_Registro
                FROM usuario
                ORDER BY Usuario_Registro DESC
                LIMIT 10
            `);
            res.json(rows);
        } catch (err) {
            console.error('Erro ao buscar usuários recentes:', err);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });

    // Rota para obter todos os usuários (READ)
    router.get('/', async (req, res) => {
        try {
            const [rows] = await pool.query(`
                SELECT 
                    Usuario_Id, 
                    Usuario_Nome, 
                    Usuario_Email,
                    DATE_FORMAT(Usuario_Registro, '%Y-%m-%d %H:%i:%s') as Usuario_Registro
                FROM usuario
                ORDER BY Usuario_Id DESC
            `);
            res.json(rows);
        } catch (err) {
            console.error('Erro ao buscar usuários:', err);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });

    // Rota para obter um usuário por ID (READ)
    router.get('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await pool.query('SELECT Usuario_Id, Usuario_Nome, Usuario_Email FROM usuario WHERE Usuario_Id = ?', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }
            res.json(rows[0]);
        } catch (err) {
            console.error('Erro ao buscar usuário:', err);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });

    // Rota para criar um novo usuário (CREATE)
    router.post('/', async (req, res) => {
        const { Usuario_Nome, Usuario_CPF, Usuario_Email, Usuario_Senha } = req.body;
        if (!Usuario_Nome || !Usuario_CPF || !Usuario_Email || !Usuario_Senha) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        }
        try {
            // Nota: Em um ambiente de produção, a senha deve ser hasheada antes de ser salva.
            const [result] = await pool.query(
                'INSERT INTO usuario (Usuario_Nome, Usuario_CPF, Usuario_Email, Usuario_Senha) VALUES (?, ?, ?, ?)',
                [Usuario_Nome, Usuario_CPF, Usuario_Email, Usuario_Senha]
            );
            res.status(201).json({ Usuario_Id: result.insertId, Usuario_Nome, Usuario_Email, message: 'Usuário criado com sucesso' });
        } catch (err) {
            console.error('Erro ao criar usuário:', err);
            // Erro de duplicidade (e-mail ou CPF)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Nome de usuário, CPF ou E-mail já cadastrado.' });
            }
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });

    // Rota para atualizar um usuário (UPDATE)
    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const { Usuario_Nome, Usuario_Email } = req.body; // Apenas nome e email para simplificar o PUT
        if (!Usuario_Nome || !Usuario_Email) {
            return res.status(400).json({ message: 'Nome e Email são obrigatórios' });
        }
        try {
            const [result] = await pool.query(
                'UPDATE usuario SET Usuario_Nome = ?, Usuario_Email = ? WHERE Usuario_Id = ?',
                [Usuario_Nome, Usuario_Email, id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }
            res.json({ message: 'Usuário atualizado com sucesso' });
        } catch (err) {
            console.error('Erro ao atualizar usuário:', err);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });

    // Rota para deletar um usuário (DELETE)
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            // Nota: É necessário deletar registros relacionados em outras tabelas (FKs) antes de deletar o usuário.
            // Para simplificar, vamos apenas deletar o usuário principal por enquanto.
            const [result] = await pool.query('DELETE FROM usuario WHERE Usuario_Id = ?', [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }
            res.json({ message: 'Usuário deletado com sucesso' });
        } catch (err) {
            console.error('Erro ao deletar usuário:', err);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });

    return router;
};


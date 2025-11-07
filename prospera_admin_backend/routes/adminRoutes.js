const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    // Rota para obter todos os administradores (READ)
    router.get('/', async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT Admin_Id, Admin_Nome, Admin_Email FROM admin_perfil');
            res.json(rows);
        } catch (err) {
            console.error('Erro ao buscar administradores:', err);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });

    // Rota para obter um administrador por ID (READ)
    router.get('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await pool.query('SELECT Admin_Id, Admin_Nome, Admin_Email FROM admin_perfil WHERE Admin_Id = ?', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Administrador não encontrado' });
            }
            res.json(rows[0]);
        } catch (err) {
            console.error('Erro ao buscar administrador:', err);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });

    // Rota para criar um novo administrador (CREATE)
    router.post('/', async (req, res) => {
        const { Admin_Nome, Admin_Email, Admin_Senha } = req.body;
        if (!Admin_Nome || !Admin_Email || !Admin_Senha) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        }
        try {
            // Nota: Em um ambiente de produção, a senha deve ser hasheada antes de ser salva.
            const [result] = await pool.query(
                'INSERT INTO admin_perfil (Admin_Nome, Admin_Email, Admin_Senha) VALUES (?, ?, ?)',
                [Admin_Nome, Admin_Email, Admin_Senha]
            );
            res.status(201).json({ Admin_Id: result.insertId, Admin_Nome, Admin_Email, message: 'Administrador criado com sucesso' });
        } catch (err) {
            console.error('Erro ao criar administrador:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'E-mail de administrador já cadastrado.' });
            }
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });

    // Rota para atualizar um administrador (UPDATE)
    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const { Admin_Nome, Admin_Email } = req.body;
        if (!Admin_Nome || !Admin_Email) {
            return res.status(400).json({ message: 'Nome e Email são obrigatórios' });
        }
        try {
            const [result] = await pool.query(
                'UPDATE admin_perfil SET Admin_Nome = ?, Admin_Email = ? WHERE Admin_Id = ?',
                [Admin_Nome, Admin_Email, id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Administrador não encontrado' });
            }
            res.json({ message: 'Administrador atualizado com sucesso' });
        } catch (err) {
            console.error('Erro ao atualizar administrador:', err);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });

    // Rota para deletar um administrador (DELETE)
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const [result] = await pool.query('DELETE FROM admin_perfil WHERE Admin_Id = ?', [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Administrador não encontrado' });
            }
            res.json({ message: 'Administrador deletado com sucesso' });
        } catch (err) {
            console.error('Erro ao deletar administrador:', err);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });

    return router;
};


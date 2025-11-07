const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // Rota de Login (simples)
  router.post('/api/admins/login', async (req, res) => {
    const { username, password } = req.body; // username é o Admin_Email

    if (!username || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    try {
      // Busca o administrador pelo email
      const [rows] = await pool.query(
        'SELECT Admin_Id, Admin_Nome, Admin_Email, Admin_Senha FROM admin_perfil WHERE Admin_Email = ? LIMIT 1',
        [username]
      );

      const admin = rows[0];
      if (admin && admin.Admin_Senha === password) {
        // Remove a senha antes de retornar
        delete admin.Admin_Senha;
        return res.json({
          Admin_Id: admin.Admin_Id,
          Admin_Nome: admin.Admin_Nome,
          Admin_Email: admin.Admin_Email,
          message: 'Login bem-sucedido'
        });
      } else {
        res.status(401).json({ message: 'Credenciais inválidas' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
    }
  });

  return router;
};


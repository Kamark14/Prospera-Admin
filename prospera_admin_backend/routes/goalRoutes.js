const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    // Endpoint de contagem/estatísticas de metas
    router.get('/count', async (req, res) => {
        try {
            const [[totalRow]] = await pool.query('SELECT COUNT(*) as total FROM meta_financeira');
            const [[completedRow]] = await pool.query("SELECT COUNT(*) as completed FROM meta_financeira WHERE LOWER(Status_Meta) LIKE '%conclu%'");
            const [[newRow]] = await pool.query("SELECT COUNT(*) as new7days FROM meta_financeira_detalhes WHERE DataCriacao_Meta >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
            res.json({ total: totalRow.total, completed: completedRow.completed, new7days: newRow.new7days });
        } catch (err) {
            console.error('Erro ao buscar contagem de metas:', err);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });

    // Rota para obter todas as metas (READ) - agora com info do usuário
    router.get('/', async (req, res) => {
        try {
            const query = `
                SELECT 
                    mf.id, 
                    mf.Nome_Meta, 
                    mf.Descricao_Meta, 
                    mf.Tipo_Meta, 
                    mf.Prioridade_Meta, 
                    mf.Status_Meta,
                    mfd.ValorAlvo_Meta,
                    mfd.ValorAtual_Meta,
                    DATE_FORMAT(mfd.DataFim_Meta, '%Y-%m-%d %H:%i:%s') as DataFim_Meta,
                    u.Usuario_Id,
                    u.Usuario_Nome,
                    u.Usuario_Email
                FROM meta_financeira mf
                JOIN meta_financeira_detalhes mfd ON mf.id = mfd.Meta_Id
                LEFT JOIN usuario u ON mf.Usuario_Id = u.Usuario_Id
                ORDER BY mfd.DataCriacao_Meta DESC
            `;
            const [rows] = await pool.query(query);
            res.json(rows);
        } catch (err) {
            console.error('Erro ao buscar metas:', err);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });

    // Rota para obter uma meta por ID (READ) - inclui info do usuário
    router.get('/:id', async (req, res) => {
        const { id } = req.params;
        try {
            const query = `
                SELECT 
                    mf.id, 
                    mf.Nome_Meta, 
                    mf.Descricao_Meta, 
                    mf.Tipo_Meta, 
                    mf.Prioridade_Meta, 
                    mf.Status_Meta,
                    mfd.DataInicio_Meta,
                    mfd.DataFim_Meta,
                    mfd.ValorAtual_Meta,
                    mfd.ValorAlvo_Meta,
                    mfd.DataCriacao_Meta,
                    mfd.DataAtualizacao_Meta,
                    mfd.DataTermino_Meta,
                    u.Usuario_Id,
                    u.Usuario_Nome,
                    u.Usuario_Email
                FROM meta_financeira mf
                JOIN meta_financeira_detalhes mfd ON mf.id = mfd.Meta_Id
                LEFT JOIN usuario u ON mf.Usuario_Id = u.Usuario_Id
                WHERE mf.id = ?
            `;
            const [rows] = await pool.query(query, [id]);
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Meta não encontrada' });
            }
            res.json(rows[0]);
        } catch (err) {
            console.error('Erro ao buscar meta:', err);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });

    // Rota para criar uma nova meta (CREATE)
    router.post('/', async (req, res) => {
        const { Nome_Meta, Descricao_Meta, Tipo_Meta, Prioridade_Meta, Status_Meta, DataInicio_Meta, DataFim_Meta, ValorAtual_Meta, ValorAlvo_Meta } = req.body;
        if (!Nome_Meta || !Descricao_Meta || !Tipo_Meta || !Prioridade_Meta || !DataFim_Meta || !ValorAlvo_Meta) {
            return res.status(400).json({ message: 'Campos obrigatórios ausentes' });
        }

        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            // 1. Inserir na meta_financeira
            const [metaResult] = await connection.query(
                'INSERT INTO meta_financeira (Nome_Meta, Descricao_Meta, Tipo_Meta, Prioridade_Meta, Status_Meta) VALUES (?, ?, ?, ?, ?)',
                [Nome_Meta, Descricao_Meta, Tipo_Meta, Prioridade_Meta, Status_Meta || 'pendente']
            );
            const metaId = metaResult.insertId;

            // 2. Inserir em meta_financeira_detalhes
            await connection.query(
                'INSERT INTO meta_financeira_detalhes (Meta_Id, DataInicio_Meta, DataFim_Meta, ValorAtual_Meta, ValorAlvo_Meta) VALUES (?, ?, ?, ?, ?)',
                [metaId, DataInicio_Meta || new Date().toISOString().split('T')[0], DataFim_Meta, ValorAtual_Meta || 0, ValorAlvo_Meta]
            );

            await connection.commit();
            res.status(201).json({ id: metaId, Nome_Meta, message: 'Meta criada com sucesso' });
        } catch (err) {
            if (connection) await connection.rollback();
            console.error('Erro ao criar meta:', err);
            res.status(500).json({ message: 'Erro interno do servidor' });
        } finally {
            if (connection) connection.release();
        }
    });

    // Rota para atualizar uma meta (UPDATE)
    router.put('/:id', async (req, res) => {
        const { id } = req.params;
        const { Nome_Meta, Descricao_Meta, Tipo_Meta, Prioridade_Meta, Status_Meta, DataFim_Meta, ValorAtual_Meta, ValorAlvo_Meta } = req.body;

        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            // 1. Atualizar meta_financeira
            const [metaResult] = await connection.query(
                'UPDATE meta_financeira SET Nome_Meta = ?, Descricao_Meta = ?, Tipo_Meta = ?, Prioridade_Meta = ?, Status_Meta = ? WHERE id = ?',
                [Nome_Meta, Descricao_Meta, Tipo_Meta, Prioridade_Meta, Status_Meta, id]
            );

            // 2. Atualizar meta_financeira_detalhes
            const [detalhesResult] = await connection.query(
                'UPDATE meta_financeira_detalhes SET DataFim_Meta = ?, ValorAtual_Meta = ?, ValorAlvo_Meta = ? WHERE Meta_Id = ?',
                [DataFim_Meta, ValorAtual_Meta, ValorAlvo_Meta, id]
            );

            if (metaResult.affectedRows === 0 && detalhesResult.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Meta não encontrada' });
            }

            await connection.commit();
            res.json({ message: 'Meta atualizada com sucesso' });
        } catch (err) {
            if (connection) await connection.rollback();
            console.error('Erro ao atualizar meta:', err);
            res.status(500).json({ message: 'Erro interno do servidor' });
        } finally {
            if (connection) connection.release();
        }
    });

    // Rota para deletar uma meta (DELETE)
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;

        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            // 1. Deletar de meta_financeira_detalhes (dependência)
            await connection.query('DELETE FROM meta_financeira_detalhes WHERE Meta_Id = ?', [id]);

            // 2. Deletar de meta_financeira
            const [result] = await connection.query('DELETE FROM meta_financeira WHERE id = ?', [id]);

            if (result.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Meta não encontrada' });
            }

            await connection.commit();
            res.json({ message: 'Meta deletada com sucesso' });
        } catch (err) {
            if (connection) await connection.rollback();
            console.error('Erro ao deletar meta:', err);
            res.status(500).json({ message: 'Erro interno do servidor' });
        } finally {
            if (connection) connection.release();
        }
    });

    return router;
};


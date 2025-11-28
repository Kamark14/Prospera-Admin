const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    async function tryQuery(q) {
        try {
            const [rows] = await pool.query(q);
            return rows;
        } catch (err) {
            // não interrompe toda a rota se uma subquery falhar
            console.warn('Query falhou em reportRoutes:', q, err.message);
            return null;
        }
    }

    router.get('/finances', async (req, res) => {
        try {
            // tenta contar novos usuários (se col existe), senão devolve fallback
            let newUsers = 0;
            const r1 = await tryQuery("SELECT COUNT(*) AS newUsers FROM usuario WHERE Usuario_Registro >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
            if (r1 && r1.length) newUsers = r1[0].newUsers || 0;
            else {
                const r1b = await tryQuery("SELECT COUNT(*) AS newUsers FROM usuario");
                newUsers = r1b && r1b.length ? r1b[0].newUsers || 0 : 0;
            }

            // conta metas criadas
            const r2 = await tryQuery("SELECT COUNT(*) AS goalsCreated FROM meta_financeira_detalhes");
            const goalsCreated = r2 && r2.length ? r2[0].goalsCreated || 0 : 0;

            // conta metas concluídas
            const r3 = await tryQuery("SELECT COUNT(*) AS goalsCompleted FROM meta_financeira WHERE LOWER(Status_Meta) LIKE '%conclu%'");
            const goalsCompleted = r3 && r3.length ? r3[0].goalsCompleted || 0 : 0;

            // soma valores salvos
            const r4 = await tryQuery("SELECT COALESCE(SUM(ValorAtual_Meta), 0) AS totalSaved FROM meta_financeira_detalhes");
            const totalSaved = r4 && r4.length ? r4[0].totalSaved || 0 : 0;

            // Retorna um array (no frontend usamos array e .map para renderizar)
            const dataRaw = await res.json();
            const financesData = Array.isArray(dataRaw) ? dataRaw : [dataRaw];

            res.json(financesData);
        } catch (err) {
            console.error('Erro ao gerar relatório financeiro:', err.message);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });

    return router;
};
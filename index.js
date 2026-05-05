const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(express.static('public'));

// 1. COLOQUE SUA CHAVE AQUI DENTRO DAS ASPAS
const genAI = new GoogleGenerativeAI("AIzaSyCteXMGUlJyetv3--aqDaM7p0-ij0Cxwjc");

app.post('/analisar', async (req, res) => {
    const { prompt } = req.body;

    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3-flash-preview",
            systemInstruction: "Atue como analista de sentimentos. Responda apenas JSON puro: { \"sentimento\": \"positivo|negativo|neutro\", \"confianca\": 90, \"decisao\": \"enviar_cupom|notificar_suporte|agradecer\", \"resposta\": \"texto\" }"
        });

        const result = await model.generateContent(prompt);
        const responseAI = await result.response;
        let texto = responseAI.text();

        // Limpeza de segurança
        if (texto.includes("```")) {
            texto = texto.split("```json").pop().split("```").shift().trim();
        }

        const analise = JSON.parse(texto);

        let acao = "SISTEMA: Padrao.";
        if (analise.decisao === "enviar_cupom") acao = "SISTEMA: Cupom Gerado.";
        if (analise.decisao === "notificar_suporte") acao = "SISTEMA: Suporte Notificado.";

        res.json({
            sentimento: analise.sentimento,
            confianca: analise.confianca,
            resposta: analise.resposta,
            acaoExecutada: acao
        });

    } catch (error) {
        console.error("Erro interno:", error.message);
        res.status(500).json({ error: "Erro no servidor" });
    }
});

app.listen(3000, () => console.log("Servidor ativo em http://localhost:3000"));
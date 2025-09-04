require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware para permitir requisições de origens diferentes (CORS)
app.use(cors()); 

// Middleware para processar JSON no corpo da requisição
app.use(express.json());

// Substitua com sua chave de API Asaas
const ASAAS_API_KEY = process.env.ASAAS_API_KEY; 
// URL base da API Asaas (use sandbox para testes)
const ASAAS_API_URL = 'https://api.asaas.com/v3';

// Rota para criar o link de pagamento
app.post('/create-payment-link', async (req, res) => {
    const { name, description, value } = req.body;

    // Validação básica dos dados recebidos
    if (!name || !description || !value) {
        return res.status(400).json({ error: 'Dados obrigatórios ausentes.' });
    }

    try {
        const payload = {
            name: name,
            description: description,
            value: value,
            chargeType: 'RECURRENT', // O campo crucial para assinaturas
            billingType: 'CREDIT_CARD', // O Asaas recomenda usar cartão de crédito para assinaturas para cobrança automática
            subscriptionCycle: 'MONTHLY' // Define o ciclo como mensal
        };

        const response = await axios.post(`${ASAAS_API_URL}/paymentLinks`, payload, {
            headers: {
                'access_token': ASAAS_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        const paymentLink = response.data.url;
        const paymentLinkID = response.data.id;

        res.status(200).json({
            message: 'Link de pagamento de assinatura criado com sucesso!',
            paymentLinkId: paymentLinkID,
            paymentLink: paymentLink
        });

    } catch (error) {
        console.error('Erro ao criar link de pagamento:', error.response ? error.response.data : error.message);
        res.status(500).json({ 
            error: 'Ocorreu um erro ao criar o link de pagamento.',
            details: error.response ? error.response.data : error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
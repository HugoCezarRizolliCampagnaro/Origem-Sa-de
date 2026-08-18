// Consultado pelo front-end a cada poucos segundos enquanto a tela do
// Pix está aberta — mesmo padrão de polling usado no FreshBowl.

const { loadEnvOnce } = require('../lib/load-env'); loadEnvOnce();

export default async function handler(req, res) {
  const { transactionId } = req.query;

  if (!transactionId) {
    return res.status(400).json({ error: 'transactionId obrigatório' });
  }

  const response = await fetch(
    `https://app.sigilopay.com.br/api/v1/gateway/transactions?id=${transactionId}`,
    {
      method: 'GET',
      headers: {
        'x-public-key': process.env.SIGILOPAY_PUBLIC_KEY,
        'x-secret-key': process.env.SIGILOPAY_SECRET_KEY,
      },
    }
  );

  const data = await response.json();
  return res.status(response.status).json(data);
}

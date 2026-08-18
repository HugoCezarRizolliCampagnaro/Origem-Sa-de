const { loadEnvOnce } = require('../lib/load-env'); loadEnvOnce();

console.log('DEBUG chaves:', !!process.env.SIGILOPAY_PUBLIC_KEY, !!process.env.SIGILOPAY_SECRET_KEY, process.env.SIGILOPAY_PUBLIC_KEY?.length);
const PRODUCTS = require('../lib/products');
const { sign } = require('../lib/token');

// Recebe do front-end: { itemIds: ['sono', 'dieta', ...], customer: {name, email, phone, cpf} }
// Nunca recebe preço do front-end — o preço vem sempre do catálogo aqui do servidor.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { itemIds, customer } = req.body || {};

  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return res.status(400).json({ error: 'Carrinho vazio' });
  }
  if (!customer?.name || !customer?.email || !customer?.phone || !customer?.cpf) {
    return res.status(400).json({ error: 'Preencha nome, e-mail, telefone e CPF' });
  }

  // Monta os itens a partir do catálogo oficial, ignorando qualquer preço
  // que o front-end tente mandar.
  const items = [];
  for (const id of itemIds) {
    const product = PRODUCTS[id];
    if (!product) {
      return res.status(400).json({ error: `Item inválido: ${id}` });
    }
    items.push({ id, ...product });
  }

  let total = items.reduce((sum, item) => sum + item.price, 0);

// Pacotes: 3 guias por R$67, ou os 16 por R$150.
// Mesma regra usada na tela do carrinho, garantindo que o valor
// cobrado bate com o que a pessoa viu antes de gerar o Pix.
if (itemIds.length === 16) {
  total = 150;
} else if (itemIds.length === 3) {
  total = 67;
}

  const response = await fetch('https://app.sigilopay.com.br/api/v1/gateway/pix/receive', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-public-key': process.env.SIGILOPAY_PUBLIC_KEY,
      'x-secret-key': process.env.SIGILOPAY_SECRET_KEY,
    },
    body: JSON.stringify({
      identifier: `os-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      amount: total,
      client: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        document: customer.cpf,
      },
      products: items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: 1,
        price: item.price,
      })),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return res.status(response.status).json({ error: 'Falha ao criar cobrança', details: data });
  }

  // Token que guarda o pedido (sem precisar de banco de dados).
  // Vai e volta com o front-end até o pagamento ser confirmado.
  const orderToken = sign({
    transactionId: data.transactionId,
    email: customer.email,
    items: itemIds,
  });

  return res.status(200).json({
    transactionId: data.transactionId,
    pix: data.pix,
    orderToken,
  });
}

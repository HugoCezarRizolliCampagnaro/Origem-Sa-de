const { loadEnvOnce } = require('../lib/load-env'); loadEnvOnce();

const PRODUCTS = require('../lib/products');
const { verify, sign } = require('../lib/token');

// Chamado pelo front-end assim que o polling detecta status "COMPLETED".
// Mas NUNCA confia só nisso: confere de novo com a SigiloPay antes de
// liberar qualquer coisa, pra ninguém conseguir forjar um "paguei" falso.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderToken } = req.body || {};
  const order = verify(orderToken);

  if (!order) {
    return res.status(400).json({ error: 'Pedido inválido' });
  }

  const statusResp = await fetch(
    `https://app.sigilopay.com.br/api/v1/gateway/transactions?id=${order.transactionId}`,
    {
      headers: {
        'x-public-key': process.env.SIGILOPAY_PUBLIC_KEY,
        'x-secret-key': process.env.SIGILOPAY_SECRET_KEY,
      },
    }
  );
  const statusData = await statusResp.json();

  if (statusData.status !== 'COMPLETED') {
    return res.status(402).json({ error: 'Pagamento ainda não confirmado' });
  }

  // Link mágico permanente — sem senha, sem login.
  const accessToken = sign({
    email: order.email,
    items: order.items,
    purchasedAt: new Date().toISOString(),
  });
  const accessUrl = `${process.env.SITE_URL}/acesso.html?t=${accessToken}`;

  const itemNames = order.items.map((id) => PRODUCTS[id]?.name).filter(Boolean);

  const emailResp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'Origem Saúde <onboarding@resend.dev>',
      to: order.email,
      subject: 'Seu pagamento foi confirmado — Origem Saúde',
      html: buildEmailHtml({ accessUrl, itemNames }),
    }),
  });

  if (!emailResp.ok) {
    const details = await emailResp.json().catch(() => null);
    // O pagamento já foi confirmado — não falha a compra por causa do e-mail,
    // só avisa que o e-mail não saiu, pra você conseguir reenviar manualmente.
    return res.status(200).json({ ok: true, accessUrl, emailSent: false, emailError: details });
  }

  return res.status(200).json({ ok: true, accessUrl, emailSent: true });
}

function buildEmailHtml({ accessUrl, itemNames }) {
  const lista = itemNames.map((n) => `<li>${n}</li>`).join('');
  return `
  <div style="font-family:Arial,sans-serif; max-width:520px; margin:0 auto; color:#1E2A22; line-height:1.6;">
    <p>Olá!</p>
    <p>Seu pagamento foi confirmado com sucesso. Agradecemos pela sua compra na <strong>Origem Saúde</strong>.</p>
    <p>O(s) e-book(s) adquirido(s) já está(ão) disponível(is) para acesso:</p>
    <ul>${lista}</ul>
    <p>Clique no botão abaixo para acessar e baixar o(s) arquivo(s) em PDF.</p>
    <div style="text-align:center; margin:28px 0;">
      <a href="${accessUrl}" style="background:#3E5A44; color:#fff; padding:14px 28px; border-radius:999px; text-decoration:none; font-weight:bold; display:inline-block;">ACESSAR MEU(S) E-BOOK(S)</a>
    </div>
    <p>Você poderá acessar o(s) material(is) adquirido(s) sempre que precisar, conforme as condições de acesso da sua compra.</p>
    <p>Se você adquiriu mais de um e-book, todos os materiais correspondentes à sua compra estarão disponíveis no mesmo acesso.</p>
    <p style="background:#F4F7F2; border:1px solid #DAE3D8; border-radius:8px; padding:14px; font-size:0.9em;">
      <strong>Importante:</strong> os conteúdos da Origem Saúde têm caráter exclusivamente informativo e educacional e não substituem avaliação, diagnóstico ou acompanhamento de um profissional de saúde.
    </p>
    <p>Obrigado por escolher a Origem Saúde.<br>Cuidar de você começa com informação.</p>
    <p>Equipe Origem Saúde</p>
  </div>`;
}

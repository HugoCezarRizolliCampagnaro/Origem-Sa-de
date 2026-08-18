// Gera e verifica um "link mágico" assinado, sem precisar de banco de dados.
// O token carrega os dados do pedido (e-mail + itens comprados) e uma
// assinatura HMAC que garante que ninguém conseguiu editar o conteúdo.
// Precisa da variável de ambiente ACCESS_TOKEN_SECRET (uma string
// aleatória e longa, só sua — pode gerar uma em https://generate-secret.vercel.app/32).

const crypto = require('crypto');

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64urlDecode(input) {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  while (input.length % 4) input += '=';
  return Buffer.from(input, 'base64').toString('utf8');
}

function sign(payloadObj) {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error('ACCESS_TOKEN_SECRET não configurada');
  const payload = base64url(JSON.stringify(payloadObj));
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

function verify(token) {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret || !token) return null;
  const [payload, sig] = String(token).split('.');
  if (!payload || !sig) return null;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  if (expected !== sig) return null; // assinatura não bate → token adulterado ou inválido
  try {
    return JSON.parse(base64urlDecode(payload));
  } catch {
    return null;
  }
}

module.exports = { sign, verify };

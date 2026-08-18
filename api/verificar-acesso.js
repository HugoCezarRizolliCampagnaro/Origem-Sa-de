const { loadEnvOnce } = require('../lib/load-env'); loadEnvOnce();

const PRODUCTS = require('../lib/products');
const { verify } = require('../lib/token');

// Chamado pela página acesso.html — recebe o token que veio no link do e-mail
// e devolve os e-books comprados. Sem senha: quem tem o link, acessa.

export default async function handler(req, res) {
  const { t } = req.query;
  const data = verify(t);

  if (!data) {
    return res.status(400).json({ error: 'Link inválido' });
  }

  const items = data.items
    .map((id) => {
      const product = PRODUCTS[id];
      if (!product) return null;
      return {
        id,
        name: product.name,
        // Troque pelo caminho real do PDF quando os arquivos estiverem prontos
        // (ex: subir os PDFs em /public/ebooks/ ou num storage externo).
        pdfUrl: `/ebooks/${id}.pdf`,
      };
    })
    .filter(Boolean);

  return res.status(200).json({ email: data.email, items });
}

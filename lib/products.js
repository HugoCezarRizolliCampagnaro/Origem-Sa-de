// Catálogo oficial dos 16 e-books.
// Preço fica travado aqui no servidor — o front-end manda só os IDs,
// nunca o preço, pra ninguém conseguir pagar menos alterando o navegador.

module.exports = {
  'sono':            { name: 'Sono',                    price: 12.50 },
  'costas':          { name: 'Dor nas costas',           price: 9.90 },
  'dor-cabeca':      { name: 'Dor de cabeça',             price: 9.90 },
  'dieta':           { name: 'Dieta e peso',              price: 12.50 },
  'ansiedade':       { name: 'Ansiedade',                 price: 12.50 },
  'cansaco':         { name: 'Cansaço constante',         price: 9.90 },
  'digestao':        { name: 'Intestino e digestão',      price: 9.90 },
  'pele':            { name: 'Pele e acne',                price: 9.90 },
  'articulacoes':    { name: 'Dor nas articulações',      price: 9.90 },
  'azia-refluxo':    { name: 'Azia e refluxo',             price: 9.90 },
  'estresse':        { name: 'Estresse no trabalho',       price: 9.90 },
  'queda-cabelo':    { name: 'Queda de cabelo',            price: 9.90 },
  'imunidade':       { name: 'Imunidade baixa',            price: 9.90 },
  'pressao-alta':    { name: 'Pressão alta',               price: 9.90 },
  'tpm':             { name: 'TPM e ciclo menstrual',      price: 9.90 },
  'vista-cansada':   { name: 'Vista cansada',               price: 9.90 },
};
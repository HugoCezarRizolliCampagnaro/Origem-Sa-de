// Catálogo oficial dos 16 e-books.
// Preço fica travado aqui no servidor — o front-end manda só os IDs,
// nunca o preço, pra ninguém conseguir pagar menos alterando o navegador.

module.exports = {
  'sono':            { name: 'Sono',                    price: 27 },
  'costas':          { name: 'Dor nas costas',           price: 27 },
  'dor-cabeca':      { name: 'Dor de cabeça',             price: 27 },
  'dieta':           { name: 'Dieta e peso',              price: 37 },
  'ansiedade':       { name: 'Ansiedade',                 price: 37 },
  'cansaco':         { name: 'Cansaço constante',         price: 27 },
  'digestao':        { name: 'Intestino e digestão',      price: 27 },
  'pele':            { name: 'Pele e acne',                price: 27 },
  'articulacoes':    { name: 'Dor nas articulações',      price: 27 },
  'azia-refluxo':    { name: 'Azia e refluxo',             price: 27 },
  'estresse':        { name: 'Estresse no trabalho',       price: 27 },
  'queda-cabelo':    { name: 'Queda de cabelo',            price: 27 },
  'imunidade':       { name: 'Imunidade baixa',            price: 27 },
  'pressao-alta':    { name: 'Pressão alta',               price: 27 },
  'tpm':             { name: 'TPM e ciclo menstrual',      price: 27 },
  'vista-cansada':   { name: 'Vista cansada',               price: 27 },
};

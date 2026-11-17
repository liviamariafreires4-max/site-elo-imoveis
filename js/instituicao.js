/**
 * DADOS INSTITUCIONAIS: ÚNICA fonte de verdade (manual, seção 08).
 * ------------------------------------------------------------------
 * Tudo com `validar: true` aparece no site com o selo "A VALIDAR".
 * Quando a imobiliária confirmar um dado, troque o valor e mude para
 * `validar: false`: o selo some de todas as páginas.
 *
 * Valores tirados do site atual (eloimoveispp.com.br, páginas Sobre e Contato).
 * O endereço continua "A VALIDAR": o site atual mostra o bairro como
 * "Vila Mathilde Vieira" no texto e "Jardim Bongiovani" no rodapé.
 *
 * O administrador pode mudar telefone, WhatsApp, e-mail etc. pelo painel
 * (painel-empresa.html): o que ele salva substitui estes valores no site
 * todo, inclusive o botão do WhatsApp (ver aplicarEmpresa em js/dados.js).
 */
window.Elo = window.Elo || {};

Elo.SITE = {
  nome: "Elo Imóveis",
  cidade: "Presidente Prudente",
  uf: "SP",
  slogan: "O melhor elo entre você e o seu sonho",
  fundacao: 2023,
  endereco: { valor: "Rua Tupiniquins, 50, Vila Mathilde Vieira, Presidente Prudente/SP", validar: true },
  telefone: { valor: "(18) 99770-1001", validar: false },
  whatsapp: { valor: "5518997701001", validar: false }, // só números, com 55 e DDD
  email: { valor: "ad018imoveis@outlook.com", validar: false },
  creci: { valor: "CRECI 48750-J", validar: false },
  cnpj: { valor: "59.425.262/0001-40", validar: false },
  horario: { valor: "Segunda a sexta, das 8h às 18h. Sábado, das 8h às 13h.", validar: false },
  redes: {
    instagram: "https://www.instagram.com/elo.imoveis.pp",
    facebook: "https://www.facebook.com/profile.php?id=61576681377208",
    youtube: "https://www.youtube.com/@eloimoveisprudente",
    pinterest: "https://br.pinterest.com/eloimoveispresidenteprudente/",
  },
};

/**
 * Nota da Elo no Google (Perfil da Empresa). Mostrada no topo da home.
 * TODO(backend): para atualizar sozinha, um servidor precisa consultar a API do
 * Google Places (com chave secreta, que não pode ficar no navegador) e gravar
 * nota e total aqui, por exemplo uma vez por dia. A home já lê destes campos.
 * Enquanto isso, os números abaixo são de EXEMPLO (aparecem com A VALIDAR).
 */
Elo.GOOGLE = {
  nota: 5.0,
  total: 0, // 0 = ainda sem o número real; a home mostra só o link
  exemplo: true,
  // Endereço do servidor que devolve { "nota": 4.9, "total": 37 } lido da API
  // do Google Places. Vazio = usa nota e total acima.
  endpoint: "",
  // Abre a busca da Elo no Google Maps, onde estão as avaliações.
  link: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Elo Imóveis Presidente Prudente"),
};

/**
 * Menu principal. Um item com `itens` vira um grupo com submenu
 * (no computador abre ao clicar ou passar o mouse; no celular, como sanfona).
 * Um item com `href` vira um link simples.
 */
Elo.MENU = (() => {
const venda = (tipo) => "imoveis.html?finalidade=venda" + (tipo ? "&tipo=" + tipo : "");
const locacao = (tipo) => "imoveis.html?finalidade=aluguel" + (tipo ? "&tipo=" + tipo : "");

return [
  {
    rotulo: "Venda",
    itens: [
      { href: venda(), rotulo: "Todos os imóveis" },
      { href: venda("terreno-condominio"), rotulo: "Terreno em condomínio" },
      { href: venda("casa-condominio"), rotulo: "Casa em condomínio" },
      { href: venda("casa"), rotulo: "Casa" },
      { href: venda("apartamento"), rotulo: "Apartamento" },
      { href: venda("comercial"), rotulo: "Comercial" },
      { href: venda("terreno"), rotulo: "Terreno" },
    ],
  },
  {
    rotulo: "Locação",
    itens: [
      { href: locacao(), rotulo: "Todos os imóveis" },
      { href: locacao("casa-condominio"), rotulo: "Casa em condomínio" },
      { href: locacao("sala-comercial"), rotulo: "Sala comercial" },
      { href: locacao("apartamento"), rotulo: "Apartamento" },
      { href: locacao("casa"), rotulo: "Casa" },
      { href: locacao("comercial"), rotulo: "Comercial" },
    ],
  },
  {
    rotulo: "Informações",
    itens: [
      { href: "sobre.html", rotulo: "Sobre nós" },
      { href: "anuncie.html", rotulo: "Cadastre seu imóvel" },
      { href: "blog.html", rotulo: "Notícias" },
      { href: "links-uteis.html", rotulo: "Links úteis" },
      { href: "faq.html", rotulo: "Perguntas frequentes" },
    ],
  },
  // Também ficam como abas próprias, para não depender do submenu.
  { href: "sobre.html", rotulo: "Sobre nós" },
  { href: "faq.html", rotulo: "FAQ" },
  { href: "contato.html", rotulo: "Contato" },
];
})();

Elo.TIPOS = {
  casa: "Casa",
  "casa-condominio": "Casa em condomínio",
  apartamento: "Apartamento",
  terreno: "Terreno",
  "terreno-condominio": "Terreno em condomínio",
  "sala-comercial": "Sala comercial",
  comercial: "Comercial",
  chacara: "Chácara",
};

Elo.FINALIDADES = { venda: "Venda", aluguel: "Aluguel" };

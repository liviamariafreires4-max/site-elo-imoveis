/**
 * HOME (index.html)
 * Busca com abas, atalhos, destaques e bairros.
 */
(function () {
  const { esc, preco, plural, foto, icone } = { ...Elo.ui, icone: Elo.icone };

  // ------------------------------------------------- busca com abas
  const FAIXAS = {
    venda: [200000, 400000, 600000, 1000000, 2000000],
    aluguel: [1500, 2500, 4000, 6000],
  };

  const tipo = document.getElementById("busca-tipo");
  for (const [valor, rotulo] of Object.entries(Elo.TIPOS)) tipo.add(new Option(rotulo, valor));

  const precoSelect = document.getElementById("busca-preco");
  function preencherPrecos(modo) {
    precoSelect.length = 1; // mantém só "Sem limite"
    for (const v of FAIXAS[modo]) precoSelect.add(new Option(preco(v), v));
    document.getElementById("rotulo-preco").textContent = modo === "venda" ? "Preço até" : "Aluguel até";
  }
  preencherPrecos("venda");

  const abas = [...document.querySelectorAll('[role="tab"]')];
  const painel = document.getElementById("painel-busca");
  const formFiltros = document.getElementById("form-filtros");
  const formCodigo = document.getElementById("form-codigo");

  function selecionarAba(aba, focar = false) {
    for (const a of abas) {
      const ativa = a === aba;
      a.setAttribute("aria-selected", String(ativa));
      a.tabIndex = ativa ? 0 : -1;
    }
    painel.setAttribute("aria-labelledby", aba.id);
    const modo = aba.dataset.modo;
    formCodigo.hidden = modo !== "codigo";
    formFiltros.hidden = modo === "codigo";
    if (modo !== "codigo") {
      document.getElementById("busca-finalidade").value = modo;
      preencherPrecos(modo);
    }
    if (focar) aba.focus();
  }

  abas.forEach((aba) => aba.addEventListener("click", () => selecionarAba(aba)));
  // Setas do teclado trocam de aba (padrão de abas acessíveis).
  document.querySelector('[role="tablist"]').addEventListener("keydown", (e) => {
    const atual = abas.findIndex((a) => a.getAttribute("aria-selected") === "true");
    let proxima = null;
    if (e.key === "ArrowRight") proxima = (atual + 1) % abas.length;
    if (e.key === "ArrowLeft") proxima = (atual - 1 + abas.length) % abas.length;
    if (e.key === "Home") proxima = 0;
    if (e.key === "End") proxima = abas.length - 1;
    if (proxima === null) return;
    e.preventDefault();
    selecionarAba(abas[proxima], true);
  });

  // Não manda campos vazios na URL (fica imoveis.html?finalidade=venda&bairro=...).
  formFiltros.addEventListener("submit", (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    for (const [k, v] of new FormData(formFiltros)) if (v) params.set(k, v);
    location.href = "imoveis.html?" + params.toString();
  });

  // ------------------------------------------------------------ atalhos
  const atalhos = [
    ["imoveis.html?finalidade=venda", "casa", "Comprar", "Casas, apartamentos e terrenos à venda."],
    ["imoveis.html?finalidade=aluguel", "chave", "Alugar", "Imóveis residenciais e comerciais para locação."],
    ["imoveis.html?destaque=1", "estrela", "Imóveis em destaque", "A seleção atual da nossa equipe."],
    ["sobre.html", "predio", "Sobre a Elo", "Quem somos e como atendemos."],
  ];
  document.getElementById("atalhos").innerHTML = atalhos
    .map(
      ([href, ic, titulo, texto]) =>
        '<li><a class="atalho" href="' + href + '">' +
        '<span class="circulo-icone">' + icone(ic, 22) + "</span>" +
        '<span class="atalho__texto"><span class="t-card">' + titulo + '</span><span class="t-pequeno cor-suave">' + texto + "</span></span>" +
        icone("seta-direita", 20, "icone--avanca") + "</a></li>",
    )
    .join("");

  // ---------------------------------------------------------- destaques
  const destaques = document.getElementById("destaques");
  async function carregarDestaques() {
    destaques.innerHTML = Elo.ui.esqueletoCards(3);
    try {
      const lista = await Elo.dados.listProperties({ destaque: true });
      destaques.innerHTML = Elo.ui.gradeCards(lista.slice(0, 6));
      Elo.ui.atualizarCoracoes();
    } catch {
      Elo.ui.falha(destaques, "os imóveis em destaque", carregarDestaques);
    }
  }
  carregarDestaques();

  // ---------------------------------------------- bairros (e lista da busca)
  const bairros = document.getElementById("bairros");
  async function carregarBairros() {
    try {
      const lista = await Elo.dados.listNeighborhoods();
      // Cidade e bairro: os bairros acompanham a cidade escolhida.
      const select = document.getElementById("busca-bairro");
      const selectCidade = document.getElementById("busca-cidade");
      [...new Set(lista.map((b) => b.cidade))].sort((a, b) => a.localeCompare(b, "pt-BR")).forEach((c) => selectCidade.add(new Option(c, c)));
      const preencherBairros = () => {
        select.length = 1;
        const nomes = [...new Set(lista.filter((b) => !selectCidade.value || b.cidade === selectCidade.value).map((b) => b.nome))];
        nomes.sort((a, b) => a.localeCompare(b, "pt-BR")).forEach((n) => select.add(new Option(n, n)));
      };
      selectCidade.addEventListener("change", preencherBairros);
      preencherBairros();

      bairros.innerHTML = lista
        .slice(0, 5)
        .map(
          (b, i) =>
            '<li><a class="bairro escuro sobe" href="imoveis.html?cidade=' + encodeURIComponent(b.cidade) + "&bairro=" + encodeURIComponent(b.nome) + '">' +
            '<img class="aproxima" src="' + esc(foto(b.foto.url, i === 0 ? 960 : 480)) + '" alt="" loading="lazy">' +
            '<span class="bairro__texto"><span class="bairro__nome ' + (i === 0 ? "t-h3" : "t-card") + '">' + esc(b.nome) + "</span>" +
            '<span class="t-pequeno">' + plural(b.quantidade, "imóvel disponível", "imóveis disponíveis") + "</span></span></a></li>",
        )
        .join("");
    } catch {
      Elo.ui.falha(bairros, "os bairros", carregarBairros);
    }
  }
  carregarBairros();

  // ---------------------------------------------------------- corretores
  const corretores = document.getElementById("corretores");
  async function carregarCorretores() {
    corretores.innerHTML = Elo.ui.esqueletoLinhas(3);
    try {
      const lista = await Elo.dados.listBrokers();
      corretores.innerHTML = lista.length
        ? '<ul class="grade-corretores">' + lista.map(Elo.ui.cardCorretor).join("") + "</ul>"
        : '<p class="t-corpo" style="margin-top:24px">Nenhum corretor disponível no momento.</p>';
    } catch {
      Elo.ui.falha(corretores, "os corretores", carregarCorretores);
    }
  }
  carregarCorretores();

  // ---------------------------------------------------------- avaliações
  const avaliacoes = document.getElementById("avaliacoes");
  async function carregarAvaliacoes() {
    try {
      const lista = await Elo.dados.listTestimonials();
      const nomes = Elo.dados.brokerNames();
      avaliacoes.innerHTML = '<ul class="grade-avaliacoes">' + lista.map((a) => Elo.ui.cardAvaliacao(a, nomes[a.corretorId])).join("") + "</ul>";
    } catch {
      Elo.ui.falha(avaliacoes, "as avaliações", carregarAvaliacoes);
    }
  }
  carregarAvaliacoes();

  // ------------------------------------------------------ últimas do blog
  const materias = document.getElementById("ultimas-materias");
  async function carregarMaterias() {
    materias.innerHTML = Elo.ui.esqueletoCards(3);
    try {
      const lista = await Elo.dados.listPosts();
      materias.innerHTML = '<ul class="grade-cards">' + lista.slice(0, 3).map(Elo.ui.cardMateria).join("") + "</ul>";
    } catch {
      Elo.ui.falha(materias, "as matérias", carregarMaterias);
    }
  }
  carregarMaterias();

  // ------------------------------------------------- nota do Google (topo)
  /**
   * Mostra a nota da Elo no Google e leva para as avaliações.
   * Se Elo.GOOGLE.endpoint estiver preenchido (um servidor que consulta a API
   * do Google Places), a nota é buscada a cada visita: quando a nota mudar no
   * Google, muda aqui sozinha. Sem endpoint, usa os números de js/instituicao.js.
   */
  const seloGoogle = document.getElementById("selo-google");
  function desenharGoogle({ nota, total, exemplo }) {
    seloGoogle.href = Elo.GOOGLE.link;
    const numero = Number(nota).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    seloGoogle.innerHTML =
      '<span class="selo-google__nota">' + numero + "</span>" +
      Elo.ui.estrelas(Math.round(nota)) +
      "<span>no Google" + (total ? " · " + Elo.ui.plural(total, "avaliação", "avaliações") : "") + "</span>" +
      '<span class="selo-google__mais">Ver avaliações<span class="sr-only"> (abre o Google em nova aba)</span></span>' +
      (exemplo ? '<span class="a-validar">NOTA DE EXEMPLO</span>' : "");
    seloGoogle.hidden = false;
  }
  async function carregarGoogle() {
    desenharGoogle(Elo.GOOGLE);
    if (!Elo.GOOGLE.endpoint) return;
    try {
      const resposta = await fetch(Elo.GOOGLE.endpoint, { cache: "no-store" });
      if (!resposta.ok) return;
      const { nota, total } = await resposta.json();
      if (nota) desenharGoogle({ nota, total, exemplo: false });
    } catch {
      // sem conexão com o servidor: fica a nota guardada
    }
  }
  carregarGoogle();

  // -------------------------------------------------------- como chegar
  document.getElementById("como-chegar").href =
    "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(Elo.SITE.endereco.valor);
})();

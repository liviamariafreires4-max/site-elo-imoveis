/**
 * BUSCA (imoveis.html)
 * Os filtros ficam na URL (imoveis.html?finalidade=venda&bairro=Centro), então
 * dá para compartilhar o link de uma busca. Cada mudança refaz a lista na hora.
 *
 * Existe um único formulário de filtros: no desktop ele fica na coluna da
 * esquerda; no celular, o botão "Filtros" move esse mesmo formulário para
 * uma folha que sobe de baixo.
 */
(function () {
  const { esc, preco, plural } = Elo.ui;

  const FAIXAS = {
    venda: [200000, 400000, 600000, 1000000, 2000000],
    aluguel: [1500, 2500, 4000, 6000],
  };
  // Nome do campo no formulário -> nome do filtro em Elo.dados.listProperties
  const CAMPOS = {
    finalidade: "finalidade",
    tipo: "tipo",
    cidade: "cidade",
    bairro: "bairro",
    precoMin: "precoMin",
    precoMax: "precoMax",
    dorms: "dormitorios",
    vagas: "vagas",
    codigo: "codigo",
    destaque: "destaque",
    ordem: "ordem",
  };
  const NUMERICOS = ["precoMin", "precoMax", "dorms", "vagas"];

  const form = document.getElementById("filtros");
  const lugarDesktop = document.getElementById("filtros-desktop");
  const folha = document.getElementById("folha-filtros");
  const lugarFolha = document.getElementById("filtros-folha");
  const resultados = document.getElementById("resultados");
  const contador = document.getElementById("contador");
  const ordem = document.getElementById("ordem");

  // -------------------------------------------------- ler/escrever a URL
  const params = () => new URLSearchParams(location.search);

  function filtrosDaUrl() {
    const p = params();
    const filtros = {};
    for (const [campo, filtro] of Object.entries(CAMPOS)) {
      const v = p.get(campo);
      if (!v) continue;
      filtros[filtro] = NUMERICOS.includes(campo) ? Number(v) : v;
    }
    if (filtros.destaque) filtros.destaque = true;
    return filtros;
  }

  function mudarParametro(nome, valor) {
    const p = params();
    if (valor) p.set(nome, valor);
    else p.delete(nome);
    // Trocar a cidade apaga o bairro (ele pode não existir na cidade nova).
    if (nome === "cidade") p.delete("bairro");
    // Trocar a finalidade invalida as faixas de preço da outra.
    if (nome === "finalidade") {
      p.delete("precoMin");
      p.delete("precoMax");
    }
    history.replaceState(null, "", "?" + p.toString());
    atualizarTudo();
  }

  // ------------------------------------------------------ formulário
  let todosBairros = []; // [{ nome, cidade }]

  function preencherOpcoes(bairros, cidades) {
    const tipo = form.elements.tipo;
    for (const [v, r] of Object.entries(Elo.TIPOS)) tipo.add(new Option(r, v));
    todosBairros = bairros;
    const cidade = form.elements.cidade;
    cidades.forEach((c) => cidade.add(new Option(c, c)));
  }

  /** Bairros da cidade escolhida (ou de todas). Com cidades diferentes, mostra "Bairro (Cidade)". */
  function preencherBairros(cidadeEscolhida) {
    const select = form.elements.bairro;
    select.length = 1; // mantém "Todos os bairros"
    const lista = todosBairros.filter((b) => !cidadeEscolhida || b.cidade === cidadeEscolhida);
    const vistos = new Set();
    lista
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
      .forEach((b) => {
        if (vistos.has(b.nome)) return;
        vistos.add(b.nome);
        const repetido = !cidadeEscolhida && todosBairros.some((x) => x.nome === b.nome && x.cidade !== b.cidade);
        select.add(new Option(repetido ? b.nome : cidadeEscolhida || b.cidade === "Presidente Prudente" ? b.nome : b.nome + " (" + b.cidade + ")", b.nome));
      });
  }

  function preencherPrecos() {
    const finalidade = params().get("finalidade") || "venda";
    for (const nome of ["precoMin", "precoMax"]) {
      const select = form.elements[nome];
      select.length = 1; // mantém "Qualquer"
      FAIXAS[finalidade].forEach((v) => select.add(new Option(preco(v), v)));
    }
  }

  /** Coloca no formulário o que está na URL. */
  function sincronizarFormulario() {
    const p = params();
    preencherPrecos();
    form.querySelectorAll('input[name="finalidade"]').forEach((r) => (r.checked = r.value === (p.get("finalidade") || "")));
    form.elements.cidade.value = p.get("cidade") || "";
    preencherBairros(p.get("cidade") || "");
    for (const nome of ["tipo", "bairro", "precoMin", "precoMax", "dorms", "vagas"]) {
      form.elements[nome].value = p.get(nome) || "";
    }
    const codigo = form.elements.codigo;
    if (document.activeElement !== codigo) codigo.value = p.get("codigo") || "";
    ordem.value = p.get("ordem") || "recentes";
  }

  form.addEventListener("change", (e) => {
    const campo = e.target;
    if (campo.name && campo.name !== "codigo") mudarParametro(campo.name, campo.value);
  });
  // Código: espera a pessoa parar de digitar (300ms) antes de buscar.
  let espera;
  form.elements.codigo.addEventListener("input", (e) => {
    clearTimeout(espera);
    espera = setTimeout(() => mudarParametro("codigo", e.target.value.trim()), 300);
  });
  form.addEventListener("submit", (e) => e.preventDefault());
  ordem.addEventListener("change", () => mudarParametro("ordem", ordem.value === "recentes" ? "" : ordem.value));

  // Limpar filtros: mantém só a finalidade.
  document.querySelectorAll("[data-limpar]").forEach((botao) =>
    botao.addEventListener("click", () => {
      const finalidade = params().get("finalidade");
      history.replaceState(null, "", finalidade ? "?finalidade=" + finalidade : "?");
      atualizarTudo();
    }),
  );

  // ------------------------------------------------- folha no celular
  document.getElementById("abrir-filtros").addEventListener("click", () => {
    lugarFolha.appendChild(form);
    folha.showModal();
  });
  const fecharFolha = () => folha.close();
  document.getElementById("fechar-filtros").addEventListener("click", fecharFolha);
  document.getElementById("ver-resultados").addEventListener("click", fecharFolha);
  folha.addEventListener("click", (e) => e.target === folha && fecharFolha());
  folha.addEventListener("close", () => lugarDesktop.appendChild(form));

  // --------------------------------------------------------- títulos
  function atualizarTitulo() {
    const f = filtrosDaUrl();
    let titulo = "Todos os imóveis";
    if (f.codigo) titulo = "Busca pelo código " + f.codigo.toUpperCase();
    else if (f.destaque) titulo = "Imóveis em destaque";
    else if (f.finalidade === "venda") titulo = "Imóveis à venda";
    else if (f.finalidade === "aluguel") titulo = "Imóveis para alugar";
    if (f.bairro && !f.codigo) titulo += " no " + f.bairro;
    if (f.cidade && !f.codigo) titulo += (f.bairro ? ", " : " em ") + f.cidade;
    document.getElementById("titulo").textContent = titulo;
    document.title = titulo + " | Elo Imóveis";

    const ativos = ["tipo", "cidade", "bairro", "precoMin", "precoMax", "dorms", "vagas", "codigo", "destaque"].filter((k) => params().get(k)).length;
    document.getElementById("rotulo-filtros").textContent = ativos ? "Filtros (" + ativos + ")" : "Filtros";
    document.querySelectorAll("[data-limpar]").forEach((b) => (b.hidden = b.dataset.limpar === "topo" && !ativos));
  }

  // ------------------------------------------------------- resultados
  let pedido = 0; // ignora respostas antigas se o filtro mudou no meio
  async function carregarResultados() {
    const meu = ++pedido;
    const filtros = filtrosDaUrl();
    contador.textContent = "Buscando imóveis…";
    if (!resultados.querySelector(".grade-cards")) resultados.innerHTML = Elo.ui.esqueletoCards(6);
    try {
      const lista = await Elo.dados.listProperties(filtros);
      if (meu !== pedido) return;
      if (!lista.length) {
        contador.textContent = "Nenhum imóvel encontrado";
        resultados.innerHTML = Elo.ui.vazio({
          icone: "busca-vazia",
          titulo: "Nenhum imóvel com esses filtros",
          texto: filtros.codigo
            ? "Confira se o código está correto (por exemplo, ELO-1007) ou busque por bairro e tipo."
            : "Tente aumentar a faixa de preço, trocar o bairro ou retirar um dos filtros.",
          acao: '<a class="botao botao--secundario" href="imoveis.html">Limpar filtros e ver todos</a>',
        });
      } else {
        contador.textContent = plural(lista.length, "imóvel encontrado", "imóveis encontrados");
        resultados.innerHTML = Elo.ui.gradeCards(lista);
        Elo.ui.atualizarCoracoes();
      }
      document.getElementById("ver-resultados").textContent = "Ver " + plural(lista.length, "imóvel", "imóveis");
    } catch {
      if (meu !== pedido) return;
      contador.textContent = "";
      Elo.ui.falha(resultados, "os imóveis", carregarResultados);
    }
  }

  function atualizarTudo() {
    sincronizarFormulario();
    atualizarTitulo();
    carregarResultados();
  }

  // ------------------------------------------------------------- início
  Promise.all([Elo.dados.listNeighborhoods().catch(() => []), Elo.dados.listCities().catch(() => [])]).then(([bairros, cidades]) => {
    preencherOpcoes(bairros, cidades);
    atualizarTudo();
  });
})();

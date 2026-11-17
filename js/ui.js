/**
 * COMPONENTES COMPARTILHADOS
 * ------------------------------------------------------------------
 * Cabeçalho, rodapé e atalho do WhatsApp (montados aqui para não repetir o
 * mesmo HTML em todas as páginas), formatação de preço, card de imóvel,
 * coração de favoritar, toast, diálogo de confirmação e estados de tela.
 *
 * Toda página pública tem:
 *   <div id="topo"></div>   <main id="conteudo">...</main>   <div id="rodape"></div>
 */
window.Elo = window.Elo || {};

(function () {
  const icone = (...a) => Elo.icone(...a);

  // ============================================================ utilidades
  /** Escapa texto antes de colocar dentro de HTML (evita injeção de código). */
  function esc(valor) {
    return String(valor ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  const formatoReal = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const formatoNumero = new Intl.NumberFormat("pt-BR");
  const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  /** R$ 1.980.000 */
  const preco = (v) => formatoReal.format(v);
  /** 1.250 m² */
  const area = (v) => formatoNumero.format(v) + " m²";
  /** 1 imóvel / 2 imóveis */
  const plural = (n, um, varios) => n + " " + (n === 1 ? um : varios);
  const data = (iso) => formatoData.format(new Date(iso));

  /** URL da foto no tamanho certo. Fotos enviadas pelo painel (data:) passam direto. */
  function foto(url, largura = 800) {
    if (url.startsWith("https://images.unsplash.com/")) {
      return url + "?w=" + largura + "&q=70&auto=format&fit=crop";
    }
    return url;
  }

  /** Parâmetros da URL: Elo.ui.param("codigo") */
  const param = (nome) => new URLSearchParams(location.search).get(nome);

  // Sem espaços, com usuário, @, domínio e terminação de 2+ letras (mesma regra de js/validacao.js).
  const EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

  /**
   * Dado institucional com o selo A VALIDAR quando ainda não foi confirmado.
   * E-mail e telefone viram links (abrem o e-mail e a ligação), sempre com o
   * valor atual: se o admin mudar em Dados da Elo, os links mudam junto.
   */
  function institucional(dado, tipo) {
    let valor = esc(dado.valor);
    if (tipo === "email") valor = '<a class="link" href="mailto:' + esc(dado.valor) + '">' + valor + "</a>";
    if (tipo === "telefone") valor = '<a class="link" href="tel:+55' + dado.valor.replace(/\D/g, "") + '">' + valor + "</a>";
    if (tipo === "whatsapp") {
      // "5518920012054" -> "(18) 92001-2054", com link que abre a conversa
      const d = dado.valor.replace(/\D/g, "").replace(/^55/, "");
      const numero = d.length >= 10 ? "(" + d.slice(0, 2) + ") " + d.slice(2, -4) + "-" + d.slice(-4) : dado.valor;
      valor = '<a class="link" href="https://wa.me/' + esc(dado.valor) + '" target="_blank" rel="noopener noreferrer">' + esc(numero) +
        '<span class="sr-only"> (abre o WhatsApp)</span></a>';
    }
    return '<span class="com-selo"><span>' + valor + "</span>" +
      (dado.validar ? '<span class="a-validar">A VALIDAR</span>' : "") + "</span>";
  }

  // ======================================================= cabeçalho e rodapé
  /**
   * Logotipo. O arquivo fica em img/logo.png (fundo transparente).
   * Para trocar, substitua o arquivo mantendo o nome, ou mude o caminho abaixo.
   * O tamanho na tela é definido em css/componentes.css (.marca img).
   */
  function marca() {
    return (
      '<a class="marca" href="index.html">' +
      '<img src="img/logo.png" alt="Elo Imóveis, página inicial" width="94" height="63">' +
      "</a>"
    );
  }

  /** Destaca no menu o link da página atual. */
  function linkAtual(href) {
    const [arquivo, busca] = href.split("?");
    const aqui = location.pathname.split("/").pop() || "index.html";
    if (arquivo !== aqui) return false;
    if (!busca) return true;
    return new URLSearchParams(busca).toString() === new URLSearchParams(location.search).toString();
  }

  /**
   * Itens do menu. Grupos (Venda, Locação, Informações) viram um botão que
   * abre o submenu: padrão "disclosure" (aria-expanded), acessível por teclado.
   * `prefixo` diferencia os ids do menu do computador e do celular.
   */
  function htmlMenu(prefixo) {
    const link = (i) =>
      '<li><a href="' + i.href + '"' + (linkAtual(i.href) ? ' aria-current="page"' : "") + ">" + esc(i.rotulo) + "</a></li>";
    return Elo.MENU.map((item, n) => {
      if (!item.itens) return link(item);
      const id = prefixo + "-sub-" + n;
      const atual = item.itens.some((i) => linkAtual(i.href));
      return (
        '<li class="menu-grupo">' +
        '<button type="button" class="menu-grupo__botao' + (atual ? " atual" : "") + '" aria-expanded="false" aria-controls="' + id + '" data-submenu>' +
        esc(item.rotulo) + icone("chevron-baixo", 16, "menu-grupo__seta") + "</button>" +
        '<ul class="submenu" id="' + id + '">' + item.itens.map(link).join("") + "</ul></li>"
      );
    }).join("");
  }

  function montarCabecalho() {
    const lugar = document.getElementById("topo");
    if (!lugar) return;
    const sessao = Elo.auth.getSession();

    let conta;
    let contaMobile = "";
    if (sessao) {
      const ehCliente = sessao.role === "cliente";
      const area =
        '<a class="botao botao--secundario botao--pequeno" href="' + (ehCliente ? "minha-conta.html" : Elo.auth.homeFor(sessao.role)) + '">' +
        icone(ehCliente ? "pessoa" : "painel", 18) + (ehCliente ? "Minha conta" : "Meu painel") + "</a>";
      const sair = '<button type="button" class="botao botao--neutro botao--pequeno" data-sair>' + icone("sair", 18) + "Sair</button>";
      conta = '<span class="so-largo">' + area + "</span>" + '<span class="so-largo">' + sair + "</span>";
      contaMobile = '<li class="menu-mobile__conta">' + area + sair + "</li>";
    } else {
      conta = '<a class="botao botao--secundario botao--pequeno" href="entrar.html">Entrar</a>';
    }

    lugar.outerHTML =
      '<header class="cabecalho" id="topo">' +
      '<a class="botao botao--primario botao--pequeno pular" href="#conteudo">Pular para o conteúdo</a>' +
      '<div class="container cabecalho__barra">' +
      marca() +
      '<nav class="cabecalho__nav" aria-label="Principal"><ul>' + htmlMenu("nav") + "</ul></nav>" +
      '<div class="cabecalho__acoes">' + conta +
      '<button type="button" class="botao botao--neutro botao--pequeno botao--icone botao-menu" aria-expanded="false" aria-controls="menu-mobile" data-menu>' +
      icone("menu", 22) + '<span class="sr-only">Abrir menu</span></button>' +
      "</div></div>" +
      '<nav class="menu-mobile" id="menu-mobile" aria-label="Principal (menu)" hidden><ul class="container">' +
      htmlMenu("cel") + contaMobile + "</ul></nav></header>";
  }

  /** Abre ou fecha um grupo do menu. */
  function alternarSubmenu(botao, abrir) {
    const grupo = botao.closest(".menu-grupo");
    if (abrir === undefined) abrir = botao.getAttribute("aria-expanded") !== "true";
    botao.setAttribute("aria-expanded", String(abrir));
    grupo.toggleAttribute("data-aberto", abrir);
  }

  /** Fecha os submenus abertos do menu do computador (menos `exceto`). */
  function fecharSubmenus(exceto) {
    document.querySelectorAll('.cabecalho__nav [data-submenu][aria-expanded="true"]').forEach((b) => {
      if (b !== exceto) alternarSubmenu(b, false);
    });
  }

  // Formulário da newsletter (fica no rodapé de todas as páginas).
  document.addEventListener("submit", async (e) => {
    const form = e.target.closest("[data-newsletter]");
    if (!form) return;
    e.preventDefault();
    const campo = form.elements.email;
    const email = campo.value.trim();
    if (!email) return mostrarErro(campo, "Digite seu e-mail.");
    if (!EMAIL.test(email)) return mostrarErro(campo, "Confira o e-mail. Ele precisa ter o formato nome@exemplo.com.");
    const desfazer = botaoCarregando(form.querySelector("button"), "Inscrevendo…");
    try {
      const { jaInscrito } = await Elo.dados.subscribeNewsletter(email);
      form.reset();
      toast(jaInscrito ? "Este e-mail já recebe a newsletter da Elo." : "Pronto! Você vai receber as novidades da Elo por e-mail.");
    } catch {
      toast("Não foi possível fazer a inscrição. Tente de novo em instantes.", { tipo: "erro" });
    } finally {
      desfazer();
    }
  });

  function htmlNewsletter() {
    return (
      '<div class="rodape__news"><div class="container rodape__news-grade">' +
      '<div><h2 class="t-h4" id="news-titulo">Receba as novidades da Elo</h2>' +
      '<p class="t-pequeno" style="margin-top:8px">Imóveis que acabaram de entrar e as matérias do nosso blog, uma vez por mês. Cancele quando quiser. ' +
      'Veja a <a class="link link--claro" href="privacidade.html">Política de Privacidade</a>.</p></div>' +
      '<form class="form-news" data-newsletter novalidate aria-labelledby="news-titulo">' +
      '<div class="campo"><label class="sr-only" for="news-email">Seu e-mail</label>' +
      '<input class="entrada" id="news-email" name="email" type="email" autocomplete="email" placeholder="Seu e-mail" required data-mascara="email" data-validar="email" maxlength="120"></div>' +
      '<button type="submit" class="botao botao--primario">Quero receber</button></form>' +
      "</div></div>"
    );
  }

  function montarRodape() {
    const lugar = document.getElementById("rodape");
    if (!lugar) return;
    const link = (i) => '<li><a href="' + i.href + '">' + esc(i.rotulo) + "</a></li>";
    const s = Elo.SITE;
    lugar.outerHTML =
      '<footer class="rodape" id="rodape">' + htmlNewsletter() +
      '<div class="container rodape__grade">' +
      "<div>" + marca() +
      '<p class="t-pequeno" style="margin-top:24px;max-width:36ch">Compra, venda e locação de imóveis em Presidente Prudente e região.</p>' +
      '<p class="t-meta" style="margin-top:16px">' + institucional(s.creci) + "</p></div>" +
      '<nav aria-label="Imóveis"><h2>Imóveis</h2><ul class="t-pequeno rodape__lista">' +
      [
        { href: "imoveis.html?finalidade=venda", rotulo: "Imóveis à venda" },
        { href: "imoveis.html?finalidade=aluguel", rotulo: "Imóveis para alugar" },
        { href: "imoveis.html?destaque=1", rotulo: "Imóveis em destaque" },
      ].map(link).join("") + "</ul></nav>" +
      '<nav aria-label="Informações"><h2>Informações</h2><ul class="t-pequeno rodape__lista">' +
      [
        ...Elo.MENU.find((m) => m.rotulo === "Informações").itens,
        { href: "contato.html", rotulo: "Contato" },
        { href: "seja-corretor.html", rotulo: "Seja um corretor parceiro" },
        { href: "privacidade.html", rotulo: "Política de Privacidade" },
        { href: "entrar.html", rotulo: "Entrar" },
      ].map(link).join("") + "</ul></nav>" +
      '<div><h2>Contato</h2><ul class="t-pequeno rodape__contato" style="margin-top:16px">' +
      "<li>" + institucional(s.endereco) + "</li><li>" + institucional(s.telefone, "telefone") + "</li><li>WhatsApp: " + institucional(s.whatsapp, "whatsapp") + "</li><li>" + institucional(s.email, "email") + "</li>" +
      "</ul></div></div>" +
      '<div class="rodape__base"><div class="container t-meta">' +
      '<p>© 2026 Elo Imóveis. Todos os direitos reservados. <a class="link" href="privacidade.html">Política de Privacidade</a></p>' +
      "<p>Fotos provisórias de banco de imagens (Unsplash): não retratam os imóveis anunciados.</p>" +
      "</div></div></footer>" +
      // Atalho do WhatsApp: único lugar com o verde (manual, seção 03).
      '<a class="whatsapp" href="https://wa.me/' + s.whatsapp.valor + '" target="_blank" rel="noopener noreferrer" aria-label="Conversar pelo WhatsApp (número a validar)">' +
      '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.82 2.42a8.2 8.2 0 0 1 2.42 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24Zm-3.52 4.4c-.16 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.13.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.29-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.78.97-.15.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.49-.4-.42-.56-.43h-.46Z"/></svg></a>';
  }

  // Menu do celular e botão Sair (delegação: funciona mesmo após redesenhar).
  document.addEventListener("click", (e) => {
    const botaoSub = e.target.closest("[data-submenu]");
    if (botaoSub) {
      fecharSubmenus(botaoSub);
      alternarSubmenu(botaoSub);
      return;
    }
    // Clique fora fecha o submenu aberto no computador.
    if (!e.target.closest(".cabecalho__nav")) fecharSubmenus();

    const botaoMenu = e.target.closest("[data-menu]");
    if (botaoMenu) {
      const menu = document.getElementById("menu-mobile");
      const abrir = menu.hidden;
      menu.hidden = !abrir;
      botaoMenu.setAttribute("aria-expanded", String(abrir));
      botaoMenu.innerHTML = icone(abrir ? "fechar" : "menu", 22) + '<span class="sr-only">' + (abrir ? "Fechar menu" : "Abrir menu") + "</span>";
      return;
    }
    if (e.target.closest("[data-sair]")) {
      Elo.auth.signOut();
      toast("Você saiu da sua conta.");
      setTimeout(() => (location.href = "index.html"), 400);
    }
  });
  // Ao sair do grupo com Tab, o submenu do computador fecha.
  document.addEventListener("focusout", (e) => {
    const grupo = e.target.closest && e.target.closest(".cabecalho__nav .menu-grupo");
    if (grupo && !grupo.contains(e.relatedTarget)) {
      alternarSubmenu(grupo.querySelector("[data-submenu]"), false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    // Esc fecha primeiro o submenu e devolve o foco ao botão dele.
    const aberto = document.querySelector('.cabecalho__nav [data-submenu][aria-expanded="true"]');
    if (aberto && aberto.closest(".menu-grupo").matches(":focus-within")) {
      alternarSubmenu(aberto, false);
      aberto.focus();
      return;
    }
    fecharSubmenus();
    const menu = document.getElementById("menu-mobile");
    if (menu && !menu.hidden) {
      document.querySelector("[data-menu]").click();
      document.querySelector("[data-menu]").focus();
    }
  });

  // ================================================================ toast
  /**
   * Elo.ui.toast("Imóvel salvo nos favoritos", { acao: { rotulo: "Ver favoritos", href: "favoritos.html" } })
   * Elo.ui.toast("Algo deu errado", { tipo: "erro" })
   */
  function toast(mensagem, opcoes = {}) {
    let pilha = document.getElementById("toasts");
    if (!pilha) {
      pilha = document.createElement("div");
      pilha.id = "toasts";
      pilha.className = "toasts";
      pilha.setAttribute("role", "status");
      pilha.setAttribute("aria-live", "polite");
      document.body.appendChild(pilha);
    }
    // No máximo 3 visíveis: o mais antigo sai.
    while (pilha.children.length >= 3) pilha.firstElementChild.remove();

    const item = document.createElement("div");
    item.className = "toast";
    item.innerHTML =
      (opcoes.tipo === "erro" ? icone("alerta", 20, "icone--erro") : icone("check", 20, "icone--ok")) +
      '<p class="toast__texto">' + esc(mensagem) + "</p>" +
      (opcoes.acao ? '<a class="link toast__acao" href="' + esc(opcoes.acao.href) + '">' + esc(opcoes.acao.rotulo) + "</a>" : "") +
      '<button type="button" class="toast__fechar">' + icone("fechar", 18) + '<span class="sr-only">Fechar aviso</span></button>';
    pilha.appendChild(item);

    const fechar = () => {
      if (item.classList.contains("saindo")) return;
      item.classList.add("saindo");
      setTimeout(() => item.remove(), 160);
    };
    item.querySelector(".toast__fechar").addEventListener("click", fechar);
    setTimeout(fechar, opcoes.duracao || 5000);
  }

  // ================================================= diálogo de confirmação
  /**
   * Abre um <dialog> de confirmação. O botão de cancelar recebe o foco
   * (a ação segura é o padrão). Enquanto `aoConfirmar` roda, os botões
   * ficam travados com um indicador de carregando.
   *
   * Elo.ui.confirmar({
   *   titulo: "Excluir o imóvel ELO-1001?",
   *   texto: "<p>Esta ação não pode ser desfeita.</p>",   // HTML já escapado
   *   confirmar: "Excluir imóvel",
   *   cancelar: "Manter imóvel",
   *   aoConfirmar: async () => { await Elo.dados.deleteProperty(id); },
   * });
   */
  function confirmar({ titulo, texto, confirmar, cancelar = "Cancelar", aoConfirmar }) {
    const dialogo = document.createElement("dialog");
    dialogo.className = "modal";
    dialogo.setAttribute("aria-labelledby", "confirma-titulo");
    dialogo.setAttribute("aria-describedby", "confirma-texto");
    dialogo.innerHTML =
      '<div class="modal__corpo">' +
      '<h2 class="t-h4" id="confirma-titulo">' + esc(titulo) + "</h2>" +
      '<div class="t-corpo modal__texto" id="confirma-texto">' + texto + "</div>" +
      '<div class="modal__acoes">' +
      '<button type="button" class="botao botao--neutro" data-cancelar autofocus>' + esc(cancelar) + "</button>" +
      '<button type="button" class="botao botao--perigo" data-confirmar>' + esc(confirmar) + "</button>" +
      "</div></div>";
    document.body.appendChild(dialogo);

    const botaoOk = dialogo.querySelector("[data-confirmar]");
    const botaoCancelar = dialogo.querySelector("[data-cancelar]");
    let ocupado = false;

    const fechar = () => {
      dialogo.close();
      setTimeout(() => dialogo.remove(), 200);
    };
    botaoCancelar.addEventListener("click", () => !ocupado && fechar());
    dialogo.addEventListener("cancel", (e) => {
      e.preventDefault();
      if (!ocupado) fechar();
    });
    dialogo.addEventListener("click", (e) => {
      if (e.target === dialogo && !ocupado) fechar(); // clique fora
    });
    botaoOk.addEventListener("click", async () => {
      ocupado = true;
      botaoOk.disabled = botaoCancelar.disabled = true;
      botaoOk.innerHTML = icone("carregando", 18, "girando") + esc(confirmar);
      try {
        await aoConfirmar();
        fechar();
      } catch (erro) {
        toast(erro.message || "Não foi possível concluir. Tente de novo.", { tipo: "erro" });
        ocupado = false;
        botaoOk.disabled = botaoCancelar.disabled = false;
        botaoOk.textContent = confirmar;
      }
    });
    dialogo.showModal();
  }

  // ======================================================= card de imóvel
  /**
   * HTML de um card, na ordem do manual (seção 07):
   * foto 4:3 → selo (só se verdadeiro) → título → bairro → preço → atributos → link.
   */
  function cardImovel(p, { carregarJa = false } = {}) {
    const areaValor = p.areaConstruida || p.areaTerreno;
    const areaRotulo = p.areaConstruida ? "de área" : "de terreno";
    const atributos = [];
    if (p.dormitorios) atributos.push([("cama"), plural(p.dormitorios, "dormitório", "dormitórios")]);
    if (p.suites) atributos.push(["banheira", plural(p.suites, "suíte", "suítes")]);
    if (p.vagas) atributos.push(["carro", plural(p.vagas, "vaga", "vagas")]);
    if (areaValor) atributos.push(["regua", area(areaValor) + " " + areaRotulo]);

    return (
      '<article class="card sobe">' +
      '<div class="card__foto">' +
      '<img class="aproxima" src="' + esc(foto(p.fotos[0].url, 640)) + '" alt="' + esc(p.fotos[0].alt) + '" loading="' + (carregarJa ? "eager" : "lazy") + '" width="640" height="480">' +
      botaoCoracao(p) +
      // Selo "Vídeo": o anúncio tem vídeo além das fotos.
      (p.videos && p.videos.length ? '<span class="card__video">' + icone("video", 16) + "Vídeo</span>" : "") +
      "</div>" +
      '<div class="card__corpo">' +
      '<p class="t-tag card__tipo">' +
      (p.selo ? '<span class="selo">' + esc(p.selo) + "</span>" : "") +
      "<span>" + esc(Elo.TIPOS[p.tipo]) + " · Cód. " + esc(p.codigo) + "</span></p>" +
      '<h3 class="t-card card__titulo" title="' + esc(p.titulo) + '">' + esc(p.titulo) + "</h3>" +
      '<p class="t-pequeno card__local">' + esc(p.bairro) + ", " + esc(p.cidade) + "/" + esc(p.uf) + "</p>" +
      '<p class="t-preco card__preco">' + preco(p.preco) + (p.finalidade === "aluguel" ? " <small>/mês</small>" : "") + "</p>" +
      (p.condominio ? '<p class="t-meta cor-suave">+ condomínio ' + preco(p.condominio) + "/mês</p>" : "") +
      '<ul class="atributos">' + atributos.map(([i, t]) => "<li>" + icone(i, 18) + t + "</li>").join("") + "</ul>" +
      '<div class="card__acao"><a class="link" href="imovel.html?codigo=' + encodeURIComponent(p.codigo) + '">Ver detalhes do imóvel' + icone("seta-direita", 18, "icone--avanca") + "</a></div>" +
      "</div></article>"
    );
  }

  function gradeCards(lista) {
    return '<ul class="grade-cards">' + lista.map((p, i) => "<li>" + cardImovel(p, { carregarJa: i < 3 }) + "</li>").join("") + "</ul>";
  }

  // ===================================================== coração (favoritar)
  function botaoCoracao(p) {
    return (
      '<button type="button" class="coracao" aria-pressed="false" data-favorito="' + esc(p.id) + '" data-titulo="' + esc(p.titulo) + '">' +
      icone("coracao", 20) + '<span class="sr-only">Salvar nos favoritos: ' + esc(p.titulo) + "</span></button>"
    );
  }

  /**
   * Pinta todos os corações da página conforme a sessão:
   * - cliente: cheio se já salvou;
   * - visitante: vazio (ao tocar, vai para o login);
   * - corretor e admin: o coração some (eles não favoritam).
   */
  function atualizarCoracoes() {
    const sessao = Elo.auth.getSession();
    const salvos = sessao && sessao.role === "cliente" ? Elo.dados.favoriteIds(sessao.userId) : [];
    document.querySelectorAll("[data-favorito]").forEach((botao) => {
      botao.hidden = Boolean(sessao && sessao.role !== "cliente");
      const ligado = salvos.includes(botao.dataset.favorito);
      botao.setAttribute("aria-pressed", String(ligado));
      const titulo = botao.dataset.titulo;
      const comTexto = botao.classList.contains("botao-favorito");
      const textoOculto = botao.querySelector(".sr-only");
      if (textoOculto) textoOculto.textContent = (ligado ? "Remover dos favoritos: " : "Salvar nos favoritos: ") + titulo;
      if (comTexto) botao.querySelector("[data-texto]").textContent = ligado ? "Salvo nos favoritos" : "Salvar nos favoritos";
    });
  }

  document.addEventListener("click", async (e) => {
    const botao = e.target.closest("[data-favorito]");
    if (!botao) return;
    const sessao = Elo.auth.getSession();
    if (!sessao) {
      toast("Entre na sua conta para salvar imóveis.");
      const voltar = location.pathname.split("/").pop() + location.search;
      setTimeout(() => (location.href = "entrar.html?proximo=" + encodeURIComponent(voltar)), 600);
      return;
    }
    try {
      const salvou = await Elo.dados.toggleFavorite(sessao.userId, botao.dataset.favorito);
      if (salvou) {
        botao.classList.remove("acabou-de-salvar");
        void botao.offsetWidth; // reinicia a animação
        botao.classList.add("acabou-de-salvar");
        toast("Imóvel salvo nos favoritos", { acao: { rotulo: "Ver favoritos", href: "favoritos.html" } });
      } else {
        toast("Imóvel removido dos favoritos");
      }
    } catch {
      toast("Não foi possível salvar. Tente de novo.", { tipo: "erro" });
    }
  });

  // ================================================================ estados
  function vazio({ icone: nomeIcone, titulo, texto, acao = "" }) {
    return (
      '<div class="vazio"><span class="vazio__icone">' + icone(nomeIcone, 22) + "</span>" +
      '<h2 class="t-h4">' + esc(titulo) + '</h2><p class="t-corpo">' + esc(texto) + "</p>" + acao + "</div>"
    );
  }

  /** Mostra o erro dentro de `container` com um botão "Tentar de novo". */
  function falha(container, oque, aoTentar) {
    container.innerHTML =
      '<div class="falha" role="alert"><p class="t-corpo">' + icone("alerta", 22) +
      "Não foi possível carregar " + esc(oque) + ". Confira sua conexão e tente de novo.</p>" +
      '<button type="button" class="botao botao--neutro botao--pequeno">' + icone("recarregar", 16) + "Tentar de novo</button></div>";
    container.querySelector("button").addEventListener("click", aoTentar);
  }

  function esqueletoCards(quantos = 6) {
    const um =
      '<li><div class="card-esqueleto" aria-hidden="true"><div class="esqueleto card-esqueleto__foto"></div>' +
      '<div class="card-esqueleto__corpo"><div class="esqueleto linha-esqueleto" style="width:35%"></div>' +
      '<div class="esqueleto linha-esqueleto" style="width:80%;height:24px"></div>' +
      '<div class="esqueleto linha-esqueleto" style="width:50%"></div>' +
      '<div class="esqueleto linha-esqueleto" style="width:40%;height:32px;margin-top:8px"></div></div></div></li>';
    return '<div role="status"><span class="sr-only">Carregando imóveis…</span><ul class="grade-cards">' + um.repeat(quantos) + "</ul></div>";
  }

  function esqueletoLinhas(quantas = 5) {
    const uma =
      '<div style="display:flex;gap:16px;align-items:center;padding:16px 24px" aria-hidden="true">' +
      '<div class="esqueleto" style="width:48px;height:48px"></div><div style="flex:1;display:grid;gap:8px">' +
      '<div class="esqueleto linha-esqueleto" style="width:40%"></div><div class="esqueleto" style="height:12px;width:25%"></div></div></div>';
    return '<div role="status"><span class="sr-only">Carregando…</span>' + uma.repeat(quantas) + "</div>";
  }

  // ============================================================= formulários
  /** Mostra a mensagem de erro logo abaixo do campo e liga ao leitor de tela. */
  function mostrarErro(campo, mensagem) {
    limparErro(campo);
    const id = campo.id + "-erro";
    const p = document.createElement("p");
    p.className = "erro-campo";
    p.id = id;
    p.textContent = mensagem;
    (campo.closest(".campo") || campo.parentElement).appendChild(p);
    campo.setAttribute("aria-invalid", "true");
    campo.setAttribute("aria-describedby", [id, campo.dataset.ajuda].filter(Boolean).join(" "));
  }

  function limparErro(campo) {
    const antigo = document.getElementById(campo.id + "-erro");
    if (antigo) antigo.remove();
    campo.removeAttribute("aria-invalid");
    if (campo.dataset.ajuda) campo.setAttribute("aria-describedby", campo.dataset.ajuda);
    else campo.removeAttribute("aria-describedby");
  }

  /** Ao digitar num campo com erro, o erro some. */
  document.addEventListener("input", (e) => {
    if (e.target.matches && e.target.matches('[aria-invalid="true"]')) limparErro(e.target);
  });

  /** Coloca o botão em modo "carregando" e devolve uma função que desfaz. */
  function botaoCarregando(botao, texto) {
    const original = botao.innerHTML;
    botao.disabled = true;
    botao.innerHTML = icone("carregando", 18, "girando") + esc(texto);
    return () => {
      botao.disabled = false;
      botao.innerHTML = original;
    };
  }

  // ================================================================ vídeos
  /**
   * Lê um link do YouTube ou do Vimeo e devolve { plataforma, id }, ou null.
   * Aceita: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID,
   * youtube.com/embed/ID e vimeo.com/NÚMERO.
   */
  function lerVideo(url) {
    let u;
    try {
      u = new URL(String(url).trim());
    } catch {
      return null;
    }
    const host = u.hostname.replace(/^www\.|^m\./, "");
    const idYoutube = /^[A-Za-z0-9_-]{11}$/;
    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      return idYoutube.test(id) ? { plataforma: "youtube", id } : null;
    }
    if (host === "youtube.com") {
      const id = u.searchParams.get("v") || (u.pathname.match(/^\/(?:shorts|embed|live)\/([^/?#]+)/) || [])[1];
      return id && idYoutube.test(id) ? { plataforma: "youtube", id } : null;
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = (u.pathname.match(/(\d{6,})/) || [])[1];
      return id ? { plataforma: "vimeo", id } : null;
    }
    return null;
  }

  /** Endereço do player embutido (YouTube sem cookies de rastreamento). */
  function videoEmbed(v) {
    return v.plataforma === "vimeo"
      ? "https://player.vimeo.com/video/" + encodeURIComponent(v.id) + "?dnt=1"
      : "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(v.id) + "?rel=0";
  }

  // ================================================ corretores, avaliações, blog
  /** Foto do corretor ou, sem foto, as iniciais do nome. */
  function avatar(nome, tamanho = "", fotoUrl = "") {
    const classe = "avatar" + (tamanho ? " avatar--" + tamanho : "");
    if (fotoUrl) return '<img class="' + classe + '" src="' + esc(fotoUrl) + '" alt="">';
    const iniciais = nome.split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
    return '<span class="' + classe + '" aria-hidden="true">' + esc(iniciais) + "</span>";
  }

  /** Card de corretor com "Saiba mais" levando para corretor.html. */
  function cardCorretor(c) {
    return (
      '<li><article class="card-corretor">' + avatar(c.nome, "", c.foto) +
      '<h3 class="t-card">' + esc(c.nome) + "</h3>" +
      (c.creci ? '<p class="t-meta">' + esc(c.creci) + "</p>" : "") +
      (c.especialidades.length ? '<ul class="etiquetas">' : "<ul hidden>") + c.especialidades.map((e) => '<li class="t-tag">' + esc(e) + "</li>").join("") + "</ul>" +
      '<p class="t-pequeno">' + plural(c.quantidadeImoveis, "imóvel anunciado", "imóveis anunciados") + "</p>" +
      '<a class="botao botao--secundario botao--pequeno" href="corretor.html?id=' + encodeURIComponent(c.id) + '">' +
      'Saiba mais<span class="sr-only"> sobre ' + esc(c.nome) + "</span></a>" +
      "</article></li>"
    );
  }

  /** Nota de 1 a 5 em estrelas, com o número para leitor de tela. */
  function estrelas(nota) {
    let html = '<span class="estrelas" role="img" aria-label="Nota ' + nota + ' de 5">';
    for (let i = 1; i <= 5; i++) html += icone("estrela", 18, i <= nota ? "estrela--cheia" : "estrela--vazia");
    return html + "</span>";
  }

  function cardAvaliacao(a, nomeCorretor) {
    return (
      '<li><figure class="avaliacao">' + estrelas(a.nota) +
      '<blockquote class="t-corpo">' + esc(a.texto) + "</blockquote>" +
      '<figcaption class="t-pequeno"><strong>' + esc(a.nome) + "</strong><br>" + esc(a.contexto) +
      (nomeCorretor ? " · atendido por " + esc(nomeCorretor) : "") + "</figcaption></figure></li>"
    );
  }

  const formatoDataLonga = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const dataLonga = (iso) => formatoDataLonga.format(new Date(iso));

  function cardMateria(m) {
    return (
      '<li><article class="card card-materia">' +
      '<div class="card__foto"><img class="aproxima" src="' + esc(foto(m.foto.url, 640)) + '" alt="" loading="lazy" width="640" height="480"></div>' +
      '<div class="card__corpo">' +
      '<p class="t-meta"><span class="etiqueta-categoria">' + esc(m.categoria) + "</span> " + dataLonga(m.data) + " · " + m.leitura + " min de leitura</p>" +
      '<h3 class="t-card"><a href="materia.html?slug=' + encodeURIComponent(m.slug) + '">' + esc(m.titulo) + "</a></h3>" +
      '<p class="t-pequeno">' + esc(m.resumo) + "</p></div></article></li>"
    );
  }

  // ================================================================ início
  /**
   * Atalhos para o HTML estático:
   *   <span data-icone="mapa"></span>          vira o <svg> do ícone
   *   <button data-icone="busca">Buscar</button>  ganha o ícone antes do texto
   *   <dd data-instituicao="telefone"></dd>     recebe o dado de instituicao.js (com selo A VALIDAR)
   */
  function preencherAtalhos(raiz = document) {
    raiz.querySelectorAll("[data-icone]").forEach((el) => {
      const svg = icone(el.dataset.icone, Number(el.dataset.tamanho) || 18, el.dataset.icone === "seta-direita" ? "icone--avanca" : "");
      if (el.tagName === "SPAN" && !el.textContent.trim()) el.outerHTML = svg;
      else el.insertAdjacentHTML("afterbegin", svg);
      el.removeAttribute("data-icone");
    });
    raiz.querySelectorAll("[data-instituicao]").forEach((el) => {
      el.innerHTML = institucional(Elo.SITE[el.dataset.instituicao], el.dataset.instituicao);
    });
  }

  function iniciar() {
    montarCabecalho();
    montarRodape();
    preencherAtalhos();
    atualizarCoracoes();
    // Aviso deixado pela página anterior (ex.: "Imóvel cadastrado com o código ELO-1013.")
    const aviso = sessionStorage.getItem("elo:aviso");
    if (aviso) {
      sessionStorage.removeItem("elo:aviso");
      setTimeout(() => toast(aviso), 300);
    }
  }

  // Quando a sessão ou os favoritos mudam: redesenha o cabeçalho e os corações.
  Elo.dados.aoMudar(() => {
    const menuAberto = document.getElementById("menu-mobile") && !document.getElementById("menu-mobile").hidden;
    const topo = document.getElementById("topo");
    if (topo && topo.tagName === "HEADER" && !menuAberto) {
      topo.outerHTML = '<div id="topo"></div>';
      montarCabecalho();
    }
    atualizarCoracoes();
  });

  Elo.ui = {
    esc,
    preco,
    area,
    plural,
    data,
    foto,
    param,
    EMAIL,
    institucional,
    marca,
    toast,
    confirmar,
    cardImovel,
    gradeCards,
    botaoCoracao,
    atualizarCoracoes,
    vazio,
    falha,
    esqueletoCards,
    esqueletoLinhas,
    mostrarErro,
    limparErro,
    botaoCarregando,
    lerVideo,
    videoEmbed,
    avatar,
    cardCorretor,
    estrelas,
    cardAvaliacao,
    dataLonga,
    cardMateria,
    preencherAtalhos,
    iniciar,
  };

  // Scripts carregam no fim do <body>, então a página já existe aqui.
  iniciar();
})();

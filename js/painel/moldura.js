/**
 * MOLDURA DO PAINEL (todas as páginas painel-*.html)
 * ------------------------------------------------------------------
 * Monta o cabeçalho e o menu lateral, e decide quem pode ver a página:
 *   - ninguém logado       -> convite para entrar
 *   - cliente              -> aviso de que o painel é da equipe
 *   - página só de admin   -> aviso para o corretor
 *
 * ATENÇÃO: isto é só UX. Quem protege os dados de verdade é o banco (RLS).
 *
 * Cada página do painel chama:
 *   Elo.painel.iniciar({ somenteAdmin: false }, function (sessao, tela) { ... desenha a tela ... });
 */
window.Elo = window.Elo || {};

(function () {
  const { esc } = Elo.ui;
  const icone = Elo.icone;

  // `contar` devolve o número do selo ao lado do item (0 = sem selo).
  const ITENS = [
    { href: "painel-imoveis.html", rotulo: "Imóveis", icone: "predio", perfis: ["corretor", "admin"], tambem: ["painel-imovel.html"] },
    { href: "painel-favoritos.html", rotulo: "Favoritos", icone: "coracao", perfis: ["corretor", "admin"] },
    {
      href: "painel-notificacoes.html", rotulo: "Notificações", icone: "mensagem", perfis: ["corretor", "admin"],
      contar: () => Elo.dados.unreadNotificationsCount(), descricaoContagem: "não lidas",
    },
    { href: "painel-perfil.html", rotulo: "Meu perfil", icone: "pessoa", perfis: ["corretor"] },
    {
      href: "painel-solicitacoes.html", rotulo: "Solicitações", icone: "convidar", perfis: ["admin"],
      contar: () => Elo.dados.pendingRequestsCount(), descricaoContagem: "aguardando resposta",
    },
    { href: "painel-corretores.html", rotulo: "Corretores", icone: "pessoa", perfis: ["admin"] },
    { href: "painel-clientes.html", rotulo: "Clientes", icone: "pessoas", perfis: ["admin"] },
    { href: "painel-empresa.html", rotulo: "Dados da Elo", icone: "predio", perfis: ["admin"] },
    // Abre numa aba nova do navegador, para editar o blog sem perder o painel.
    { href: "painel-blog.html", rotulo: "Gerenciar blog", icone: "lapis", perfis: ["admin"], novaAba: true },
  ];

  const paginaAtual = () => location.pathname.split("/").pop();

  function itensDoMenu(sessao) {
    return ITENS.filter((i) => i.perfis.includes(sessao.role))
      .map((i) => {
        const ativo = i.href === paginaAtual() || (i.tambem || []).includes(paginaAtual());
        const n = i.contar ? i.contar() : 0;
        const selo = n ? '<span class="contador" aria-hidden="true">' + n + '</span><span class="sr-only">, ' + n + " " + i.descricaoContagem + "</span>" : "";
        const novaAba = i.novaAba && !ativo
          ? ' target="_blank" rel="noopener"'
          : "";
        const avisoAba = i.novaAba && !ativo ? icone("link-externo", 14, "item-menu__externo") + '<span class="sr-only"> (abre em nova aba)</span>' : "";
        return '<li><a class="item-menu" href="' + i.href + '"' + novaAba + (ativo ? ' aria-current="page"' : "") + ">" + icone(i.icone, 18) + i.rotulo + selo + avisoAba + "</a></li>";
      })
      .join("");
  }

  /** Redesenha o menu (ex.: depois de ler as notificações ou responder uma solicitação). */
  function atualizarMenu() {
    const sessao = Elo.auth.getSession();
    if (!sessao) return;
    document.querySelectorAll(".painel__abas ul, #painel-menu ul").forEach((lista) => (lista.innerHTML = itensDoMenu(sessao)));
  }
  Elo.dados.aoMudar(atualizarMenu);

  function montarTopo(sessao) {
    const podeVer = sessao && sessao.role !== "cliente";
    document.getElementById("painel-topo").outerHTML =
      '<header class="painel__topo">' +
      '<a class="botao botao--primario botao--pequeno pular" href="#conteudo">Pular para o conteúdo</a>' +
      '<div class="container painel__barra">' +
      '<div class="painel__marca">' + Elo.ui.marca() + '<span class="t-tag painel__etiqueta">Painel</span></div>' +
      '<div class="painel__acoes">' +
      (podeVer
        ? '<p class="t-pequeno painel__usuario"><span class="cor-tinta negrito" style="display:block">' + esc(sessao.nome) + "</span>" + Elo.auth.NOMES_PERFIL[sessao.role] + "</p>"
        : "") +
      '<a class="botao botao--neutro botao--pequeno" href="index.html">' + icone("link-externo", 16) + "Ver o site</a>" +
      (sessao ? '<button type="button" class="botao botao--neutro botao--pequeno" id="painel-sair">' + icone("sair", 16) + "Sair</button>" : "") +
      "</div></div>" +
      (podeVer ? '<nav class="painel__abas" aria-label="Painel"><ul class="container">' + itensDoMenu(sessao) + "</ul></nav>" : "") +
      "</header>";

    const sair = document.getElementById("painel-sair");
    if (sair) {
      sair.addEventListener("click", () => {
        Elo.auth.signOut();
        Elo.ui.toast("Você saiu da sua conta.");
        setTimeout(() => (location.href = "index.html"), 400);
      });
    }

    const menu = document.getElementById("painel-menu");
    if (podeVer) menu.innerHTML = "<ul>" + itensDoMenu(sessao) + "</ul>";
    else menu.remove();
  }

  function iniciar({ somenteAdmin = false, somenteCorretor = false } = {}, desenhar) {
    const sessao = Elo.auth.getSession();
    montarTopo(sessao);
    const tela = document.getElementById("tela");

    if (!sessao) {
      tela.innerHTML = Elo.ui.vazio({
        icone: "entrar",
        titulo: "Entre para acessar o painel",
        texto: "O painel é a área de trabalho dos corretores e da administração da Elo.",
        acao: '<a class="botao botao--primario" href="entrar.html">Entrar na conta</a>',
      });
      return;
    }
    if (sessao.role === "cliente") {
      tela.innerHTML = Elo.ui.vazio({
        icone: "cadeado",
        titulo: "O painel é só para a equipe da Elo",
        texto: "Você entrou com uma conta de cliente. Seus imóveis salvos estão em Meus favoritos.",
        acao: '<a class="botao botao--primario" href="favoritos.html">Ir para Meus favoritos</a>',
      });
      return;
    }
    if (somenteAdmin && sessao.role !== "admin") {
      tela.innerHTML = Elo.ui.vazio({
        icone: "cadeado",
        titulo: "Esta área é só da administração",
        texto: "Corretores cadastram e editam imóveis. A gestão de corretores e clientes fica com o administrador.",
        acao: '<a class="botao botao--primario" href="painel-imoveis.html">Voltar para os imóveis</a>',
      });
      return;
    }
    if (somenteCorretor && sessao.role !== "corretor") {
      tela.innerHTML = Elo.ui.vazio({
        icone: "pessoa",
        titulo: "Esta página é do corretor",
        texto: "Aqui cada corretor preenche os dados do próprio perfil público. A administração vê os corretores em Corretores.",
        acao: '<a class="botao botao--primario" href="painel-corretores.html">Ir para Corretores</a>',
      });
      return;
    }
    desenhar(sessao, tela);
  }

  Elo.painel = { iniciar };
})();

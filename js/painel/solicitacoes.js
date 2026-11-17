/**
 * PAINEL > SOLICITAÇÕES (painel-solicitacoes.html) — só administrador
 * ------------------------------------------------------------------
 * Corretores que pediram acesso em seja-corretor.html. Aprovar libera o
 * painel para ele; recusar mantém a conta bloqueada.
 */
Elo.painel.iniciar({ somenteAdmin: true }, function (sessao, tela) {
  const { esc, data } = Elo.ui;
  const icone = Elo.icone;

  tela.innerHTML =
    '<div class="tela-cabeca"><div><h1 class="t-h2">Solicitações de corretores</h1>' +
    '<p class="t-corpo" id="resumo" aria-live="polite">Carregando…</p></div>' +
    '<a class="botao botao--secundario" href="painel-corretores.html">' + icone("convidar", 18) + "Cadastrar corretor direto</a></div>" +
    '<p class="t-pequeno" style="margin-top:8px">Antes de aprovar, confira o CRECI no ' +
    '<a class="link" href="https://www.crecisp.gov.br" target="_blank" rel="noopener noreferrer">site do CRECI-SP</a>.</p>' +
    '<div id="lista" style="margin-top:24px"></div>';

  const lista = document.getElementById("lista");
  const resumo = document.getElementById("resumo");

  async function carregar() {
    lista.innerHTML = '<div class="caixa">' + Elo.ui.esqueletoLinhas(3) + "</div>";
    try {
      const pedidos = await Elo.dados.listBrokerRequests();
      resumo.textContent = pedidos.length
        ? Elo.ui.plural(pedidos.length, "solicitação aguardando", "solicitações aguardando") + " resposta."
        : "Nenhuma solicitação aguardando resposta.";
      if (!pedidos.length) {
        lista.innerHTML = Elo.ui.vazio({
          icone: "check",
          titulo: "Tudo respondido",
          texto: "Quando um corretor pedir acesso pelo site, a solicitação aparece aqui.",
        });
        return;
      }
      lista.innerHTML = '<ul class="lista-pedidos">' + pedidos.map(cartao).join("") + "</ul>";
    } catch {
      resumo.textContent = "";
      Elo.ui.falha(lista, "as solicitações", carregar);
    }
  }

  function cartao(u) {
    return (
      '<li class="caixa caixa--espaco pedido">' +
      '<div class="pedido__cabeca">' + Elo.ui.avatar(u.nome) +
      '<div><h2 class="t-h4">' + esc(u.nome) + "</h2>" +
      '<p class="t-pequeno cor-suave">Pediu acesso em ' + data(u.criadoEm) + "</p></div>" +
      '<span class="situacao situacao--pendente">Aguardando</span></div>' +
      '<dl class="pedido__dados t-pequeno">' +
      "<div><dt>E-mail</dt><dd>" + esc(u.email) + "</dd></div>" +
      "<div><dt>Telefone</dt><dd>" + esc(u.telefone || "Não informado") + "</dd></div>" +
      "<div><dt>CRECI</dt><dd>" + esc(u.creci || "Não informado") + "</dd></div>" +
      "</dl>" +
      (u.mensagem ? '<blockquote class="t-corpo pedido__mensagem">' + esc(u.mensagem) + "</blockquote>" : "") +
      '<div class="acoes-linha" style="justify-content:flex-start">' +
      '<button type="button" class="botao botao--primario botao--pequeno" data-aprovar="' + esc(u.id) + '" data-nome="' + esc(u.nome) + '">' +
      icone("check", 16) + 'Aprovar<span class="sr-only"> ' + esc(u.nome) + "</span></button>" +
      '<button type="button" class="botao botao--neutro botao--pequeno" data-recusar="' + esc(u.id) + '" data-nome="' + esc(u.nome) + '">' +
      'Recusar<span class="sr-only"> ' + esc(u.nome) + "</span></button>" +
      "</div></li>"
    );
  }

  lista.addEventListener("click", async (e) => {
    const aprovar = e.target.closest("[data-aprovar]");
    const recusar = e.target.closest("[data-recusar]");
    if (aprovar) {
      const desfazer = Elo.ui.botaoCarregando(aprovar, "Aprovando…");
      try {
        await Elo.dados.approveBroker(aprovar.dataset.aprovar);
        Elo.ui.toast(aprovar.dataset.nome + " foi aprovado e já pode entrar no painel.");
        carregar();
      } catch (erro) {
        desfazer();
        Elo.ui.toast(erro.message, { tipo: "erro" });
      }
    }
    if (recusar) {
      const nome = recusar.dataset.nome;
      Elo.ui.confirmar({
        titulo: "Recusar a solicitação de " + nome + "?",
        texto: "<p>Ele não vai conseguir entrar no painel. Se mudar de ideia, cadastre o corretor direto em Corretores.</p>",
        confirmar: "Recusar solicitação",
        cancelar: "Voltar",
        aoConfirmar: async () => {
          await Elo.dados.rejectBroker(recusar.dataset.recusar);
          Elo.ui.toast("Solicitação de " + nome + " recusada.");
          carregar();
        },
      });
    }
  });

  carregar();
});

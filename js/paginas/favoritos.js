/**
 * MEUS FAVORITOS (favoritos.html)
 * Visitante vê o convite para entrar; corretor e admin são lembrados de que
 * favoritos são da conta de cliente; cliente vê seus imóveis salvos.
 * Ao tirar o coração de um imóvel aqui, ele some da lista.
 */
(function () {
  const { vazio, esc, plural } = Elo.ui;
  const lugar = document.getElementById("favoritos");
  const resumo = document.getElementById("resumo");

  async function carregar() {
    const sessao = Elo.auth.getSession();

    if (!sessao) {
      lugar.innerHTML = vazio({
        icone: "entrar",
        titulo: "Entre para ver seus favoritos",
        texto: "Os imóveis que você salva ficam guardados na sua conta e continuam aqui quando você voltar.",
        acao: '<a class="botao botao--primario" href="entrar.html?proximo=favoritos.html">Entrar na conta</a>',
      });
      return;
    }

    if (sessao.role !== "cliente") {
      lugar.innerHTML = vazio({
        icone: "coracao",
        titulo: "Favoritos são da conta de cliente",
        texto: "Você entrou como " + (sessao.role === "admin" ? "administrador" : "corretor") + ". Para salvar imóveis, entre com uma conta de cliente.",
        acao: '<a class="botao botao--primario" href="painel-imoveis.html">Ir para o painel</a>',
      });
      return;
    }

    if (!lugar.querySelector(".grade-cards")) lugar.innerHTML = Elo.ui.esqueletoCards(3);
    try {
      const lista = await Elo.dados.listFavorites(sessao.userId);
      if (!lista.length) {
        resumo.textContent = "Conta de " + sessao.nome + ".";
        lugar.innerHTML = vazio({
          icone: "coracao",
          titulo: "Você ainda não salvou nenhum imóvel",
          texto: "Toque no coração de um imóvel para guardá-lo aqui e comparar com calma depois.",
          acao: '<a class="botao botao--primario" href="imoveis.html">Buscar imóveis</a>',
        });
        return;
      }
      resumo.textContent = plural(lista.length, "imóvel salvo", "imóveis salvos") + " na conta de " + sessao.nome + ".";
      lugar.innerHTML = Elo.ui.gradeCards(lista);
      Elo.ui.atualizarCoracoes();
    } catch {
      Elo.ui.falha(lugar, "seus favoritos", carregar);
    }
  }

  carregar();
  // Tirou o coração aqui? Recarrega a lista.
  Elo.dados.aoMudar(carregar);
})();

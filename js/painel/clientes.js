/**
 * PAINEL > CLIENTES (painel-clientes.html) — só administrador
 * Lista de quem criou cadastro no site, com quantos imóveis salvou.
 */
Elo.painel.iniciar({ somenteAdmin: true }, function (sessao, tela) {
  const { esc, plural, data } = Elo.ui;

  tela.innerHTML =
    '<h1 class="t-h2">Clientes</h1>' +
    '<p class="t-corpo" id="resumo" aria-live="polite" style="margin-top:4px">Carregando…</p>' +
    '<div id="lista" style="margin-top:24px"></div>';

  const lista = document.getElementById("lista");
  const resumo = document.getElementById("resumo");

  async function carregar() {
    lista.innerHTML = '<div class="caixa">' + Elo.ui.esqueletoLinhas(4) + "</div>";
    try {
      const clientes = await Elo.dados.listUsers("cliente");
      const favoritos = Elo.dados.favoriteCounts();
      resumo.textContent = plural(clientes.length, "cliente cadastrado", "clientes cadastrados") + " pelo site.";
      if (!clientes.length) {
        lista.innerHTML = Elo.ui.vazio({
          icone: "pessoas",
          titulo: "Nenhum cliente cadastrado ainda",
          texto: "Quando alguém criar um cadastro no site para salvar imóveis, aparece aqui.",
        });
        return;
      }
      lista.innerHTML =
        '<div class="caixa" style="overflow:hidden"><table class="tabela"><caption class="sr-only">Clientes cadastrados</caption>' +
        '<thead><tr><th scope="col">Cliente</th><th scope="col">Telefone</th><th scope="col" class="direita">Favoritos</th><th scope="col" class="direita">Cadastro</th></tr></thead><tbody>' +
        clientes
          .map(
            (u) =>
              "<tr>" +
              '<th scope="row"><span class="imovel-linha__titulo">' + esc(u.nome) + '</span><span class="cor-suave" style="display:block;word-break:break-all">' + esc(u.email) + "</span></th>" +
              '<td class="numero"><span class="rotulo-celular">Telefone: </span>' + esc(u.telefone || "Não informado") + "</td>" +
              '<td class="direita numero"><span class="rotulo-celular">Favoritos: </span>' + (favoritos[u.id] || 0) + "</td>" +
              '<td class="direita numero"><span class="rotulo-celular">Cadastro: </span>' + data(u.criadoEm) + "</td>" +
              "</tr>",
          )
          .join("") +
        "</tbody></table></div>";
    } catch {
      resumo.textContent = "";
      Elo.ui.falha(lista, "os clientes", carregar);
    }
  }

  carregar();
});

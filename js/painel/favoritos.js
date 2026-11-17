/**
 * PAINEL > FAVORITOS (painel-favoritos.html)
 * ------------------------------------------------------------------
 * Quantas e quais pessoas salvaram cada imóvel.
 *   Corretor: só os imóveis que ele cadastrou.
 *   Admin:    todos, com filtro por corretor.
 * A regra fica em Elo.dados.favoritesReport (TODO de RLS no backend).
 */
Elo.painel.iniciar({}, function (sessao, tela) {
  const { esc, data, plural, foto } = Elo.ui;
  const ehAdmin = sessao.role === "admin";
  const corretores = Elo.dados.brokerNames();

  tela.innerHTML =
    '<div class="tela-cabeca"><div>' +
    '<h1 class="t-h2">' + (ehAdmin ? "Favoritos dos clientes" : "Quem favoritou meus imóveis") + "</h1>" +
    '<p class="t-corpo" id="resumo" aria-live="polite">Carregando…</p></div>' +
    (ehAdmin
      ? '<div><label class="rotulo" for="f-corretor">Corretor</label><select class="entrada" id="f-corretor"><option value="">Todos os corretores</option>' +
        Object.entries(corretores)
          .filter(([id]) => id !== "u-admin")
          .map(([id, nome]) => '<option value="' + esc(id) + '">' + esc(nome) + "</option>")
          .join("") +
        "</select></div>"
      : "") +
    "</div>" +
    '<p class="t-pequeno" style="margin-top:8px">Use estes contatos só para falar sobre o imóvel que a pessoa salvou.</p>' +
    '<div id="lista" style="margin-top:24px"></div>';

  const lista = document.getElementById("lista");
  const resumo = document.getElementById("resumo");
  const filtro = document.getElementById("f-corretor");

  async function carregar() {
    lista.innerHTML = '<div class="caixa">' + Elo.ui.esqueletoLinhas(4) + "</div>";
    try {
      const relatorio = await Elo.dados.favoritesReport({ corretorId: filtro ? filtro.value : undefined });
      const pessoas = new Set(relatorio.flatMap((x) => x.clientes.map((c) => c.id))).size;
      const total = relatorio.reduce((n, x) => n + x.clientes.length, 0);
      resumo.textContent = relatorio.length
        ? plural(total, "favorito", "favoritos") + " em " + plural(relatorio.length, "imóvel", "imóveis") + ", de " + plural(pessoas, "pessoa", "pessoas") + "."
        : "";
      if (!relatorio.length) {
        lista.innerHTML = Elo.ui.vazio({
          icone: "coracao",
          titulo: "Nenhum imóvel favoritado ainda",
          texto: ehAdmin
            ? "Quando um cliente salvar um imóvel, ele aparece aqui com o nome de quem salvou."
            : "Quando um cliente salvar um dos seus imóveis, você vê aqui quem foi e recebe uma notificação.",
        });
        return;
      }
      lista.innerHTML = '<ul class="lista-favoritados">' + relatorio.map(item).join("") + "</ul>";
    } catch {
      resumo.textContent = "";
      Elo.ui.falha(lista, "os favoritos", carregar);
    }
  }

  function item({ imovel: p, clientes }) {
    return (
      '<li class="caixa favoritado">' +
      '<div class="favoritado__imovel">' +
      '<span class="miniatura">' + (p.fotos[0] ? '<img src="' + esc(foto(p.fotos[0].url, 120)) + '" alt="">' : "") + "</span>" +
      "<div><p class=\"imovel-linha__titulo\">" + esc(p.titulo) + "</p>" +
      '<p class="t-pequeno cor-suave">' + esc(p.codigo) + " · " + esc(p.bairro) +
      (ehAdmin ? " · Corretor: " + esc(corretores[p.corretorId] || "sem corretor") : "") + "</p></div>" +
      '<span class="favoritado__total">' + Elo.icone("coracao", 16) + plural(clientes.length, "pessoa", "pessoas") + "</span></div>" +
      '<details class="favoritado__quem"><summary>Ver quem salvou</summary>' +
      '<table class="tabela tabela--simples"><caption class="sr-only">Quem salvou ' + esc(p.codigo) + "</caption>" +
      '<thead><tr><th scope="col">Cliente</th><th scope="col">Telefone</th><th scope="col" class="direita">Salvou em</th></tr></thead><tbody>' +
      clientes
        .map(
          (c) =>
            '<tr><th scope="row"><span class="imovel-linha__titulo">' + esc(c.nome) + '</span><span class="cor-suave" style="display:block;word-break:break-all">' + esc(c.email) + "</span></th>" +
            '<td class="numero"><span class="rotulo-celular">Telefone: </span>' + esc(c.telefone || "Não informado") + "</td>" +
            '<td class="direita numero"><span class="rotulo-celular">Salvou em: </span>' + (c.em ? data(c.em) : "—") + "</td></tr>",
        )
        .join("") +
      "</tbody></table></details></li>"
    );
  }

  if (filtro) filtro.addEventListener("change", carregar);
  carregar();
});

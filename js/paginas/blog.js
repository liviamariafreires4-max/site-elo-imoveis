/**
 * BLOG / NOTÍCIAS (blog.html, blog.html?categoria=Compra)
 * Lista as matérias com filtro por categoria. A categoria fica na URL,
 * então o link pode ser compartilhado já filtrado.
 */
(function () {
  const { esc, param } = Elo.ui;
  const lista = document.getElementById("materias");
  const botoes = document.getElementById("categorias");
  const resumo = document.getElementById("resumo-blog");
  let categoria = param("categoria") || "";

  // Categorias saem das próprias matérias, na ordem em que aparecem.
  const categorias = Elo.dados.categoriasBlog(); // inclui as criadas pelo admin

  function desenharBotoes() {
    botoes.innerHTML = ["", ...categorias]
      .map(
        (c) =>
          '<button type="button" class="botao botao--pequeno ' + (c === categoria ? "botao--secundario" : "botao--neutro") + '"' +
          ' aria-pressed="' + (c === categoria) + '" data-categoria="' + esc(c) + '">' + (c ? esc(c) : "Todas") + "</button>",
      )
      .join("");
  }

  botoes.addEventListener("click", (e) => {
    const b = e.target.closest("[data-categoria]");
    if (!b) return;
    categoria = b.dataset.categoria;
    const url = new URL(location.href);
    if (categoria) url.searchParams.set("categoria", categoria);
    else url.searchParams.delete("categoria");
    history.replaceState(null, "", url);
    desenharBotoes();
    carregar();
  });

  async function carregar() {
    lista.innerHTML = Elo.ui.esqueletoCards(3);
    try {
      const materias = await Elo.dados.listPosts({ categoria });
      resumo.textContent = Elo.ui.plural(materias.length, "matéria", "matérias") + (categoria ? " em " + categoria : "");
      lista.innerHTML = materias.length
        ? '<ul class="grade-cards">' + materias.map(Elo.ui.cardMateria).join("") + "</ul>"
        : Elo.ui.vazio({ icone: "busca-vazia", titulo: "Nenhuma matéria nesta categoria", texto: "Escolha outra categoria ou veja todas." });
    } catch {
      Elo.ui.falha(lista, "as matérias", carregar);
    }
  }

  desenharBotoes();
  carregar();
})();

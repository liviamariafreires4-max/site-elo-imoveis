/**
 * MATÉRIA DO BLOG (materia.html?slug=documentos-para-comprar-imovel)
 * O texto vem de Elo.dados.getPost (as matérias que o admin edita em painel-blog.html).
 */
(function () {
  const { esc, param, foto } = Elo.ui;
  const icone = Elo.icone;
  const lugar = document.getElementById("materia");
  const slug = param("slug") || "";

  /** Converte os blocos do `corpo` em HTML. */
  function bloco(b) {
    if (typeof b === "string") return '<p class="t-corpo">' + esc(b) + "</p>";
    if (b.titulo) return '<h2 class="t-h3">' + esc(b.titulo) + "</h2>";
    if (b.lista) return '<ul class="t-corpo">' + b.lista.map((i) => "<li>" + esc(i) + "</li>").join("") + "</ul>";
    return "";
  }

  async function carregar() {
    lugar.innerHTML = Elo.ui.esqueletoLinhas(4);
    try {
      const m = await Elo.dados.getPost(slug);
      if (!m) return naoEncontrada();
      const outras = (await Elo.dados.listPosts()).filter((x) => x.slug !== m.slug).slice(0, 3);
      desenhar(m, outras);
    } catch {
      Elo.ui.falha(lugar, "esta matéria", carregar);
    }
  }

  function naoEncontrada() {
    document.title = "Matéria não encontrada | Elo Imóveis";
    lugar.innerHTML = Elo.ui.vazio({
      icone: "busca-vazia",
      titulo: "Não encontramos esta matéria",
      texto: "Ela pode ter sido removida ou o link pode estar incorreto.",
      acao: '<a class="botao botao--primario" href="blog.html">Ver todas as matérias</a>',
    });
  }

  function desenhar(m, outras) {
    document.title = m.titulo + " | Elo Imóveis";
    lugar.innerHTML =
      '<nav class="migalhas t-meta" aria-label="Você está em"><ol>' +
      '<li class="com-selo"><a href="index.html">Início</a>' + icone("chevron-direita", 14) + "</li>" +
      '<li class="com-selo"><a href="blog.html">Notícias</a>' + icone("chevron-direita", 14) + "</li>" +
      '<li aria-current="page">' + esc(m.categoria) + "</li></ol></nav>" +

      '<article class="materia">' +
      '<header class="entrada-hero">' +
      '<p class="t-meta"><a class="etiqueta-categoria" href="blog.html?categoria=' + encodeURIComponent(m.categoria) + '">' + esc(m.categoria) + "</a> " +
      Elo.ui.dataLonga(m.data) + " · " + m.leitura + " min de leitura</p>" +
      '<h1 class="t-h1" style="margin-top:16px">' + esc(m.titulo) + "</h1>" +
      '<p class="t-lead" style="margin-top:16px">' + esc(m.resumo) + "</p>" +
      '<p class="t-pequeno" style="margin-top:16px">Por ' + esc(m.autor) + ' <span class="a-validar">TEXTO DE EXEMPLO</span></p>' +
      "</header>" +
      '<img class="materia__foto" src="' + esc(foto(m.foto.url, 1200)) + '" alt="' + esc(m.foto.alt) + '" width="1200" height="675">' +
      '<div class="materia__texto">' + m.corpo.map(bloco).join("") + "</div>" +
      '<div class="caixa-borda materia__fim">' +
      '<p class="t-corpo">Ficou com alguma dúvida? Fale com um corretor da Elo.</p>' +
      '<a class="botao botao--primario" href="contato.html">Falar com a Elo</a></div>' +
      "</article>" +

      (outras.length
        ? '<section class="secao" style="padding-bottom:0" aria-labelledby="outras-titulo">' +
          '<h2 class="t-h2" id="outras-titulo">Leia também</h2>' +
          '<ul class="grade-cards" style="margin-top:32px">' + outras.map(Elo.ui.cardMateria).join("") + "</ul></section>"
        : "");
  }

  carregar();
})();

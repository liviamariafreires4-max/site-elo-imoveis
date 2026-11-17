/**
 * PÁGINA DO CORRETOR (corretor.html?id=u-corretor-1)
 * O "Saiba mais" da home leva para cá: apresentação, contato,
 * imóveis que ele atende e avaliações de clientes.
 */
(function () {
  const { esc, param } = Elo.ui;
  const icone = Elo.icone;
  const lugar = document.getElementById("corretor");
  const id = param("id") || "";

  async function carregar() {
    lugar.innerHTML = Elo.ui.esqueletoLinhas(3);
    try {
      const c = await Elo.dados.getBroker(id);
      if (!c) return naoEncontrado();
      const [imoveis, avaliacoes] = await Promise.all([
        Elo.dados.listProperties({ corretorId: c.id }),
        Elo.dados.listTestimonials(c.id),
      ]);
      desenhar(c, imoveis, avaliacoes);
    } catch {
      Elo.ui.falha(lugar, "o perfil do corretor", carregar);
    }
  }

  function naoEncontrado() {
    document.title = "Corretor não encontrado | Elo Imóveis";
    lugar.innerHTML = Elo.ui.vazio({
      icone: "pessoa",
      titulo: "Não encontramos este corretor",
      texto: "Ele pode não fazer mais parte da equipe ou o link pode estar incorreto.",
      acao: '<a class="botao botao--primario" href="index.html#corretores-titulo">Ver todos os corretores</a>',
    });
  }

  function desenhar(c, imoveis, avaliacoes) {
    document.title = c.nome + ", corretor | Elo Imóveis";
    const anos = c.desde ? new Date().getFullYear() - c.desde : null;
    const whatsapp =
      "https://wa.me/" + (c.whatsapp || Elo.SITE.whatsapp.valor) + "?text=" +
      encodeURIComponent("Olá, " + c.nome.split(" ")[0] + "! Vi seu perfil no site da Elo Imóveis.");

    lugar.innerHTML =
      '<nav class="migalhas t-meta" aria-label="Você está em"><ol>' +
      '<li class="com-selo"><a href="index.html">Início</a>' + icone("chevron-direita", 14) + "</li>" +
      '<li class="com-selo"><a href="index.html#corretores-titulo">Corretores</a>' + icone("chevron-direita", 14) + "</li>" +
      '<li aria-current="page">' + esc(c.nome) + "</li></ol></nav>" +

      '<section class="perfil-corretor entrada-hero" aria-labelledby="nome-corretor">' +
      Elo.ui.avatar(c.nome, "grande", c.foto) +
      "<div>" +
      '<h1 class="t-h1" id="nome-corretor">' + esc(c.nome) + "</h1>" +
      (c.creci ? '<p class="t-meta" style="margin-top:8px">' + esc(c.creci) + "</p>" : "") +
      '<p class="t-lead" style="margin-top:24px;max-width:60ch">' + esc(c.bio) + "</p>" +
      '<ul class="etiquetas" style="margin-top:24px">' + c.especialidades.map((e) => '<li class="t-tag">' + esc(e) + "</li>").join("") + "</ul>" +
      '<dl class="numeros-corretor">' +
      (anos ? "<div><dt class=\"t-pequeno\">Na profissão</dt><dd class=\"t-h3\">" + Elo.ui.plural(anos, "ano", "anos") + "</dd></div>" : "") +
      '<div><dt class="t-pequeno">Imóveis anunciados</dt><dd class="t-h3">' + imoveis.length + "</dd></div>" +
      (avaliacoes.length
        ? '<div><dt class="t-pequeno">Avaliações</dt><dd class="t-h3">' + avaliacoes.length + "</dd></div>"
        : "") +
      "</dl>" +
      '<div class="acoes-corretor">' +
      '<a class="botao botao--primario" href="' + whatsapp + '" target="_blank" rel="noopener noreferrer">' + icone("mensagem", 18) + "Conversar pelo WhatsApp</a>" +
      '<a class="botao botao--secundario" href="contato.html">Enviar mensagem</a>' +
      "</div></div></section>" +

      '<section class="secao" style="padding-bottom:0" aria-labelledby="imoveis-corretor">' +
      '<h2 class="t-h2" id="imoveis-corretor">Imóveis de ' + esc(c.nome.split(" ")[0]) + "</h2>" +
      '<div style="margin-top:32px">' +
      (imoveis.length
        ? Elo.ui.gradeCards(imoveis)
        : '<p class="t-corpo">Nenhum imóvel anunciado no momento.</p>') +
      "</div></section>" +

      (avaliacoes.length
        ? '<section class="secao" style="padding-bottom:0" aria-labelledby="avaliacoes-corretor">' +
          '<h2 class="t-h2" id="avaliacoes-corretor">O que dizem os clientes</h2>' +
          '<p class="t-pequeno com-selo" style="margin-top:8px">Depoimentos de exemplo, para o layout <span class="a-validar">A VALIDAR</span></p>' +
          '<ul class="grade-avaliacoes grade-avaliacoes--2">' + avaliacoes.map((a) => Elo.ui.cardAvaliacao(a)).join("") + "</ul></section>"
        : "");

    Elo.ui.atualizarCoracoes();
  }

  carregar();
})();

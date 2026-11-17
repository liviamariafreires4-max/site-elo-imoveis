/**
 * DIVULGAR NAS REDES (painel)
 * ------------------------------------------------------------------
 * Monta, a partir do imóvel cadastrado, tudo o que é preciso para postar:
 *   - Instagram: legenda com hashtags + imagens 1080×1080 (a 1ª é uma arte
 *     com preço, tipo e bairro; as outras são as fotos, até 10 no carrossel);
 *   - Facebook: texto do post com o link do anúncio + as mesmas imagens;
 *   - Marketplace: cada campo do formulário do Marketplace pronto para copiar.
 *
 * Hoje a postagem é feita à mão (copiar, baixar e colar).
 * Publicar sozinho no Facebook e no Instagram precisa de um servidor:
 * ver REDES-SOCIAIS.md. O Marketplace não tem caminho automático.
 *
 * Uso: Elo.redesSociais.abrir(imovel, { recemPublicado: true })
 */
window.Elo = window.Elo || {};

Elo.redesSociais = (function () {
  const { esc, preco, foto, toast } = Elo.ui;
  const icone = Elo.icone;
  const LIMITE_LEGENDA_INSTAGRAM = 2200;
  const MAX_IMAGENS = 10; // carrossel do Instagram

  // ------------------------------------------------------------ textos
  const minusculo = (t) => (t || "").toLowerCase();
  /** "Presidente Prudente" -> "presidenteprudente" (para hashtag) */
  const hashtag = (t) => "#" + String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]/g, "").toLowerCase();

  function telefoneBonito(zap) {
    const d = String(zap || "").replace(/\D/g, "").replace(/^55/, "");
    return d.length >= 10 ? "(" + d.slice(0, 2) + ") " + d.slice(2, -4) + "-" + d.slice(-4) : zap;
  }

  /** Dados comuns a todas as redes. */
  function base(p) {
    const venda = p.finalidade === "venda";
    const valor = preco(p.preco) + (venda ? "" : "/mês");
    const atributos = [];
    if (p.dormitorios) atributos.push(p.dormitorios + (p.dormitorios > 1 ? " dormitórios" : " dormitório") + (p.suites ? " (" + p.suites + (p.suites > 1 ? " suítes)" : " suíte)") : ""));
    if (p.vagas) atributos.push(p.vagas + (p.vagas > 1 ? " vagas" : " vaga"));
    const area = p.areaConstruida || p.areaTerreno;
    if (area) atributos.push(area.toLocaleString("pt-BR") + " m²" + (p.areaConstruida ? " construídos" : " de terreno"));
    // Descrição curta: até ~300 caracteres, terminando numa frase inteira.
    let resumo = p.descricao || "";
    if (resumo.length > 300) {
      const corte = resumo.slice(0, 300);
      resumo = corte.slice(0, Math.max(corte.lastIndexOf(". ") + 1, 200)).trim();
      if (!/[.!?]$/.test(resumo)) resumo += "…";
    }
    const zap = Elo.dados.brokerWhatsapp(p.corretorId) || Elo.SITE.whatsapp.valor;
    return {
      venda,
      valor,
      atributos,
      resumo,
      tipo: Elo.TIPOS[p.tipo] || "Imóvel",
      chamada: venda ? "À VENDA" : "PARA ALUGAR",
      local: p.bairro + ", " + p.cidade,
      link: new URL("imovel.html?codigo=" + encodeURIComponent(p.codigo), location.href).href,
      whatsapp: telefoneBonito(zap),
      creci: Elo.SITE.creci.valor, // anúncio de imóvel deve trazer o CRECI da imobiliária
    };
  }

  function legendaInstagram(p) {
    const b = base(p);
    const tags = [
      "#imoveis",
      hashtag(p.cidade),
      hashtag(b.tipo),
      b.venda ? "#imovelavenda" : "#imovelparaalugar",
      b.venda ? "#casaavenda" : "#aluguel",
      hashtag(p.bairro),
      "#eloimoveis",
      "#corretordeimoveis",
    ];
    return [
      "🏡 " + b.tipo + " " + minusculo(b.chamada) + " · " + b.local,
      "",
      p.titulo,
      "",
      "💰 " + b.valor + (p.condominio ? " + condomínio " + preco(p.condominio) + "/mês" : ""),
      b.atributos.length ? "📐 " + b.atributos.join(" · ") : "",
      "",
      b.resumo,
      "",
      "📲 Fale com a gente pelo WhatsApp " + b.whatsapp,
      "🔗 Fotos e detalhes no link da bio · Código " + p.codigo,
      "",
      "Elo Imóveis · " + b.creci,
      ".",
      [...new Set(tags)].join(" "),
    ]
      .filter((linha, i, todas) => !(linha === "" && todas[i - 1] === ""))
      .join("\n")
      .trim();
  }

  function textoFacebook(p) {
    const b = base(p);
    return [
      b.tipo.toUpperCase() + " " + b.chamada + " · " + b.local,
      "",
      p.titulo,
      "",
      "Valor: " + b.valor + (p.condominio ? " + condomínio " + preco(p.condominio) + "/mês" : ""),
      b.atributos.length ? b.atributos.join(" · ") : "",
      "",
      b.resumo,
      "",
      "Veja todas as fotos e detalhes: " + b.link,
      "WhatsApp: " + b.whatsapp,
      "",
      "Código " + p.codigo + " · Elo Imóveis · " + b.creci,
      "",
      "#imoveis " + hashtag(p.cidade) + " #eloimoveis",
    ]
      .filter((linha, i, todas) => !(linha === "" && todas[i - 1] === ""))
      .join("\n")
      .trim();
  }

  /** O Marketplace pede campo por campo: cada um vem separado para copiar. */
  function camposMarketplace(p) {
    const b = base(p);
    const titulo = (b.tipo + " " + (b.venda ? "à venda" : "para alugar") + " · " + p.bairro).slice(0, 100);
    const descricao = [
      p.titulo,
      "",
      b.atributos.join(" · "),
      p.condominio ? "Condomínio: " + preco(p.condominio) + "/mês" : "",
      p.iptu ? "IPTU: " + preco(p.iptu) + "/ano" : "",
      "",
      p.descricao,
      "",
      "Fotos e detalhes: " + b.link,
      "WhatsApp: " + b.whatsapp,
      "Código " + p.codigo + " · Elo Imóveis · " + b.creci,
    ]
      .filter((linha, i, todas) => !(linha === "" && todas[i - 1] === ""))
      .join("\n")
      .trim();
    return [
      ["Título", titulo],
      ["Preço", String(p.preco)],
      ["Tipo de anúncio", b.venda ? "Imóvel à venda" : "Imóvel para alugar"],
      ["Tipo de imóvel", b.tipo],
      ["Localização", p.cidade + ", " + (p.uf || "SP")],
      ["Quartos", String(p.dormitorios || 0)],
      ["Área (m²)", String(p.areaConstruida || p.areaTerreno || "")],
      ["Descrição", descricao],
    ].filter(([, valor]) => valor && valor !== "0"); // sem "Quartos: 0" em sala comercial ou terreno
  }

  // ----------------------------------------------------------- imagens
  /** Abre uma imagem pronta para desenhar no canvas (null se não der). */
  function carregarImagem(url) {
    return new Promise((resolver) => {
      const img = new Image();
      if (!url.startsWith("data:")) img.crossOrigin = "anonymous"; // fotos do banco de imagens
      img.onload = () => resolver(img);
      img.onerror = () => resolver(null);
      img.src = url;
    });
  }

  /** Desenha a foto cobrindo o quadrado inteiro (recorte no centro). */
  function cobrir(ctx, img, lado) {
    const escala = Math.max(lado / img.width, lado / img.height);
    const w = img.width * escala;
    const h = img.height * escala;
    ctx.drawImage(img, (lado - w) / 2, (lado - h) / 2, w, h);
  }

  /** Quebra o texto em até `maxLinhas` linhas que cabem em `largura`. */
  function linhas(ctx, texto, largura, maxLinhas) {
    const palavras = texto.split(" ");
    const saida = [];
    let atual = "";
    for (const p of palavras) {
      const teste = atual ? atual + " " + p : p;
      if (ctx.measureText(teste).width > largura && atual) {
        saida.push(atual);
        atual = p;
        if (saida.length === maxLinhas) break;
      } else {
        atual = teste;
      }
    }
    if (saida.length < maxLinhas && atual) saida.push(atual);
    if (saida.length === maxLinhas && palavras.join(" ") !== saida.join(" ")) saida[maxLinhas - 1] = saida[maxLinhas - 1].replace(/\s*\S*$/, "…");
    return saida;
  }

  /** 1ª imagem do carrossel: foto + faixa com chamada, preço, título e bairro. */
  async function arteCapa(p) {
    const L = 1080;
    const c = document.createElement("canvas");
    c.width = c.height = L;
    const ctx = c.getContext("2d");
    const b = base(p);
    const img = await carregarImagem(foto(p.fotos[0].url, 1080));
    if (img) cobrir(ctx, img, L);
    else {
      ctx.fillStyle = "#143052";
      ctx.fillRect(0, 0, L, L);
    }
    // Escurece a parte de baixo para o texto ficar legível.
    const g = ctx.createLinearGradient(0, L * 0.45, 0, L);
    g.addColorStop(0, "rgba(16,20,37,0)");
    g.addColorStop(0.45, "rgba(16,20,37,0.78)");
    g.addColorStop(1, "rgba(16,20,37,0.94)");
    ctx.fillStyle = g;
    ctx.fillRect(0, L * 0.45, L, L * 0.55);

    // Marca no alto
    ctx.fillStyle = "rgba(255,255,255,0.94)";
    ctx.beginPath();
    ctx.roundRect(48, 48, 300, 76, 38);
    ctx.fill();
    ctx.fillStyle = "#D60000";
    ctx.font = "700 34px Poppins, Arial, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText("ELO", 80, 87);
    ctx.fillStyle = "#101425";
    ctx.fillText("IMÓVEIS", 160, 87);

    // Chamada (À VENDA / PARA ALUGAR)
    ctx.font = "700 30px Inter, Arial, sans-serif";
    const larguraChamada = ctx.measureText(b.chamada).width + 48;
    ctx.fillStyle = "#D60000";
    ctx.beginPath();
    ctx.roundRect(64, 600, larguraChamada, 60, 30);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(b.chamada, 88, 631);

    // Preço
    ctx.font = "700 76px Poppins, Arial, sans-serif";
    ctx.fillText(b.valor, 64, 726);
    // Título (até 2 linhas)
    ctx.font = "600 38px Poppins, Arial, sans-serif";
    linhas(ctx, p.titulo, L - 128, 2).forEach((t, i) => ctx.fillText(t, 64, 800 + i * 48));
    // Local e atributos
    ctx.font = "500 30px Inter, Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    // Cada linha corta com "…" se não couber na largura da arte.
    ctx.fillText(linhas(ctx, b.local, L - 128, 1)[0], 64, 916);
    ctx.font = "500 26px Inter, Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    if (b.atributos.length) ctx.fillText(linhas(ctx, b.atributos.join(" · "), L - 128, 1)[0], 64, 966);
    ctx.font = "500 24px Inter, Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("Cód. " + p.codigo + " · " + b.creci, 64, 1030);
    return c;
  }

  /** Demais imagens: cada foto recortada em 1080×1080. */
  async function quadrado(url) {
    const c = document.createElement("canvas");
    c.width = c.height = 1080;
    const img = await carregarImagem(foto(url, 1080));
    if (!img) return null;
    cobrir(c.getContext("2d"), img, 1080);
    return c;
  }

  async function gerarImagens(p) {
    const canvases = [await arteCapa(p)];
    for (const f of p.fotos.slice(0, MAX_IMAGENS - 1)) {
      const c = await quadrado(f.url);
      if (c) canvases.push(c);
    }
    return canvases;
  }

  /** Salva um canvas como arquivo JPEG. Devolve false se o navegador bloquear. */
  function baixar(canvas, nome) {
    return new Promise((resolver) => {
      try {
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolver(false);
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = nome;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(a.href), 2000);
            resolver(true);
          },
          "image/jpeg",
          0.9,
        );
      } catch {
        resolver(false); // imagem de outro site sem permissão (CORS)
      }
    });
  }

  async function copiar(texto) {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      const area = document.createElement("textarea");
      area.value = texto;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    toast("Copiado. Agora é só colar na rede social.");
  }

  // ------------------------------------------------------------ diálogo
  function abrir(p, { recemPublicado = false } = {}) {
    const marketplace = camposMarketplace(p);
    const dialogo = document.createElement("dialog");
    dialogo.className = "modal modal--largo divulgar";
    dialogo.setAttribute("aria-labelledby", "divulgar-titulo");
    dialogo.innerHTML =
      '<div class="modal__corpo">' +
      '<div class="ficha-cabeca"><div>' +
      (recemPublicado ? '<p class="t-pequeno sucesso__titulo">' + icone("check", 16) + "Imóvel " + esc(p.codigo) + " publicado no site</p>" : "") +
      '<h2 class="t-h3" id="divulgar-titulo">Divulgar ' + esc(p.codigo) + " nas redes</h2></div>" +
      '<button type="button" class="botao botao--neutro botao--pequeno botao--icone" data-fechar>' + icone("fechar", 18) + '<span class="sr-only">Fechar</span></button></div>' +
      '<p class="t-pequeno cor-suave" style="margin-top:4px">Textos e imagens prontos. Copie, baixe e publique em cada rede.</p>' +

      '<fieldset class="segmentos ficha-perfis"><legend class="sr-only">Rede social</legend>' +
      '<label><input type="radio" name="rede" value="instagram" checked>Instagram</label>' +
      '<label><input type="radio" name="rede" value="facebook">Facebook</label>' +
      '<label><input type="radio" name="rede" value="marketplace">Marketplace</label></fieldset>' +

      // Instagram
      '<section data-rede="instagram">' +
      '<h3 class="t-h4">Imagens do carrossel</h3>' +
      '<p class="t-pequeno cor-suave">1080 × 1080 px. A primeira é a capa com o preço; as outras são as fotos do anúncio.</p>' +
      '<div class="imagens-post" data-imagens><p class="t-pequeno">' + icone("carregando", 16, "girando") + "Preparando as imagens…</p></div>" +
      '<button type="button" class="botao botao--secundario botao--pequeno" data-baixar disabled>' + icone("foto-mais", 16) + "Baixar imagens</button>" +
      '<div class="campo"><label class="rotulo" for="legenda-ig">Legenda</label>' +
      '<textarea class="entrada texto-post" id="legenda-ig" rows="12" maxlength="' + LIMITE_LEGENDA_INSTAGRAM + '"></textarea>' +
      '<p class="ajuda"><span data-conta="legenda-ig"></span> · No Instagram o link da legenda não é clicável: por isso ele vai na bio.</p></div>' +
      '<div class="acoes-post"><button type="button" class="botao botao--primario" data-copiar="legenda-ig">Copiar legenda</button>' +
      '<a class="botao botao--neutro" href="' + esc(Elo.SITE.redes.instagram) + '" target="_blank" rel="noopener noreferrer">' + icone("link-externo", 16) + "Abrir o Instagram</a></div>" +
      "</section>" +

      // Facebook
      '<section data-rede="facebook" hidden>' +
      '<p class="t-pequeno cor-suave">Use as mesmas imagens (aba Instagram) e este texto, que já leva o link do anúncio.</p>' +
      '<div class="campo"><label class="rotulo" for="texto-fb">Texto do post</label>' +
      '<textarea class="entrada texto-post" id="texto-fb" rows="14"></textarea></div>' +
      '<div class="acoes-post"><button type="button" class="botao botao--primario" data-copiar="texto-fb">Copiar texto</button>' +
      '<a class="botao botao--neutro" href="' + esc(Elo.SITE.redes.facebook) + '" target="_blank" rel="noopener noreferrer">' + icone("link-externo", 16) + "Abrir a página da Elo</a></div>" +
      "</section>" +

      // Marketplace
      '<section data-rede="marketplace" hidden>' +
      '<p class="t-pequeno cor-suave">O Marketplace não aceita publicação automática. No Facebook, crie o anúncio de imóvel e copie cada campo abaixo. Use as imagens da aba Instagram.</p>' +
      '<dl class="campos-marketplace">' +
      marketplace
        .map(
          ([rotulo, valor], i) =>
            '<div><dt class="t-pequeno cor-suave">' + esc(rotulo) + "</dt>" +
            '<dd><span class="valor-campo' + (rotulo === "Descrição" ? " valor-campo--longo" : "") + '" id="mk-' + i + '">' + esc(valor) + "</span>" +
            '<button type="button" class="botao botao--neutro botao--pequeno" data-copiar-mk="' + i + '">Copiar<span class="sr-only"> ' + esc(rotulo) + "</span></button></dd></div>",
        )
        .join("") +
      "</dl>" +
      '<div class="acoes-post"><a class="botao botao--neutro" href="https://www.facebook.com/marketplace/create" target="_blank" rel="noopener noreferrer">' + icone("link-externo", 16) + "Abrir o Marketplace</a></div>" +
      "</section>" +
      "</div>";
    document.body.appendChild(dialogo);

    const $ = (sel) => dialogo.querySelector(sel);
    $("#legenda-ig").value = legendaInstagram(p);
    $("#texto-fb").value = textoFacebook(p);

    // Contador da legenda (o Instagram aceita até 2.200 caracteres)
    const conta = () => ($('[data-conta="legenda-ig"]').textContent = $("#legenda-ig").value.length.toLocaleString("pt-BR") + " de 2.200 caracteres");
    $("#legenda-ig").addEventListener("input", conta);
    conta();

    // Abas
    $(".ficha-perfis").addEventListener("change", (e) => {
      dialogo.querySelectorAll("[data-rede]").forEach((s) => (s.hidden = s.dataset.rede !== e.target.value));
    });

    // Copiar
    dialogo.addEventListener("click", (e) => {
      const botao = e.target.closest("[data-copiar]");
      if (botao) copiar($("#" + botao.dataset.copiar).value);
      const mk = e.target.closest("[data-copiar-mk]");
      if (mk) copiar(marketplace[Number(mk.dataset.copiarMk)][1]);
    });

    // Imagens
    let imagens = [];
    gerarImagens(p).then((lista) => {
      imagens = lista;
      $("[data-imagens]").innerHTML = lista
        .map((c, i) => {
          let src = "";
          try {
            src = c.toDataURL("image/jpeg", 0.6);
          } catch {
            return '<p class="t-pequeno">Uma das fotos não pôde ser preparada.</p>';
          }
          return '<img src="' + src + '" alt="' + (i === 0 ? "Capa do post com preço e bairro" : "Foto " + i + " do imóvel") + '" width="120" height="120">';
        })
        .join("");
      const botao = $("[data-baixar]");
      botao.disabled = false;
      botao.lastChild.textContent = "Baixar " + lista.length + (lista.length > 1 ? " imagens" : " imagem");
    });
    $("[data-baixar]").addEventListener("click", async () => {
      let falhas = 0;
      for (let i = 0; i < imagens.length; i++) {
        const ok = await baixar(imagens[i], p.codigo + "-" + String(i + 1).padStart(2, "0") + ".jpg");
        if (!ok) falhas++;
        await new Promise((r) => setTimeout(r, 250)); // o navegador baixa um de cada vez
      }
      toast(
        falhas
          ? "Algumas fotos não puderam ser baixadas (fotos de banco de imagens). As fotos enviadas pelo painel funcionam."
          : "Imagens baixadas. Elas estão na pasta Downloads.",
        falhas ? { tipo: "erro" } : {},
      );
    });

    const fechar = () => {
      dialogo.close();
      setTimeout(() => dialogo.remove(), 200);
    };
    $("[data-fechar]").addEventListener("click", fechar);
    dialogo.addEventListener("cancel", (e) => {
      e.preventDefault();
      fechar();
    });
    dialogo.showModal();
  }

  return { abrir, legendaInstagram, textoFacebook, camposMarketplace };
})();

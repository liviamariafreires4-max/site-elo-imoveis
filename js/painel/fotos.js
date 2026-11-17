/**
 * UPLOAD DE FOTOS COM REORDENAÇÃO (usado em painel-imovel.html)
 * ------------------------------------------------------------------
 * - Escolher arquivos ou arrastar para a área tracejada.
 * - A primeira foto é a capa do anúncio.
 * - Reordenar: arrastar a miniatura (mouse) ou usar as setas (teclado e toque).
 * - Cada foto tem um campo de descrição (texto alternativo).
 *
 * As fotos são reduzidas no navegador e guardadas como texto (data URL).
 * TODO(backend): com Supabase Storage, enviar o arquivo e guardar só a URL.
 *
 * Uso:
 *   const envio = Elo.envioDeFotos(elementoOndeDesenhar, fotosIniciais);
 *   envio.fotos()              -> lista atual [{ url, alt }]
 *   envio.mostrarErro("...")   -> marca a área com erro
 */
window.Elo = window.Elo || {};

Elo.envioDeFotos = function (lugar, fotosIniciais = []) {
  const { esc, foto } = Elo.ui;
  const icone = Elo.icone;
  const MAXIMO = 12;
  const LADO_MAXIMO = 1280; // px

  let fotos = fotosIniciais.map((f) => ({ ...f }));
  let arrastando = null; // índice da miniatura sendo arrastada

  lugar.innerHTML =
    '<label class="envio" id="envio-area">' +
    '<span id="envio-icone">' + icone("foto-mais", 24) + "</span>" +
    '<span class="t-corpo cor-tinta negrito" id="envio-texto">Escolher fotos ou arrastar para cá</span>' +
    '<span class="t-pequeno cor-suave">JPG, PNG ou WebP. Até ' + MAXIMO + " fotos, de preferência horizontais. A marca d'água da Elo é aplicada automaticamente.</span>" +
    '<input class="sr-only" type="file" accept="image/*" multiple id="envio-arquivo">' +
    "</label>" +
    '<p class="t-pequeno cor-suave" role="status" id="envio-aviso" style="min-height:22px;margin-top:8px"></p>' +
    '<ul class="miniaturas" id="miniaturas"></ul>';

  const area = lugar.querySelector("#envio-area");
  const entrada = lugar.querySelector("#envio-arquivo");
  const aviso = lugar.querySelector("#envio-aviso");
  const listaEl = lugar.querySelector("#miniaturas");

  // ---------------------------------------------------- reduzir a foto
  function reduzir(arquivo) {
    return new Promise((resolver, rejeitar) => {
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, LADO_MAXIMO / Math.max(img.width, img.height));
        const tela = document.createElement("canvas");
        tela.width = Math.round(img.width * escala);
        tela.height = Math.round(img.height * escala);
        tela.getContext("2d").drawImage(img, 0, 0, tela.width, tela.height);
        URL.revokeObjectURL(img.src);
        // Marca d'água OBRIGATÓRIA: toda foto enviada sai com ela (js/painel/marca-dagua.js).
        Elo.marcaDagua.aplicar(tela, 0.72).then(resolver, rejeitar);
      };
      img.onerror = rejeitar;
      img.src = URL.createObjectURL(arquivo);
    });
  }

  async function adicionar(arquivos) {
    const imagens = [...arquivos].filter((a) => a.type.startsWith("image/"));
    if (!imagens.length) {
      aviso.textContent = "Envie arquivos de imagem (JPG, PNG ou WebP).";
      return;
    }
    const espaco = MAXIMO - fotos.length;
    area.classList.remove("com-erro");
    aviso.style.color = "";
    lugar.querySelector("#envio-icone").innerHTML = icone("carregando", 24, "girando");
    lugar.querySelector("#envio-texto").textContent = "Preparando as fotos…";
    try {
      const urls = await Promise.all(imagens.slice(0, espaco).map(reduzir));
      const antes = fotos.length;
      fotos = [...fotos, ...urls.map((url) => ({ url, alt: "" }))];
      desenhar(antes);
      aviso.textContent =
        imagens.length > espaco
          ? "Limite de " + MAXIMO + " fotos: " + (imagens.length - espaco) + " não foram adicionadas."
          : urls.length === 1 ? "1 foto adicionada." : urls.length + " fotos adicionadas.";
    } catch {
      aviso.textContent = "Não foi possível ler uma das fotos. Tente outro arquivo.";
      desenhar();
    }
  }

  // ------------------------------------------- reordenar com animação
  /**
   * Técnica FLIP: guarda onde cada miniatura estava, reordena, e anima cada
   * uma da posição antiga para a nova. Assim fica claro para onde a foto foi.
   */
  function comAnimacao(mudar) {
    const antes = new Map();
    listaEl.querySelectorAll("[data-chave]").forEach((el) => antes.set(el.dataset.chave, el.getBoundingClientRect()));
    mudar();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    listaEl.querySelectorAll("[data-chave]").forEach((el) => {
      const r = antes.get(el.dataset.chave);
      if (!r) return;
      const agora = el.getBoundingClientRect();
      const dx = r.left - agora.left;
      const dy = r.top - agora.top;
      if (!dx && !dy) return;
      el.animate([{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "none" }], {
        duration: 220,
        easing: "cubic-bezier(0.77, 0, 0.175, 1)",
      });
    });
  }

  function mover(de, para, focarBotao) {
    if (para < 0 || para >= fotos.length || de === para) return;
    comAnimacao(() => {
      const [item] = fotos.splice(de, 1);
      fotos.splice(para, 0, item);
      desenhar();
    });
    aviso.textContent = "Foto movida para a posição " + (para + 1) + " de " + fotos.length + ".";
    // Mantém o foco no botão equivalente da foto que mudou de lugar.
    if (focarBotao) {
      const botao = listaEl.children[para].querySelector('[data-acao="' + focarBotao + '"]');
      (botao && !botao.disabled ? botao : listaEl.children[para].querySelector("input")).focus();
    }
  }

  function remover(i) {
    comAnimacao(() => {
      fotos.splice(i, 1);
      desenhar();
    });
    aviso.textContent = "Foto " + (i + 1) + " retirada do anúncio.";
    const proximo = listaEl.children[Math.min(i, fotos.length - 1)];
    (proximo ? proximo.querySelector("input") : entrada).focus();
  }

  // ------------------------------------------------------------ desenho
  /** `novasAPartirDe`: índice da primeira foto recém-enviada (entra com animação). */
  function desenhar(novasAPartirDe = Infinity) {
    const cheio = fotos.length >= MAXIMO;
    entrada.disabled = cheio;
    area.classList.toggle("cheio", cheio);
    lugar.querySelector("#envio-icone").innerHTML = icone("foto-mais", 24);
    lugar.querySelector("#envio-texto").textContent = cheio ? "Limite de " + MAXIMO + " fotos atingido" : "Escolher fotos ou arrastar para cá";

    listaEl.innerHTML = fotos
      .map(
        (f, i) =>
          '<li class="miniatura-foto' + (i >= novasAPartirDe ? " miniatura-entra" : "") + '" draggable="true" data-indice="' + i + '" data-chave="' + esc(f.url.slice(-40)) + i + '">' +
          '<div class="miniatura-foto__imagem"><img src="' + esc(foto(f.url, 320)) + '" alt="">' +
          '<span class="t-tag miniatura-foto__ordem">' + (i === 0 ? "Capa" : i + 1) + "</span></div>" +
          '<label class="t-meta cor-suave" for="alt-' + i + '" style="display:block;margin-top:8px">Descrição da foto ' + (i + 1) + "</label>" +
          '<input class="entrada" id="alt-' + i + '" data-alt="' + i + '" value="' + esc(f.alt) + '" placeholder="Ex.: Fachada com jardim">' +
          '<div class="miniatura-foto__botoes"><div>' +
          '<button type="button" class="botao botao--neutro botao--pequeno botao--icone" data-acao="antes"' + (i === 0 ? " disabled" : "") + ">" +
          icone("seta-esquerda", 16) + '<span class="sr-only">Mover foto ' + (i + 1) + " para antes</span></button>" +
          '<button type="button" class="botao botao--neutro botao--pequeno botao--icone" data-acao="depois"' + (i === fotos.length - 1 ? " disabled" : "") + ">" +
          icone("seta-direita", 16) + '<span class="sr-only">Mover foto ' + (i + 1) + " para depois</span></button></div>" +
          '<button type="button" class="botao botao--neutro botao--pequeno botao--icone" data-acao="remover">' +
          icone("fechar", 16) + '<span class="sr-only">Retirar foto ' + (i + 1) + " do anúncio</span></button>" +
          "</div></li>",
      )
      .join("");
  }

  // -------------------------------------------------------------- eventos
  entrada.addEventListener("change", () => {
    if (entrada.files.length) adicionar(entrada.files);
    entrada.value = "";
  });

  // Arrastar ARQUIVOS do computador para a área tracejada
  area.addEventListener("dragover", (e) => {
    if (arrastando !== null) return;
    e.preventDefault();
    area.classList.add("arrastando");
  });
  area.addEventListener("dragleave", () => area.classList.remove("arrastando"));
  area.addEventListener("drop", (e) => {
    e.preventDefault();
    area.classList.remove("arrastando");
    if (e.dataTransfer.files.length && fotos.length < MAXIMO) adicionar(e.dataTransfer.files);
  });

  // Botões das miniaturas
  listaEl.addEventListener("click", (e) => {
    const botao = e.target.closest("[data-acao]");
    if (!botao) return;
    const i = Number(botao.closest("[data-indice]").dataset.indice);
    if (botao.dataset.acao === "antes") mover(i, i - 1, "antes");
    if (botao.dataset.acao === "depois") mover(i, i + 1, "depois");
    if (botao.dataset.acao === "remover") remover(i);
  });

  // Descrição de cada foto
  listaEl.addEventListener("input", (e) => {
    if (e.target.dataset.alt !== undefined) fotos[Number(e.target.dataset.alt)].alt = e.target.value;
  });

  // Arrastar MINIATURAS para reordenar (mouse)
  listaEl.addEventListener("dragstart", (e) => {
    const item = e.target.closest("[data-indice]");
    if (!item) return;
    arrastando = Number(item.dataset.indice);
    item.classList.add("arrastada");
    e.dataTransfer.effectAllowed = "move";
  });
  listaEl.addEventListener("dragend", () => {
    arrastando = null;
    listaEl.querySelectorAll(".arrastada").forEach((el) => el.classList.remove("arrastada"));
  });
  listaEl.addEventListener("dragover", (e) => {
    if (arrastando !== null) e.preventDefault();
  });
  listaEl.addEventListener("drop", (e) => {
    const alvo = e.target.closest("[data-indice]");
    if (arrastando === null || !alvo) return;
    e.preventDefault();
    mover(arrastando, Number(alvo.dataset.indice));
    arrastando = null;
  });

  desenhar();

  return {
    fotos: () => fotos.map((f) => ({ ...f })),
    mostrarErro(mensagem) {
      area.classList.add("com-erro");
      aviso.textContent = mensagem;
      aviso.style.color = "var(--error)";
    },
    limparErro() {
      area.classList.remove("com-erro");
      aviso.style.color = "";
    },
    focar: () => entrada.focus(),
  };
};

/**
 * PÁGINA DO IMÓVEL (imovel.html?codigo=ELO-1001)
 * Galeria com tela cheia, ficha, mapa, agendar visita, WhatsApp e favoritar.
 */
(function () {
  const { esc, preco, area, foto, param, institucional } = Elo.ui;
  const icone = Elo.icone;
  const lugar = document.getElementById("imovel");
  const codigo = param("codigo") || "";

  async function carregar() {
    lugar.innerHTML =
      '<div role="status"><span class="sr-only">Carregando imóvel…</span>' +
      '<div class="imovel" aria-hidden="true"><div><div class="esqueleto" style="aspect-ratio:16/10;border-radius:16px"></div>' +
      '<div class="esqueleto" style="height:40px;width:80%;margin-top:32px"></div><div class="esqueleto" style="height:20px;width:40%;margin-top:16px"></div></div>' +
      '<div class="esqueleto" style="height:320px;border-radius:16px"></div></div></div>';
    try {
      const p = await Elo.dados.getPropertyByCode(codigo);
      if (!p) return naoEncontrado();
      if (p.situacao === "vendido") {
        document.title = "Imóvel vendido | Elo Imóveis";
        lugar.innerHTML = Elo.ui.vazio({
          icone: "check",
          titulo: "Este imóvel já foi " + (p.finalidade === "aluguel" ? "alugado" : "vendido"),
          texto: "O " + p.codigo + " não está mais disponível. Veja outros imóveis parecidos.",
          acao: '<a class="botao botao--primario" href="imoveis.html?finalidade=' + p.finalidade + "&tipo=" + p.tipo + '">Ver imóveis parecidos</a>',
        });
        return;
      }
      desenhar(p);
    } catch {
      Elo.ui.falha(lugar, "este imóvel", carregar);
    }
  }

  function naoEncontrado() {
    document.title = "Imóvel não encontrado | Elo Imóveis";
    lugar.innerHTML = Elo.ui.vazio({
      icone: "busca-vazia",
      titulo: codigo ? "Não encontramos o imóvel " + codigo.toUpperCase() : "Nenhum imóvel informado",
      texto: "O anúncio pode ter sido encerrado ou o código pode estar incorreto.",
      acao: '<a class="botao botao--primario" href="imoveis.html">Buscar outros imóveis</a>',
    });
  }

  function desenhar(p) {
    document.title = p.titulo + " | Elo Imóveis";
    const corretores = Elo.dados.brokerNames();
    const ficha = [
      ["Tipo", Elo.TIPOS[p.tipo]],
      ["Finalidade", Elo.FINALIDADES[p.finalidade]],
      p.dormitorios && ["Dormitórios", p.dormitorios],
      p.suites && ["Suítes", p.suites],
      p.vagas && ["Vagas", p.vagas],
      p.areaConstruida && ["Área construída", area(p.areaConstruida)],
      p.areaTerreno && ["Área do terreno", area(p.areaTerreno)],
      ["Código", p.codigo],
    ].filter(Boolean);

    const whatsapp =
      // WhatsApp do corretor do imóvel (o que ele salvou em Meu perfil); sem ele, o da Elo.
      "https://wa.me/" + (Elo.dados.brokerWhatsapp(p.corretorId) || Elo.SITE.whatsapp.valor) + "?text=" +
      encodeURIComponent("Olá! Tenho interesse no imóvel " + p.codigo + " (" + p.titulo + ").");

    lugar.innerHTML =
      // Migalhas
      '<nav class="migalhas t-meta" aria-label="Você está em"><ol>' +
      '<li class="com-selo"><a href="index.html">Início</a>' + icone("chevron-direita", 14) + "</li>" +
      '<li class="com-selo"><a href="imoveis.html?finalidade=' + p.finalidade + '">' + (p.finalidade === "venda" ? "Comprar" : "Alugar") + "</a>" +
      icone("chevron-direita", 14) + '</li><li aria-current="page">' + esc(p.codigo) + "</li></ol></nav>" +

      '<div class="imovel"><div class="imovel__principal">' +
      galeriaHtml(p) +
      '<header style="margin-top:32px">' +
      '<p class="t-tag card__tipo">' + (p.selo ? '<span class="selo">' + esc(p.selo) + "</span>" : "") +
      "<span>" + esc(Elo.TIPOS[p.tipo]) + " · " + (p.finalidade === "venda" ? "À venda" : "Para alugar") + " · Cód. " + esc(p.codigo) + "</span></p>" +
      '<h1 class="t-h1" style="margin-top:12px">' + esc(p.titulo) + "</h1>" +
      '<p class="t-lead cor-suave" style="margin-top:12px">' + esc(p.bairro) + ", " + esc(p.cidade) + "/" + esc(p.uf) + "</p></header>" +

      '<section class="bloco-imovel" aria-labelledby="dados"><h2 class="t-h3" id="dados">Dados do imóvel</h2><dl class="ficha">' +
      ficha.map(([k, v]) => '<div><dt class="t-pequeno cor-suave">' + k + '</dt><dd class="t-corpo">' + esc(v) + "</dd></div>").join("") +
      "</dl></section>" +

      '<section class="bloco-imovel" aria-labelledby="descricao"><h2 class="t-h3" id="descricao">Descrição</h2>' +
      '<p class="t-corpo" style="margin-top:16px;max-width:68ch;white-space:pre-line">' + esc(p.descricao) + "</p></section>" +

      // Vídeos (YouTube ou Vimeo), quando o corretor cadastrou
      (p.videos && p.videos.length
        ? '<section class="bloco-imovel" aria-labelledby="videos"><h2 class="t-h3" id="videos">' + (p.videos.length > 1 ? "Vídeos" : "Vídeo") + "</h2>" +
          '<div class="videos-imovel">' +
          p.videos
            .map(
              (v, i) =>
                '<div class="video-imovel"><iframe src="' + esc(Elo.ui.videoEmbed(v)) + '" title="Vídeo ' + (i + 1) + " do imóvel " + esc(p.codigo) + '" ' +
                'loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>',
            )
            .join("") +
          "</div></section>"
        : "") +
      '<section class="bloco-imovel" aria-labelledby="localizacao"><h2 class="t-h3" id="localizacao">Localização</h2>' +
      '<p class="t-corpo local-imovel" style="margin-top:16px">' + icone("mapa", 20) + "<span><strong>" + esc(p.bairro) + "</strong>, " + esc(p.cidade) + "/" + esc(p.uf) + "</span></p>" +
      '<p class="t-pequeno cor-suave" style="margin-top:8px">Por segurança do proprietário, o endereço completo é informado pelo corretor ao agendar a visita.</p></section>' +
      "</div>" +

      // Coluna de ação: preço e contato sempre à vista no desktop.
      '<aside class="imovel__lado"><div class="caixa-preco">' +
      '<p class="t-pequeno cor-suave">' + (p.finalidade === "venda" ? "Valor de venda" : "Aluguel mensal") + "</p>" +
      '<p class="t-preco">' + preco(p.preco) + (p.finalidade === "aluguel" ? ' <span class="preco-mes">/mês</span>' : "") + "</p>" +
      (p.condominio || p.iptu
        ? '<dl class="t-pequeno caixa-preco__custos">' +
          (p.condominio ? '<div><dt class="cor-suave">Condomínio</dt><dd>' + preco(p.condominio) + "/mês</dd></div>" : "") +
          (p.iptu ? '<div><dt class="cor-suave">IPTU</dt><dd>' + preco(p.iptu) + "/ano</dd></div>" : "") +
          "</dl>"
        : "") +
      '<div class="caixa-preco__acoes">' +
      '<a class="botao botao--primario" href="#agendar">' + icone("calendario", 18) + "Agendar visita</a>" +
      '<a class="botao botao--secundario" href="' + whatsapp + '" target="_blank" rel="noopener noreferrer">' + icone("mensagem", 18) + "Conversar no WhatsApp</a>" +
      '<button type="button" class="botao botao--neutro botao-favorito" aria-pressed="false" data-favorito="' + esc(p.id) + '" data-titulo="' + esc(p.titulo) + '">' +
      icone("coracao", 20) + '<span data-texto>Salvar nos favoritos</span></button>' +
      "</div>" +
      '<p class="t-meta cor-suave" style="margin-top:16px">' + institucional({ valor: "WhatsApp e telefone", validar: true }) + "</p>" +
      (corretores[p.corretorId]
        ? '<p class="t-pequeno caixa-preco__rodape">Corretor responsável: <a class="link" href="corretor.html?id=' + encodeURIComponent(p.corretorId) + '">' + esc(corretores[p.corretorId]) + "</a></p>"
        : "") +
      "</div></aside></div>" +

      // Agendar visita
      '<section class="agendar" id="agendar" aria-labelledby="agendar-titulo"><div class="agendar__grade">' +
      '<div><h2 class="t-h3" id="agendar-titulo">Agendar visita ao imóvel ' + esc(p.codigo) + "</h2>" +
      '<p class="t-corpo" style="margin-top:12px">Diga quando você pode e um corretor confirma o horário por telefone ou WhatsApp.</p></div>' +
      '<form id="form-visita" class="form-grade form-grade--2">' +
      '<div class="campo"><label class="rotulo" for="v-nome">Nome</label><input class="entrada" id="v-nome" name="nome" required autocomplete="name" data-mascara="nome" data-validar="nome" maxlength="80"></div>' +
      '<div class="campo"><label class="rotulo" for="v-tel">Telefone com DDD</label><input class="entrada" id="v-tel" name="telefone" type="tel" required autocomplete="tel" inputmode="tel" data-mascara="telefone" data-validar="telefone" maxlength="15" placeholder="(18) 99999-0000"></div>' +
      '<div class="campo"><label class="rotulo" for="v-dia">Dia de preferência <span class="opcional">(opcional)</span></label><input class="entrada" id="v-dia" name="dia" type="date"></div>' +
      '<div class="campo"><label class="rotulo" for="v-periodo">Período <span class="opcional">(opcional)</span></label><select class="entrada" id="v-periodo" name="periodo"><option value="">Escolha</option><option>Manhã</option><option>Tarde</option><option>Sábado de manhã</option></select></div>' +
      '<div class="campo inteiro"><label class="rotulo" for="v-msg">Mensagem <span class="opcional">(opcional)</span></label><textarea class="entrada" id="v-msg" name="mensagem" rows="4"></textarea></div>' +
      '<div class="inteiro"><button type="submit" class="botao botao--primario">Pedir agendamento da visita</button>' +
      '<p class="ajuda">Esboço: o envio é simulado e nada sai do seu navegador.</p></div>' +
      "</form></div></section>" +
      '<section id="parecidos"></section>';


    ligarGaleria(p);
    Elo.ui.atualizarCoracoes();
    Elo.formularioContato(document.getElementById("form-visita"), {
      sucessoTitulo: "Pedido de visita enviado",
      sucessoTexto: "Recebemos seu pedido para o imóvel " + p.codigo + ". Um corretor entra em contato para confirmar o horário.",
    });
    carregarParecidos(p);
  }

  // ----------------------------------------------------------- galeria
  function galeriaHtml(p) {
    const varias = p.fotos.length > 1;
    const setas = varias
      ? '<button type="button" class="galeria__seta galeria__seta--ant" data-anterior>' + icone("chevron-esquerda", 22) + '<span class="sr-only">Foto anterior</span></button>' +
        '<button type="button" class="galeria__seta galeria__seta--prox" data-proxima>' + icone("chevron-direita", 22) + '<span class="sr-only">Próxima foto</span></button>'
      : "";
    return (
      '<section class="galeria" aria-label="Fotos do imóvel">' +
      '<div class="galeria__principal">' +
      '<button type="button" class="galeria__ampliar" id="ampliar"><img id="foto-grande" src="' + esc(foto(p.fotos[0].url, 1200)) + '" alt="' + esc(p.fotos[0].alt) + '" fetchpriority="high">' +
      '<span class="sr-only">Ampliar foto</span>' +
      '<span class="t-tag galeria__contador" aria-hidden="true">' + icone("ampliar", 14) + '<span id="contador-foto">1 de ' + p.fotos.length + "</span></span></button>" +
      setas +
      (varias
        ? '<button type="button" class="galeria__play" id="galeria-play" aria-pressed="false">' +
          '<span class="galeria__play-icone" aria-hidden="true"></span><span class="galeria__play-texto">Pausar fotos</span></button>'
        : "") +
      "</div>" +
      (varias
        ? '<ul class="galeria__miniaturas">' +
          p.fotos.map((f, i) =>
            '<li><button type="button" data-foto="' + i + '" aria-current="' + (i === 0) + '"><img src="' + esc(foto(f.url, 240)) + '" alt="">' +
            '<span class="sr-only">Foto ' + (i + 1) + ": " + esc(f.alt) + "</span></button></li>",
          ).join("") +
          "</ul>"
        : "") +
      '<dialog class="tela-cheia escuro" id="tela-cheia" aria-label="Fotos em tela cheia">' +
      '<div class="tela-cheia__topo"><p class="t-pequeno" id="legenda-cheia" aria-live="polite"></p>' +
      '<button type="button" class="botao botao--pequeno botao--claro-contorno" id="fechar-cheia" autofocus>' + icone("fechar", 18) + "Fechar</button></div>" +
      '<div class="tela-cheia__foto"><img id="foto-cheia" src="" alt="">' + setas + "</div></dialog>" +
      "</section>"
    );
  }

  function ligarGaleria(p) {
    let atual = 0;
    const grande = document.getElementById("foto-grande");
    const cheia = document.getElementById("foto-cheia");
    const dialogo = document.getElementById("tela-cheia");

    /** Troca a foto. Pelo teclado a troca é imediata; no clique, esmaece rápido. */
    function mostrar(indice, peloTeclado = false, automatico = false) {
      atual = (indice + p.fotos.length) % p.fotos.length;
      const f = p.fotos[atual];
      for (const img of [grande, cheia]) {
        img.src = foto(f.url, img === cheia ? 1920 : 1200);
        img.alt = f.alt;
        img.classList.remove("troca-foto");
        if (!peloTeclado) {
          void img.offsetWidth; // reinicia a animação
          img.classList.add("troca-foto");
        }
      }
      document.getElementById("contador-foto").textContent = atual + 1 + " de " + p.fotos.length;
      document.getElementById("legenda-cheia").textContent = atual + 1 + " de " + p.fotos.length + ": " + f.alt;
      document.querySelectorAll("[data-foto]").forEach((b) => {
        const ativa = Number(b.dataset.foto) === atual;
        b.setAttribute("aria-current", String(ativa));
        if (!ativa) return;
        if (automatico) {
          // Só desliza a fileira de miniaturas, sem mexer na rolagem da página.
          const fileira = b.closest(".galeria__miniaturas");
          fileira.scrollTo({ left: b.parentElement.offsetLeft - fileira.clientWidth / 2 + b.offsetWidth / 2, behavior: "smooth" });
        } else {
          b.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
      });
    }

    const galeria = document.querySelector(".galeria");
    galeria.addEventListener("click", (e) => {
      if (e.target.closest("#galeria-play")) return;
      if (e.target.closest("[data-anterior]")) mostrar(atual - 1);
      else if (e.target.closest("[data-proxima]")) mostrar(atual + 1);
      else if (e.target.closest("[data-foto]")) mostrar(Number(e.target.closest("[data-foto]").dataset.foto));
      else return;
      reiniciar(); // escolheu uma foto: conta 1,5 s de novo a partir dela
    });

    // ---------------------------------------------- troca automática
    /*
     * As fotos passam sozinhas a cada INTERVALO. A troca para quando:
     *   - a pessoa aperta "Pausar fotos" (fica pausado até apertar de novo);
     *   - o mouse está sobre a foto ou o foco do teclado está na galeria;
     *   - a tela cheia está aberta ou a aba do navegador não está visível.
     * Quem pede menos movimento no sistema (prefers-reduced-motion) começa
     * com as fotos paradas e pode ligar pelo botão.
     */
    const INTERVALO = 1500; // ms
    const botaoPlay = document.getElementById("galeria-play");
    let relogio = null;
    let pausadoPeloUsuario = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let mouseEmCima = false;
    let focoDentro = false;

    const podeRodar = () =>
      p.fotos.length > 1 && !pausadoPeloUsuario && !mouseEmCima && !focoDentro && !dialogo.open && !document.hidden;

    function proxima() {
      const seguinte = p.fotos[(atual + 2) % p.fotos.length];
      if (seguinte) new Image().src = foto(seguinte.url, 1200); // já baixa a próxima
      mostrar(atual + 1, false, true);
    }
    function parar() {
      clearInterval(relogio);
      relogio = null;
    }
    function reiniciar() {
      parar();
      if (podeRodar()) relogio = setInterval(proxima, INTERVALO);
    }
    function atualizarBotao() {
      if (!botaoPlay) return;
      botaoPlay.setAttribute("aria-pressed", String(pausadoPeloUsuario));
      botaoPlay.classList.toggle("pausado", pausadoPeloUsuario);
      botaoPlay.querySelector(".galeria__play-texto").textContent = pausadoPeloUsuario ? "Passar fotos" : "Pausar fotos";
    }
    if (botaoPlay) {
      botaoPlay.addEventListener("click", () => {
        pausadoPeloUsuario = !pausadoPeloUsuario;
        atualizarBotao();
        reiniciar();
      });
      const principal = document.querySelector(".galeria__principal");
      principal.addEventListener("pointerenter", (e) => {
        if (e.pointerType === "mouse") {
          mouseEmCima = true;
          reiniciar();
        }
      });
      principal.addEventListener("pointerleave", () => {
        mouseEmCima = false;
        reiniciar();
      });
      galeria.addEventListener("focusin", (e) => {
        if (e.target === botaoPlay) return; // focar o próprio botão não pausa
        focoDentro = true;
        reiniciar();
      });
      galeria.addEventListener("focusout", () => {
        setTimeout(() => {
          const el = document.activeElement;
          focoDentro = galeria.contains(el) && el !== botaoPlay;
          reiniciar();
        });
      });
      document.addEventListener("visibilitychange", reiniciar);
      dialogo.addEventListener("close", reiniciar);
      atualizarBotao();
      reiniciar(); // começa depois de 1,5 s
    }
    galeria.addEventListener("keydown", (e) => {
      if (p.fotos.length < 2) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        mostrar(atual + 1, true);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        mostrar(atual - 1, true);
      }
    });

    document.getElementById("ampliar").addEventListener("click", () => {
      mostrar(atual, true);
      dialogo.showModal();
      if (typeof parar === "function") parar();
    });
    document.getElementById("fechar-cheia").addEventListener("click", () => dialogo.close());
    dialogo.addEventListener("click", (e) => e.target === dialogo && dialogo.close());
  }

  // ---------------------------------------------------------- parecidos
  async function carregarParecidos(p) {
    try {
      const lista = (await Elo.dados.listProperties({ finalidade: p.finalidade })).filter((x) => x.id !== p.id).slice(0, 3);
      if (!lista.length) return;
      const secao = document.getElementById("parecidos");
      secao.className = "secao";
      secao.style.paddingBottom = "0";
      secao.setAttribute("aria-labelledby", "parecidos-titulo");
      secao.innerHTML =
        '<h2 class="t-h2" id="parecidos-titulo">' + (p.finalidade === "venda" ? "Outros imóveis à venda" : "Outros imóveis para alugar") + "</h2>" +
        '<div style="margin-top:32px">' + Elo.ui.gradeCards(lista) + "</div>";
      Elo.ui.atualizarCoracoes();
    } catch {
      /* lista extra: se falhar, a página continua sem ela */
    }
  }

  carregar();
})();

/**
 * PAINEL > CADASTRAR / EDITAR IMÓVEL (painel-imovel.html)
 * ------------------------------------------------------------------
 *   painel-imovel.html          -> cadastrar (o código é gerado ao salvar)
 *   painel-imovel.html?id=p-1001 -> editar
 *
 * Corretor edita só os imóveis que cadastrou; admin edita todos.
 * Ninguém exclui por aqui: a retirada fica só na lista do admin.
 *
 * DADOS DO PROPRIETÁRIO: sigilosos. Só o corretor do imóvel e o admin veem
 * (Elo.dados.getOwner). Nunca aparecem no site. Ver o TODO em js/dados.js.
 */
Elo.painel.iniciar({}, async function (sessao, tela) {
  const { esc, mostrarErro, limparErro, botaoCarregando, param } = Elo.ui;
  const icone = Elo.icone;
  const id = param("id");
  let existente = null;

  // ------------------------------------------------- carregar (edição)
  if (id) {
    tela.innerHTML = '<div class="caixa">' + Elo.ui.esqueletoLinhas(6) + "</div>";
    try {
      existente = await Elo.dados.getPropertyById(id);
    } catch {
      Elo.ui.falha(tela, "este imóvel", () => location.reload());
      return;
    }
    if (!existente) {
      tela.innerHTML = Elo.ui.vazio({
        icone: "busca-vazia",
        titulo: "Imóvel não encontrado",
        texto: "Ele pode ter sido excluído pela administração.",
        acao: '<a class="botao botao--primario" href="painel-imoveis.html">Voltar para os imóveis</a>',
      });
      return;
    }
    if (sessao.role === "corretor" && existente.corretorId !== sessao.userId) {
      tela.innerHTML = Elo.ui.vazio({
        icone: "cadeado",
        titulo: "Este imóvel é de outro corretor",
        texto: "Você só pode editar os imóveis que cadastrou.",
        acao: '<a class="botao botao--primario" href="painel-imoveis.html">Voltar para os meus imóveis</a>',
      });
      return;
    }
    document.title = "Editar " + existente.codigo + " | Painel Elo Imóveis";
  }

  // Proprietário (sigiloso): carregado à parte, só para quem pode ver.
  let dono = {};
  if (existente) {
    try {
      dono = (await Elo.dados.getOwner(existente.id)) || {};
    } catch {
      dono = {};
    }
  }
  const valorDono = (k) => esc(dono[k] ?? "");
  // Contatos do proprietário (registros antigos tinham só "telefone").
  const contatos = dono.contatos || [{ nome: "", telefone: dono.telefone || "" }];
  function contatoHtml(n) {
    const c = contatos[n - 1] || { nome: "", telefone: "" };
    const id = n === 1 ? "pf-donoTelefone" : "pf-dono2Telefone";
    const idNome = n === 1 ? "pf-dono1Nome" : "pf-dono2Nome";
    const opcional = n === 1 ? "" : ' <span class="opcional">(opcional)</span>';
    return (
      '<fieldset class="contato-dono inteiro"><legend class="rotulo">Contato ' + n + opcional + "</legend>" +
      '<div class="form-grade form-grade--2">' +
      '<div class="campo"><label class="rotulo" for="' + idNome + '">Nome de quem atende <span class="opcional">(' +
      (n === 1 ? "se não for o proprietário" : "ex.: cônjuge, zelador") + ")</span></label>" +
      '<input class="entrada" id="' + idNome + '" autocomplete="off" maxlength="80" data-mascara="nome" value="' + esc(c.nome) + '"></div>' +
      '<div class="campo"><label class="rotulo" for="' + id + '">Telefone com DDD</label>' +
      '<input class="entrada" id="' + id + '" type="tel" autocomplete="off" data-mascara="telefone" maxlength="15" placeholder="(18) 99999-0000" value="' + esc(c.telefone) + '"></div>' +
      "</div></fieldset>"
    );
  }

  const v = existente || { finalidade: "venda", tipo: "casa", cidade: "Presidente Prudente", fotos: [], videos: [] };
  const MAX_VIDEOS = 5;
  const valor = (x) => (x === undefined || x === null ? "" : esc(x));

  // ------------------------------------------------------- campos
  /** Campo de texto com rótulo, ajuda opcional, prefixo (R$) e sufixo (m²). */
  function campo(nome, rotulo, { ajuda, opcional, numerico, prefixo, sufixo, exemplo, lista, max } = {}) {
    const idCampo = "pf-" + nome;
    const classe = "com-prefixo" + (prefixo ? " com-prefixo--antes" : "") + (sufixo ? " com-prefixo--depois" : "");
    return (
      '<div class="campo-form">' +
      '<label class="rotulo" for="' + idCampo + '">' + rotulo + (opcional ? ' <span class="opcional">(opcional)</span>' : "") + "</label>" +
      '<div class="' + classe + '">' +
      (prefixo ? '<span class="prefixo" aria-hidden="true">' + prefixo + "</span>" : "") +
      '<input class="entrada" id="' + idCampo + '" name="' + nome + '" autocomplete="off"' +
      (numerico ? ' inputmode="numeric"' : "") + (exemplo ? ' placeholder="' + exemplo + '"' : "") +
      (lista ? ' list="' + lista + '"' : "") + (max ? ' maxlength="' + max + '"' : "") +
      (ajuda ? ' aria-describedby="' + idCampo + '-ajuda" data-ajuda="' + idCampo + '-ajuda"' : "") +
      ' value="' + valor(v[nome]) + '">' +
      (sufixo ? '<span class="sufixo" aria-hidden="true">' + sufixo + "</span>" : "") +
      "</div>" +
      (ajuda ? '<p class="ajuda" id="' + idCampo + '-ajuda">' + ajuda + "</p>" : "") +
      "</div>"
    );
  }

  tela.innerHTML =
    '<a class="link voltar" href="painel-imoveis.html">' + icone("seta-esquerda", 16) + "Voltar para os imóveis</a>" +
    '<div class="tela-cabeca" style="margin-top:8px">' +
    '<h1 class="t-h2">' + (existente ? "Editar imóvel" : "Cadastrar imóvel") + "</h1>" +
    '<p class="t-pequeno codigo-caixa">Código: <span class="cor-tinta negrito numeros">' + (existente ? esc(existente.codigo) : "gerado ao salvar") + "</span></p></div>" +

    '<form id="form-imovel" novalidate style="margin-top:24px">' +
    '<div id="resumo-erros"></div>' +

    // Anúncio
    '<fieldset class="secao-form"><legend class="t-h4">Anúncio</legend><div class="form-grade form-grade--2">' +
    '<fieldset><legend class="rotulo">Finalidade</legend><div class="segmentos">' +
    '<label><input type="radio" name="finalidade" value="venda"' + (v.finalidade === "venda" ? " checked" : "") + ">Venda</label>" +
    '<label><input type="radio" name="finalidade" value="aluguel"' + (v.finalidade === "aluguel" ? " checked" : "") + ">Aluguel</label>" +
    "</div></fieldset>" +
    '<div><label class="rotulo" for="pf-tipo">Tipo de imóvel</label><select class="entrada" id="pf-tipo" name="tipo">' +
    Object.entries(Elo.TIPOS).map(([k, r]) => '<option value="' + k + '"' + (v.tipo === k ? " selected" : "") + ">" + r + "</option>").join("") +
    "</select></div>" +
    '<div class="inteiro">' + campo("titulo", "Título do anúncio", { ajuda: "Curto e descritivo, sem caixa-alta. Ex.: Casa térrea com quintal amplo.", max: 80 }) + "</div>" +
    '<div class="inteiro">' + campo("selo", "Selo", { opcional: true, max: 24, exemplo: "Ex.: Aceita permuta", ajuda: "Só preencha se for uma condição real deste imóvel. Aparece em destaque no card." }) + "</div>" +
    '<label class="caixa-marcar inteiro"><input type="checkbox" name="destaque"' + (v.destaque ? " checked" : "") + ">Mostrar em Imóveis em destaque na página inicial</label>" +
    "</div></fieldset>" +

    // Valores
    '<fieldset class="secao-form"><legend class="t-h4">Valores</legend><div class="form-grade form-grade--3">' +
    campo("preco", '<span id="rotulo-preco">' + (v.finalidade === "aluguel" ? "Aluguel mensal" : "Valor de venda") + "</span>", { numerico: true, prefixo: "R$" }) +
    campo("condominio", "Condomínio", { opcional: true, numerico: true, prefixo: "R$", sufixo: "/mês" }) +
    campo("iptu", "IPTU", { opcional: true, numerico: true, prefixo: "R$", sufixo: "/ano" }) +
    '</div><p class="ajuda">Condomínio e IPTU aparecem separados do preço, nunca somados.</p></fieldset>' +

    // Localização
    '<fieldset class="secao-form"><legend class="t-h4">Localização no site</legend>' +
    '<p class="ajuda" style="margin-top:0">Só a cidade e o bairro aparecem no anúncio. O endereço fica na parte sigilosa, abaixo.</p>' +
    '<div class="form-grade form-grade--2">' +
    campo("cidade", "Cidade", { lista: "lista-cidades", max: 60 }) +
    '<datalist id="lista-cidades"></datalist>' +
    campo("bairro", "Bairro", { lista: "lista-bairros", max: 80 }) +
    '<datalist id="lista-bairros"></datalist>' +
    "</div></fieldset>" +

    // Características
    '<fieldset class="secao-form"><legend class="t-h4">Características</legend><div class="form-grade form-grade--5">' +
    campo("dormitorios", "Dormitórios", { numerico: true }) +
    campo("suites", "Suítes", { numerico: true }) +
    campo("vagas", "Vagas", { numerico: true }) +
    campo("areaConstruida", "Área construída", { numerico: true, sufixo: "m²" }) +
    campo("areaTerreno", "Área do terreno", { numerico: true, sufixo: "m²" }) +
    "</div>" +
    '<div class="campo-form" style="margin-top:20px"><label class="rotulo" for="pf-descricao">Descrição</label>' +
    '<textarea class="entrada" id="pf-descricao" name="descricao" rows="6" aria-describedby="pf-descricao-ajuda" data-ajuda="pf-descricao-ajuda">' + valor(v.descricao) + "</textarea>" +
    '<p class="ajuda" id="pf-descricao-ajuda">Ambientes, acabamento, o que há por perto. Escreva só o que foi conferido no imóvel.</p></div>' +
    "</fieldset>" +

    // Proprietário (sigiloso)
    '<fieldset class="secao-form secao-form--sigilo"><legend class="t-h4">' + icone("cadeado", 18) + "Proprietário e endereço</legend>" +
    '<p class="aviso-sigilo t-pequeno">Dados sigilosos: visíveis só para o corretor deste imóvel e para a administração. Nunca aparecem no site.</p>' +
    '<div class="form-grade form-grade--2">' +
    '<div class="campo inteiro"><label class="rotulo" for="pf-endereco">Endereço do imóvel</label>' +
    '<input class="entrada" id="pf-endereco" autocomplete="off" maxlength="160" placeholder="Rua, número e complemento" value="' + valorDono("endereco") + '"></div>' +
    '<div class="campo"><label class="rotulo" for="pf-donoNome">Nome do proprietário</label><input class="entrada" id="pf-donoNome" autocomplete="off" maxlength="100" value="' + valorDono("nome") + '"></div>' +
    '<div class="campo"><label class="rotulo" for="pf-donoDocumento">CPF ou CNPJ <span class="opcional">(opcional)</span></label><input class="entrada" id="pf-donoDocumento" inputmode="numeric" autocomplete="off" data-mascara="cpfCnpj" data-validar="cpfCnpj" maxlength="18" placeholder="000.000.000-00" value="' + valorDono("documento") + '"></div>' +
    '<div class="campo inteiro"><label class="rotulo" for="pf-donoEmail">E-mail <span class="opcional">(opcional)</span></label><input class="entrada" id="pf-donoEmail" type="email" autocomplete="off" value="' + valorDono("email") + '" data-mascara="email" data-validar="email" maxlength="120" placeholder="nome@exemplo.com"></div>' +
    // Dois contatos: o 1º é obrigatório; o 2º é opcional (ex.: cônjuge, filho, zelador).
    contatoHtml(1) +
    contatoHtml(2) +
    '<div class="campo inteiro"><label class="rotulo" for="pf-donoObservacoes">Observações <span class="opcional">(opcional)</span></label>' +
    '<textarea class="entrada" id="pf-donoObservacoes" rows="3" placeholder="Ex.: melhor horário para contato, chaves com o zelador">' + valorDono("observacoes") + "</textarea></div>" +
    "</div></fieldset>" +

    // Fotos
    '<fieldset class="secao-form" id="pf-fotos"><legend class="t-h4">Fotos</legend><div id="envio"></div></fieldset>' +

    // Vídeos: links do YouTube ou do Vimeo (o arquivo fica lá, não no site).
    '<fieldset class="secao-form" id="pf-videos"><legend class="t-h4">' + icone("video", 18) + 'Vídeos <span class="opcional">(opcional)</span></legend>' +
    '<p class="ajuda" style="margin-top:0">Publique o vídeo no YouTube (pode ser como “não listado”) ou no Vimeo e cole o link aqui. Até ' + MAX_VIDEOS + " vídeos.</p>" +
    '<ul class="lista-videos" id="lista-videos"></ul>' +
    '<button type="button" class="botao botao--secundario botao--pequeno" id="mais-video">' + icone("mais", 16) + "Adicionar vídeo</button>" +
    "</fieldset>" +

    '<div class="acoes-form">' +
    '<a class="botao botao--neutro" href="painel-imoveis.html">Cancelar</a>' +
    '<button type="submit" class="botao botao--primario">' + (existente ? "Salvar alterações" : "Cadastrar imóvel") + "</button>" +
    "</div></form>";

  // O erro de cada campo aparece dentro do .campo-form (ver Elo.ui.mostrarErro).
  tela.querySelectorAll(".campo-form").forEach((c) => c.classList.add("campo"));

  const form = document.getElementById("form-imovel");
  const envio = Elo.envioDeFotos(document.getElementById("envio"), v.fotos);

  // ---------------------------------------------------------- vídeos
  const listaVideos = document.getElementById("lista-videos");
  const maisVideo = document.getElementById("mais-video");
  let contadorVideo = 0;

  function linhaVideo(url = "") {
    const n = ++contadorVideo;
    const li = document.createElement("li");
    li.className = "linha-video campo";
    li.innerHTML =
      '<label class="rotulo" for="pf-video-' + n + '">Link do vídeo</label>' +
      '<div class="linha-video__campo">' +
      '<input class="entrada" id="pf-video-' + n + '" type="url" inputmode="url" autocomplete="off" maxlength="200" ' +
      'placeholder="https://www.youtube.com/watch?v=..." value="' + esc(url) + '" data-video>' +
      '<button type="button" class="botao botao--neutro botao--pequeno botao--icone" data-tirar-video>' +
      icone("lixeira", 16) + '<span class="sr-only">Remover este vídeo</span></button></div>';
    listaVideos.appendChild(li);
    atualizarBotaoVideo();
    return li.querySelector("input");
  }
  function atualizarBotaoVideo() {
    maisVideo.hidden = listaVideos.children.length >= MAX_VIDEOS;
  }
  (v.videos || []).forEach((x) => linhaVideo(x.url));
  maisVideo.addEventListener("click", () => linhaVideo().focus());
  listaVideos.addEventListener("click", (e) => {
    const tirar = e.target.closest("[data-tirar-video]");
    if (!tirar) return;
    tirar.closest("li").remove();
    atualizarBotaoVideo();
    maisVideo.focus();
  });

  /** Lê e confere os links. Devolve { videos, erros: [[campo, mensagem]] }. */
  function lerVideos() {
    const videos = [];
    const erros = [];
    listaVideos.querySelectorAll("[data-video]").forEach((campo) => {
      const url = campo.value.trim();
      if (!url) return; // linha vazia é ignorada
      const video = Elo.ui.lerVideo(url);
      if (!video) erros.push([campo, "Cole um link do YouTube ou do Vimeo, como https://www.youtube.com/watch?v=..."]);
      else if (videos.some((x) => x.id === video.id)) erros.push([campo, "Este vídeo já foi adicionado."]);
      else videos.push({ url, ...video });
    });
    return { videos, erros };
  }

  // Sugestões de bairro já usados
  Elo.dados.listNeighborhoods().then((lista) => {
    const nomes = [...new Set(lista.map((b) => b.nome))];
    document.getElementById("lista-bairros").innerHTML = nomes.map((b) => '<option value="' + esc(b) + '">').join("");
  }).catch(() => {});
  // Cidades já usadas + as da região (para digitar menos e sem erro de grafia)
  Elo.dados.listCities().then((lista) => {
    const regiao = ["Presidente Prudente", "Álvares Machado", "Presidente Bernardes", "Regente Feijó", "Pirapozinho", "Martinópolis", "Santo Anastácio", "Presidente Venceslau"];
    const todas = [...new Set([...lista, ...regiao])].sort((a, b) => a.localeCompare(b, "pt-BR"));
    document.getElementById("lista-cidades").innerHTML = todas.map((c) => '<option value="' + esc(c) + '">').join("");
  }).catch(() => {});

  // O rótulo do preço muda com a finalidade
  form.addEventListener("change", (e) => {
    if (e.target.name === "finalidade") {
      document.getElementById("rotulo-preco").textContent = e.target.value === "aluguel" ? "Aluguel mensal" : "Valor de venda";
    }
  });

  // ---------------------------------------------------------- validação
  /** "1.980.000" ou "1980000" -> 1980000 ; vazio -> undefined */
  const numero = (texto) => {
    const digitos = String(texto || "").replace(/\D/g, "");
    return digitos ? Number(digitos) : undefined;
  };

  function validar(d) {
    const erros = {};
    const semQuartos = d.tipo === "terreno" || d.tipo === "sala-comercial";
    if (d.titulo.length < 10) erros.titulo = "Escreva um título com pelo menos 10 caracteres, como “Casa térrea com quintal amplo”.";
    if (!d.preco) erros.preco = d.finalidade === "venda" ? "Informe o valor de venda em reais." : "Informe o aluguel mensal em reais.";
    if (!d.cidade || d.cidade.length < 3 || /\d/.test(d.cidade)) erros.cidade = "Informe a cidade, sem números.";
    if (!d.bairro) erros.bairro = "Informe o bairro.";
    if (d.proprietario.endereco.length < 5) erros.endereco = "Informe a rua e o número. O endereço fica sigiloso, não aparece no site.";
    if (!semQuartos && !d.dormitorios) erros.dormitorios = "Informe o número de dormitórios.";
    if ((d.suites || 0) > (d.dormitorios || 0)) erros.suites = "As suítes não podem passar do número de dormitórios.";
    if (!d.areaConstruida && !d.areaTerreno) erros.areaConstruida = "Informe a área construída ou a área do terreno.";
    if (d.descricao.length < 30) erros.descricao = "Descreva o imóvel com pelo menos 30 caracteres.";
    if (!d.fotos.length) erros.fotos = "Adicione pelo menos uma foto.";
    const dono = d.proprietario;
    if (dono.nome.length < 3 || /\d/.test(dono.nome)) erros.donoNome = "Informe o nome do proprietário, sem números.";
    const doc = dono.documento.replace(/\D/g, "");
    if (doc && Elo.validar.regras.cpfCnpj(doc)) erros.donoDocumento = Elo.validar.regras.cpfCnpj(doc);
    const [c1, c2] = dono.contatos;
    if (Elo.validar.regras.telefone(c1.telefone)) erros.donoTelefone = "Contato 1: " + Elo.validar.regras.telefone(c1.telefone);
    if (c2.nome && !c2.telefone) erros.dono2Telefone = "Contato 2: informe o telefone de " + c2.nome + ".";
    else if (c2.telefone && Elo.validar.regras.telefone(c2.telefone)) erros.dono2Telefone = "Contato 2: " + Elo.validar.regras.telefone(c2.telefone);
    if (dono.email && Elo.validar.regras.email(dono.email)) erros.donoEmail = Elo.validar.regras.email(dono.email);
    return erros;
  }

  function lerFormulario() {
    const f = new FormData(form);
    const texto = (n) => String(f.get(n) || "").trim();
    return {
      finalidade: texto("finalidade"),
      tipo: texto("tipo"),
      titulo: texto("titulo"),
      selo: texto("selo") || undefined,
      destaque: f.get("destaque") === "on",
      preco: numero(f.get("preco")),
      condominio: numero(f.get("condominio")),
      iptu: numero(f.get("iptu")),
      bairro: texto("bairro"),
      cidade: texto("cidade"),
      uf: "SP",
      dormitorios: numero(f.get("dormitorios")) || 0,
      suites: numero(f.get("suites")) || 0,
      vagas: numero(f.get("vagas")) || 0,
      areaConstruida: numero(f.get("areaConstruida")),
      areaTerreno: numero(f.get("areaTerreno")),
      descricao: texto("descricao"),
      fotos: envio.fotos().map((p, i) => ({ url: p.url, alt: p.alt.trim() || "Foto " + (i + 1) + " do imóvel" })),
      videos: lerVideos().videos,
      // Vai para um lugar separado do anúncio (ver createProperty em js/dados.js).
      proprietario: {
        nome: document.getElementById("pf-donoNome").value.trim(),
        documento: document.getElementById("pf-donoDocumento").value.trim(),
        endereco: document.getElementById("pf-endereco").value.trim(),
        contatos: [
          { nome: document.getElementById("pf-dono1Nome").value.trim(), telefone: document.getElementById("pf-donoTelefone").value.trim() },
          { nome: document.getElementById("pf-dono2Nome").value.trim(), telefone: document.getElementById("pf-dono2Telefone").value.trim() },
        ],
        telefone: document.getElementById("pf-donoTelefone").value.trim(), // = contato 1 (compatibilidade)
        email: document.getElementById("pf-donoEmail").value.trim(),
        observacoes: document.getElementById("pf-donoObservacoes").value.trim(),
      },
    };
  }

  /** Caixa no topo com todos os erros; cada um é um link para o campo. */
  function mostrarResumo(erros, mensagemGeral) {
    const lugar = document.getElementById("resumo-erros");
    const chaves = Object.keys(erros);
    if (!chaves.length && !mensagemGeral) {
      lugar.innerHTML = "";
      return;
    }
    lugar.innerHTML =
      '<div class="resumo-erros" tabindex="-1" role="alert" style="margin-bottom:24px">' +
      "<p>" + icone("alerta", 20) + esc(mensagemGeral || "Corrija " + (chaves.length === 1 ? "1 campo" : chaves.length + " campos") + " para salvar:") + "</p>" +
      (chaves.length
        ? '<ul class="t-pequeno">' + chaves.map((k) => '<li><a href="#pf-' + k + '">' + esc(erros[k]) + "</a></li>").join("") + "</ul>"
        : "") +
      "</div>";
    lugar.firstElementChild.focus();
  }

  // --------------------------------------------------------- salvar
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const dados = lerFormulario();
    const erros = validar(dados);

    // Erro embaixo de cada campo
    form.querySelectorAll('[aria-invalid="true"]').forEach(limparErro);
    envio.limparErro();
    for (const [nome, mensagem] of Object.entries(erros)) {
      if (nome === "fotos") envio.mostrarErro(mensagem);
      else mostrarErro(document.getElementById("pf-" + nome), mensagem);
    }
    // Links de vídeo inválidos
    const { erros: errosVideo } = lerVideos();
    listaVideos.querySelectorAll("[data-video]").forEach(limparErro);
    errosVideo.forEach(([campo, mensagem], i) => {
      mostrarErro(campo, mensagem);
      erros["video-" + i] = mensagem;
    });
    mostrarResumo(erros);
    if (Object.keys(erros).length) {
      // O link do resumo leva ao campo de vídeo certo
      errosVideo.forEach(([campo], i) => {
        const a = document.querySelector('#resumo-erros a[href="#pf-video-' + i + '"]');
        if (a) a.setAttribute("href", "#" + campo.id);
      });
      return;
    }

    const restaurar = botaoCarregando(form.querySelector('[type="submit"]'), "Salvando…");
    try {
      if (existente) {
        const salvo = await Elo.dados.updateProperty(existente.id, dados);
        sessionStorage.setItem("elo:aviso", "Alterações salvas no imóvel " + salvo.codigo + ".");
      } else {
        const salvo = await Elo.dados.createProperty(dados);
        sessionStorage.setItem("elo:aviso", "Imóvel cadastrado com o código " + salvo.codigo + ".");
        sessionStorage.setItem("elo:divulgar", salvo.id); // abre o post pronto para as redes
      }
      location.href = "painel-imoveis.html";
    } catch (erro) {
      restaurar();
      mostrarResumo({}, erro.message || "Não foi possível salvar. Tente de novo.");
    }
  });
});

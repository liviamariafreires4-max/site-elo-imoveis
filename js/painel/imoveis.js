/**
 * PAINEL > IMÓVEIS (painel-imoveis.html)
 * ------------------------------------------------------------------
 * Corretor: vê só os imóveis que cadastrou; pode cadastrar e editar.
 *           NÃO existe botão de excluir para ele.
 * Admin:    vê todos, filtra por corretor e é o ÚNICO que retira um imóvel
 *           do site, e só por um destes motivos (Elo.dados.MOTIVOS_REMOCAO):
 *             - vendido (ou alugado) pela Elo
 *             - vendido por outro corretor, sem relação com a Elo
 *           Cada retirada fica registrada no histórico (quem, quando, por quê).
 *
 * Lembrete: esconder o botão é só UX. Ver o TODO de RLS em js/dados.js.
 */
Elo.painel.iniciar({}, function (sessao, tela) {
  const { esc, preco, plural, data, foto } = Elo.ui;
  const icone = Elo.icone;
  const ehAdmin = sessao.role === "admin";
  const corretores = Elo.dados.brokerNames();

  tela.innerHTML =
    '<div class="tela-cabeca"><div>' +
    '<h1 class="t-h2">' + (ehAdmin ? "Todos os imóveis" : "Meus imóveis") + "</h1>" +
    '<p class="t-corpo" id="resumo" aria-live="polite">Carregando…</p></div>' +
    '<a class="botao botao--primario" href="painel-imovel.html">' + icone("mais", 18) + "Cadastrar imóvel</a></div>" +

    '<form class="caixa filtros-painel' + (ehAdmin ? " filtros-painel--4" : "") + '" role="search" aria-label="Filtrar imóveis" id="filtros">' +
    '<div><label class="rotulo" for="f-codigo">Buscar por código</label><input class="entrada" id="f-codigo" type="search" autocomplete="off" placeholder="Ex.: ELO-1007"></div>' +
    '<div><label class="rotulo" for="f-finalidade">Finalidade</label><select class="entrada" id="f-finalidade"><option value="">Todas</option><option value="venda">Venda</option><option value="aluguel">Aluguel</option></select></div>' +
    '<div><label class="rotulo" for="f-tipo">Tipo</label><select class="entrada" id="f-tipo"><option value="">Todos</option>' +
    Object.entries(Elo.TIPOS).map(([v, r]) => '<option value="' + v + '">' + r + "</option>").join("") + "</select></div>" +
    (ehAdmin
      ? '<div><label class="rotulo" for="f-corretor">Corretor</label><select class="entrada" id="f-corretor"><option value="">Todos</option>' +
        Object.entries(corretores).map(([id, nome]) => '<option value="' + esc(id) + '">' + esc(nome) + "</option>").join("") + "</select></div>"
      : "") +
    "</form>" +
    '<div id="lista" style="margin-top:24px"></div>' +
    (ehAdmin ? '<section id="historico" style="margin-top:40px" aria-labelledby="historico-titulo"></section>' : "");

  const lista = document.getElementById("lista");
  const resumo = document.getElementById("resumo");
  const campo = (id) => document.getElementById(id);

  function filtrosAtuais() {
    return {
      codigo: campo("f-codigo").value.trim(),
      finalidade: campo("f-finalidade").value,
      tipo: campo("f-tipo").value,
      // Corretor vê só o que cadastrou; admin escolhe (ou vê todos).
      corretorId: ehAdmin ? (campo("f-corretor").value || undefined) : sessao.userId,
      incluirVendidos: true, // no painel os vendidos continuam na lista, com o selo "Vendido"
    };
  }
  const filtrando = () => {
    const f = filtrosAtuais();
    return Boolean(f.codigo || f.finalidade || f.tipo || (ehAdmin && f.corretorId));
  };

  let pedido = 0;
  async function carregar() {
    const meu = ++pedido;
    if (!lista.querySelector("table")) lista.innerHTML = '<div class="caixa">' + Elo.ui.esqueletoLinhas() + "</div>";
    try {
      const imoveis = await Elo.dados.listProperties(filtrosAtuais());
      if (meu !== pedido) return;
      resumo.textContent =
        plural(imoveis.length, "imóvel", "imóveis") +
        (filtrando() ? " com os filtros atuais." : ehAdmin ? " cadastrados." : " cadastrados por você.");
      desenhar(imoveis);
    } catch {
      if (meu !== pedido) return;
      resumo.textContent = "";
      Elo.ui.falha(lista, "os imóveis", carregar);
    }
  }

  function desenhar(imoveis) {
    if (!imoveis.length) {
      lista.innerHTML = filtrando()
        ? Elo.ui.vazio({
            icone: "busca-vazia",
            titulo: "Nenhum imóvel com esses filtros",
            texto: "Confira o código digitado ou retire um dos filtros.",
            acao: '<button type="button" class="botao botao--secundario" id="limpar">Limpar filtros</button>',
          })
        : Elo.ui.vazio({
            icone: "predio",
            titulo: "Você ainda não cadastrou nenhum imóvel",
            texto: "Os imóveis que você cadastrar aparecem aqui, com o código gerado, para você editar quando precisar.",
            acao: '<a class="botao botao--primario" href="painel-imovel.html">' + icone("mais", 18) + "Cadastrar o primeiro imóvel</a>",
          });
      const limpar = document.getElementById("limpar");
      if (limpar) limpar.addEventListener("click", () => {
        document.getElementById("filtros").reset();
        carregar();
      });
      return;
    }

    lista.innerHTML =
      '<div class="caixa" style="overflow:hidden"><table class="tabela">' +
      '<caption class="sr-only">' + (ehAdmin ? "Todos os imóveis" : "Imóveis cadastrados por você") + "</caption>" +
      "<thead><tr><th scope=\"col\">Imóvel</th><th scope=\"col\">Finalidade</th><th scope=\"col\" class=\"direita\">Preço</th>" +
      '<th scope="col" class="so-largo-tabela">Atualizado</th></tr></thead><tbody>' +
      imoveis.map(linha).join("") +
      "</tbody></table></div>";
  }

  /*
   * Cada imóvel ocupa duas linhas da tabela:
   *   1. os dados (foto, título, finalidade, preço, data);
   *   2. uma faixa com os botões, na largura toda: os de consulta à esquerda
   *      (Ficha, Editar, Ver no site) e os do administrador à direita
   *      (Confirmar venda, Retirar). Assim os botões não espremem o título.
   */
  function linha(p) {
    return (
      '<tr class="linha-imovel">' +
      '<th scope="row"><div class="imovel-linha">' +
      '<span class="miniatura">' + (p.fotos[0] ? '<img src="' + esc(foto(p.fotos[0].url, 120)) + '" alt="">' : "") + "</span>" +
      "<span><span class=\"imovel-linha__titulo\">" + esc(p.titulo) + "</span>" +
      (p.situacao === "vendido" ? '<span class="situacao situacao--vendido">Vendido em ' + data(p.vendidoEm + "T12:00:00") + "</span>" : "") +
      '<span class="cor-suave" style="display:block">' + esc(p.codigo) + " · " + esc(p.bairro) + "</span>" +
      (ehAdmin ? '<span class="cor-suave" style="display:block">Corretor: ' + esc(corretores[p.corretorId] || "sem corretor") + "</span>" : "") +
      "</span></div></th>" +
      '<td><span class="rotulo-celular">Finalidade: </span>' + Elo.FINALIDADES[p.finalidade] + "</td>" +
      '<td class="direita numero cor-tinta negrito"><span class="rotulo-celular" style="font-weight:400">Preço: </span>' + preco(p.preco) +
      (p.finalidade === "aluguel" ? '<span class="cor-suave" style="font-weight:400">/mês</span>' : "") + "</td>" +
      '<td class="so-largo-tabela numero"><span class="rotulo-celular">Atualizado: </span>' + data(p.atualizadoEm) + "</td>" +
      "</tr>" +
      '<tr class="linha-acoes"><td colspan="4"><div class="acoes-imovel" role="group" aria-label="Ações do imóvel ' + esc(p.codigo) + '">' +
      '<div class="acoes-imovel__grupo">' +
      // Ficha: tudo o que este perfil pode ver do imóvel (e como o cliente vê).
      '<button type="button" class="botao botao--neutro botao--pequeno" data-ficha="' + esc(p.id) + '">' + icone("painel", 16) +
      'Ficha<span class="sr-only"> de ' + esc(p.codigo) + "</span></button>" +
      '<a class="botao botao--neutro botao--pequeno" href="painel-imovel.html?id=' + encodeURIComponent(p.id) + '">' + icone("lapis", 16) + 'Editar<span class="sr-only"> ' + esc(p.codigo) + "</span></a>" +
      '<a class="botao botao--neutro botao--pequeno" href="imovel.html?codigo=' + encodeURIComponent(p.codigo) + '" >' + icone("link-externo", 16) + 'Ver no site<span class="sr-only">: ' + esc(p.codigo) + "</span></a>" +
      // Divulgar: post pronto para Instagram, Facebook e Marketplace.
      (p.situacao !== "vendido"
        ? '<button type="button" class="botao botao--neutro botao--pequeno" data-divulgar="' + esc(p.id) + '">' + icone("compartilhar", 16) +
          'Divulgar<span class="sr-only"> ' + esc(p.codigo) + " nas redes sociais</span></button>"
        : "") +
      "</div>" +
      (ehAdmin ? '<div class="acoes-imovel__grupo acoes-imovel__grupo--admin">' : "") +
      // Confirmar venda: SÓ o administrador. Libera a avaliação para o comprador.
      (ehAdmin && p.situacao !== "vendido"
        ? '<button type="button" class="botao botao--secundario botao--pequeno" data-vender="' + esc(p.id) + '" data-codigo="' + esc(p.codigo) + '" data-titulo="' + esc(p.titulo) + '">' +
          icone("check", 16) + 'Confirmar venda<span class="sr-only"> de ' + esc(p.codigo) + "</span></button>"
        : "") +
      // Excluir: SÓ para o administrador. Ver o TODO de RLS em js/dados.js.
      (ehAdmin
        ? '<button type="button" class="botao botao--perigo-contorno botao--pequeno" data-excluir="' + esc(p.id) + '" data-codigo="' + esc(p.codigo) + '" data-titulo="' + esc(p.titulo) + '">' +
          icone("lixeira", 16) + 'Retirar<span class="sr-only"> ' + esc(p.codigo) + " do site</span></button>"
        : "") +
      (ehAdmin ? "</div>" : "") +
      "</div></td></tr>"
    );
  }

  // ============================================================ DIVULGAR
  lista.addEventListener("click", async (e) => {
    const botao = e.target.closest("[data-divulgar]");
    if (!botao) return;
    const imovel = await Elo.dados.getPropertyById(botao.dataset.divulgar);
    if (imovel) Elo.redesSociais.abrir(imovel);
  });

  // Acabou de cadastrar? Abre o post pronto para as redes.
  const recem = sessionStorage.getItem("elo:divulgar");
  if (recem) {
    sessionStorage.removeItem("elo:divulgar");
    Elo.dados.getPropertyById(recem).then((imovel) => imovel && Elo.redesSociais.abrir(imovel, { recemPublicado: true }));
  }

  // ================================================================= FICHA
  /*
   * "Ficha" abre as informações do imóvel separadas por perfil:
   *   - Como eu vejo: tudo que o perfil logado pode ver. Corretor (só dos imóveis
   *     dele) e admin veem também os dados sigilosos: proprietário, contatos e
   *     endereço, quem favoritou e a situação da venda.
   *   - Como o cliente vê: só o que aparece no site.
   */
  lista.addEventListener("click", (e) => {
    const botao = e.target.closest("[data-ficha]");
    if (botao) abrirFicha(botao.dataset.ficha, botao);
  });

  const linhaFicha = (rotulo, valor) =>
    valor === undefined || valor === null || valor === ""
      ? ""
      : '<div><dt class="t-pequeno cor-suave">' + esc(rotulo) + '</dt><dd class="t-corpo">' + valor + "</dd></div>";

  function blocoPublico(p) {
    const area = (v) => (v ? v.toLocaleString("pt-BR") + " m²" : "");
    return (
      '<h3 class="t-h4">' + icone("casa", 18) + "Anúncio (aparece no site)</h3>" +
      '<dl class="ficha-imovel">' +
      linhaFicha("Título", esc(p.titulo)) +
      linhaFicha("Código", esc(p.codigo)) +
      linhaFicha("Tipo e finalidade", esc(Elo.TIPOS[p.tipo]) + " · " + esc(Elo.FINALIDADES[p.finalidade])) +
      linhaFicha("Preço", preco(p.preco) + (p.finalidade === "aluguel" ? "/mês" : "")) +
      linhaFicha("Condomínio", p.condominio ? preco(p.condominio) + "/mês" : "") +
      linhaFicha("IPTU", p.iptu ? preco(p.iptu) + "/ano" : "") +
      linhaFicha("Localização no site", esc(p.bairro) + ", " + esc(p.cidade) + "/" + esc(p.uf)) +
      linhaFicha("Dormitórios / suítes / vagas", (p.dormitorios || 0) + " / " + (p.suites || 0) + " / " + (p.vagas || 0)) +
      linhaFicha("Área construída", area(p.areaConstruida)) +
      linhaFicha("Área do terreno", area(p.areaTerreno)) +
      linhaFicha("Fotos e vídeos", plural(p.fotos.length, "foto", "fotos") + (p.videos && p.videos.length ? " · " + plural(p.videos.length, "vídeo", "vídeos") : "")) +
      linhaFicha("Selo", esc(p.selo || "")) +
      linhaFicha("Em destaque na home", p.destaque ? "Sim" : "Não") +
      '<div class="inteiro"><dt class="t-pequeno cor-suave">Descrição</dt><dd class="t-corpo">' + esc(p.descricao) + "</dd></div>" +
      "</dl>"
    );
  }

  function blocoInterno(p, dono, quem) {
    const contatos = ((dono && dono.contatos) || []).filter((c) => c.telefone);
    return (
      '<h3 class="t-h4" style="margin-top:24px">' + icone("cadeado", 18) + "Dados internos (só equipe)</h3>" +
      '<dl class="ficha-imovel">' +
      linhaFicha("Corretor responsável", esc(corretores[p.corretorId] || "sem corretor")) +
      linhaFicha("Situação", p.situacao === "vendido" ? "Vendido em " + data(p.vendidoEm + "T12:00:00") : "Disponível no site") +
      linhaFicha("Cadastrado em", data(p.criadoEm)) +
      linhaFicha("Última alteração", data(p.atualizadoEm)) +
      linhaFicha("Quem favoritou", quem.length ? quem.map((c) => esc(c.nome)).join(", ") : "Ninguém ainda") +
      "</dl>" +
      '<h3 class="t-h4 sigilo-titulo" style="margin-top:24px">' + icone("cadeado", 18) + "Proprietário e endereço (sigiloso)</h3>" +
      (dono
        ? '<dl class="ficha-imovel ficha-imovel--sigilo">' +
          linhaFicha("Endereço do imóvel", esc(dono.endereco || "Não informado")) +
          linhaFicha("Proprietário", esc(dono.nome)) +
          linhaFicha("CPF ou CNPJ", esc(dono.documento || "")) +
          linhaFicha("E-mail", esc(dono.email || "")) +
          contatos.map((c, i) => linhaFicha("Contato " + (i + 1), esc(c.telefone) + (c.nome ? " · " + esc(c.nome) : ""))).join("") +
          linhaFicha("Observações", esc(dono.observacoes || "")) +
          "</dl>"
        : '<p class="t-corpo">Sem dados do proprietário cadastrados.</p>')
    );
  }

  async function abrirFicha(id, origem) {
    let p, dono, quem;
    try {
      [p, dono, quem] = await Promise.all([
        Elo.dados.getPropertyById(id),
        Elo.dados.getOwner(id).catch(() => null),
        Elo.dados.favoritesReport().then((rel) => ((rel.find((x) => x.imovel.id === id) || { clientes: [] }).clientes)),
      ]);
    } catch {
      Elo.ui.toast("Não foi possível abrir a ficha. Tente de novo.", { tipo: "erro" });
      return;
    }
    if (!p) return;
    const perfil = ehAdmin ? "Administrador" : "Corretor";
    const dialogo = document.createElement("dialog");
    dialogo.className = "modal modal--largo";
    dialogo.setAttribute("aria-labelledby", "ficha-titulo");
    dialogo.innerHTML =
      '<div class="modal__corpo">' +
      '<div class="ficha-cabeca"><h2 class="t-h3" id="ficha-titulo">Ficha do ' + esc(p.codigo) + "</h2>" +
      '<button type="button" class="botao botao--neutro botao--pequeno botao--icone" data-fechar>' + icone("fechar", 18) + '<span class="sr-only">Fechar ficha</span></button></div>' +
      // Escolha do perfil: rádios (teclado e leitor de tela funcionam)
      '<fieldset class="segmentos ficha-perfis"><legend class="sr-only">Ver as informações como</legend>' +
      '<label><input type="radio" name="ficha-perfil" value="eu" checked>Como eu vejo (' + perfil + ")</label>" +
      '<label><input type="radio" name="ficha-perfil" value="cliente">Como o cliente vê</label></fieldset>' +
      '<div class="ficha-conteudo" aria-live="polite"></div>' +
      '<div class="modal__acoes">' +
      '<a class="botao botao--neutro" href="imovel.html?codigo=' + encodeURIComponent(p.codigo) + '" target="_blank" rel="noopener">' + icone("link-externo", 16) + "Abrir no site</a>" +
      '<a class="botao botao--primario" href="painel-imovel.html?id=' + encodeURIComponent(p.id) + '">' + icone("lapis", 16) + "Editar</a></div></div>";
    document.body.appendChild(dialogo);

    const conteudo = dialogo.querySelector(".ficha-conteudo");
    const desenhar = (modo) => {
      conteudo.innerHTML =
        modo === "cliente"
          ? '<p class="t-pequeno ficha-nota">' + icone("pessoas", 16) + "Isto é o que visitantes e clientes veem no site. Endereço, proprietário e quem favoritou ficam escondidos.</p>" +
            (p.situacao === "vendido" ? '<p class="t-corpo">O imóvel está vendido: no site aparece só o aviso “Este imóvel já foi vendido”.</p>' : blocoPublico(p))
          : blocoPublico(p) + blocoInterno(p, dono, quem);
    };
    desenhar("eu");
    dialogo.querySelector(".ficha-perfis").addEventListener("change", (e) => desenhar(e.target.value));

    const fechar = () => {
      dialogo.close();
      setTimeout(() => dialogo.remove(), 200);
      if (origem && origem.isConnected) origem.focus();
    };
    dialogo.querySelector("[data-fechar]").addEventListener("click", fechar);
    dialogo.addEventListener("cancel", (ev) => {
      ev.preventDefault();
      fechar();
    });
    dialogo.addEventListener("click", (ev) => ev.target === dialogo && fechar());
    dialogo.showModal();
  }

  // Confirmar venda (só admin): marca como vendido e diz quem comprou.
  lista.addEventListener("click", (e) => {
    const botao = e.target.closest("[data-vender]");
    if (botao && ehAdmin) abrirVenda(botao.dataset);
  });

  async function abrirVenda({ vender: id, codigo, titulo }) {
    let clientes = [];
    let interessados = [];
    try {
      [clientes, interessados] = await Promise.all([
        Elo.dados.listUsers("cliente"),
        Elo.dados.favoritesReport().then((r) => (r.find((x) => x.imovel.id === id) || { clientes: [] }).clientes.map((c) => c.id)),
      ]);
    } catch {
      Elo.ui.toast("Não foi possível carregar a lista de clientes. Tente de novo.", { tipo: "erro" });
      return;
    }
    // Quem favoritou este imóvel aparece primeiro na lista.
    clientes.sort((a, b) => interessados.includes(b.id) - interessados.includes(a.id));
    const hoje = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

    const dialogo = document.createElement("dialog");
    dialogo.className = "modal";
    dialogo.setAttribute("aria-labelledby", "venda-titulo");
    dialogo.innerHTML =
      '<form class="modal__corpo" novalidate>' +
      '<h2 class="t-h4" id="venda-titulo">Confirmar a venda do imóvel ' + esc(codigo) + "</h2>" +
      '<p class="t-corpo cor-tinta negrito" style="margin-top:8px">' + esc(titulo) + "</p>" +
      '<p class="t-pequeno" style="margin-top:8px">O imóvel sai do site e o comprador passa a poder avaliar o atendimento na área dele.</p>' +
      '<div class="campo"><label class="rotulo" for="venda-cliente">Quem comprou</label>' +
      '<select class="entrada" id="venda-cliente" required data-mensagem-vazio="Escolha o cliente que comprou o imóvel."><option value="">Escolha o cliente</option>' +
      clientes
        .map((c) => '<option value="' + esc(c.id) + '">' + esc(c.nome) + " (" + esc(c.email) + ")" + (interessados.includes(c.id) ? " · favoritou" : "") + "</option>")
        .join("") +
      "</select>" +
      '<p class="ajuda">O comprador precisa ter cadastro no site para avaliar. Se não tiver, peça para ele criar em Criar cadastro.</p></div>' +
      '<div class="campo"><label class="rotulo" for="venda-data">Data da venda</label>' +
      '<input class="entrada" id="venda-data" type="date" required max="' + hoje + '" value="' + hoje + '" data-mensagem-vazio="Informe a data da venda."></div>' +
      '<div class="modal__acoes">' +
      '<button type="button" class="botao botao--neutro" data-cancelar autofocus>Cancelar</button>' +
      '<button type="submit" class="botao botao--primario">Confirmar venda</button></div></form>';
    document.body.appendChild(dialogo);

    const form = dialogo.querySelector("form");
    const fechar = () => {
      dialogo.close();
      setTimeout(() => dialogo.remove(), 200);
    };
    dialogo.querySelector("[data-cancelar]").addEventListener("click", fechar);
    dialogo.addEventListener("cancel", (ev) => {
      ev.preventDefault();
      fechar();
    });
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      if (!Elo.validar.formulario(form)) return;
      const dataVenda = form.querySelector("#venda-data").value;
      if (dataVenda > hoje) {
        Elo.ui.mostrarErro(form.querySelector("#venda-data"), "A data da venda não pode ser no futuro.");
        return;
      }
      const desfazer = Elo.ui.botaoCarregando(form.querySelector('[type="submit"]'), "Confirmando…");
      try {
        await Elo.dados.confirmSale(id, { compradorId: form.querySelector("#venda-cliente").value, data: dataVenda });
        fechar();
        Elo.ui.toast("Venda do " + codigo + " confirmada. O comprador já pode avaliar.");
        carregar();
      } catch (erro) {
        desfazer();
        Elo.ui.toast(erro.message, { tipo: "erro" });
      }
    });
    dialogo.showModal();
  }

  // Retirar do site (só existe na tela do admin). Exige motivo e descrição.
  lista.addEventListener("click", (e) => {
    const botao = e.target.closest("[data-excluir]");
    if (!botao || !ehAdmin) return;
    abrirRetirada(botao.dataset);
  });

  function abrirRetirada({ excluir: id, codigo, titulo }) {
    const dialogo = document.createElement("dialog");
    dialogo.className = "modal";
    dialogo.setAttribute("aria-labelledby", "retirar-titulo");
    dialogo.innerHTML =
      '<form class="modal__corpo" method="dialog" novalidate>' +
      '<h2 class="t-h4" id="retirar-titulo">Retirar o imóvel ' + esc(codigo) + " do site?</h2>" +
      '<p class="t-corpo cor-tinta negrito" style="margin-top:8px">' + esc(titulo) + "</p>" +
      '<p class="t-pequeno" style="margin-top:8px">Um imóvel só sai do site quando foi vendido. A retirada fica registrada com o seu nome, a data e o motivo.</p>' +
      '<fieldset style="margin-top:20px"><legend class="rotulo">Motivo</legend>' +
      Object.entries(Elo.dados.MOTIVOS_REMOCAO)
        .map(([v, rotulo]) => '<label class="caixa-marcar"><input type="radio" name="motivo" value="' + v + '">' + esc(rotulo) + "</label>")
        .join("") +
      '<p class="erro-campo" id="retirar-motivo-erro" hidden>Escolha o motivo da retirada.</p></fieldset>' +
      '<div class="campo"><label class="rotulo" for="retirar-obs">Descreva a venda</label>' +
      '<textarea class="entrada" id="retirar-obs" rows="3" aria-describedby="retirar-obs-ajuda" data-ajuda="retirar-obs-ajuda"></textarea>' +
      '<p class="ajuda" id="retirar-obs-ajuda">Ex.: vendido em 10/11 para o cliente X, escritura no cartório Y; ou: vendido pela imobiliária Z.</p></div>' +
      '<div class="modal__acoes">' +
      '<button type="button" class="botao botao--neutro" data-cancelar autofocus>Manter no site</button>' +
      '<button type="submit" class="botao botao--perigo">Retirar do site</button></div></form>';
    document.body.appendChild(dialogo);

    const form = dialogo.querySelector("form");
    const obs = dialogo.querySelector("#retirar-obs");
    const erroMotivo = dialogo.querySelector("#retirar-motivo-erro");
    const fechar = () => {
      dialogo.close();
      setTimeout(() => dialogo.remove(), 200);
    };
    dialogo.querySelector("[data-cancelar]").addEventListener("click", fechar);
    dialogo.addEventListener("cancel", (ev) => {
      ev.preventDefault();
      fechar();
    });
    form.addEventListener("change", () => (erroMotivo.hidden = true));

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const motivo = (form.querySelector('[name="motivo"]:checked') || {}).value;
      Elo.ui.limparErro(obs);
      erroMotivo.hidden = Boolean(motivo);
      if (obs.value.trim().length < 10) Elo.ui.mostrarErro(obs, "Descreva a venda em pelo menos 10 caracteres.");
      if (!motivo) return form.querySelector('[name="motivo"]').focus();
      if (obs.getAttribute("aria-invalid")) return obs.focus();

      const desfazer = Elo.ui.botaoCarregando(form.querySelector('[type="submit"]'), "Retirando…");
      try {
        await Elo.dados.deleteProperty(id, { motivo, observacao: obs.value });
        fechar();
        Elo.ui.toast("Imóvel " + codigo + " retirado do site.");
        carregar();
        carregarHistorico();
      } catch (erro) {
        desfazer();
        Elo.ui.toast(erro.message, { tipo: "erro" });
      }
    });
    dialogo.showModal();
  }

  // Histórico de retiradas (auditoria), só para o admin.
  async function carregarHistorico() {
    const lugar = document.getElementById("historico");
    if (!lugar) return;
    try {
      const removidos = await Elo.dados.listRemovals();
      const nomes = Elo.dados.brokerNames();
      lugar.innerHTML =
        '<h2 class="t-h3" id="historico-titulo">Histórico de retiradas</h2>' +
        (removidos.length
          ? '<div class="caixa" style="overflow:hidden;margin-top:16px"><table class="tabela"><caption class="sr-only">Imóveis retirados do site</caption>' +
            '<thead><tr><th scope="col">Imóvel</th><th scope="col">Motivo</th><th scope="col">Retirado por</th><th scope="col" class="direita">Data</th></tr></thead><tbody>' +
            removidos
              .map(
                (x) =>
                  '<tr><th scope="row"><span class="imovel-linha__titulo">' + esc(x.codigo) + '</span><span class="cor-suave" style="display:block">' + esc(x.titulo) + "</span></th>" +
                  '<td><span class="rotulo-celular">Motivo: </span>' + esc(Elo.dados.MOTIVOS_REMOCAO[x.motivo] || x.motivo) +
                  '<span class="cor-suave" style="display:block">' + esc(x.observacao) + "</span></td>" +
                  '<td><span class="rotulo-celular">Retirado por: </span>' + esc(nomes[x.removidoPor] || "Administração") + "</td>" +
                  '<td class="direita numero"><span class="rotulo-celular">Data: </span>' + data(x.removidoEm) + "</td></tr>",
              )
              .join("") +
            "</tbody></table></div>"
          : '<p class="t-corpo" style="margin-top:8px">Nenhum imóvel foi retirado do site até agora.</p>');
    } catch {
      lugar.innerHTML = "";
    }
  }
  carregarHistorico();

  // Filtros: refaz a lista a cada mudança (o código espera parar de digitar).
  let espera;
  document.getElementById("filtros").addEventListener("input", (e) => {
    clearTimeout(espera);
    espera = setTimeout(carregar, e.target.id === "f-codigo" ? 300 : 0);
  });
  document.getElementById("filtros").addEventListener("submit", (e) => e.preventDefault());

  carregar();
});

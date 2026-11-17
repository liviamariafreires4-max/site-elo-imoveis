/**
 * PAINEL > CORRETORES (painel-corretores.html) — só administrador
 * Listar, cadastrar direto (já aprovado) e desativar/reativar corretores.
 * Pedidos feitos pelo site ficam em painel-solicitacoes.html.
 */
Elo.painel.iniciar({ somenteAdmin: true }, function (sessao, tela) {
  const { esc, plural, mostrarErro, limparErro, botaoCarregando, EMAIL } = Elo.ui;
  const icone = Elo.icone;

  const SITUACAO = {
    ativo: ["Ativo", "situacao--ativo"],
    pendente: ["Aguardando aprovação", "situacao--pendente"],
    inativo: ["Desativado", "situacao--inativo"],
  };

  tela.innerHTML =
    '<div class="tela-cabeca"><div><h1 class="t-h2">Corretores</h1>' +
    '<p class="t-corpo">Quem pode cadastrar e editar imóveis no painel. Pedidos feitos pelo site ficam em ' +
    '<a class="link" href="painel-solicitacoes.html">Solicitações</a>.</p></div>' +
    '<button type="button" class="botao botao--primario" id="abrir-convite">' + icone("convidar", 18) + "Cadastrar corretor</button></div>" +

    '<form class="caixa caixa--espaco" id="form-convite" novalidate hidden style="margin-top:24px" aria-labelledby="convite-titulo">' +
    '<h2 class="t-h4" id="convite-titulo">Cadastrar corretor</h2>' +
    '<p class="t-pequeno" style="margin-top:4px">O corretor entra já aprovado. Esboço: nenhum e-mail é enviado; avise-o de que pode entrar com este e-mail.</p>' +
    '<div class="form-grade form-grade--2" style="margin-top:20px">' +
    '<div class="campo"><label class="rotulo" for="inv-nome">Nome completo</label><input class="entrada" id="inv-nome" autocomplete="off" data-mascara="nome" data-validar="nome" maxlength="80"></div>' +
    '<div class="campo"><label class="rotulo" for="inv-email">E-mail</label><input class="entrada" id="inv-email" type="email" autocomplete="off" data-mascara="email" data-validar="email" maxlength="120" placeholder="nome@exemplo.com"></div>' +
    '<div class="campo"><label class="rotulo" for="inv-telefone">Telefone <span class="opcional">(opcional)</span></label><input class="entrada" id="inv-telefone" type="tel" autocomplete="off" data-mascara="telefone" data-validar="telefone" maxlength="15" placeholder="(18) 99999-0000"></div>' +
    '<div class="campo"><label class="rotulo" for="inv-creci">CRECI <span class="opcional">(opcional)</span></label><input class="entrada" id="inv-creci" autocomplete="off" data-mascara="creci" data-validar="creci" maxlength="16" placeholder="Ex.: CRECI 123456-F"></div>' +
    "</div>" +
    '<div class="acoes-form"><button type="button" class="botao botao--neutro" id="cancelar-convite">Cancelar</button>' +
    '<button type="submit" class="botao botao--primario">Cadastrar corretor</button></div>' +
    "</form>" +
    '<div id="lista" style="margin-top:24px"></div>';

  const lista = document.getElementById("lista");
  const form = document.getElementById("form-convite");
  const abrir = document.getElementById("abrir-convite");
  const nome = document.getElementById("inv-nome");
  const email = document.getElementById("inv-email");

  // Quantos imóveis cada corretor tem
  let contagem = {};

  async function carregar() {
    if (!lista.querySelector("table")) lista.innerHTML = '<div class="caixa">' + Elo.ui.esqueletoLinhas(4) + "</div>";
    try {
      const [todos, imoveis] = await Promise.all([Elo.dados.listUsers("corretor"), Elo.dados.listProperties({ incluirVendidos: true })]);
      // Pendentes ficam em Solicitações; recusados não entram na equipe.
      const corretores = todos.filter((u) => u.situacao === "ativo" || u.situacao === "inativo");
      contagem = {};
      imoveis.forEach((p) => (contagem[p.corretorId] = (contagem[p.corretorId] || 0) + 1));
      desenhar(corretores);
    } catch {
      Elo.ui.falha(lista, "os corretores", carregar);
    }
  }

  function desenhar(corretores) {
    if (!corretores.length) {
      lista.innerHTML = Elo.ui.vazio({
        icone: "pessoa",
        titulo: "Nenhum corretor cadastrado",
        texto: "Cadastre o primeiro corretor ou aprove uma solicitação para que ele possa cadastrar imóveis.",
      });
      return;
    }
    lista.innerHTML =
      '<div class="caixa" style="overflow:hidden"><table class="tabela"><caption class="sr-only">Corretores</caption>' +
      '<thead><tr><th scope="col">Corretor</th><th scope="col">Situação</th><th scope="col" class="direita">Imóveis</th><th scope="col" class="direita">Ações</th></tr></thead><tbody>' +
      corretores
        .map((u) => {
          const [rotulo, classe] = SITUACAO[u.situacao];
          return (
            "<tr>" +
            '<th scope="row"><span class="imovel-linha__titulo">' + esc(u.nome) + '</span><span class="cor-suave" style="display:block;word-break:break-all">' + esc(u.email) + "</span></th>" +
            '<td><span class="situacao ' + classe + '">' + rotulo + "</span></td>" +
            '<td class="direita numero"><span class="rotulo-celular">Imóveis: </span>' + (contagem[u.id] || 0) + "</td>" +
            '<td><div class="acoes-linha">' +
            (u.situacao === "inativo"
              ? '<button type="button" class="botao botao--neutro botao--pequeno" data-reativar="' + esc(u.id) + '" data-nome="' + esc(u.nome) + '">Reativar<span class="sr-only"> ' + esc(u.nome) + "</span></button>"
              : '<button type="button" class="botao botao--neutro botao--pequeno" data-desativar="' + esc(u.id) + '" data-nome="' + esc(u.nome) + '">Desativar<span class="sr-only"> ' + esc(u.nome) + "</span></button>") +
            "</div></td></tr>"
          );
        })
        .join("") +
      "</tbody></table></div>";
  }

  // --------------------------------------------------- desativar / reativar
  lista.addEventListener("click", async (e) => {
    const desativar = e.target.closest("[data-desativar]");
    const reativar = e.target.closest("[data-reativar]");
    if (desativar) {
      const { desativar: id, nome: nomeCorretor } = desativar.dataset;
      Elo.ui.confirmar({
        titulo: "Desativar " + nomeCorretor + "?",
        texto:
          "<p>Ele deixa de entrar no painel. Os " + plural(contagem[id] || 0, "imóvel cadastrado", "imóveis cadastrados") +
          " por ele continuam no site, e você pode reativá-lo quando quiser.</p>",
        confirmar: "Desativar corretor",
        cancelar: "Manter ativo",
        aoConfirmar: async () => {
          await Elo.dados.setBrokerActive(id, false);
          Elo.ui.toast(nomeCorretor + " foi desativado.");
          carregar();
        },
      });
    }
    if (reativar) {
      try {
        await Elo.dados.setBrokerActive(reativar.dataset.reativar, true);
        Elo.ui.toast(reativar.dataset.nome + " foi reativado.");
        carregar();
      } catch (erro) {
        Elo.ui.toast(erro.message, { tipo: "erro" });
      }
    }
  });

  // ------------------------------------------------------------ cadastrar
  function fecharConvite() {
    form.hidden = true;
    form.reset();
    limparErro(nome);
    limparErro(email);
    abrir.hidden = false;
    abrir.focus();
  }
  abrir.addEventListener("click", () => {
    form.hidden = false;
    abrir.hidden = true;
    nome.focus();
  });
  document.getElementById("cancelar-convite").addEventListener("click", fecharConvite);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    limparErro(nome);
    limparErro(email);
    let erro = false;
    if (Elo.validar.regras.nome(nome.value)) {
      mostrarErro(nome, Elo.validar.regras.nome(nome.value));
      erro = true;
    }
    if (Elo.validar.regras.email(email.value)) {
      mostrarErro(email, Elo.validar.regras.email(email.value));
      erro = true;
    }
    // Telefone e CRECI são opcionais, mas se vierem precisam estar certos.
    for (const id of ["inv-telefone", "inv-creci"]) {
      const el = document.getElementById(id);
      const msg = Elo.validar.campo(el);
      if (msg) {
        mostrarErro(el, msg);
        erro = true;
      } else limparErro(el);
    }
    if (erro) {
      form.querySelector('[aria-invalid="true"]').focus();
      return;
    }
    const restaurar = botaoCarregando(form.querySelector('[type="submit"]'), "Cadastrando…");
    try {
      await Elo.dados.addBroker({
        nome: nome.value,
        email: email.value,
        telefone: document.getElementById("inv-telefone").value,
        creci: document.getElementById("inv-creci").value,
      });
      Elo.ui.toast(nome.value.trim() + " foi cadastrado e já pode entrar no painel.");
      restaurar();
      fecharConvite();
      carregar();
    } catch (falha) {
      restaurar();
      mostrarErro(email, falha.message);
      email.focus();
    }
  });

  carregar();
});

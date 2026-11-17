/**
 * PAINEL > DADOS DA ELO (painel-empresa.html) — só administrador
 * ------------------------------------------------------------------
 * 1. Contato da imobiliária: telefone, WhatsApp, e-mail, endereço, horário,
 *    CRECI e CNPJ. Ao salvar, o site todo passa a usar os novos valores:
 *    botão verde do WhatsApp, rodapé, Contato, Sobre, home.
 *    (Elo.dados.updateCompany grava; aplicarEmpresa em js/dados.js aplica.)
 * 2. Conta do administrador: nome e e-mail de acesso.
 */
Elo.painel.iniciar({ somenteAdmin: true }, async function (sessao, tela) {
  const { esc, botaoCarregando, toast, mostrarErro } = Elo.ui;
  const icone = Elo.icone;

  tela.innerHTML = '<div class="caixa">' + Elo.ui.esqueletoLinhas(5) + "</div>";
  let conta;
  try {
    conta = await Elo.dados.getMyAccount();
  } catch {
    Elo.ui.falha(tela, "os dados", () => location.reload());
    return;
  }
  const e = Elo.dados.getCompany();
  const v = (x) => esc(x || "");
  const soDigitos = (x) => String(x || "").replace(/\D/g, "");
  // Marcado quando os dois números já são iguais (o caso mais comum).
  const mesmoNumero = soDigitos(e.whatsapp) === "55" + soDigitos(e.telefone);

  tela.innerHTML =
    '<div class="tela-cabeca"><div><h1 class="t-h2">Dados da Elo</h1>' +
    '<p class="t-corpo">O que você salvar aqui aparece no site na hora: rodapé, página de contato e botão do WhatsApp.</p></div></div>' +

    '<form id="form-empresa" class="perfil-form" novalidate style="margin-top:24px">' +
    '<fieldset class="secao-form"><legend class="t-h4">Contato da imobiliária</legend><div class="form-grade form-grade--2">' +
    '<div class="campo"><label class="rotulo" for="e-telefone">Telefone</label>' +
    '<input class="entrada" id="e-telefone" type="tel" required data-mascara="telefone" data-validar="telefone" maxlength="15" value="' + v(e.telefone) + '"></div>' +
    '<label class="caixa-marcar inteiro"><input type="checkbox" id="e-mesmo"' + (mesmoNumero ? " checked" : "") + ">" +
    "O WhatsApp é o mesmo número do telefone</label>" +
    '<div class="campo"><label class="rotulo" for="e-whatsapp">WhatsApp (botão verde e links do site)</label>' +
    '<input class="entrada" id="e-whatsapp" inputmode="numeric" required data-mascara="whatsapp" data-validar="whatsapp" maxlength="13" value="' + v(e.whatsapp) + '" aria-describedby="e-whatsapp-ajuda" data-ajuda="e-whatsapp-ajuda">' +
    '<p class="ajuda" id="e-whatsapp-ajuda">Só números, com 55 e DDD. Ex.: 5518997701001.</p></div>' +
    '<div class="campo"><label class="rotulo" for="e-email">E-mail de contato</label>' +
    '<input class="entrada" id="e-email" type="email" required data-mascara="email" data-validar="email" maxlength="120" value="' + v(e.email) + '"></div>' +
    '<div class="campo"><label class="rotulo" for="e-horario">Horário de atendimento</label>' +
    '<input class="entrada" id="e-horario" required data-min="10" maxlength="120" value="' + v(e.horario) + '"></div>' +
    '<div class="campo inteiro"><label class="rotulo" for="e-endereco">Endereço</label>' +
    '<input class="entrada" id="e-endereco" required data-min="10" maxlength="160" value="' + v(e.endereco) + '"></div>' +
    '<div class="campo"><label class="rotulo" for="e-creci">CRECI da imobiliária</label>' +
    '<input class="entrada" id="e-creci" required data-mascara="creci" data-validar="creci" maxlength="16" value="' + v(e.creci) + '"></div>' +
    '<div class="campo"><label class="rotulo" for="e-cnpj">CNPJ</label>' +
    '<input class="entrada" id="e-cnpj" required inputmode="numeric" data-mascara="cpfCnpj" data-validar="cpfCnpj" maxlength="18" value="' + v(e.cnpj) + '"></div>' +
    "</div></fieldset>" +
    '<div class="acoes-form"><a class="botao botao--neutro" href="index.html" target="_blank" rel="noopener">' + icone("link-externo", 16) + "Ver o site</a>" +
    '<button type="submit" class="botao botao--primario">Salvar dados da Elo</button></div>' +
    "</form>" +

    '<form id="form-admin" class="perfil-form" novalidate style="margin-top:40px">' +
    '<fieldset class="secao-form"><legend class="t-h4">Conta do administrador</legend><div class="form-grade form-grade--2">' +
    '<div class="campo"><label class="rotulo" for="a-nome">Nome</label>' +
    '<input class="entrada" id="a-nome" required data-min="3" maxlength="80" value="' + v(conta.nome) + '"></div>' +
    '<div class="campo"><label class="rotulo" for="a-email">E-mail de acesso</label>' +
    '<input class="entrada" id="a-email" type="email" required data-mascara="email" data-validar="email" maxlength="120" value="' + v(conta.email) + '"></div>' +
    "</div></fieldset>" +
    '<div class="acoes-form"><button type="submit" class="botao botao--primario">Salvar conta</button></div>' +
    "</form>";

  const formEmpresa = document.getElementById("form-empresa");

  // "Mesmo número": o WhatsApp acompanha o telefone enquanto a caixa estiver marcada.
  const campoTel = document.getElementById("e-telefone");
  const campoZap = document.getElementById("e-whatsapp");
  const mesmo = document.getElementById("e-mesmo");
  function sincronizar() {
    campoZap.readOnly = mesmo.checked;
    if (mesmo.checked) {
      campoZap.value = soDigitos(campoTel.value) ? "55" + soDigitos(campoTel.value) : "";
      Elo.ui.limparErro(campoZap);
    }
  }
  campoTel.addEventListener("input", sincronizar);
  mesmo.addEventListener("change", () => {
    sincronizar();
    if (!mesmo.checked) campoZap.focus();
  });
  sincronizar();
  formEmpresa.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (!Elo.validar.formulario(formEmpresa)) return;
    const desfazer = botaoCarregando(formEmpresa.querySelector('[type="submit"]'), "Salvando…");
    try {
      const ler = (id) => document.getElementById(id).value.trim();
      const creci = ler("e-creci");
      await Elo.dados.updateCompany({
        telefone: ler("e-telefone"),
        whatsapp: ler("e-whatsapp"),
        email: ler("e-email"),
        horario: ler("e-horario"),
        endereco: ler("e-endereco"),
        creci: /^CRECI/i.test(creci) ? creci : "CRECI " + creci,
        cnpj: ler("e-cnpj"),
      });
      toast("Dados da Elo atualizados: telefone, WhatsApp e e-mail já mudaram em todas as páginas.", { acao: { rotulo: "Ver o site", href: "contato.html" } });
    } catch (erro) {
      toast(erro.message || "Não foi possível salvar.", { tipo: "erro" });
    } finally {
      desfazer();
    }
  });

  const formAdmin = document.getElementById("form-admin");
  formAdmin.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (!Elo.validar.formulario(formAdmin)) return;
    const desfazer = botaoCarregando(formAdmin.querySelector('[type="submit"]'), "Salvando…");
    try {
      await Elo.dados.updateMyAccount({ nome: document.getElementById("a-nome").value, email: document.getElementById("a-email").value });
      toast("Conta do administrador atualizada. Use o novo e-mail para entrar.");
    } catch (erro) {
      mostrarErro(document.getElementById("a-email"), erro.message);
      document.getElementById("a-email").focus();
    } finally {
      desfazer();
    }
  });
});

/**
 * ENTRAR (entrar.html)
 * ------------------------------------------------------------------
 * 1. Formulário de e-mail e senha  -> Elo.auth.signIn(email, senha)
 * 2. Login de desenvolvimento      -> Elo.auth.signInAsDev("cliente" | "corretor" | "admin")
 *
 * Depois de entrar:
 *   - cliente vai para favoritos.html (ou volta para a página de onde veio,
 *     se chegou aqui pelo coração: entrar.html?proximo=imovel.html?codigo=ELO-1001)
 *   - corretor e admin vão para painel-imoveis.html
 *
 * Contas de exemplo (qualquer senha com 6+ caracteres):
 *   camila@cliente.example      (cliente)
 *   marina@eloimoveis.example   (corretor)
 *   admin@eloimoveis.example    (administrador)
 */
(function () {
  const { toast, mostrarErro, limparErro, botaoCarregando, EMAIL, esc } = Elo.ui;

  const form = document.getElementById("form-entrar");
  const campoEmail = document.getElementById("email");
  const campoSenha = document.getElementById("senha");

  // ------------------------------------------------- para onde ir depois
  /** Só aceita destino dentro do site (evita mandar a pessoa para outro site). */
  function destinoSeguro() {
    const proximo = Elo.ui.param("proximo");
    if (!proximo || proximo.includes("//") || proximo.includes(":")) return null;
    return proximo;
  }

  function irParaAreaDo(sessao) {
    const proximo = destinoSeguro();
    location.href = sessao.role === "cliente" && proximo ? proximo : Elo.auth.homeFor(sessao.role);
  }

  // ---------------------------------------------- aviso "já está logado"
  const sessaoAtual = Elo.auth.getSession();
  if (sessaoAtual) {
    const aviso = document.getElementById("ja-logado");
    aviso.innerHTML =
      "Você já está na conta de " + esc(sessaoAtual.nome) + '. <a class="link" href="' + Elo.auth.homeFor(sessaoAtual.role) + '">Ir para a minha área</a>';
    aviso.hidden = false;
  }

  // ------------------------------------------- 1. e-mail e senha
  form.addEventListener("submit", async (evento) => {
    evento.preventDefault(); // não recarrega a página

    const email = campoEmail.value.trim();
    const senha = campoSenha.value;

    // Validação antes de "enviar"
    limparErro(campoEmail);
    limparErro(campoSenha);
    let temErro = false;
    if (!EMAIL.test(email)) {
      mostrarErro(campoEmail, "Digite um e-mail no formato nome@exemplo.com.");
      temErro = true;
    }
    if (!senha) {
      mostrarErro(campoSenha, "Digite sua senha.");
      temErro = true;
    }
    if (temErro) {
      (campoEmail.getAttribute("aria-invalid") ? campoEmail : campoSenha).focus();
      return;
    }

    const restaurarBotao = botaoCarregando(form.querySelector('[type="submit"]'), "Entrando…");
    try {
      const sessao = await Elo.auth.signIn(email, senha);
      toast("Olá, " + sessao.nome.split(" ")[0] + ". Você entrou na sua conta.");
      setTimeout(() => irParaAreaDo(sessao), 500);
    } catch (erro) {
      // O erro diz em qual campo mostrar a mensagem (erro.campo = "email" ou "senha").
      const campo = erro.campo === "senha" ? campoSenha : campoEmail;
      mostrarErro(campo, erro.message);
      campo.focus();
      restaurarBotao();
    }
  });

  // ------------------------------------- 2. login de desenvolvimento
  document.querySelectorAll("[data-perfil]").forEach((botao) => {
    botao.addEventListener("click", async () => {
      const perfil = botao.dataset.perfil; // "cliente", "corretor" ou "admin"
      const sessao = await Elo.auth.signInAsDev(perfil);
      toast("Você entrou como " + Elo.auth.NOMES_PERFIL[perfil].toLowerCase() + ": " + sessao.nome + ".");
      setTimeout(() => irParaAreaDo(sessao), 500);
    });
  });

  // Liga/desliga a falha simulada (para ver as telas de erro das listas).
  const simular = document.getElementById("simular-erro");
  simular.checked = Elo.dados.simulandoErro();
  simular.addEventListener("change", () => {
    Elo.dados.simularErro(simular.checked);
    toast(simular.checked ? "Falha de conexão simulada ligada." : "Falha de conexão simulada desligada.");
  });

  document.getElementById("restaurar").addEventListener("click", () => {
    Elo.dados.resetarDados();
    toast("Dados de exemplo restaurados.");
  });
})();

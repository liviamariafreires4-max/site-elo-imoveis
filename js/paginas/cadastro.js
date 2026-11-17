/**
 * CADASTRO DE CLIENTE (cadastro.html)
 * ------------------------------------------------------------------
 * Valida os campos e chama Elo.auth.signUp(). O cadastro público sempre
 * cria uma conta de CLIENTE; corretores pedem acesso em seja-corretor.html.
 *
 * Para acrescentar um campo (ex.: CPF):
 *   1. coloque o <div class="campo"> no cadastro.html
 *   2. valide aqui embaixo, no mesmo formato dos outros
 *   3. passe o valor para Elo.auth.signUp e guarde em js/auth.js
 */
(function () {
  const { toast, mostrarErro, limparErro, botaoCarregando, EMAIL } = Elo.ui;
  const form = document.getElementById("form-cadastro");
  const campo = (id) => document.getElementById(id);

  /** Cada regra devolve a mensagem de erro, ou null se estiver tudo certo. */
  const regras = {
    // As regras ficam em js/validacao.js (as mesmas do site todo).
    nome: (v) => Elo.validar.regras.nome(v),
    email: (v) => Elo.validar.regras.email(v),
    telefone: (v) => (v ? Elo.validar.regras.telefone(v) : null), // opcional
    senha: (v) => Elo.validar.regras.senhaNova(v),
  };

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const valores = {
      nome: campo("nome").value.trim(),
      email: campo("email").value.trim(),
      telefone: campo("telefone").value.trim(),
      senha: campo("senha").value,
    };

    // Valida todos e foca o primeiro com erro.
    let primeiroErro = null;
    for (const nome of Object.keys(regras)) {
      const mensagem = regras[nome](valores[nome]);
      if (mensagem) {
        mostrarErro(campo(nome), mensagem);
        primeiroErro = primeiroErro || campo(nome);
      } else {
        limparErro(campo(nome));
      }
    }
    if (primeiroErro) {
      primeiroErro.focus();
      return;
    }

    const restaurarBotao = botaoCarregando(form.querySelector('[type="submit"]'), "Criando cadastro…");
    try {
      await Elo.auth.signUp(valores);
      toast("Cadastro criado. Agora você pode salvar imóveis.");
      setTimeout(() => (location.href = "favoritos.html"), 500);
    } catch (erro) {
      const alvo = campo(erro.campo || "email");
      mostrarErro(alvo, erro.message);
      alvo.focus();
      restaurarBotao();
    }
  });
})();

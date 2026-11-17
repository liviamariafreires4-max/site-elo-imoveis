/**
 * SOLICITAÇÃO DE CORRETOR (seja-corretor.html)
 * ------------------------------------------------------------------
 * O corretor pede acesso; a conta nasce "pendente" e só entra no painel
 * depois que o administrador aprovar em painel-solicitacoes.html.
 */
(function () {
  const { mostrarErro, limparErro, botaoCarregando, EMAIL, esc } = Elo.ui;
  const form = document.getElementById("form-corretor");
  const campo = (id) => document.getElementById(id);

  const regras = {
    // As regras ficam em js/validacao.js (as mesmas do site todo).
    nome: (v) => Elo.validar.regras.nome(v),
    email: (v) => Elo.validar.regras.email(v),
    telefone: (v) => Elo.validar.regras.telefone(v),
    creci: (v) => Elo.validar.regras.creci(v),
    senha: (v) => Elo.validar.regras.senhaNova(v),
  };

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const valores = {
      nome: campo("nome").value.trim(),
      email: campo("email").value.trim(),
      telefone: campo("telefone").value.trim(),
      creci: campo("creci").value.trim(),
      mensagem: campo("mensagem").value.trim(),
      senha: campo("senha").value,
    };

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
    if (primeiroErro) return primeiroErro.focus();

    const restaurar = botaoCarregando(form.querySelector('[type="submit"]'), "Enviando…");
    try {
      // A senha NÃO é guardada neste esboço.
      await Elo.dados.requestBrokerAccess({ ...valores, creci: "CRECI " + valores.creci.replace(/^creci\s*/i, "") });
      const area = document.getElementById("area-form");
      area.innerHTML =
        '<div class="sucesso sucesso--pilha" role="status" tabindex="-1">' +
        '<h1 class="t-h2 sucesso__titulo">' + Elo.icone("check", 28) + "Solicitação enviada</h1>" +
        '<p class="t-corpo">Obrigado, ' + esc(valores.nome.split(" ")[0]) + ". A administração da Elo vai conferir seus dados. " +
        "Depois da aprovação, entre com <strong>" + esc(valores.email) + "</strong> para acessar o painel.</p>" +
        '<a class="botao botao--secundario" href="index.html">Voltar para a página inicial</a></div>';
      area.firstElementChild.focus();
    } catch (erro) {
      restaurar();
      const alvo = campo(erro.campo || "email");
      mostrarErro(alvo, erro.message);
      alvo.focus();
    }
  });
})();

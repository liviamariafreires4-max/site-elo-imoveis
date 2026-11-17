/**
 * FORMULÁRIOS DE CONTATO (Contato, Anuncie, Agendar visita)
 * ------------------------------------------------------------------
 * Valida pelo próprio HTML:
 *   required        -> "Preencha o campo Nome."
 *   type="email"    -> formato nome@exemplo.com
 *   type="tel"      -> pelo menos 10 dígitos (com DDD)
 * A mensagem aparece embaixo do campo e o foco vai para o primeiro erro.
 *
 * Uso:
 *   Elo.formularioContato(document.getElementById("form-contato"), {
 *     sucessoTitulo: "Mensagem enviada",
 *     sucessoTexto: "Recebemos sua mensagem...",
 *   });
 *
 * TODO(backend): hoje o envio é simulado; ligar a um endpoint ou tabela "contatos".
 */
window.Elo = window.Elo || {};

Elo.formularioContato = function (form, { sucessoTitulo, sucessoTexto }) {
  const { esc, mostrarErro, limparErro, botaoCarregando, EMAIL } = Elo.ui;

  function nomeDoCampo(campo) {
    const rotulo = form.querySelector('label[for="' + campo.id + '"]');
    return rotulo ? rotulo.childNodes[0].textContent.trim().toLowerCase() : "este campo";
  }

  function validar(campo) {
    const valor = campo.value.trim();
    if (campo.required && !valor) {
      return campo.tagName === "SELECT" ? "Escolha uma opção em " + nomeDoCampo(campo) + "." : "Preencha o campo " + nomeDoCampo(campo) + ".";
    }
    // E-mail, telefone, nome...: regras de js/validacao.js (data-validar no campo).
    if (valor && campo.dataset.validar) return Elo.validar.regras[campo.dataset.validar](valor);
    return null;
  }

  form.noValidate = true; // as mensagens são nossas, não as do navegador
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let primeiro = null;
    for (const campo of form.querySelectorAll("input, select, textarea")) {
      if (!campo.name) continue;
      const erro = validar(campo);
      if (erro) {
        mostrarErro(campo, erro);
        primeiro = primeiro || campo;
      } else {
        limparErro(campo);
      }
    }
    if (primeiro) {
      primeiro.focus();
      return;
    }

    const restaurar = botaoCarregando(form.querySelector('[type="submit"]'), "Enviando…");
    await new Promise((r) => setTimeout(r, 700)); // envio simulado
    restaurar();

    // Troca o formulário pela confirmação (e leva o foco até ela).
    const aviso = document.createElement("div");
    aviso.className = "sucesso";
    aviso.tabIndex = -1;
    aviso.setAttribute("role", "status");
    aviso.innerHTML =
      '<p class="t-h4 sucesso__titulo">' + Elo.icone("check", 24) + esc(sucessoTitulo) + "</p>" +
      '<p class="t-corpo" style="margin-top:8px">' + esc(sucessoTexto) + "</p>" +
      '<button type="button" class="botao botao--neutro botao--pequeno" style="margin-top:24px">Enviar outra mensagem</button>';
    form.hidden = true;
    form.after(aviso);
    aviso.focus();
    aviso.querySelector("button").addEventListener("click", () => {
      form.reset();
      aviso.remove();
      form.hidden = false;
      form.querySelector("input, select, textarea").focus();
    });
  });
};

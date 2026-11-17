/**
 * VALIDAÇÃO E MÁSCARAS DOS CAMPOS
 * ------------------------------------------------------------------
 * Um lugar só para as regras de todos os formulários do site.
 *
 * No HTML:
 *   <input data-mascara="telefone">   formata enquanto digita: (18) 99999-0000
 *   <input data-validar="email">      confere ao sair do campo e ao enviar
 *
 * No JavaScript:
 *   Elo.validar.regras.email("x@y.com")  -> null (ok) ou a mensagem de erro
 *   Elo.validar.formulario(form)         -> true se tudo certo; senão mostra
 *                                           os erros e foca o primeiro campo
 *
 * Campos com `required` vazios também dão erro. Campo opcional vazio passa.
 *
 * ATENÇÃO: validar no navegador ajuda quem preenche, mas não protege nada.
 * O backend precisa repetir estas regras antes de gravar.
 */
window.Elo = window.Elo || {};

(function () {
  const digitos = (v) => String(v || "").replace(/\D/g, "");

  // ------------------------------------------------------------ CPF e CNPJ
  function cpfValido(v) {
    const d = digitos(v);
    if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
    for (const t of [9, 10]) {
      let soma = 0;
      for (let i = 0; i < t; i++) soma += Number(d[i]) * (t + 1 - i);
      if (((soma * 10) % 11) % 10 !== Number(d[t])) return false;
    }
    return true;
  }

  function cnpjValido(v) {
    const d = digitos(v);
    if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
    const pesos = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    for (const t of [12, 13]) {
      let soma = 0;
      for (let i = 0; i < t; i++) soma += Number(d[i]) * pesos[i + (13 - t)];
      const resto = soma % 11;
      if ((resto < 2 ? 0 : 11 - resto) !== Number(d[t])) return false;
    }
    return true;
  }

  // ---------------------------------------------------------------- regras
  /** Cada regra devolve null (tudo certo) ou a mensagem de erro. */
  const regras = {
    nome(v) {
      v = String(v).trim();
      if (!v) return "Digite seu nome completo.";
      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(v)) return "Use só letras no nome, sem números ou símbolos.";
      if (v.split(/\s+/).filter((p) => p.length >= 2).length < 2) return "Digite nome e sobrenome.";
      return null;
    },
    email(v) {
      v = String(v).trim();
      if (!v) return "Digite seu e-mail.";
      if (/\s/.test(v) || /\.\./.test(v) || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(v)) {
        return "Digite um e-mail válido, no formato nome@exemplo.com.";
      }
      return null;
    },
    telefone(v) {
      const d = digitos(v);
      if (!d) return "Digite o telefone com DDD.";
      if (d.length < 10 || d.length > 11) return "O telefone tem DDD e 8 ou 9 números. Ex.: (18) 99999-0000.";
      if (Number(d.slice(0, 2)) < 11) return "Confira o DDD do telefone.";
      if (d.length === 11 && d[2] !== "9") return "Celular com 9 números começa com 9. Ex.: (18) 99999-0000.";
      return null;
    },
    whatsapp(v) {
      const d = digitos(v);
      if (!d) return "Digite o número do WhatsApp.";
      if (!d.startsWith("55") || d.length < 12 || d.length > 13) return "Use 55, o DDD e o número, só com números. Ex.: 5518999990000.";
      return null;
    },
    cpf(v) {
      return cpfValido(v) ? null : "CPF inválido. Confira os 11 números.";
    },
    cpfCnpj(v) {
      const d = digitos(v);
      if (d.length === 11) return cpfValido(d) ? null : "CPF inválido. Confira os 11 números.";
      if (d.length === 14) return cnpjValido(d) ? null : "CNPJ inválido. Confira os 14 números.";
      return "Digite um CPF (11 números) ou um CNPJ (14 números).";
    },
    creci(v) {
      v = String(v).trim();
      if (!v) return "Digite o número do CRECI.";
      if (!/^(CRECI\s*)?\d{3,6}-?[FJ]$/i.test(v)) return "Use o formato do CRECI: números e a letra F (pessoa) ou J (empresa). Ex.: 123456-F.";
      return null;
    },
    senha(v) {
      return String(v).length < 6 ? "A senha tem pelo menos 6 caracteres." : null;
    },
    /** Senha de conta nova: um pouco mais forte. */
    senhaNova(v) {
      v = String(v);
      if (v.length < 8) return "Crie uma senha com pelo menos 8 caracteres.";
      if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return "Use letras e números na senha.";
      return null;
    },
    ano(v) {
      const n = Number(digitos(v));
      const atual = new Date().getFullYear();
      return n >= 1950 && n <= atual ? null : "Digite um ano entre 1950 e " + atual + ".";
    },
    url(v) {
      try {
        const u = new URL(String(v).trim());
        return u.protocol === "https:" || u.protocol === "http:" ? null : "Use um endereço que comece com https://.";
      } catch {
        return "Digite um endereço completo, começando com https://.";
      }
    },
  };

  // --------------------------------------------------------------- máscaras
  function formatarTelefone(v) {
    const d = digitos(v).slice(0, 11);
    if (d.length <= 2) return d.length ? "(" + d : "";
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  }
  function formatarCpfCnpj(v) {
    const d = digitos(v).slice(0, 14);
    if (d.length <= 11) {
      return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return d
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  const mascaras = {
    telefone: formatarTelefone,
    cpf: (v) => formatarCpfCnpj(digitos(v).slice(0, 11)),
    cpfCnpj: formatarCpfCnpj,
    whatsapp: (v) => digitos(v).slice(0, 13),
    digitos: (v) => digitos(v),
    ano: (v) => digitos(v).slice(0, 4),
    nome: (v) => v.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ' -]/g, "").replace(/\s{2,}/g, " "),
    email: (v) => v.replace(/\s/g, ""),
    creci: (v) => v.toUpperCase().replace(/[^A-Z0-9 -]/g, ""),
  };

  // Formata enquanto a pessoa digita (mantendo o cursor no fim).
  document.addEventListener("input", (e) => {
    const el = e.target;
    const tipo = el.dataset && el.dataset.mascara;
    if (!tipo || !mascaras[tipo]) return;
    const novo = mascaras[tipo](el.value);
    if (novo !== el.value) el.value = novo;
  });

  // -------------------------------------------------------- campo e form
  /** Valida um campo pelo data-validar (e pelo required). */
  function campo(el) {
    const valor = el.type === "checkbox" ? (el.checked ? "sim" : "") : el.value;
    const vazio = !String(valor).trim();
    if (vazio) {
      if (!el.required) return null;
      return el.dataset.mensagemVazio || (el.dataset.validar && regras[el.dataset.validar] ? regras[el.dataset.validar]("") : "Preencha este campo.");
    }
    const tipo = el.dataset.validar;
    if (tipo && regras[tipo]) return regras[tipo](valor);
    const min = Number(el.dataset.min || 0);
    if (min && String(valor).trim().length < min) return "Escreva pelo menos " + min + " caracteres.";
    return null;
  }

  /** Valida todos os campos do form. Devolve true se estiver tudo certo. */
  function formulario(form) {
    let primeiro = null;
    form.querySelectorAll("[data-validar], [required], [data-min]").forEach((el) => {
      if (el.disabled || el.closest("[hidden]")) return;
      const erro = campo(el);
      if (erro) {
        Elo.ui.mostrarErro(el, erro);
        primeiro = primeiro || el;
      } else {
        Elo.ui.limparErro(el);
      }
    });
    if (primeiro) primeiro.focus();
    return !primeiro;
  }

  // Ao sair de um campo preenchido, já avisa se estiver errado.
  document.addEventListener("focusout", (e) => {
    const el = e.target;
    if (!el.dataset || !(el.dataset.validar || el.dataset.min)) return;
    if (!String(el.value || "").trim()) return; // vazio: só avisa ao enviar
    const erro = campo(el);
    if (erro) Elo.ui.mostrarErro(el, erro);
    else Elo.ui.limparErro(el);
  });

  Elo.validar = { regras, mascaras, campo, formulario, cpfValido, cnpjValido, digitos };
})();

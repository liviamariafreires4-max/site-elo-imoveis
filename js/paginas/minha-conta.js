/**
 * MINHA CONTA (minha-conta.html) — cliente
 * ------------------------------------------------------------------
 * 1. Meus dados: nome, e-mail e telefone (a administração é avisada).
 * 2. Avaliar minha compra: aparece quando o administrador confirma que o
 *    cliente comprou um imóvel pela Elo. O cliente escolhe se a avaliação
 *    sai com o nome dele ou como "Cliente anônimo".
 */
(function () {
  const { esc, vazio, botaoCarregando, toast, mostrarErro } = Elo.ui;
  const icone = Elo.icone;
  const lugar = document.getElementById("conta");
  const sessao = Elo.auth.getSession();

  if (!sessao) {
    lugar.innerHTML = vazio({
      icone: "entrar",
      titulo: "Entre para ver sua conta",
      texto: "Na sua conta você atualiza seus dados e vê os imóveis que salvou.",
      acao: '<a class="botao botao--primario" href="entrar.html">Entrar na conta</a>',
    });
    return;
  }
  if (sessao.role !== "cliente") {
    lugar.innerHTML = vazio({
      icone: "pessoa",
      titulo: "Esta área é da conta de cliente",
      texto: "Corretores atualizam os dados em Meu perfil, e a administração em Dados da Elo, no painel.",
      acao: '<a class="botao botao--primario" href="' + (sessao.role === "admin" ? "painel-empresa.html" : "painel-perfil.html") + '">Ir para o painel</a>',
    });
    return;
  }

  async function carregar() {
    lugar.innerHTML = Elo.ui.esqueletoLinhas(4);
    try {
      const [conta, compras] = await Promise.all([Elo.dados.getMyAccount(), Elo.dados.myPurchases()]);
      desenhar(conta, compras);
    } catch {
      Elo.ui.falha(lugar, "os seus dados", carregar);
    }
  }

  function desenhar(conta, compras) {
    lugar.innerHTML =
      '<div class="conta-grade">' +
      // ----------------------------------------------------- meus dados
      '<section class="caixa-borda" aria-labelledby="dados-titulo">' +
      '<h2 class="t-h3" id="dados-titulo">Meus dados</h2>' +
      '<p class="t-pequeno" style="margin-top:4px">Usamos estes dados para falar com você sobre os imóveis que você salvou.</p>' +
      '<form id="form-dados" novalidate>' +
      '<div class="campo"><label class="rotulo" for="d-nome">Nome completo</label>' +
      '<input class="entrada" id="d-nome" required autocomplete="name" data-mascara="nome" data-validar="nome" maxlength="80" value="' + esc(conta.nome) + '"></div>' +
      '<div class="campo"><label class="rotulo" for="d-email">E-mail</label>' +
      '<input class="entrada" id="d-email" type="email" required autocomplete="email" data-mascara="email" data-validar="email" maxlength="120" value="' + esc(conta.email) + '">' +
      '<p class="ajuda">É com ele que você entra na conta.</p></div>' +
      '<div class="campo"><label class="rotulo" for="d-telefone">Telefone com DDD <span class="opcional">(opcional)</span></label>' +
      '<input class="entrada" id="d-telefone" type="tel" inputmode="tel" autocomplete="tel" data-mascara="telefone" data-validar="telefone" maxlength="15" placeholder="(18) 99999-0000" value="' + esc(conta.telefone) + '"></div>' +
      '<button type="submit" class="botao botao--primario">Salvar meus dados</button>' +
      "</form></section>" +

      // ----------------------------------------------- avaliar compras
      '<section aria-labelledby="compras-titulo">' +
      '<h2 class="t-h3" id="compras-titulo">Minhas compras pela Elo</h2>' +
      (compras.length
        ? compras.map(cartaoCompra).join("")
        : '<p class="t-corpo" style="margin-top:8px">Quando você fechar negócio com a Elo, o imóvel aparece aqui e você pode avaliar o nosso atendimento.</p>') +
      "</section></div>";

    ligarFormDados();
    lugar.querySelectorAll("[data-avaliar]").forEach(ligarAvaliacao);
  }

  function cartaoCompra({ imovel: p, avaliacao }) {
    const cabeca =
      '<div class="compra__cabeca">' +
      '<img src="' + esc(Elo.ui.foto(p.fotos[0].url, 240)) + '" alt="" width="96" height="72">' +
      "<div><p class=\"t-card\">" + esc(p.titulo) + "</p>" +
      '<p class="t-pequeno cor-suave">' + esc(p.codigo) + " · " + esc(p.bairro) + "</p></div></div>";

    if (avaliacao) {
      return (
        '<article class="caixa-borda compra">' + cabeca +
        '<p class="t-pequeno sucesso__titulo" style="margin-top:16px">' + icone("check", 18) + "Obrigado! Sua avaliação foi enviada" +
        (avaliacao.anonimo ? " como anônima." : ".") + "</p>" +
        '<div style="margin-top:8px">' + Elo.ui.estrelas(avaliacao.nota) + "</div>" +
        (avaliacao.texto ? '<p class="t-corpo" style="margin-top:8px">' + esc(avaliacao.texto) + "</p>" : "") +
        "</article>"
      );
    }

    const id = esc(p.id);
    return (
      '<article class="caixa-borda compra">' + cabeca +
      '<form class="avaliar" data-avaliar="' + id + '" novalidate>' +
      '<fieldset class="estrelas-escolha"><legend class="rotulo">Como foi o atendimento da Elo?</legend>' +
      '<div class="estrelas-escolha__opcoes">' +
      [1, 2, 3, 4, 5]
        .map(
          (n) =>
            '<label><input type="radio" name="nota-' + id + '" value="' + n + '"><span class="sr-only">' + n + (n === 1 ? " estrela" : " estrelas") + "</span>" +
            icone("estrela", 32) + "</label>",
        )
        .join("") +
      '</div><p class="erro-campo" id="nota-' + id + '-erro" hidden>Escolha de 1 a 5 estrelas.</p></fieldset>' +
      '<div class="campo"><label class="rotulo" for="texto-' + id + '">Conte como foi <span class="opcional">(opcional)</span></label>' +
      '<textarea class="entrada" id="texto-' + id + '" rows="4" maxlength="400" placeholder="O que você achou do atendimento, das visitas e da negociação?"></textarea></div>' +
      // Interruptor: a escolha de aparecer com o nome ou anônimo é do cliente.
      '<label class="interruptor"><input type="checkbox" role="switch" id="anonimo-' + id + '" aria-describedby="anonimo-' + id + '-ajuda">' +
      '<span class="interruptor__trilho" aria-hidden="true"></span><span>Publicar como anônimo</span></label>' +
      '<p class="ajuda" id="anonimo-' + id + '-ajuda" data-previa="' + id + '">No site, a avaliação aparece com o nome <strong>' + esc(nomeCurto()) + "</strong>.</p>" +
      '<button type="submit" class="botao botao--primario" style="margin-top:16px">Enviar avaliação</button>' +
      "</form></article>"
    );
  }

  /** "Camila Duarte" -> "Camila D." (como aparece no site) */
  function nomeCurto() {
    const partes = sessao.nome.trim().split(/\s+/);
    return partes[0] + (partes[1] ? " " + partes[partes.length - 1][0] + "." : "");
  }

  function ligarAvaliacao(form) {
    const id = form.dataset.avaliar;
    const anonimo = document.getElementById("anonimo-" + id);
    const previa = form.querySelector("[data-previa]");
    const erroNota = document.getElementById("nota-" + id + "-erro");

    anonimo.addEventListener("change", () => {
      previa.innerHTML = anonimo.checked
        ? "No site, a avaliação aparece como <strong>Cliente anônimo</strong>. A administração da Elo ainda sabe quem enviou."
        : "No site, a avaliação aparece com o nome <strong>" + esc(nomeCurto()) + "</strong>.";
    });
    form.addEventListener("change", (e) => {
      if (e.target.type === "radio") erroNota.hidden = true;
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const escolhida = form.querySelector('input[type="radio"]:checked');
      if (!escolhida) {
        erroNota.hidden = false;
        form.querySelector('input[type="radio"]').focus();
        return;
      }
      const desfazer = botaoCarregando(form.querySelector('[type="submit"]'), "Enviando…");
      try {
        await Elo.dados.submitReview({
          imovelId: id,
          nota: Number(escolhida.value),
          texto: document.getElementById("texto-" + id).value,
          anonimo: anonimo.checked,
        });
        toast("Avaliação enviada. Obrigado por contar como foi!");
        carregar();
      } catch (erro) {
        desfazer();
        toast(erro.message, { tipo: "erro" });
      }
    });
  }

  function ligarFormDados() {
    const form = document.getElementById("form-dados");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!Elo.validar.formulario(form)) return;
      const desfazer = botaoCarregando(form.querySelector('[type="submit"]'), "Salvando…");
      try {
        await Elo.dados.updateMyAccount({
          nome: document.getElementById("d-nome").value,
          email: document.getElementById("d-email").value,
          telefone: document.getElementById("d-telefone").value,
        });
        toast("Seus dados foram atualizados.");
      } catch (erro) {
        const alvo = document.getElementById(erro.campo === "email" ? "d-email" : "d-nome");
        mostrarErro(alvo, erro.message);
        alvo.focus();
      } finally {
        desfazer();
      }
    });
  }

  carregar();
})();

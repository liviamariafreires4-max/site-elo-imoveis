/**
 * PAINEL > MEU PERFIL (painel-perfil.html) — só corretor
 * ------------------------------------------------------------------
 * O corretor preenche o que aparece para o público no "Saiba mais"
 * (corretor.html), na home e na página Sobre nós.
 */
Elo.painel.iniciar({ somenteCorretor: true }, async function (sessao, tela) {
  const { esc, mostrarErro, limparErro, botaoCarregando } = Elo.ui;
  const icone = Elo.icone;

  tela.innerHTML = '<div class="caixa">' + Elo.ui.esqueletoLinhas(5) + "</div>";
  let u;
  try {
    u = await Elo.dados.getMyProfile();
  } catch {
    Elo.ui.falha(tela, "o seu perfil", () => location.reload());
    return;
  }
  let foto = u.foto || "";
  const valor = (x) => esc(x ?? "");
  const anoAtual = new Date().getFullYear();

  tela.innerHTML =
    '<div class="tela-cabeca"><div><h1 class="t-h2">Meu perfil</h1>' +
    '<p class="t-corpo">Estes dados aparecem no site, no “Saiba mais” dos corretores e na página Sobre nós.</p></div>' +
    '<a class="botao botao--neutro" href="corretor.html?id=' + encodeURIComponent(u.id) + '" target="_blank" rel="noopener">' + icone("link-externo", 16) + "Ver meu perfil no site</a></div>" +

    '<form id="form-perfil" class="perfil-form" novalidate style="margin-top:24px">' +
    '<fieldset class="secao-form"><legend class="t-h4">Foto</legend>' +
    '<div class="perfil-foto"><span id="previa-foto"></span><div>' +
    '<label class="botao botao--secundario botao--pequeno" for="arquivo-foto">' + icone("foto-mais", 16) + "Escolher foto</label>" +
    '<input class="sr-only" id="arquivo-foto" type="file" accept="image/*">' +
    '<button type="button" class="botao botao--neutro botao--pequeno" id="tirar-foto"' + (foto ? "" : " hidden") + ">Remover foto</button>" +
    '<p class="ajuda">Foto de rosto, de frente e com boa luz. Sem foto, aparecem as suas iniciais.</p></div></div></fieldset>' +

    '<fieldset class="secao-form"><legend class="t-h4">Dados de contato</legend><div class="form-grade form-grade--2">' +
    '<div class="campo"><label class="rotulo" for="pp-nome">Nome para exibição</label><input class="entrada" id="pp-nome" value="' + valor(u.nome) + '" autocomplete="name" data-mascara="nome" maxlength="80" data-mascara="nome" data-validar="nome" maxlength="80"></div>' +
    '<div class="campo"><label class="rotulo" for="pp-creci">CRECI</label><input class="entrada" id="pp-creci" value="' + valor(u.creci) + '" data-mascara="creci" data-validar="creci" maxlength="16" placeholder="Ex.: CRECI 123456-F"></div>' +
    '<div class="campo"><label class="rotulo" for="pp-telefone">Telefone</label><input class="entrada" id="pp-telefone" type="tel" value="' + valor(u.telefone) + '" autocomplete="tel" data-mascara="telefone" data-validar="telefone" maxlength="15" placeholder="(18) 99999-0000"></div>' +
    '<div class="campo"><label class="rotulo" for="pp-whatsapp">WhatsApp</label><input class="entrada" id="pp-whatsapp" type="tel" inputmode="numeric" data-mascara="whatsapp" data-validar="whatsapp" maxlength="13" value="' + valor(u.whatsapp) + '" aria-describedby="pp-whatsapp-ajuda" data-ajuda="pp-whatsapp-ajuda">' +
    '<p class="ajuda" id="pp-whatsapp-ajuda">Só números, com 55 e DDD. Ex.: 5518999990000. É para onde vai o botão “Conversar pelo WhatsApp”.</p></div>' +
    "</div></fieldset>" +

    '<fieldset class="secao-form"><legend class="t-h4">Apresentação</legend><div class="form-grade form-grade--2">' +
    '<div class="campo"><label class="rotulo" for="pp-desde">Ano em que começou como corretor</label><input class="entrada" id="pp-desde" inputmode="numeric" maxlength="4" data-mascara="ano" value="' + valor(u.desde) + '" placeholder="Ex.: 2015"></div>' +
    '<div class="campo"><label class="rotulo" for="pp-especialidades">Especialidades</label><input class="entrada" id="pp-especialidades" value="' + valor((u.especialidades || []).join(", ")) + '" aria-describedby="pp-esp-ajuda" data-ajuda="pp-esp-ajuda">' +
    '<p class="ajuda" id="pp-esp-ajuda">Separe com vírgula, até 4. Ex.: Locação, Terrenos, Primeiro imóvel.</p></div>' +
    '<div class="campo inteiro"><label class="rotulo" for="pp-bio">Sobre você</label>' +
    '<textarea class="entrada" id="pp-bio" rows="5" maxlength="500" aria-describedby="pp-bio-ajuda" data-ajuda="pp-bio-ajuda">' + valor(u.bio) + "</textarea>" +
    '<p class="ajuda" id="pp-bio-ajuda">De 2 a 4 frases: onde atua, com que tipo de imóvel e como atende. <span id="pp-bio-conta"></span></p></div>' +
    "</div></fieldset>" +

    '<div class="acoes-form"><button type="submit" class="botao botao--primario">Salvar perfil</button></div>' +
    "</form>";

  const campo = (id) => document.getElementById(id);
  const previa = campo("previa-foto");
  const tirar = campo("tirar-foto");

  function desenharFoto() {
    previa.innerHTML = Elo.ui.avatar(campo("pp-nome").value || u.nome, "grande", foto);
    tirar.hidden = !foto;
  }
  desenharFoto();
  campo("pp-nome").addEventListener("input", () => !foto && desenharFoto());

  const bio = campo("pp-bio");
  const conta = () => (campo("pp-bio-conta").textContent = bio.value.length + " de 500 caracteres.");
  bio.addEventListener("input", conta);
  conta();

  /** Reduz a foto para 320 × 320 (recorte quadrado no centro). */
  function reduzir(arquivo) {
    return new Promise((resolver, rejeitar) => {
      const img = new Image();
      img.onload = () => {
        const lado = Math.min(img.width, img.height);
        const c = document.createElement("canvas");
        c.width = c.height = 320;
        c.getContext("2d").drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, 320, 320);
        URL.revokeObjectURL(img.src);
        resolver(c.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = rejeitar;
      img.src = URL.createObjectURL(arquivo);
    });
  }

  campo("arquivo-foto").addEventListener("change", async (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    try {
      foto = await reduzir(arquivo);
      desenharFoto();
    } catch {
      Elo.ui.toast("Não foi possível abrir esta imagem. Tente um arquivo JPG ou PNG.", { tipo: "erro" });
    }
    e.target.value = "";
  });
  tirar.addEventListener("click", () => {
    foto = "";
    desenharFoto();
    campo("arquivo-foto").focus();
  });

  campo("form-perfil").addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = {
      nome: campo("pp-nome").value.trim(),
      creci: campo("pp-creci").value.trim(),
      telefone: campo("pp-telefone").value.trim(),
      whatsapp: campo("pp-whatsapp").value.replace(/\D/g, ""),
      desde: Number(campo("pp-desde").value) || null,
      especialidades: campo("pp-especialidades").value.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 4),
      bio: bio.value.trim(),
      foto,
    };

    const erros = [];
    if (Elo.validar.regras.nome(d.nome)) erros.push(["pp-nome", Elo.validar.regras.nome(d.nome)]);
    if (Elo.validar.regras.creci(d.creci)) erros.push(["pp-creci", Elo.validar.regras.creci(d.creci)]);
    if (d.telefone && Elo.validar.regras.telefone(d.telefone)) erros.push(["pp-telefone", Elo.validar.regras.telefone(d.telefone)]);
    if (d.whatsapp && Elo.validar.regras.whatsapp(d.whatsapp)) erros.push(["pp-whatsapp", Elo.validar.regras.whatsapp(d.whatsapp)]);
    if (d.desde && (d.desde < 1950 || d.desde > anoAtual)) erros.push(["pp-desde", "Digite um ano entre 1950 e " + anoAtual + "."]);
    if (d.bio.length < 40) erros.push(["pp-bio", "Escreva pelo menos 40 caracteres sobre você."]);

    tela.querySelectorAll('[aria-invalid="true"]').forEach(limparErro);
    erros.forEach(([id, msg]) => mostrarErro(campo(id), msg));
    if (erros.length) return campo(erros[0][0]).focus();

    const restaurar = botaoCarregando(e.target.querySelector('[type="submit"]'), "Salvando…");
    try {
      await Elo.dados.updateMyProfile(d);
      Elo.ui.toast("Perfil salvo. Ele já aparece assim no site.", { acao: { rotulo: "Ver no site", href: "corretor.html?id=" + u.id } });
    } catch (erro) {
      Elo.ui.toast(erro.message || "Não foi possível salvar. Tente de novo.", { tipo: "erro" });
    } finally {
      restaurar();
    }
  });
});

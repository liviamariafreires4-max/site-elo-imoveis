/**
 * PAINEL > GERENCIAR BLOG (painel-blog.html) — só administrador
 * ------------------------------------------------------------------
 * Abre numa aba nova (link "Gerenciar blog" do menu do painel).
 * Lista as matérias e permite adicionar, editar e excluir.
 *
 * O texto da matéria é escrito em um campo só, com estas convenções:
 *   linha em branco     separa parágrafos
 *   ## Título           vira subtítulo
 *   - item              vira item de lista
 * Esse texto é convertido para os blocos que materia.html mostra.
 */
Elo.painel.iniciar({ somenteAdmin: true }, function (sessao, tela) {
  const { esc, botaoCarregando, toast, dataLonga, foto } = Elo.ui;
  const icone = Elo.icone;

  tela.innerHTML =
    '<div class="tela-cabeca"><div><h1 class="t-h2">Gerenciar blog</h1>' +
    '<p class="t-corpo" id="resumo" aria-live="polite">Carregando…</p></div>' +
    '<div class="acoes-linha"><a class="botao botao--neutro" href="blog.html" target="_blank" rel="noopener">' + icone("link-externo", 16) + "Ver o blog</a>" +
    '<button type="button" class="botao botao--primario" id="nova">' + icone("mais", 18) + "Nova matéria</button></div></div>" +
    '<div id="editor" hidden></div>' +
    '<div id="lista" style="margin-top:24px"></div>';

  const lista = document.getElementById("lista");
  const editor = document.getElementById("editor");
  const resumo = document.getElementById("resumo");
  const botaoNova = document.getElementById("nova");
  let materias = [];

  // ---------------------------------------------------- texto <-> blocos
  function blocosParaTexto(corpo) {
    return corpo
      .map((b) => (typeof b === "string" ? b : b.titulo ? "## " + b.titulo : b.lista ? b.lista.map((i) => "- " + i).join("\n") : ""))
      .join("\n\n");
  }
  function textoParaBlocos(texto) {
    return texto
      .split(/\n\s*\n/)
      .map((trecho) => trecho.trim())
      .filter(Boolean)
      .map((trecho) => {
        if (trecho.startsWith("## ")) return { titulo: trecho.slice(3).trim() };
        const linhas = trecho.split("\n").map((l) => l.trim());
        if (linhas.every((l) => l.startsWith("- "))) return { lista: linhas.map((l) => l.slice(2).trim()) };
        return linhas.join(" ");
      });
  }

  // ------------------------------------------------------------- lista
  async function carregar() {
    lista.innerHTML = '<div class="caixa">' + Elo.ui.esqueletoLinhas(4) + "</div>";
    try {
      materias = await Elo.dados.listPosts();
      resumo.textContent = Elo.ui.plural(materias.length, "matéria publicada", "matérias publicadas") + " no blog.";
      if (!materias.length) {
        lista.innerHTML = Elo.ui.vazio({ icone: "lapis", titulo: "Nenhuma matéria ainda", texto: "Clique em Nova matéria para escrever a primeira." });
        return;
      }
      lista.innerHTML =
        '<div class="caixa" style="overflow:hidden"><table class="tabela"><caption class="sr-only">Matérias do blog</caption>' +
        '<thead><tr><th scope="col">Matéria</th><th scope="col">Categoria</th><th scope="col" class="so-largo-tabela">Data</th><th scope="col" class="direita">Ações</th></tr></thead><tbody>' +
        materias
          .map(
            (m) =>
              '<tr><th scope="row"><div class="imovel-linha"><span class="miniatura"><img src="' + esc(foto(m.foto.url, 120)) + '" alt=""></span>' +
              '<span><span class="imovel-linha__titulo">' + esc(m.titulo) + '</span><span class="cor-suave" style="display:block">' + esc(m.autor) + "</span></span></div></th>" +
              '<td><span class="rotulo-celular">Categoria: </span>' + esc(m.categoria) + "</td>" +
              '<td class="so-largo-tabela numero">' + dataLonga(m.data) + "</td>" +
              '<td><div class="acoes-linha">' +
              '<button type="button" class="botao botao--neutro botao--pequeno" data-editar="' + esc(m.slug) + '">' + icone("lapis", 16) + 'Editar<span class="sr-only"> ' + esc(m.titulo) + "</span></button>" +
              '<a class="botao botao--neutro botao--pequeno" href="materia.html?slug=' + encodeURIComponent(m.slug) + '" target="_blank" rel="noopener" title="Ver no site">' + icone("link-externo", 16) + '<span class="sr-only">Ver no site: ' + esc(m.titulo) + "</span></a>" +
              '<button type="button" class="botao botao--perigo-contorno botao--pequeno" data-excluir="' + esc(m.slug) + '">' + icone("lixeira", 16) + 'Excluir<span class="sr-only"> ' + esc(m.titulo) + "</span></button>" +
              "</div></td></tr>",
          )
          .join("") +
        "</tbody></table></div>";
    } catch {
      resumo.textContent = "";
      Elo.ui.falha(lista, "as matérias", carregar);
    }
  }

  lista.addEventListener("click", (e) => {
    const editar = e.target.closest("[data-editar]");
    const excluir = e.target.closest("[data-excluir]");
    if (editar) abrirEditor(materias.find((m) => m.slug === editar.dataset.editar));
    if (excluir) {
      const m = materias.find((x) => x.slug === excluir.dataset.excluir);
      Elo.ui.confirmar({
        titulo: "Excluir a matéria?",
        texto: '<p class="cor-tinta negrito">' + esc(m.titulo) + '</p><p style="margin-top:8px">Ela sai do blog e da página inicial. Esta ação não pode ser desfeita.</p>',
        confirmar: "Excluir matéria",
        cancelar: "Manter matéria",
        aoConfirmar: async () => {
          await Elo.dados.deletePost(m.slug);
          toast("Matéria excluída.");
          carregar();
        },
      });
    }
  });
  botaoNova.addEventListener("click", () => abrirEditor(null));

  // ------------------------------------------------------------ editor
  let fotoAtual = null;

  function abrirEditor(m) {
    const hoje = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const categorias = Elo.dados.categoriasBlog();
    fotoAtual = m ? m.foto : null;
    editor.hidden = false;
    botaoNova.hidden = true;
    editor.innerHTML =
      '<form id="form-materia" class="caixa caixa--espaco" novalidate style="margin-top:24px" aria-labelledby="editor-titulo">' +
      '<h2 class="t-h3" id="editor-titulo">' + (m ? "Editar matéria" : "Nova matéria") + "</h2>" +
      '<div class="form-grade form-grade--2" style="margin-top:16px">' +
      '<div class="campo inteiro"><label class="rotulo" for="m-titulo">Título</label>' +
      '<input class="entrada" id="m-titulo" required data-min="10" maxlength="120" value="' + esc(m ? m.titulo : "") + '"></div>' +
      '<div class="campo inteiro"><label class="rotulo" for="m-resumo">Resumo</label>' +
      '<input class="entrada" id="m-resumo" required data-min="20" maxlength="200" value="' + esc(m ? m.resumo : "") + '" aria-describedby="m-resumo-ajuda" data-ajuda="m-resumo-ajuda">' +
      '<p class="ajuda" id="m-resumo-ajuda">Uma frase que aparece no card do blog e na página inicial.</p></div>' +
      '<div class="campo"><label class="rotulo" for="m-categoria">Categoria</label>' +
      '<input class="entrada" id="m-categoria" required data-min="3" maxlength="30" list="m-categorias" value="' + esc(m ? m.categoria : "") + '">' +
      '<datalist id="m-categorias">' + categorias.map((c) => '<option value="' + esc(c) + '">').join("") + "</datalist></div>" +
      '<div class="campo"><label class="rotulo" for="m-data">Data de publicação</label>' +
      '<input class="entrada" id="m-data" type="date" required value="' + esc(m ? m.data : hoje) + '"></div>' +
      '<div class="campo"><label class="rotulo" for="m-autor">Autor</label>' +
      '<input class="entrada" id="m-autor" required data-min="3" maxlength="60" value="' + esc(m ? m.autor : "Equipe Elo") + '"></div>' +
      '<div class="campo"><label class="rotulo" for="m-foto">Foto de capa</label>' +
      '<div class="capa-materia"><span id="m-previa"></span>' +
      '<label class="botao botao--secundario botao--pequeno" for="m-foto">' + icone("foto-mais", 16) + "Escolher foto</label>" +
      '<input class="sr-only" id="m-foto" type="file" accept="image/*"></div>' +
      '<p class="erro-campo" id="m-foto-erro" hidden>Escolha uma foto de capa.</p></div>' +
      '<div class="campo inteiro"><label class="rotulo" for="m-corpo">Texto da matéria</label>' +
      '<textarea class="entrada" id="m-corpo" rows="14" required data-min="100" aria-describedby="m-corpo-ajuda" data-ajuda="m-corpo-ajuda">' + esc(m ? blocosParaTexto(m.corpo) : "") + "</textarea>" +
      '<p class="ajuda" id="m-corpo-ajuda">Deixe uma linha em branco entre parágrafos. Comece a linha com <strong>##</strong> para um subtítulo e com <strong>-</strong> para um item de lista.</p></div>' +
      "</div>" +
      '<div class="acoes-form"><button type="button" class="botao botao--neutro" id="cancelar">Cancelar</button>' +
      '<button type="submit" class="botao botao--primario">' + (m ? "Salvar alterações" : "Publicar matéria") + "</button></div></form>";

    desenharCapa();
    document.getElementById("m-titulo").focus();
    document.getElementById("cancelar").addEventListener("click", fecharEditor);
    document.getElementById("m-foto").addEventListener("change", trocarFoto);
    document.getElementById("form-materia").addEventListener("submit", (e) => salvar(e, m));
  }

  function fecharEditor() {
    editor.hidden = true;
    editor.innerHTML = "";
    botaoNova.hidden = false;
    botaoNova.focus();
  }

  function desenharCapa() {
    document.getElementById("m-previa").innerHTML = fotoAtual
      ? '<img src="' + esc(foto(fotoAtual.url, 240)) + '" alt="" width="120" height="90">'
      : '<span class="capa-materia__vazia">Sem foto</span>';
  }

  /** Reduz a foto para no máximo 1200 px de largura (cabe no armazenamento do navegador). */
  function trocarFoto(e) {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    const img = new Image();
    img.onload = () => {
      const escala = Math.min(1, 1200 / img.width);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * escala);
      c.height = Math.round(img.height * escala);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      fotoAtual = { url: c.toDataURL("image/jpeg", 0.75), alt: "" };
      document.getElementById("m-foto-erro").hidden = true;
      desenharCapa();
    };
    img.onerror = () => toast("Não foi possível abrir esta imagem. Tente JPG ou PNG.", { tipo: "erro" });
    img.src = URL.createObjectURL(arquivo);
    e.target.value = "";
  }

  async function salvar(e, m) {
    e.preventDefault();
    const form = e.target;
    const ok = Elo.validar.formulario(form);
    const erroFoto = document.getElementById("m-foto-erro");
    erroFoto.hidden = Boolean(fotoAtual);
    if (!ok || !fotoAtual) return;

    const ler = (id) => document.getElementById(id).value.trim();
    const corpo = textoParaBlocos(ler("m-corpo"));
    const palavras = ler("m-corpo").split(/\s+/).length;
    const dados = {
      titulo: ler("m-titulo"),
      resumo: ler("m-resumo"),
      categoria: ler("m-categoria"),
      data: ler("m-data"),
      autor: ler("m-autor"),
      leitura: Math.max(1, Math.round(palavras / 200)), // ~200 palavras por minuto
      foto: { url: fotoAtual.url, alt: fotoAtual.alt || ler("m-titulo") },
      corpo,
    };
    const desfazer = botaoCarregando(form.querySelector('[type="submit"]'), "Salvando…");
    try {
      if (m) await Elo.dados.updatePost(m.slug, dados);
      else await Elo.dados.createPost(dados);
      toast(m ? "Matéria atualizada." : "Matéria publicada no blog.");
      fecharEditor();
      carregar();
    } catch (erro) {
      desfazer();
      toast(erro.message || "Não foi possível salvar. Tente de novo.", { tipo: "erro" });
    }
  }

  carregar();
});

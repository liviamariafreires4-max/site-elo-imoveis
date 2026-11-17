/**
 * PAINEL > NOTIFICAÇÕES (painel-notificacoes.html)
 * ------------------------------------------------------------------
 * Corretor: avisos de favorito dos imóveis que ele cadastrou.
 * Admin:    favoritos de todos os imóveis, mais toda alteração de dados feita
 *           por cliente ou corretor (perfil, conta, imóveis) e as avaliações.
 * Abrir a página marca tudo como lido (o número some do menu).
 * TODO(backend): enviar também por e-mail ou WhatsApp, se a Elo quiser.
 */
Elo.painel.iniciar({}, function (sessao, tela) {
  const { esc, dataLonga } = Elo.ui;
  const ehAdmin = sessao.role === "admin";

  tela.innerHTML =
    '<h1 class="t-h2">Notificações</h1>' +
    '<p class="t-corpo" id="resumo" aria-live="polite" style="margin-top:4px">Carregando…</p>' +
    '<div id="lista" style="margin-top:24px"></div>';

  const lista = document.getElementById("lista");
  const resumo = document.getElementById("resumo");

  const hora = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const PERFIL = { cliente: "cliente", corretor: "corretor" };

  /** Favorito: "Camila salvou ELO-1002 nos favoritos." Alteração: "Marina (corretor) alterou..." */
  function textoDoAviso(n) {
    if (n.tipo === "favorito") {
      return (
        "<strong>" + esc(n.clienteNome) + "</strong> salvou " +
        (n.imovel
          ? '<a class="link" href="imovel.html?codigo=' + encodeURIComponent(n.imovel.codigo) + '">' + esc(n.imovel.codigo) + "</a> (" + esc(n.imovel.titulo) + ")"
          : "um imóvel que já saiu do site") +
        " nos favoritos."
      );
    }
    return "<strong>" + esc(n.autorNome || "Alguém") + "</strong> (" + (PERFIL[n.autorPerfil] || "usuário") + ") " + esc(n.texto);
  }

  async function carregar() {
    lista.innerHTML = '<div class="caixa">' + Elo.ui.esqueletoLinhas(4) + "</div>";
    try {
      const avisos = await Elo.dados.listNotifications();
      const novas = avisos.filter((n) => !n.lida).length;
      resumo.textContent = novas
        ? Elo.ui.plural(novas, "notificação nova", "notificações novas") + "."
        : ehAdmin
          ? "Você recebe um aviso a cada favorito, avaliação e alteração de dados feita por clientes e corretores."
          : "Você recebe um aviso sempre que um cliente favorita um dos seus imóveis.";
      if (!avisos.length) {
        lista.innerHTML = Elo.ui.vazio({ icone: "mensagem", titulo: "Nenhuma notificação", texto: "Quando alguém favoritar um imóvel, o aviso aparece aqui." });
        return;
      }
      lista.innerHTML =
        '<ul class="caixa lista-avisos">' +
        avisos
          .map(
            (n) =>
              '<li class="aviso' + (n.lida ? "" : " aviso--nova") + '">' +
              '<span class="aviso__icone">' + Elo.icone(n.tipo === "favorito" ? "coracao" : n.tipo === "alteracao" ? "lapis" : "estrela", 18) + "</span>" +
              '<div><p class="t-corpo">' + textoDoAviso(n) + "</p>" +
              '<p class="t-pequeno cor-suave">' + dataLonga(n.criadoEm) + ", " + hora.format(new Date(n.criadoEm)) +
              (ehAdmin && n.corretorNome ? " · Corretor: " + esc(n.corretorNome) : "") +
              (n.lida ? "" : ' · <span class="aviso__nova">Nova</span>') + "</p></div></li>",
          )
          .join("") +
        "</ul>" +
        '<p class="t-pequeno" style="margin-top:16px"><a class="link" href="painel-favoritos.html">Ver todos os favoritos por imóvel</a></p>';
      if (novas) Elo.dados.markNotificationsRead(); // o selo do menu some; o destaque fica até sair da página
    } catch {
      resumo.textContent = "";
      Elo.ui.falha(lista, "as notificações", carregar);
    }
  }

  carregar();
});

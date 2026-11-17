/**
 * SOBRE NÓS (sobre.html)
 * A seção "Nossa equipe de corretores" lista todos os corretores ativos.
 * Quando o administrador aprova (ou cadastra) um corretor, ele aparece aqui
 * sem precisar mexer no HTML.
 */
(function () {
  const equipe = document.getElementById("equipe");

  async function carregar() {
    equipe.innerHTML = Elo.ui.esqueletoLinhas(3);
    try {
      const corretores = await Elo.dados.listBrokers();
      equipe.innerHTML = corretores.length
        ? '<ul class="grade-corretores">' + corretores.map(Elo.ui.cardCorretor).join("") + "</ul>"
        : '<p class="t-corpo" style="margin-top:24px">Nossa equipe está sendo formada.</p>';
    } catch {
      Elo.ui.falha(equipe, "a equipe de corretores", carregar);
    }
  }

  carregar();

  // Redes sociais da Elo (js/instituicao.js > Elo.SITE.redes)
  const NOMES = { instagram: "Instagram", facebook: "Facebook", youtube: "YouTube", pinterest: "Pinterest" };
  const redes = document.getElementById("redes");
  if (redes) {
    redes.innerHTML = Object.entries(Elo.SITE.redes || {})
      .map(([rede, url]) =>
        '<li><a class="link" href="' + Elo.ui.esc(url) + '" target="_blank" rel="noopener noreferrer">' + NOMES[rede] +
        '<span class="sr-only"> (abre em nova aba)</span></a></li>')
      .join("");
  }
})();

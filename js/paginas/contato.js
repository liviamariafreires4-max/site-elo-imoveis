/** CONTATO (contato.html) */
(function () {
  Elo.formularioContato(document.getElementById("form-contato"), {
    sucessoTitulo: "Mensagem enviada",
    sucessoTexto: "Recebemos sua mensagem. Um corretor da Elo responde pelo contato que você informou.",
  });

  document.getElementById("como-chegar").href =
    "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(Elo.SITE.endereco.valor);
})();

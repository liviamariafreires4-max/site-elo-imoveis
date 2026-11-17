/** ANUNCIE SEU IMÓVEL (anuncie.html) */
(function () {
  const tipo = document.getElementById("a-tipo");
  Object.values(Elo.TIPOS).forEach((rotulo) => tipo.add(new Option(rotulo, rotulo)));

  Elo.formularioContato(document.getElementById("form-anuncie"), {
    sucessoTitulo: "Dados enviados",
    sucessoTexto: "Recebemos os dados do seu imóvel. Um corretor da Elo entra em contato para combinar a visita.",
  });
})();

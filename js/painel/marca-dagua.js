/**
 * MARCA D'ÁGUA DAS FOTOS (obrigatória)
 * ------------------------------------------------------------------
 * Toda foto enviada no cadastro de imóvel passa por aqui antes de ser
 * guardada: não existe opção para desligar.
 *
 * A marca é só texto: "ELO IMÓVEIS" repetido em diagonal por toda a foto,
 * transparente (aparece, mas não atrapalha ver o imóvel). Cobrir a foto
 * inteira dificulta recortar a marca e reaproveitar a foto.
 *
 * Para ajustar:
 *   TEXTO        o que vai escrito
 *   OPACIDADE    0 = invisível, 1 = branco sólido (hoje 0.16)
 *   tamanho      o divisor 22 em desenharPadrao: número menor = letra maior
 *
 * Uso: const dataUrl = await Elo.marcaDagua.aplicar(canvas)
 *
 * TODO(backend): repetir a marca no servidor (ao subir para o Storage).
 * A marca feita no navegador pode ser contornada por quem mexe no código.
 */
window.Elo = window.Elo || {};

Elo.marcaDagua = (function () {
  const TEXTO = "ELO IMÓVEIS";
  const OPACIDADE = 0.16;

  /** Texto em diagonal, repetido, transparente. */
  function desenharPadrao(ctx, largura, altura) {
    const tamanho = Math.max(14, Math.round(Math.min(largura, altura) / 22));
    ctx.save();
    ctx.translate(largura / 2, altura / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.font = "700 " + tamanho + "px Poppins, Arial, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, " + OPACIDADE + ")";
    // Contorno escuro bem leve: a marca continua visível em fotos claras.
    ctx.strokeStyle = "rgba(16, 20, 37, " + OPACIDADE * 0.6 + ")";
    ctx.lineWidth = 1;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const passoX = ctx.measureText(TEXTO).width + tamanho * 3;
    const passoY = tamanho * 5;
    const diagonal = Math.hypot(largura, altura);
    for (let y = -diagonal; y < diagonal; y += passoY) {
      for (let x = -diagonal; x < diagonal; x += passoX) {
        ctx.fillText(TEXTO, x, y);
        ctx.strokeText(TEXTO, x, y);
      }
    }
    ctx.restore();
  }

  /** Aplica a marca no canvas e devolve a foto em JPEG (data URL). */
  async function aplicar(canvas, qualidade = 0.72) {
    desenharPadrao(canvas.getContext("2d"), canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", qualidade);
  }

  return { aplicar };
})();

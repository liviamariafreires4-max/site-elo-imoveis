/**
 * LOGIN SIMULADO
 * ------------------------------------------------------------------
 * Não há senha de verdade nem servidor: qualquer senha com 6 ou mais
 * caracteres entra numa conta que exista. A sessão é só o id do usuário
 * guardado no localStorage.
 *
 * Para ligar o Supabase Auth, reescreva as funções mantendo os nomes:
 *   getSession() -> supabase.auth.getSession() + perfil (role)
 *   signIn()     -> supabase.auth.signInWithPassword()
 *   signUp()     -> supabase.auth.signUp()
 *   signOut()    -> supabase.auth.signOut()
 * e APAGUE signInAsDev (só existe para o login de desenvolvimento).
 *
 * Uma sessão tem: { userId, nome, email, role }
 * role é "cliente", "corretor" ou "admin".
 */
window.Elo = window.Elo || {};

(function () {
  const CHAVE_SESSAO = "elo:sessao:v1";

  /** Erro de login que sabe em qual campo do formulário mostrar a mensagem. */
  function erroDeCampo(mensagem, campo) {
    const erro = new Error(mensagem);
    erro.campo = campo; // "email", "senha" ou "nome"
    return erro;
  }

  function paraSessao(usuario) {
    return { userId: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role };
  }

  /** Sessão atual, ou null se ninguém entrou. */
  function getSession() {
    const id = localStorage.getItem(CHAVE_SESSAO);
    if (!id) return null;
    // Só conta ativa tem sessão (corretor pendente ou recusado não entra).
    const usuario = Elo.dados._usuarios().find((u) => u.id === id && u.situacao === "ativo");
    return usuario ? paraSessao(usuario) : null;
  }

  function guardar(usuario) {
    localStorage.setItem(CHAVE_SESSAO, usuario.id);
    Elo.dados.avisarMudanca();
    return paraSessao(usuario);
  }

  function esperar(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function signIn(email, senha) {
    await esperar(400); // simula a rede
    const e = String(email).trim().toLowerCase();
    const usuario = Elo.dados._usuarios().find((u) => u.email.toLowerCase() === e);
    if (!usuario) {
      throw erroDeCampo("Não encontramos uma conta com este e-mail. Confira ou crie um cadastro.", "email");
    }
    if (usuario.situacao === "inativo") {
      throw erroDeCampo("Esta conta foi desativada. Fale com a administração da Elo.", "email");
    }
    if (usuario.situacao === "pendente") {
      throw erroDeCampo("Sua solicitação para ser corretor parceiro ainda está em análise. Você recebe acesso assim que a administração aprovar.", "email");
    }
    if (usuario.situacao === "recusado") {
      throw erroDeCampo("Sua solicitação para ser corretor parceiro não foi aprovada. Fale com a administração da Elo.", "email");
    }
    if (String(senha).length < 6) {
      throw erroDeCampo("A senha tem pelo menos 6 caracteres.", "senha");
    }
    return guardar(usuario);
  }

  async function signUp({ nome, email, telefone, senha }) {
    await esperar(400);
    const e = String(email).trim().toLowerCase();
    if (Elo.dados._usuarios().some((u) => u.email.toLowerCase() === e)) {
      throw erroDeCampo("Já existe uma conta com este e-mail. Entre com ela.", "email");
    }
    // A senha NÃO é guardada neste esboço.
    const usuario = {
      id: "u-" + Date.now().toString(36),
      nome: String(nome).trim(),
      email: e,
      telefone: String(telefone || "").trim() || undefined,
      role: "cliente", // o cadastro público sempre cria cliente
      situacao: "ativo",
      criadoEm: new Date().toISOString(),
    };
    Elo.dados._adicionarUsuario(usuario);
    return guardar(usuario);
  }

  /** SOMENTE DESENVOLVIMENTO: entra como o primeiro usuário ativo do perfil. */
  async function signInAsDev(role) {
    const usuario = Elo.dados._usuarios().find((u) => u.role === role && u.situacao === "ativo");
    if (!usuario) throw new Error("Não há usuário de exemplo para este perfil.");
    return guardar(usuario);
  }

  function signOut() {
    localStorage.removeItem(CHAVE_SESSAO);
    Elo.dados.avisarMudanca();
  }

  /** Para onde cada perfil vai depois de entrar. */
  function homeFor(role) {
    return role === "cliente" ? "favoritos.html" : "painel-imoveis.html";
  }

  const NOMES_PERFIL = { cliente: "Cliente", corretor: "Corretor", admin: "Administrador" };

  Elo.auth = { getSession, signIn, signUp, signInAsDev, signOut, homeFor, NOMES_PERFIL };
})();

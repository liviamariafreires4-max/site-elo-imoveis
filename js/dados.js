/**
 * CAMADA DE DADOS
 * ------------------------------------------------------------------
 * As páginas NUNCA leem o localStorage direto: tudo passa por estas funções,
 * que devolvem Promises (como faria uma chamada de rede de verdade).
 *
 * Para ligar o Supabase depois, troque o corpo de cada função mantendo o nome
 * e o que ela devolve. Exemplo:
 *
 *   async function listProperties(filtros) {
 *     const { data, error } = await supabase.from("imoveis").select("*")...;
 *     if (error) throw error;
 *     return data;
 *   }
 *
 * Hoje os dados ficam no localStorage, então cada navegador tem a sua cópia.
 */
window.Elo = window.Elo || {};

(function () {
  // v6: endereço do imóvel passa a ser sigiloso; imóveis em outras cidades; 2 contatos do proprietário.
  const CHAVE_BANCO = "elo:banco:v6";
  const CHAVE_SIMULAR_ERRO = "elo:simular-erro";

  // ------------------------------------------------------ "banco" local
  function bancoNovo() {
    const banco = structuredClone({
      imoveis: Elo.EXEMPLO.imoveis,
      usuarios: Elo.EXEMPLO.usuarios,
      favoritos: Elo.EXEMPLO.favoritos,
      proprietarios: Elo.EXEMPLO.proprietarios,
      proximoCodigo: Elo.EXEMPLO.proximoCodigo,
      newsletter: [],
      favoritosEm: {}, // "idCliente|idImovel" -> data em que salvou
      notificacoes: [],
      removidos: [], // histórico de imóveis retirados (auditoria)
      avaliacoes: Elo.EXEMPLO.avaliacoes, // as de exemplo + as que os compradores enviarem
      materias: Elo.EXEMPLO.materias, // blog: o admin edita em painel-blog.html
      empresa: {}, // dados de contato alterados pelo admin (sobrepõem js/instituicao.js)
    });
    // Os favoritos de exemplo já chegam com a notificação correspondente.
    let dia = 1;
    for (const [clienteId, ids] of Object.entries(banco.favoritos)) {
      for (const imovelId of ids) {
        const em = "2026-11-" + String(dia++ + 5).padStart(2, "0") + "T14:00:00.000Z";
        banco.favoritosEm[clienteId + "|" + imovelId] = em;
        const imovel = banco.imoveis.find((x) => x.id === imovelId);
        banco.notificacoes.push({
          id: "n-" + dia, tipo: "favorito", imovelId, clienteId,
          corretorId: imovel && imovel.corretorId, criadoEm: em, lidaPor: [],
        });
      }
    }
    return banco;
  }

  function lerBanco() {
    try {
      const texto = localStorage.getItem(CHAVE_BANCO);
      return texto ? JSON.parse(texto) : bancoNovo();
    } catch {
      return bancoNovo();
    }
  }

  function gravarBanco(banco) {
    try {
      localStorage.setItem(CHAVE_BANCO, JSON.stringify(banco));
    } catch {
      throw new Error("O armazenamento do navegador está cheio. Remova algumas fotos e tente de novo.");
    }
    avisarMudanca();
  }

  /** Volta aos dados de exemplo. */
  function resetarDados() {
    localStorage.removeItem(CHAVE_BANCO);
    avisarMudanca();
  }

  // Quem quiser saber quando os dados mudam (ex.: o cabeçalho) assina aqui.
  const ouvintes = new Set();
  function aoMudar(funcao) {
    ouvintes.add(funcao);
    return () => ouvintes.delete(funcao);
  }
  function avisarMudanca() {
    ouvintes.forEach((f) => f());
  }
  // Mudança feita em outra aba do navegador.
  window.addEventListener("storage", (e) => {
    if (e.key === CHAVE_BANCO || e.key === "elo:sessao:v1") avisarMudanca();
  });

  /** Simula a demora da rede, para os estados de "carregando" existirem. */
  function rede(ms = 280) {
    return new Promise((resolver, rejeitar) => {
      setTimeout(() => {
        if (localStorage.getItem(CHAVE_SIMULAR_ERRO) === "1") {
          rejeitar(new Error("Falha simulada de conexão."));
        } else {
          resolver();
        }
      }, ms);
    });
  }

  function simulandoErro() {
    return localStorage.getItem(CHAVE_SIMULAR_ERRO) === "1";
  }
  function simularErro(ligado) {
    if (ligado) localStorage.setItem(CHAVE_SIMULAR_ERRO, "1");
    else localStorage.removeItem(CHAVE_SIMULAR_ERRO);
  }

  function semPermissao(mensagem = "Você não tem permissão para fazer isso.") {
    const erro = new Error(mensagem);
    erro.name = "SemPermissao";
    return erro;
  }

  // ----------------------------------------------------- filtros e ordem
  /**
   * filtros: { finalidade, tipo, bairro, precoMin, precoMax, dormitorios,
   *            vagas, codigo, destaque, corretorId, ordem }
   * ordem: "recentes" | "menor-preco" | "maior-preco" | "maior-area"
   */
  function filtrar(lista, f = {}) {
    const codigo = (f.codigo || "").trim().toUpperCase();
    const resultado = lista.filter((p) => {
      if (codigo) return p.codigo.toUpperCase().includes(codigo); // código ignora o resto
      if (f.finalidade && p.finalidade !== f.finalidade) return false;
      if (f.tipo && p.tipo !== f.tipo) return false;
      if (f.cidade && p.cidade !== f.cidade) return false;
      if (f.bairro && p.bairro !== f.bairro) return false;
      if (f.precoMin && p.preco < f.precoMin) return false;
      if (f.precoMax && p.preco > f.precoMax) return false;
      if (f.dormitorios && p.dormitorios < f.dormitorios) return false;
      if (f.vagas && p.vagas < f.vagas) return false;
      if (f.destaque && !p.destaque) return false;
      if (f.corretorId && p.corretorId !== f.corretorId) return false;
      if (!f.incluirVendidos && p.situacao === "vendido") return false;
      return true;
    });

    const area = (p) => p.areaConstruida || p.areaTerreno || 0;
    switch (f.ordem) {
      case "menor-preco":
        return resultado.sort((a, b) => a.preco - b.preco);
      case "maior-preco":
        return resultado.sort((a, b) => b.preco - a.preco);
      case "maior-area":
        return resultado.sort((a, b) => area(b) - area(a));
      default:
        return resultado.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
    }
  }

  // ---------------------------------------------------------------- imóveis
  async function listProperties(filtros) {
    await rede();
    return filtrar([...lerBanco().imoveis], filtros);
  }

  async function getPropertyByCode(codigo) {
    await rede();
    const c = String(codigo || "").toLowerCase();
    return lerBanco().imoveis.find((p) => p.codigo.toLowerCase() === c) || null;
  }

  async function getPropertyById(id) {
    await rede();
    return lerBanco().imoveis.find((p) => p.id === id) || null;
  }

  /** Bairros com quantos imóveis cada um tem e uma foto (para a home). */
  async function listNeighborhoods() {
    await rede();
    const mapa = new Map();
    for (const p of lerBanco().imoveis.filter((x) => x.situacao !== "vendido")) {
      const chave = p.bairro + "|" + p.cidade;
      const atual = mapa.get(chave);
      if (atual) atual.quantidade += 1;
      else mapa.set(chave, { nome: p.bairro, cidade: p.cidade, quantidade: 1, foto: p.fotos[0] });
    }
    return [...mapa.values()].sort((a, b) => b.quantidade - a.quantidade || a.nome.localeCompare(b.nome, "pt-BR"));
  }

  /** Cidades com imóveis disponíveis (para o filtro da busca), em ordem alfabética. */
  async function listCities() {
    await rede();
    const cidades = new Set(lerBanco().imoveis.filter((x) => x.situacao !== "vendido").map((p) => p.cidade));
    return [...cidades].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }

  /**
   * Campos que NUNCA ficam no anúncio público: o endereço e as coordenadas
   * vão para os dados sigilosos do proprietário (getOwner).
   */
  const CAMPOS_SIGILOSOS = ["endereco", "lat", "lng"];
  function separarSigilosos(dados) {
    const { proprietario, ...publico } = dados;
    const sigiloso = proprietario ? { ...proprietario } : null;
    for (const k of CAMPOS_SIGILOSOS) {
      if (k in publico) {
        if (sigiloso && !(k in sigiloso)) sigiloso[k] = publico[k];
        delete publico[k];
      }
    }
    return { proprietario: sigiloso, publico };
  }

  async function createProperty(dados) {
    await rede();
    const sessao = Elo.auth.getSession();
    if (!sessao || sessao.role === "cliente") throw semPermissao();
    const banco = lerBanco();
    const agora = new Date().toISOString();
    const { proprietario, publico } = separarSigilosos(dados);
    const imovel = {
      ...publico,
      id: "p-" + banco.proximoCodigo,
      codigo: "ELO-" + banco.proximoCodigo, // código gerado no cadastro
      corretorId: sessao.userId,
      criadoEm: agora,
      atualizadoEm: agora,
    };
    banco.imoveis.push(imovel);
    if (proprietario) banco.proprietarios[imovel.id] = proprietario;
    banco.proximoCodigo += 1;
    if (sessao.role === "corretor") {
      notificarAdmin(banco, sessao, "cadastrou o imóvel " + imovel.codigo + " (" + imovel.titulo + ").", imovel.id);
    }
    gravarBanco(banco);
    return imovel;
  }

  async function updateProperty(id, alteracoes) {
    await rede();
    const sessao = Elo.auth.getSession();
    const banco = lerBanco();
    const atual = banco.imoveis.find((p) => p.id === id);
    if (!atual) throw new Error("Imóvel não encontrado.");
    // Corretor só edita o que cadastrou; admin edita tudo.
    const pode =
      (sessao && sessao.role === "admin") ||
      (sessao && sessao.role === "corretor" && atual.corretorId === sessao.userId);
    if (!pode) throw semPermissao();
    const { proprietario, publico } = separarSigilosos(alteracoes);
    const mudou = camposAlterados(atual, publico);
    const donoMudou = proprietario && camposAlterados(banco.proprietarios[id] || {}, proprietario).length > 0;
    Object.assign(atual, publico, { atualizadoEm: new Date().toISOString() });
    if (proprietario) banco.proprietarios[id] = proprietario;
    if (sessao.role === "corretor" && (mudou.length || donoMudou)) {
      const lista = [...mudou.map((k) => NOMES_CAMPOS[k] || k), ...(donoMudou ? ["dados do proprietário"] : [])];
      notificarAdmin(banco, sessao, "alterou o imóvel " + atual.codigo + ": " + lista.join(", ") + ".", id);
    }
    gravarBanco(banco);
    return atual;
  }

  /**
   * TODO(backend, OBRIGATÓRIO antes de produção):
   * a regra "corretor NÃO exclui imóvel; SÓ o administrador exclui" precisa
   * ser garantida NO BANCO, com RLS no Supabase. Algo como:
   *
   *   create policy "somente admin exclui imovel" on imoveis
   *     for delete using (
   *       exists (select 1 from perfis where id = auth.uid() and role = 'admin')
   *     );
   *
   * E nenhuma policy de DELETE para o papel de corretor.
   *
   * Esconder o botão no painel do corretor e a checagem abaixo são apenas UX:
   * rodam no navegador, e qualquer pessoa pode contorná-las pelo console.
   */
  /** Únicos motivos aceitos para retirar um imóvel do site. */
  const MOTIVOS_REMOCAO = {
    "vendido-elo": "Vendido (ou alugado) pela Elo",
    "vendido-terceiros": "Vendido por outro corretor, sem relação com a Elo",
  };

  async function deleteProperty(id, { motivo, observacao } = {}) {
    await rede();
    const sessao = Elo.auth.getSession();
    if (!sessao || sessao.role !== "admin") {
      throw semPermissao("Somente o administrador pode retirar imóveis do site.");
    }
    if (!MOTIVOS_REMOCAO[motivo]) throw new Error("Escolha o motivo da retirada.");
    if (String(observacao || "").trim().length < 10) {
      throw new Error("Descreva a venda em pelo menos 10 caracteres (comprador, data ou corretor).");
    }
    const banco = lerBanco();
    const imovel = banco.imoveis.find((p) => p.id === id);
    if (!imovel) throw new Error("Imóvel não encontrado.");
    // Fica registrado quem retirou, quando e por quê (auditoria contra fraude).
    banco.removidos = banco.removidos || [];
    banco.removidos.unshift({
      imovelId: id, codigo: imovel.codigo, titulo: imovel.titulo, corretorId: imovel.corretorId,
      motivo, observacao: String(observacao).trim(), removidoPor: sessao.userId, removidoEm: new Date().toISOString(),
    });
    banco.imoveis = banco.imoveis.filter((p) => p.id !== id);
    for (const usuario in banco.favoritos) {
      banco.favoritos[usuario] = banco.favoritos[usuario].filter((x) => x !== id);
    }
    gravarBanco(banco);
  }

  // -------------------------------------------------------------- favoritos
  /** Leitura imediata (sem espera), usada para pintar os corações. */
  function favoriteIds(userId) {
    return lerBanco().favoritos[userId] || [];
  }

  async function listFavorites(userId) {
    await rede();
    const banco = lerBanco();
    return (banco.favoritos[userId] || [])
      .map((id) => banco.imoveis.find((p) => p.id === id))
      .filter(Boolean)
      .reverse(); // o salvo por último aparece primeiro
  }

  /** Devolve true se o imóvel ficou salvo, false se foi removido. */
  async function toggleFavorite(userId, imovelId) {
    const banco = lerBanco();
    const lista = banco.favoritos[userId] || [];
    const salvou = !lista.includes(imovelId);
    banco.favoritos[userId] = salvou ? [...lista, imovelId] : lista.filter((x) => x !== imovelId);
    banco.favoritosEm = banco.favoritosEm || {};
    if (salvou) {
      const agora = new Date().toISOString();
      banco.favoritosEm[userId + "|" + imovelId] = agora;
      // Avisa o corretor do imóvel e a administração.
      const imovel = banco.imoveis.find((p) => p.id === imovelId);
      banco.notificacoes = banco.notificacoes || [];
      banco.notificacoes.unshift({
        id: "n-" + Date.now().toString(36), tipo: "favorito", imovelId, clienteId: userId,
        corretorId: imovel && imovel.corretorId, criadoEm: agora, lidaPor: [],
      });
    } else {
      delete banco.favoritosEm[userId + "|" + imovelId];
    }
    gravarBanco(banco);
    return salvou;
  }

  // --------------------------------------------------------------- usuários
  function exigirAdmin() {
    const sessao = Elo.auth.getSession();
    if (!sessao || sessao.role !== "admin") throw semPermissao();
  }

  async function listUsers(role) {
    await rede();
    exigirAdmin();
    return lerBanco()
      .usuarios.filter((u) => u.role === role)
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }

  /** WhatsApp público do corretor (leitura imediata), ou "" se ele não preencheu. */
  function brokerWhatsapp(id) {
    const u = lerBanco().usuarios.find((x) => x.id === id && x.role === "corretor" && x.situacao === "ativo");
    return (u && u.whatsapp) || "";
  }

  /** { id do corretor: nome } para mostrar quem cadastrou cada imóvel. */
  function brokerNames() {
    const nomes = {};
    for (const u of lerBanco().usuarios) if (u.role !== "cliente") nomes[u.id] = u.nome;
    return nomes;
  }

  async function setBrokerActive(userId, ativo) {
    await rede();
    exigirAdmin();
    const banco = lerBanco();
    const u = banco.usuarios.find((x) => x.id === userId && x.role === "corretor");
    if (u) u.situacao = ativo ? "ativo" : "inativo";
    gravarBanco(banco);
  }

  function favoriteCounts() {
    const contagem = {};
    const banco = lerBanco();
    for (const u in banco.favoritos) contagem[u] = banco.favoritos[u].length;
    return contagem;
  }

  // ====================================================== EQUIPE DE CORRETORES
  /*
   * Como um corretor entra na Elo:
   *   1. Ele preenche seja-corretor.html -> requestBrokerAccess -> situação "pendente"
   *      (ou o administrador cadastra direto -> addBroker -> "ativo").
   *   2. O administrador aprova (approveBroker -> "ativo") ou recusa ("recusado").
   *   3. Só com "ativo" ele entra no painel (ver Elo.auth.signIn).
   * TODO(backend): no Supabase, a situação fica na tabela de perfis e a RLS só
   * libera insert/update de imóveis para corretor com situacao = 'ativo'.
   */
  function emailEmUso(banco, email) {
    return banco.usuarios.some((u) => u.email.toLowerCase() === email);
  }

  /** Pedido público de acesso (não precisa estar logado). */
  async function requestBrokerAccess({ nome, email, telefone, creci, mensagem }) {
    await rede();
    const banco = lerBanco();
    const e = email.trim().toLowerCase();
    if (emailEmUso(banco, e)) {
      const erro = new Error("Já existe uma conta ou solicitação com este e-mail.");
      erro.campo = "email";
      throw erro;
    }
    const usuario = {
      id: "u-" + Date.now().toString(36),
      nome: nome.trim(), email: e, telefone: telefone.trim(), creci: creci.trim(),
      mensagem: (mensagem || "").trim(),
      role: "corretor", situacao: "pendente", criadoEm: new Date().toISOString(),
    };
    banco.usuarios.push(usuario);
    gravarBanco(banco);
    return usuario;
  }

  /** O administrador cadastra o corretor direto, já aprovado. */
  async function addBroker({ nome, email, telefone, creci }) {
    await rede();
    exigirAdmin();
    const banco = lerBanco();
    const e = email.trim().toLowerCase();
    if (emailEmUso(banco, e)) throw new Error("Já existe uma conta com este e-mail.");
    const agora = new Date().toISOString();
    const usuario = {
      id: "u-" + Date.now().toString(36),
      nome: nome.trim(), email: e, telefone: (telefone || "").trim(), creci: (creci || "").trim(),
      role: "corretor", situacao: "ativo", criadoEm: agora, aprovadoEm: agora,
    };
    banco.usuarios.push(usuario);
    gravarBanco(banco);
    return usuario;
  }

  async function listBrokerRequests() {
    await rede();
    exigirAdmin();
    return lerBanco()
      .usuarios.filter((u) => u.role === "corretor" && u.situacao === "pendente")
      .sort((a, b) => a.criadoEm.localeCompare(b.criadoEm));
  }

  /** Quantas solicitações esperam resposta (para o número no menu do admin). */
  function pendingRequestsCount() {
    return lerBanco().usuarios.filter((u) => u.role === "corretor" && u.situacao === "pendente").length;
  }

  async function answerBrokerRequest(userId, aprovar) {
    await rede();
    exigirAdmin();
    const banco = lerBanco();
    const u = banco.usuarios.find((x) => x.id === userId && x.situacao === "pendente");
    if (!u) throw new Error("Esta solicitação já foi respondida.");
    u.situacao = aprovar ? "ativo" : "recusado";
    u[aprovar ? "aprovadoEm" : "recusadoEm"] = new Date().toISOString();
    gravarBanco(banco);
    return u;
  }
  const approveBroker = (id) => answerBrokerRequest(id, true);
  const rejectBroker = (id) => answerBrokerRequest(id, false);

  // ------------------------------------------------ perfil do próprio corretor
  async function getMyProfile() {
    await rede();
    const sessao = Elo.auth.getSession();
    if (!sessao || sessao.role !== "corretor") throw semPermissao();
    return structuredClone(lerBanco().usuarios.find((u) => u.id === sessao.userId));
  }

  /** O corretor preenche o que aparece no "Saiba mais" (corretor.html). */
  async function updateMyProfile(dados) {
    await rede();
    const sessao = Elo.auth.getSession();
    if (!sessao || sessao.role !== "corretor") throw semPermissao();
    const banco = lerBanco();
    const u = banco.usuarios.find((x) => x.id === sessao.userId);
    const permitidos = ["nome", "telefone", "whatsapp", "creci", "desde", "bio", "especialidades", "foto"];
    const mudou = camposAlterados(u, Object.fromEntries(permitidos.filter((k) => k in dados).map((k) => [k, dados[k]])));
    for (const k of permitidos) if (k in dados) u[k] = dados[k];
    if (mudou.length) notificarAdmin(banco, sessao, "atualizou o perfil: " + mudou.map((k) => NOMES_CAMPOS[k] || k).join(", ") + ".");
    gravarBanco(banco);
    return u;
  }

  // ================================================ NOTIFICAÇÕES PARA O ADMIN
  /** Nomes em português dos campos, para o texto das notificações. */
  const NOMES_CAMPOS = {
    nome: "nome", email: "e-mail", telefone: "telefone", whatsapp: "WhatsApp", creci: "CRECI",
    desde: "ano de início", bio: "apresentação", especialidades: "especialidades", foto: "foto",
    titulo: "título", preco: "preço", condominio: "condomínio", iptu: "IPTU", endereco: "endereço",
    bairro: "bairro", cidade: "cidade", finalidade: "finalidade", tipo: "tipo", dormitorios: "dormitórios", suites: "suítes",
    vagas: "vagas", areaConstruida: "área construída", areaTerreno: "área do terreno", descricao: "descrição",
    fotos: "fotos", videos: "vídeos", selo: "selo", destaque: "destaque",
  };

  /** Quais campos de "novo" são diferentes de "atual". */
  function camposAlterados(atual, novo) {
    const igual = (a, b) => JSON.stringify(a ?? "") === JSON.stringify(b ?? "");
    return Object.keys(novo).filter((k) => k !== "uf" && !igual(atual[k], novo[k]));
  }

  /**
   * Avisa a administração de uma mudança feita por cliente ou corretor.
   * Estas notificações são só do admin (soAdmin), nunca aparecem para corretor.
   */
  function notificarAdmin(banco, sessao, texto, imovelId) {
    banco.notificacoes = banco.notificacoes || [];
    banco.notificacoes.unshift({
      id: "n-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      tipo: "alteracao", soAdmin: true, autorId: sessao.userId, autorPerfil: sessao.role,
      texto, imovelId: imovelId || null, criadoEm: new Date().toISOString(), lidaPor: [],
    });
  }

  // ================================================== CONTA DO CLIENTE
  async function getMyAccount() {
    await rede();
    const sessao = Elo.auth.getSession();
    if (!sessao) throw semPermissao();
    const u = lerBanco().usuarios.find((x) => x.id === sessao.userId);
    return { id: u.id, nome: u.nome, email: u.email, telefone: u.telefone || "", role: u.role, criadoEm: u.criadoEm };
  }

  /** Cliente (ou admin) atualiza nome, e-mail e telefone. Cliente avisa o admin. */
  async function updateMyAccount({ nome, email, telefone }) {
    await rede();
    const sessao = Elo.auth.getSession();
    if (!sessao || sessao.role === "corretor") throw semPermissao(); // corretor usa Meu perfil
    const banco = lerBanco();
    const u = banco.usuarios.find((x) => x.id === sessao.userId);
    const e = email.trim().toLowerCase();
    if (banco.usuarios.some((x) => x.id !== u.id && x.email.toLowerCase() === e)) {
      const erro = new Error("Este e-mail já é usado por outra conta.");
      erro.campo = "email";
      throw erro;
    }
    const novo = { nome: nome.trim(), email: e, telefone: (telefone || "").trim() };
    const mudou = camposAlterados(u, novo);
    Object.assign(u, novo);
    if (mudou.length && sessao.role === "cliente") {
      notificarAdmin(banco, sessao, "atualizou os dados pessoais: " + mudou.map((k) => NOMES_CAMPOS[k] || k).join(", ") + ".");
    }
    gravarBanco(banco);
    return u;
  }

  // ======================================================== DADOS DA EMPRESA
  /** Campos de contato que o admin pode mudar (sobrepõem js/instituicao.js). */
  const CAMPOS_EMPRESA = ["telefone", "whatsapp", "email", "endereco", "horario", "creci", "cnpj"];

  /** Copia o que o admin salvou para Elo.SITE: o site todo passa a usar. */
  function aplicarEmpresa() {
    const empresa = lerBanco().empresa || {};
    for (const k of CAMPOS_EMPRESA) {
      if (empresa[k] && Elo.SITE[k]) Elo.SITE[k] = { valor: empresa[k], validar: false };
    }
  }

  function getCompany() {
    const o = {};
    for (const k of CAMPOS_EMPRESA) o[k] = Elo.SITE[k] ? Elo.SITE[k].valor : "";
    return o;
  }

  async function updateCompany(dados) {
    await rede();
    exigirAdmin();
    const banco = lerBanco();
    banco.empresa = banco.empresa || {};
    for (const k of CAMPOS_EMPRESA) if (k in dados) banco.empresa[k] = String(dados[k]).trim();
    gravarBanco(banco);
    aplicarEmpresa();
  }

  // ===================================================== VENDAS E AVALIAÇÕES
  /**
   * O admin confirma que o imóvel foi vendido (ou alugado) pela Elo e diz
   * quem comprou. O imóvel sai das listas do site e o comprador ganha o
   * direito de avaliar o atendimento (uma vez).
   * TODO(backend): RLS para só admin mudar "situacao" e "compradorId".
   */
  async function confirmSale(imovelId, { compradorId, data }) {
    await rede();
    exigirAdmin();
    const banco = lerBanco();
    const imovel = banco.imoveis.find((x) => x.id === imovelId);
    if (!imovel) throw new Error("Imóvel não encontrado.");
    if (imovel.situacao === "vendido") throw new Error("Este imóvel já está marcado como vendido.");
    const comprador = banco.usuarios.find((u) => u.id === compradorId && u.role === "cliente");
    if (!comprador) throw new Error("Escolha o cliente que comprou o imóvel.");
    imovel.situacao = "vendido";
    imovel.compradorId = compradorId;
    imovel.vendidoEm = data || new Date().toISOString().slice(0, 10);
    imovel.atualizadoEm = new Date().toISOString();
    gravarBanco(banco);
    return imovel;
  }

  /** Imóveis que o cliente logado comprou, e se ele já avaliou cada um. */
  async function myPurchases() {
    await rede();
    const sessao = Elo.auth.getSession();
    if (!sessao || sessao.role !== "cliente") return [];
    const banco = lerBanco();
    return banco.imoveis
      .filter((p) => p.situacao === "vendido" && p.compradorId === sessao.userId)
      .map((p) => ({ imovel: p, avaliacao: (banco.avaliacoes || []).find((a) => a.imovelId === p.id && a.clienteId === sessao.userId) || null }));
  }

  /** O comprador avalia o atendimento. anonimo = true esconde o nome no site. */
  async function submitReview({ imovelId, nota, texto, anonimo }) {
    await rede();
    const sessao = Elo.auth.getSession();
    if (!sessao || sessao.role !== "cliente") throw semPermissao();
    const banco = lerBanco();
    const imovel = banco.imoveis.find((p) => p.id === imovelId);
    if (!imovel || imovel.situacao !== "vendido" || imovel.compradorId !== sessao.userId) {
      throw semPermissao("Só quem comprou este imóvel pela Elo pode avaliar.");
    }
    banco.avaliacoes = banco.avaliacoes || [];
    if (banco.avaliacoes.some((a) => a.imovelId === imovelId && a.clienteId === sessao.userId)) {
      throw new Error("Você já avaliou esta compra.");
    }
    const n = Math.round(Number(nota));
    if (!(n >= 1 && n <= 5)) throw new Error("Escolha uma nota de 1 a 5 estrelas.");
    const partes = sessao.nome.trim().split(/s+/);
    const avaliacao = {
      id: "a-" + Date.now().toString(36),
      imovelId, clienteId: sessao.userId, corretorId: imovel.corretorId,
      // Anônimo: o nome não é mostrado no site (o admin ainda sabe quem foi).
      anonimo: Boolean(anonimo),
      nome: anonimo ? "Cliente anônimo" : partes[0] + (partes[1] ? " " + partes[partes.length - 1][0] + "." : ""),
      contexto: (imovel.finalidade === "aluguel" ? "Alugou " : "Comprou ") + (Elo.TIPOS[imovel.tipo] || "imóvel").toLowerCase() + " no " + imovel.bairro,
      nota: n, texto: String(texto || "").trim(), data: new Date().toISOString().slice(0, 10), real: true,
    };
    banco.avaliacoes.unshift(avaliacao);
    notificarAdmin(banco, sessao, "avaliou a compra do imóvel " + imovel.codigo + " com " + n + " estrela" + (n > 1 ? "s" : "") + (anonimo ? " (anônima no site)." : "."), imovelId);
    gravarBanco(banco);
    return avaliacao;
  }

  // ============================================================ BLOG (admin)
  /** "Como preparar a casa!" -> "como-preparar-a-casa" */
  function criarSlug(titulo, existentes) {
    const base = titulo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "materia";
    let slug = base;
    for (let i = 2; existentes.includes(slug); i++) slug = base + "-" + i;
    return slug;
  }

  function validarMateria(m) {
    if (!m.titulo || m.titulo.trim().length < 10) throw new Error("O título precisa de pelo menos 10 caracteres.");
    if (!m.resumo || m.resumo.trim().length < 20) throw new Error("O resumo precisa de pelo menos 20 caracteres.");
    if (!m.corpo || !m.corpo.length) throw new Error("Escreva o texto da matéria.");
  }

  async function createPost(dados) {
    await rede();
    exigirAdmin();
    validarMateria(dados);
    const banco = lerBanco();
    const materia = { ...dados, slug: criarSlug(dados.titulo, banco.materias.map((m) => m.slug)) };
    banco.materias.unshift(materia);
    gravarBanco(banco);
    return materia;
  }

  async function updatePost(slug, dados) {
    await rede();
    exigirAdmin();
    validarMateria(dados);
    const banco = lerBanco();
    const m = banco.materias.find((x) => x.slug === slug);
    if (!m) throw new Error("Matéria não encontrada.");
    Object.assign(m, dados, { slug }); // o endereço da matéria não muda
    gravarBanco(banco);
    return m;
  }

  async function deletePost(slug) {
    await rede();
    exigirAdmin();
    const banco = lerBanco();
    banco.materias = banco.materias.filter((x) => x.slug !== slug);
    gravarBanco(banco);
  }

  // ===================================================== DADOS DO PROPRIETÁRIO
  /**
   * SIGILOSO: só o corretor do imóvel e o administrador leem.
   * TODO(backend, OBRIGATÓRIO): tabela "proprietarios" separada de "imoveis",
   * com RLS de select/update só para o corretor dono e para admin. Hoje fica no
   * localStorage, que qualquer pessoa com acesso ao navegador consegue ler.
   */
  async function getOwner(imovelId) {
    await rede();
    const sessao = Elo.auth.getSession();
    const banco = lerBanco();
    const imovel = banco.imoveis.find((p) => p.id === imovelId);
    const pode =
      sessao && imovel && (sessao.role === "admin" || (sessao.role === "corretor" && imovel.corretorId === sessao.userId));
    if (!pode) throw semPermissao("Os dados do proprietário são visíveis só para o corretor do imóvel e a administração.");
    return structuredClone((banco.proprietarios || {})[imovelId] || null);
  }

  // =================================================== QUEM FAVORITOU (painel)
  /**
   * Para cada imóvel, quem salvou nos favoritos. O corretor recebe só os
   * imóveis dele; o administrador recebe todos (ou os de um corretor, se filtrar).
   */
  async function favoritesReport({ corretorId } = {}) {
    await rede();
    const sessao = Elo.auth.getSession();
    if (!sessao || sessao.role === "cliente") throw semPermissao();
    const banco = lerBanco();
    const filtroCorretor = sessao.role === "admin" ? corretorId : sessao.userId;
    const clientes = new Map(banco.usuarios.filter((u) => u.role === "cliente").map((u) => [u.id, u]));
    const porImovel = new Map();
    for (const [clienteId, ids] of Object.entries(banco.favoritos)) {
      const c = clientes.get(clienteId);
      if (!c) continue;
      for (const id of ids) {
        if (!porImovel.has(id)) porImovel.set(id, []);
        porImovel.get(id).push({
          id: c.id, nome: c.nome, email: c.email, telefone: c.telefone || "",
          em: (banco.favoritosEm || {})[clienteId + "|" + id] || null,
        });
      }
    }
    return banco.imoveis
      .filter((p) => !filtroCorretor || p.corretorId === filtroCorretor)
      .map((p) => ({
        imovel: p,
        clientes: (porImovel.get(p.id) || []).sort((a, b) => String(b.em).localeCompare(String(a.em))),
      }))
      .filter((x) => x.clientes.length)
      .sort((a, b) => b.clientes.length - a.clientes.length);
  }

  // ============================================================ NOTIFICAÇÕES
  /** Corretor vê só as dos imóveis dele; admin vê todas. */
  function minhasNotificacoes(banco, sessao) {
    if (!sessao || sessao.role === "cliente") return [];
    return (banco.notificacoes || []).filter((n) => sessao.role === "admin" || (!n.soAdmin && n.corretorId === sessao.userId));
  }

  async function listNotifications() {
    await rede();
    const sessao = Elo.auth.getSession();
    const banco = lerBanco();
    const nomes = Object.fromEntries(banco.usuarios.map((u) => [u.id, u.nome]));
    return minhasNotificacoes(banco, sessao)
      .map((n) => {
        const imovel = banco.imoveis.find((p) => p.id === n.imovelId);
        return {
          ...n,
          lida: n.lidaPor.includes(sessao.userId),
          clienteNome: nomes[n.clienteId] || "Cliente",
          autorNome: nomes[n.autorId] || "",
          corretorNome: nomes[n.corretorId] || "",
          imovel: imovel ? { codigo: imovel.codigo, titulo: imovel.titulo } : null,
        };
      })
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  }

  /** Quantas não lidas (leitura imediata, para o número no menu). */
  function unreadNotificationsCount() {
    const sessao = Elo.auth.getSession();
    return minhasNotificacoes(lerBanco(), sessao).filter((n) => !n.lidaPor.includes(sessao.userId)).length;
  }

  async function markNotificationsRead() {
    const sessao = Elo.auth.getSession();
    const banco = lerBanco();
    for (const n of minhasNotificacoes(banco, sessao)) {
      if (!n.lidaPor.includes(sessao.userId)) n.lidaPor.push(sessao.userId);
    }
    gravarBanco(banco);
  }

  /** Histórico de imóveis retirados do site (só admin). */
  async function listRemovals() {
    await rede();
    exigirAdmin();
    return lerBanco().removidos || [];
  }

  // ------------------------------------------------- corretores (público)
  /** Só o que pode aparecer no site: nada de e-mail de login nem situação. */
  function perfilPublico(u, imoveis) {
    return {
      id: u.id,
      nome: u.nome,
      creci: u.creci || "",
      desde: u.desde || null,
      bio: u.bio || "",
      especialidades: u.especialidades || [],
      telefone: u.telefone || "",
      whatsapp: u.whatsapp || "",
      foto: u.foto || "",
      quantidadeImoveis: imoveis.filter((p) => p.corretorId === u.id).length,
    };
  }

  /** Corretores ativos, para a home e a página do corretor. */
  async function listBrokers() {
    await rede();
    const banco = lerBanco();
    return banco.usuarios
      .filter((u) => u.role === "corretor" && u.situacao === "ativo")
      .map((u) => perfilPublico(u, banco.imoveis))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }

  async function getBroker(id) {
    await rede();
    const banco = lerBanco();
    const u = banco.usuarios.find((x) => x.id === id && x.role === "corretor" && x.situacao === "ativo");
    return u ? perfilPublico(u, banco.imoveis) : null;
  }

  // ------------------------------------- avaliações, blog e newsletter
  /** Avaliações de clientes. corretorId opcional filtra as de um corretor. */
  async function listTestimonials(corretorId) {
    await rede();
    return (lerBanco().avaliacoes || []).filter((a) => !corretorId || a.corretorId === corretorId);
  }

  /** Matérias do blog, da mais nova para a mais antiga. */
  async function listPosts({ categoria } = {}) {
    await rede();
    return [...lerBanco().materias]
      .filter((m) => !categoria || m.categoria === categoria)
      .sort((a, b) => b.data.localeCompare(a.data));
  }

  async function getPost(slug) {
    await rede();
    return lerBanco().materias.find((m) => m.slug === slug) || null;
  }

  /**
   * Inscreve o e-mail na newsletter. Devolve { jaInscrito } para a mensagem.
   * TODO(backend): mandar para a ferramenta de e-mail marketing e pedir
   * confirmação por e-mail (dupla confirmação).
   */
  async function subscribeNewsletter(email) {
    await rede();
    const banco = lerBanco();
    banco.newsletter = banco.newsletter || [];
    const e = email.trim().toLowerCase();
    if (banco.newsletter.some((x) => x.email === e)) return { jaInscrito: true };
    banco.newsletter.push({ email: e, criadoEm: new Date().toISOString() });
    gravarBanco(banco);
    return { jaInscrito: false };
  }

  // Usado só pelo login simulado (auth.js).
  function _usuarios() {
    return lerBanco().usuarios;
  }
  function _adicionarUsuario(usuario) {
    const banco = lerBanco();
    banco.usuarios.push(usuario);
    gravarBanco(banco);
  }

  aplicarEmpresa();
  aoMudar(aplicarEmpresa);

  Elo.dados = {
    listProperties,
    getPropertyByCode,
    getPropertyById,
    listNeighborhoods,
    listCities,
    createProperty,
    updateProperty,
    deleteProperty,
    favoriteIds,
    listFavorites,
    toggleFavorite,
    listUsers,
    brokerNames,
    brokerWhatsapp,
    addBroker,
    requestBrokerAccess,
    listBrokerRequests,
    pendingRequestsCount,
    approveBroker,
    rejectBroker,
    getMyProfile,
    updateMyProfile,
    getOwner,
    favoritesReport,
    listNotifications,
    unreadNotificationsCount,
    markNotificationsRead,
    listRemovals,
    MOTIVOS_REMOCAO,
    getMyAccount,
    updateMyAccount,
    getCompany,
    updateCompany,
    confirmSale,
    myPurchases,
    submitReview,
    createPost,
    updatePost,
    deletePost,
    categoriasBlog: () => [...new Set(lerBanco().materias.map((m) => m.categoria))],
    setBrokerActive,
    favoriteCounts,
    listBrokers,
    getBroker,
    listTestimonials,
    listPosts,
    getPost,
    subscribeNewsletter,
    resetarDados,
    simulandoErro,
    simularErro,
    aoMudar,
    avisarMudanca,
    _usuarios,
    _adicionarUsuario,
  };
})();

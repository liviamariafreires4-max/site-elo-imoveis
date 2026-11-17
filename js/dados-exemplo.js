/**
 * DADOS DE EXEMPLO (PROVISÓRIOS)
 * ------------------------------------------------------------------
 * Imóveis fictícios em bairros reais de Presidente Prudente e cidades da região. Preços, áreas e
 * endereços são plausíveis, mas inventados. As fotos são de banco de imagens
 * livre (Unsplash) e NÃO retratam os imóveis: trocar pelas fotos reais.
 *
 * Este arquivo só é lido na primeira visita (ou ao "Restaurar dados de
 * exemplo"). Depois disso, os dados vivem no localStorage do navegador.
 */
window.Elo = window.Elo || {};

(function () {
  const foto = (id, alt) => ({ url: "https://images.unsplash.com/photo-" + id, alt });

  // Banco de fotos provisórias, conferidas visualmente.
  const F = {
    vilaPiscina: "1580587771525-78b9dba3b914",
    brancaPiscina: "1600596542815-ffad4c1539a9",
    palmeirasPiscina: "1564013799919-ab600027ffc6",
    modernaArvore: "1600585154340-be6161a56a0c",
    modernaPedra: "1600566753190-17f0baa2a6c3",
    modernaLaranja: "1600047509807-ba8f99d2cdde",
    varandaPiscina: "1613490493576-7fde63acd811",
    areaLazer: "1582268611958-ebfd161ef9cf",
    predio: "1545324418-cc1a3fa10c00",
    salaMadeira: "1600607687939-ce8a6c25118c",
    salaQuadros: "1600210492486-724fe5c67fb0",
    salaPlantas: "1502672260266-1c1ef2d93688",
    salaJantar: "1522708323590-d24dbb6b0267",
    salaClara: "1493809842364-78817add7ffb",
    salaAmpla: "1560448204-e02f11c3d0e2",
    salaIntegrada: "1560185127-6ed189bf02f4",
    salaAzul: "1600573472550-8090b5e0745e",
    salaLoft: "1600566753086-00f18fb6b3ea",
    cozinha: "1484154218962-a197022b5858",
    quarto: "1616594039964-ae9021a400a0",
    banheiro: "1552321554-5fefe8c9ef14",
    campo: "1500382017468-9049fed747ef",
    chacara: "1558036117-15d82a90b9b1",
    escritorio: "1497366216548-37526070297c",
    salaComercial: "1497366811353-6870744d04b2",
  };

  const PP = { cidade: "Presidente Prudente", uf: "SP" };

  const imoveis = [
    {
      id: "p-1001", codigo: "ELO-1001", finalidade: "venda", tipo: "casa-condominio",
      titulo: "Casa em condomínio com piscina e área gourmet",
      preco: 1980000, condominio: 780, iptu: 3200,
      endereco: "Rua das Acácias, 120", bairro: "Parque Residencial Damha II", ...PP,
      dormitorios: 4, suites: 3, vagas: 4, areaConstruida: 320, areaTerreno: 480,
      descricao: "Casa de dois pavimentos em condomínio fechado, com sala em pé-direito duplo integrada à área gourmet e à piscina. Quatro dormitórios, sendo três suítes, todos com armários. Cozinha planejada, lavanderia separada e garagem coberta para quatro carros. O condomínio tem portaria 24 horas, quadras e salão de festas.",
      fotos: [
        foto(F.vilaPiscina, "Fachada com piscina e deque"),
        foto(F.salaMadeira, "Sala de estar com painel de madeira"),
        foto(F.cozinha, "Cozinha planejada"),
        foto(F.quarto, "Suíte principal"),
        foto(F.areaLazer, "Área de lazer com piscina"),
      ],
      selo: "Aceita permuta", destaque: true, corretorId: "u-corretor-1",
      criadoEm: "2026-10-28T14:10:00.000Z", atualizadoEm: "2026-11-05T09:30:00.000Z",
    },
    {
      id: "p-1002", codigo: "ELO-1002", finalidade: "venda", tipo: "apartamento",
      titulo: "Apartamento com varanda a duas quadras do Parque do Povo",
      preco: 620000, condominio: 690, iptu: 1450,
      endereco: "Avenida Onze de Maio, 1500", bairro: "Jardim Paulistano", ...PP,
      dormitorios: 3, suites: 1, vagas: 2, areaConstruida: 112,
      descricao: "Apartamento em andar alto, com sala para dois ambientes e varanda voltada para o nascente. Três dormitórios, sendo uma suíte, cozinha com armários e área de serviço fechada. Duas vagas cobertas e depósito no subsolo. Prédio com elevador, portaria e salão de festas.",
      fotos: [
        foto(F.predio, "Fachada do edifício"),
        foto(F.salaJantar, "Sala de estar e jantar"),
        foto(F.cozinha, "Cozinha com armários"),
        foto(F.banheiro, "Banheiro social"),
      ],
      destaque: true, corretorId: "u-corretor-1",
      criadoEm: "2026-11-02T11:00:00.000Z", atualizadoEm: "2026-11-02T11:00:00.000Z",
    },
    {
      id: "p-1003", codigo: "ELO-1003", finalidade: "venda", tipo: "casa",
      titulo: "Casa térrea com quintal amplo",
      preco: 890000, iptu: 2100,
      endereco: "Rua Antônio Rodrigues, 345", bairro: "Jardim Bongiovani", ...PP,
      dormitorios: 3, suites: 1, vagas: 2, areaConstruida: 210, areaTerreno: 360,
      descricao: "Casa térrea em rua tranquila do Jardim Bongiovani. Sala ampla, três dormitórios com uma suíte, cozinha com despensa e edícula com churrasqueira. Quintal gramado com espaço para piscina. Garagem coberta para dois carros.",
      fotos: [
        foto(F.modernaLaranja, "Fachada e jardim frontal"),
        foto(F.salaQuadros, "Sala de estar"),
        foto(F.cozinha, "Cozinha"),
        foto(F.quarto, "Suíte"),
      ],
      destaque: true, corretorId: "u-corretor-2",
      criadoEm: "2026-10-20T16:45:00.000Z", atualizadoEm: "2026-10-30T10:00:00.000Z",
    },
    {
      id: "p-1004", codigo: "ELO-1004", finalidade: "aluguel", tipo: "apartamento",
      titulo: "Apartamento mobiliado no Centro",
      preco: 2400, condominio: 480, iptu: 960,
      endereco: "Rua Siqueira Campos, 820", bairro: "Centro", ...PP,
      dormitorios: 2, suites: 1, vagas: 1, areaConstruida: 68,
      descricao: "Apartamento mobiliado, pronto para morar, perto do calçadão e de linhas de ônibus. Dois dormitórios com uma suíte, sala com varanda, cozinha equipada com geladeira e fogão. Uma vaga coberta. Prédio com elevador e portaria.",
      fotos: [
        foto(F.salaClara, "Sala com janelas amplas"),
        foto(F.salaPlantas, "Estar com poltronas"),
        foto(F.banheiro, "Banheiro"),
      ],
      selo: "Mobiliado", destaque: true, corretorId: "u-corretor-2",
      criadoEm: "2026-11-06T13:20:00.000Z", atualizadoEm: "2026-11-06T13:20:00.000Z",
    },
    {
      id: "p-1005", codigo: "ELO-1005", finalidade: "venda", tipo: "terreno",
      titulo: "Terreno plano de 250 m² pronto para construir",
      preco: 185000, iptu: 620,
      endereco: "Rua Projetada 4, lote 18", bairro: "Jardim Vale do Sol", ...PP,
      dormitorios: 0, suites: 0, vagas: 0, areaTerreno: 250,
      descricao: "Terreno plano de 10 x 25 m em loteamento com asfalto, água, esgoto e iluminação. Documentação em ordem, pronto para financiar a construção.",
      fotos: [foto(F.campo, "Vista do terreno ao entardecer")],
      destaque: false, corretorId: "u-corretor-1",
      criadoEm: "2026-09-15T09:00:00.000Z", atualizadoEm: "2026-09-15T09:00:00.000Z",
    },
    {
      id: "p-1006", codigo: "ELO-1006", finalidade: "venda", tipo: "casa",
      titulo: "Sobrado com área gourmet na Vila Maristela",
      preco: 540000, iptu: 1300,
      endereco: "Rua Ribeiro de Barros, 77", bairro: "Vila Maristela", ...PP,
      dormitorios: 3, suites: 1, vagas: 2, areaConstruida: 168, areaTerreno: 250,
      descricao: "Sobrado com sala, lavabo e cozinha no térreo e três dormitórios no piso superior, sendo uma suíte com sacada. Área gourmet coberta nos fundos. Perto de escolas e do comércio do bairro.",
      fotos: [
        foto(F.modernaPedra, "Fachada com muro de pedra"),
        foto(F.salaAmpla, "Sala de estar"),
        foto(F.cozinha, "Cozinha"),
      ],
      destaque: false, corretorId: "u-corretor-2",
      criadoEm: "2026-10-05T15:30:00.000Z", atualizadoEm: "2026-10-05T15:30:00.000Z",
    },
    {
      id: "p-1007", codigo: "ELO-1007", finalidade: "aluguel", tipo: "casa",
      titulo: "Casa com piscina no Jardim Aviação",
      preco: 4800, iptu: 2600,
      endereco: "Rua Major Felício Tarabay, 410", bairro: "Jardim Aviação", ...PP,
      dormitorios: 3, suites: 2, vagas: 3, areaConstruida: 240, areaTerreno: 400,
      descricao: "Casa ampla para locação, com piscina, churrasqueira e jardim. Três dormitórios, sendo duas suítes, sala para três ambientes e cozinha com armários. Garagem para três carros, com portão automático.",
      fotos: [
        foto(F.palmeirasPiscina, "Fundos da casa com piscina"),
        foto(F.salaIntegrada, "Sala integrada à cozinha"),
        foto(F.quarto, "Suíte"),
      ],
      destaque: true, corretorId: "u-corretor-1",
      criadoEm: "2026-11-08T10:15:00.000Z", atualizadoEm: "2026-11-08T10:15:00.000Z",
    },
    {
      id: "p-1008", codigo: "ELO-1008", finalidade: "aluguel", tipo: "sala-comercial",
      titulo: "Sala comercial com recepção e copa",
      preco: 1900, condominio: 350,
      endereco: "Avenida Coronel José Soares Marcondes, 2300", bairro: "Vila Nova", ...PP,
      dormitorios: 0, suites: 0, vagas: 1, areaConstruida: 54,
      descricao: "Sala comercial em edifício com elevador e portaria, com recepção, uma sala de atendimento, copa e banheiro. Uma vaga de garagem. Indicada para consultório ou escritório.",
      fotos: [
        foto(F.escritorio, "Área de trabalho da sala"),
        foto(F.salaComercial, "Sala de reunião"),
      ],
      destaque: false, corretorId: "u-corretor-2",
      criadoEm: "2026-10-12T08:40:00.000Z", atualizadoEm: "2026-10-12T08:40:00.000Z",
    },
    {
      id: "p-1009", codigo: "ELO-1009", finalidade: "venda", tipo: "apartamento",
      titulo: "Apartamento de 2 dormitórios na Vila Formosa",
      preco: 230000, condominio: 320, iptu: 540,
      endereco: "Rua José Bongiovani, 1140", bairro: "Vila Formosa", ...PP,
      dormitorios: 2, suites: 0, vagas: 1, areaConstruida: 58,
      descricao: "Apartamento bem conservado, com dois dormitórios, sala com sacada, cozinha e área de serviço. Uma vaga coberta. Condomínio com playground e portaria.",
      fotos: [
        foto(F.salaPlantas, "Sala de estar"),
        foto(F.salaAzul, "Estar com sofá"),
        foto(F.banheiro, "Banheiro"),
      ],
      destaque: false, corretorId: "u-corretor-1",
      criadoEm: "2026-09-28T17:00:00.000Z", atualizadoEm: "2026-09-28T17:00:00.000Z",
    },
    {
      id: "p-1010", codigo: "ELO-1010", finalidade: "venda", tipo: "casa-condominio",
      titulo: "Casa nova de três suítes com piscina",
      preco: 1450000, condominio: 620, iptu: 2800,
      endereco: "Alameda dos Ipês, 56", bairro: "Central Park Residence", ...PP,
      dormitorios: 3, suites: 3, vagas: 2, areaConstruida: 245, areaTerreno: 300,
      descricao: "Casa recém-construída, nunca habitada, com três suítes, sala integrada à cozinha e área gourmet com piscina. Acabamento em porcelanato, esquadrias de alumínio e preparação para ar-condicionado em todos os ambientes.",
      fotos: [
        foto(F.brancaPiscina, "Fachada branca com piscina"),
        foto(F.salaLoft, "Sala com pé-direito duplo"),
        foto(F.varandaPiscina, "Varanda e piscina"),
        foto(F.quarto, "Suíte"),
      ],
      destaque: true, corretorId: "u-corretor-2",
      criadoEm: "2026-11-10T09:05:00.000Z", atualizadoEm: "2026-11-10T09:05:00.000Z",
    },
    {
      id: "p-1011", codigo: "ELO-1011", finalidade: "aluguel", tipo: "apartamento",
      titulo: "Apartamento de 3 dormitórios perto da universidade",
      preco: 3200, condominio: 650, iptu: 1500,
      endereco: "Rua Tenente Nicolau Maffei, 980", bairro: "Jardim Bongiovani", ...PP,
      dormitorios: 3, suites: 1, vagas: 2, areaConstruida: 105,
      descricao: "Apartamento amplo, com três dormitórios, sendo uma suíte, sala para dois ambientes e varanda. Cozinha com armários e duas vagas cobertas. Condomínio com piscina e academia.",
      fotos: [
        foto(F.salaQuadros, "Sala de estar"),
        foto(F.cozinha, "Cozinha"),
        foto(F.quarto, "Suíte"),
      ],
      destaque: false, corretorId: "u-corretor-1",
      criadoEm: "2026-10-25T12:00:00.000Z", atualizadoEm: "2026-10-25T12:00:00.000Z",
    },
    {
      id: "p-1012", codigo: "ELO-1012", finalidade: "venda", tipo: "chacara",
      titulo: "Chácara com pomar e casa de 3 dormitórios",
      preco: 780000,
      endereco: "Estrada vicinal, km 4", bairro: "Zona rural", cidade: "Álvares Machado", uf: "SP",
      dormitorios: 3, suites: 1, vagas: 4, areaConstruida: 220, areaTerreno: 5000,
      descricao: "Chácara de 5.000 m² a quinze minutos do centro, com casa de três dormitórios, varanda em volta, pomar formado e poço artesiano. Acesso por estrada cascalhada em bom estado.",
      fotos: [
        foto(F.chacara, "Casa da chácara ao pôr do sol"),
        foto(F.campo, "Área de pasto"),
      ],
      destaque: false, corretorId: "u-corretor-2",
      criadoEm: "2026-08-30T10:00:00.000Z", atualizadoEm: "2026-08-30T10:00:00.000Z",
    },
    {
      id: "p-1013", codigo: "ELO-1013", finalidade: "venda", tipo: "terreno-condominio",
      titulo: "Terreno de 450 m² em condomínio fechado",
      preco: 420000, condominio: 390, iptu: 1100,
      endereco: "Alameda das Palmeiras, lote 32", bairro: "Parque Residencial Damha III", ...PP,
      dormitorios: 0, suites: 0, vagas: 0, areaTerreno: 450,
      descricao: "Terreno plano de esquina em condomínio fechado com portaria 24 horas, clube, trilha de caminhada e áreas verdes. Projeto de construção livre, seguindo o regulamento do condomínio.",
      fotos: [foto(F.campo, "Vista do terreno")],
      destaque: false, corretorId: "u-corretor-4",
      criadoEm: "2026-11-02T10:00:00.000Z", atualizadoEm: "2026-11-02T10:00:00.000Z",
    },
    {
      id: "p-1014", codigo: "ELO-1014", finalidade: "venda", tipo: "comercial",
      titulo: "Galpão comercial com escritório e pátio",
      preco: 1150000, iptu: 4200,
      endereco: "Avenida Brasil, 4100", bairro: "Distrito Industrial", cidade: "Presidente Bernardes", uf: "SP",
      dormitorios: 0, suites: 0, vagas: 8, areaConstruida: 600, areaTerreno: 1200,
      descricao: "Galpão com pé-direito de 8 metros, escritório no mezanino, dois banheiros e pátio para manobra de caminhões. Energia trifásica e acesso fácil à rodovia.",
      fotos: [
        foto(F.escritorio, "Escritório do galpão"),
        foto(F.salaComercial, "Sala de reunião"),
      ],
      destaque: false, corretorId: "u-corretor-1",
      criadoEm: "2026-10-30T15:00:00.000Z", atualizadoEm: "2026-10-30T15:00:00.000Z",
    },
    {
      id: "p-1015", codigo: "ELO-1015", finalidade: "aluguel", tipo: "casa-condominio",
      titulo: "Casa térrea em condomínio com 3 dormitórios",
      preco: 5200, condominio: 480, iptu: 1900,
      endereco: "Rua das Orquídeas, 88", bairro: "Residencial Golden Village", ...PP,
      dormitorios: 3, suites: 1, vagas: 2, areaConstruida: 160, areaTerreno: 300,
      descricao: "Casa térrea com sala ampla, cozinha integrada, três dormitórios (uma suíte) e quintal gramado. Condomínio com portaria, playground e salão de festas.",
      fotos: [
        foto(F.modernaPedra, "Fachada com pedra natural"),
        foto(F.salaClara, "Sala de estar"),
        foto(F.quarto, "Suíte"),
      ],
      destaque: false, corretorId: "u-corretor-2",
      criadoEm: "2026-11-06T11:00:00.000Z", atualizadoEm: "2026-11-06T11:00:00.000Z",
    },
    {
      id: "p-1016", codigo: "ELO-1016", finalidade: "aluguel", tipo: "comercial",
      titulo: "Ponto comercial de esquina com estacionamento",
      preco: 6800, iptu: 2600,
      endereco: "Avenida Manoel Goulart, 1900", bairro: "Centro", cidade: "Regente Feijó", uf: "SP",
      dormitorios: 0, suites: 0, vagas: 6, areaConstruida: 210, areaTerreno: 420,
      descricao: "Salão comercial de esquina com vitrine para as duas ruas, depósito, dois banheiros e estacionamento próprio. Bom para loja, clínica ou restaurante.",
      fotos: [
        foto(F.salaComercial, "Salão principal"),
        foto(F.escritorio, "Área de atendimento"),
      ],
      destaque: false, corretorId: "u-corretor-1",
      criadoEm: "2026-10-20T09:30:00.000Z", atualizadoEm: "2026-10-20T09:30:00.000Z",
    },
    {
      id: "p-1017", codigo: "ELO-1017", finalidade: "venda", tipo: "terreno",
      titulo: "Terreno comercial de 900 m² na avenida",
      preco: 640000, iptu: 1300,
      endereco: "Avenida Washington Luiz, 3200", bairro: "Jardim Petrópolis", ...PP,
      dormitorios: 0, suites: 0, vagas: 0, areaTerreno: 900,
      descricao: "Terreno murado e plano, com portão de correr, em avenida de bom movimento. Indicado para estacionamento, depósito ou loja de materiais.",
      fotos: [foto(F.campo, "Vista do terreno")],
      destaque: false, corretorId: "u-corretor-4",
      criadoEm: "2026-11-11T08:00:00.000Z", atualizadoEm: "2026-11-11T08:00:00.000Z",
    },
  ];

  /**
   * Coordenadas APROXIMADAS (centro do bairro, não o endereço) para o mapa de
   * imóveis. Quando houver o endereço real, guardar lat/lng exatos no cadastro.
   */
  const COORDENADAS = {
    "p-1001": [-22.159, -51.418], "p-1002": [-22.115, -51.399], "p-1003": [-22.137, -51.412],
    "p-1004": [-22.123, -51.389], "p-1005": [-22.099, -51.423], "p-1006": [-22.114, -51.379],
    "p-1007": [-22.13, -51.398], "p-1008": [-22.118, -51.394], "p-1009": [-22.131, -51.404],
    "p-1010": [-22.152, -51.425], "p-1011": [-22.1395, -51.4085], "p-1012": [-22.065, -51.39],
    "p-1013": [-22.164, -51.423], "p-1014": [-22.09, -51.365], "p-1015": [-22.148, -51.432],
    "p-1016": [-22.115, -51.384], "p-1017": [-22.109, -51.404],
  };
  for (const p of imoveis) [p.lat, p.lng] = COORDENADAS[p.id];

  /**
   * Usuários de exemplo (PROVISÓRIOS). Nenhum é uma pessoa real.
   * Os corretores têm um perfil público (bio, CRECI, especialidades), mostrado
   * na home e em corretor.html. O CRECI de cada um é placeholder.
   */
  const usuarios = [
    { id: "u-admin", nome: "Administração Elo", email: "admin@eloimoveis.example", role: "admin", situacao: "ativo", criadoEm: "2026-08-01T12:00:00.000Z" },
    {
      id: "u-corretor-1", nome: "Marina Prado", email: "marina@eloimoveis.example", telefone: "(18) 99000-0001", whatsapp: "5518990000001",
      role: "corretor", situacao: "ativo", criadoEm: "2026-08-04T12:00:00.000Z",
      creci: "CRECI 000000-F", desde: 2015,
      especialidades: ["Casas em condomínio", "Apartamentos", "Imóveis comerciais"],
      bio: "Atua com imóveis residenciais de médio e alto padrão na zona sul de Presidente Prudente. Acompanha o cliente da primeira visita à entrega das chaves, inclusive na parte de financiamento.",
    },
    {
      id: "u-corretor-2", nome: "Rafael Tanaka", email: "rafael@eloimoveis.example", telefone: "(18) 99000-0002", whatsapp: "5518990000002",
      role: "corretor", situacao: "ativo", criadoEm: "2026-08-10T12:00:00.000Z",
      creci: "CRECI 000001-F", desde: 2018,
      especialidades: ["Locação", "Chácaras", "Primeiro imóvel"],
      bio: "Cuida da locação residencial e comercial e de chácaras na região. Gosta de explicar contrato, vistoria e garantias sem pressa, para ninguém assinar com dúvida.",
    },
    {
      id: "u-corretor-4", nome: "Lucas Ferreira", email: "lucas@eloimoveis.example", telefone: "(18) 99000-0004", whatsapp: "5518990000004",
      role: "corretor", situacao: "ativo", criadoEm: "2026-09-01T12:00:00.000Z",
      creci: "CRECI 000002-F", desde: 2021,
      especialidades: ["Terrenos", "Loteamentos", "Minha Casa Minha Vida"],
      bio: "Especialista em terrenos e loteamentos novos. Ajuda quem vai construir a escolher o lote e a organizar a documentação para o financiamento da obra.",
    },
    // Solicitações de acesso esperando o administrador (seja-corretor.html).
    {
      id: "u-corretor-3", nome: "Bianca Moura", email: "bianca@corretora.example", telefone: "(18) 99000-0003",
      role: "corretor", situacao: "pendente", criadoEm: "2026-11-09T12:00:00.000Z",
      creci: "CRECI 000003-F",
      mensagem: "Atuo há 4 anos com locação na zona norte e quero anunciar meus imóveis com a Elo.",
    },
    {
      id: "u-corretor-5", nome: "Paulo Mendes", email: "paulo@corretora.example", telefone: "(18) 99000-0005",
      role: "corretor", situacao: "pendente", criadoEm: "2026-11-12T16:30:00.000Z",
      creci: "CRECI 000005-F",
      mensagem: "Trabalho com terrenos e chácaras na região de Álvares Machado.",
    },
    { id: "u-cliente-1", nome: "Camila Duarte", email: "camila@cliente.example", telefone: "(18) 99000-0010", role: "cliente", situacao: "ativo", criadoEm: "2026-10-02T12:00:00.000Z" },
    { id: "u-cliente-2", nome: "Thiago Nogueira", email: "thiago@cliente.example", role: "cliente", situacao: "ativo", criadoEm: "2026-10-19T12:00:00.000Z" },
    { id: "u-cliente-3", nome: "Helena Sato", email: "helena@cliente.example", role: "cliente", situacao: "ativo", criadoEm: "2026-11-04T12:00:00.000Z" },
  ];

  /**
   * DADOS DO PROPRIETÁRIO (SIGILOSOS). Ficam separados dos imóveis de propósito:
   * as funções públicas (listProperties, getPropertyByCode) nunca os devolvem.
   * Só o corretor do imóvel e o administrador leem (Elo.dados.getOwner).
   * Todos fictícios.
   */
  const NOMES_FICTICIOS = ["Alfa", "Beta", "Gama", "Delta", "Épsilon", "Zeta", "Eta", "Teta", "Iota", "Capa", "Lambda", "Mi", "Ni", "Ômicron", "Pi", "Rô", "Sigma"];

  /** CPF fictício com os dois dígitos verificadores certos (passa na validação). */
  function cpfFicticio(i) {
    const base = String(100000000 + i * 7919).slice(0, 9).split("").map(Number);
    for (const t of [9, 10]) {
      let soma = 0;
      for (let k = 0; k < t; k++) soma += base[k] * (t + 1 - k);
      base.push(((soma * 10) % 11) % 10);
    }
    const d = base.join("");
    return d.slice(0, 3) + "." + d.slice(3, 6) + "." + d.slice(6, 9) + "-" + d.slice(9);
  }

  const proprietarios = {};
  imoveis.forEach((p, i) => {
    const n = String(i + 1).padStart(2, "0");
    proprietarios[p.id] = {
      nome: "Proprietário Exemplo " + NOMES_FICTICIOS[i % NOMES_FICTICIOS.length],
      documento: cpfFicticio(i), // CPF com dígitos válidos, gerado: não é de ninguém
      email: "proprietario" + n + "@exemplo.example",
      // Até 2 contatos. O primeiro é obrigatório.
      contatos: [
        { nome: "", telefone: "(18) 99000-01" + n },
        i % 2 === 0 ? { nome: "Familiar Exemplo " + NOMES_FICTICIOS[(i + 3) % NOMES_FICTICIOS.length], telefone: "(18) 99000-02" + n } : { nome: "", telefone: "" },
      ],
      // LOCALIZAÇÃO (sigilosa): sai do anúncio e fica só aqui.
      endereco: p.endereco,
      lat: p.lat,
      lng: p.lng,
      observacoes: i % 3 === 0 ? "Prefere contato por WhatsApp, depois das 18h." : "",
    };
    // O anúncio público fica só com bairro e cidade.
    delete p.endereco;
    delete p.lat;
    delete p.lng;
  });

  /** Favoritos já salvos: id do usuário -> ids de imóveis. */
  const favoritos = {
    "u-cliente-1": ["p-1002", "p-1007"],
    "u-cliente-2": ["p-1010"],
  };

  /**
   * Avaliações de clientes: EXEMPLOS FICTÍCIOS para o layout. O site mostra o
   * selo "A VALIDAR" sobre elas. Antes de publicar, trocar por depoimentos
   * reais e autorizados (ou pelas avaliações do Google).
   */
  const avaliacoes = [
    { id: "a-1", nome: "Cliente de exemplo 1", contexto: "Comprou casa no Damha", nota: 5, corretorId: "u-corretor-1", data: "2026-10-10",
      texto: "A Marina explicou cada etapa do financiamento e foi conosco em todas as visitas. Fechamos em menos de dois meses." },
    { id: "a-2", nome: "Cliente de exemplo 2", contexto: "Alugou apartamento no Centro", nota: 5, corretorId: "u-corretor-2", data: "2026-09-22",
      texto: "Atendimento rápido pelo WhatsApp e vistoria muito bem feita, com fotos de tudo. Me senti segura para assinar." },
    { id: "a-3", nome: "Cliente de exemplo 3", contexto: "Comprou terreno para construir", nota: 4, corretorId: "u-corretor-4", data: "2026-10-28",
      texto: "O Lucas mostrou vários lotes e indicou o que fazia sentido para o nosso orçamento. Ajudou muito com a papelada da Caixa." },
    { id: "a-4", nome: "Cliente de exemplo 4", contexto: "Vendeu apartamento", nota: 5, corretorId: "u-corretor-1", data: "2026-08-30",
      texto: "Fizeram fotos boas, divulgaram bem e trouxeram visitas qualificadas. A venda saiu pelo valor que eu esperava." },
  ];

  /**
   * Matérias do blog (Notícias). Textos de exemplo, escritos para o esboço:
   * a imobiliária deve revisar ou trocar. `corpo` é uma lista de blocos:
   * texto simples vira parágrafo; { titulo } vira subtítulo; { lista } vira lista.
   */
  const materias = [
    {
      slug: "documentos-para-comprar-imovel",
      titulo: "Documentos para comprar um imóvel: o que separar antes da proposta",
      resumo: "A lista do comprador, do vendedor e do imóvel, para a negociação não travar na hora da escritura.",
      categoria: "Compra", data: "2026-11-05", autor: "Equipe Elo", leitura: 4,
      foto: foto(F.escritorio, "Mesa com documentos e notebook"),
      corpo: [
        "Boa parte dos atrasos numa compra não vem do preço, e sim de documento que falta na última hora. Separar tudo antes de fazer a proposta deixa a negociação mais rápida e evita surpresa no cartório.",
        { titulo: "Do comprador" },
        { lista: ["RG e CPF (e do cônjuge, se for casado)", "Certidão de nascimento ou de casamento", "Comprovante de residência", "Comprovante de renda, se for financiar"] },
        { titulo: "Do vendedor" },
        { lista: ["RG, CPF e certidão de estado civil", "Certidões negativas (cíveis, trabalhistas e de protesto)", "Comprovante de quitação do condomínio, se houver"] },
        { titulo: "Do imóvel" },
        { lista: ["Matrícula atualizada, emitida pelo cartório de registro de imóveis", "Certidão negativa de débitos de IPTU", "Habite-se, no caso de construção"] },
        "A lista pode variar conforme o banco e o cartório. O corretor da Elo confere a documentação com você antes da assinatura.",
      ],
    },
    {
      slug: "minha-casa-minha-vida",
      titulo: "Minha Casa Minha Vida: quem pode usar e como começar",
      resumo: "As faixas de renda, o que o programa financia e o primeiro passo para simular.",
      categoria: "Financiamento", data: "2026-10-22", autor: "Equipe Elo", leitura: 5,
      foto: foto(F.salaClara, "Sala clara de apartamento novo"),
      corpo: [
        "O Minha Casa Minha Vida é o programa habitacional do governo federal que oferece juros menores e, em algumas faixas, subsídio para quem compra o primeiro imóvel.",
        { titulo: "Quem pode participar" },
        "O programa é dividido em faixas de renda familiar mensal. As faixas e os valores mudam de tempos em tempos, então vale sempre conferir as regras atuais no site da Caixa antes de simular.",
        { titulo: "O que dá para financiar" },
        { lista: ["Imóvel novo ou usado, dentro do valor máximo da faixa", "Terreno com construção", "Construção em terreno próprio"] },
        { titulo: "Por onde começar" },
        "Faça uma simulação no site da Caixa com a renda da família e separe os documentos pessoais. Com a simulação em mãos, a Elo ajuda a encontrar imóveis que cabem no valor aprovado.",
      ],
    },
    {
      slug: "vistoria-de-entrada-aluguel",
      titulo: "Vistoria de entrada no aluguel: como fazer e por que guardar",
      resumo: "O laudo que protege o inquilino e o proprietário na hora de devolver as chaves.",
      categoria: "Locação", data: "2026-10-08", autor: "Equipe Elo", leitura: 3,
      foto: foto(F.salaIntegrada, "Sala vazia pronta para vistoria"),
      corpo: [
        "A vistoria de entrada registra o estado do imóvel no dia em que o inquilino recebe as chaves. É esse documento que vai ser comparado com a vistoria de saída.",
        { titulo: "O que conferir" },
        { lista: ["Paredes, pisos e teto, cômodo por cômodo", "Portas, janelas, fechaduras e chaves", "Torneiras, chuveiros, descargas e ralos", "Tomadas, interruptores e lâmpadas"] },
        "Fotos datadas de cada ambiente deixam o laudo mais claro. Se encontrar algo que não está no laudo nos primeiros dias, avise por escrito.",
        "Na Elo, a vistoria é feita com o inquilino e entregue assinada junto com o contrato.",
      ],
    },
    {
      slug: "custos-escritura-registro",
      titulo: "Escritura, registro e ITBI: os custos além do preço do imóvel",
      resumo: "Entenda o que é cada taxa da compra e reserve o valor certo no orçamento.",
      categoria: "Compra", data: "2026-09-25", autor: "Equipe Elo", leitura: 4,
      foto: foto(F.salaMadeira, "Sala de estar com painel de madeira"),
      corpo: [
        "Quem compra um imóvel paga, além do preço combinado, alguns custos de transferência. Somados, costumam representar alguns pontos percentuais do valor do imóvel.",
        { titulo: "ITBI" },
        "O Imposto sobre Transmissão de Bens Imóveis é cobrado pela prefeitura. A alíquota e a base de cálculo são definidas pelo município.",
        { titulo: "Escritura" },
        "É o documento lavrado no cartório de notas. Na compra financiada, o contrato do banco costuma substituir a escritura pública.",
        { titulo: "Registro" },
        "Só o registro na matrícula, feito no cartório de registro de imóveis, transfere a propriedade. Sem ele, o imóvel continua no nome do vendedor.",
      ],
    },
    {
      slug: "preparar-casa-para-visitas",
      titulo: "Como preparar a casa para fotos e visitas",
      resumo: "Pequenos ajustes que fazem o anúncio render mais visitas e a venda sair mais rápido.",
      categoria: "Venda", data: "2026-09-10", autor: "Equipe Elo", leitura: 3,
      foto: foto(F.salaPlantas, "Sala arrumada com plantas"),
      corpo: [
        "A primeira visita a um imóvel hoje acontece pelas fotos do anúncio. Uma casa clara e arrumada nas fotos recebe mais contatos.",
        { titulo: "Antes das fotos" },
        { lista: ["Abra cortinas e acenda as luzes", "Tire objetos pessoais e excesso de móveis", "Conserte o que é pequeno: torneira pingando, lâmpada queimada, porta rangendo"] },
        { titulo: "No dia da visita" },
        "Deixe o imóvel ventilado e, se possível, saia durante a visita para o comprador ficar à vontade. O corretor conduz a conversa e depois conta para você o que o interessado achou.",
      ],
    },
  ];

  Elo.EXEMPLO = {
    imoveis,
    usuarios,
    favoritos,
    proprietarios,
    avaliacoes,
    materias,
    proximoCodigo: 1018,
    fotoHero: foto(F.modernaArvore, "Casa contemporânea com jardim ao entardecer"),
  };
})();

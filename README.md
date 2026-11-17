# Elo Imóveis: esboço navegável (HTML, CSS e JavaScript)

Primeiro esboço do novo site da Elo Imóveis (Presidente Prudente/SP), feito só com
**HTML, CSS e JavaScript puros**: sem framework, sem `npm install`, sem build.

A identidade vem do `Manual_Identidade_Visual_Elo_Imoveis_2026.docx`. A tradução do
manual para o código está em [DESIGN.md](DESIGN.md).

## Como abrir

**Opção 1: duplo clique.** Abra o `index.html` no navegador. Funciona, mas cada
navegador guarda os dados (favoritos, imóveis cadastrados) separadamente.

**Opção 2 (recomendada): VS Code + Live Server.**

1. No VS Code, **Arquivo → Abrir Pasta…** e escolha a pasta `site-html`.
2. O VS Code sugere instalar a extensão **Live Server** (já está nas recomendações da pasta). Instale.
3. Clique com o botão direito no `index.html` → **Open with Live Server**.
4. O site abre em `http://127.0.0.1:5500` e recarrega sozinho a cada arquivo salvo.

## Como testar os três perfis

Na página **Entrar** (`entrar.html`) há duas formas de entrar:

**Formulário de e-mail e senha.** Qualquer senha com 6 ou mais caracteres serve:

| E-mail | Perfil |
|---|---|
| `camila@cliente.example` | Cliente |
| `marina@eloimoveis.example` | Corretor |
| `admin@eloimoveis.example` | Administrador |

**Login de desenvolvimento.** Um botão para cada perfil, sem senha.

O que cada perfil faz:

- **Cliente:** salva imóveis pelo coração (no card e na página do imóvel) e vê os salvos em `favoritos.html`.
- **Corretor:** cadastra e edita os próprios imóveis (com os dados sigilosos do proprietário), preenche o próprio perfil público (`painel-perfil.html`), vê quem favoritou os imóveis dele (`painel-favoritos.html`) e recebe uma notificação a cada novo favorito (`painel-notificacoes.html`). **Não retira imóveis do site.**
- **Administrador:** vê todos os imóveis, aprova ou recusa pedidos de corretores (`painel-solicitacoes.html`), cadastra corretores direto, vê os favoritos e as notificações de todos os corretores e é **o único que retira um imóvel do site**, só com motivo (vendido pela Elo ou vendido por outro corretor) e descrição. Cada retirada fica no histórico, no fim da lista de imóveis.

### Como um corretor entra

1. Ele pede acesso em `seja-corretor.html` (link na página Entrar e no rodapé). A conta nasce **aguardando aprovação** e não entra no painel.
2. O administrador aprova ou recusa em **Solicitações**. Também pode cadastrar o corretor direto em **Corretores**.
3. Aprovado, o corretor entra com o e-mail dele, preenche **Meu perfil** e passa a aparecer na home, no Sobre nós e no "Saiba mais".

Para testar: há duas solicitações de exemplo (Bianca Moura e Paulo Mendes) esperando o administrador.

No mesmo bloco de desenvolvimento:

- **Simular falha de conexão:** mostra as telas de erro das listas.
- **Restaurar dados de exemplo:** apaga o que foi cadastrado e volta aos 12 imóveis.

### Venda e avaliação do cliente

1. Na lista de imóveis do painel, o administrador clica em **Confirmar venda** e escolhe o cliente que comprou (quem favoritou aparece primeiro).
2. O imóvel sai do site e ganha o selo "Vendido" no painel.
3. O comprador entra em **Minha conta** e avalia o atendimento com estrelas. Um interruptor deixa ele escolher se a avaliação aparece com o nome dele ou como "Cliente anônimo".
4. A avaliação aparece na home e no perfil do corretor.

### O que avisa o administrador

Em **Notificações**, o admin recebe: cada favorito, cada avaliação e qualquer alteração de dados feita por cliente (Minha conta) ou corretor (Meu perfil, cadastro e edição de imóvel, dados do proprietário). O corretor só recebe os favoritos dos imóveis dele.

### Vídeos dos imóveis

No cadastro do imóvel há a seção **Vídeos**: o corretor publica o vídeo no YouTube (pode ser "não listado") ou no Vimeo e cola o link (até 5). A página do imóvel mostra os players e o card ganha o selo "Vídeo". Os vídeos ficam hospedados no YouTube ou no Vimeo, e não no site, porque o armazenamento do navegador comporta só alguns megabytes. Quando houver backend, dá para aceitar o envio do arquivo direto (Supabase Storage).

### Telefone e WhatsApp da Elo

Em **Dados da Elo**, a opção "O WhatsApp é o mesmo número do telefone" faz o WhatsApp acompanhar o telefone. O site mostra os dois números (rodapé, home, Contato e Sobre), com links que abrem a ligação e a conversa no WhatsApp.

### Divulgar nas redes sociais

Ao cadastrar um imóvel, o painel abre a janela **Divulgar nas redes** (também pelo botão **Divulgar** de cada imóvel). Ela traz: imagens 1080 × 1080 para o carrossel do Instagram (a 1ª é uma capa com preço, bairro e CRECI), a legenda com hashtags, o texto do Facebook com o link do anúncio e os campos do Marketplace prontos para copiar. A publicação automática no Facebook e no Instagram precisa de backend, e o Marketplace não tem publicação automática: veja [REDES-SOCIAIS.md](REDES-SOCIAIS.md).

### Marca d'água das fotos (obrigatória)

Toda foto enviada no cadastro de imóvel recebe a marca d'água da Elo antes de ser guardada (`js/painel/marca-dagua.js`): o texto "ELO IMÓVEIS" repetido em diagonal pela foto toda, transparente. Não há como desligar. Para deixar mais ou menos visível, mude `OPACIDADE` nesse arquivo. As fotos de exemplo (do banco de imagens) não têm marca. A marca feita no navegador pode ser contornada: no backend, aplicar de novo no servidor.

### Endereço sigiloso e cidades

O anúncio mostra só **cidade e bairro**. O endereço (e as coordenadas) ficam junto dos dados do proprietário, que só o corretor do imóvel e o admin veem. O proprietário tem até **2 contatos** (o 1º obrigatório). A busca e a home filtram por **cidade**, e os bairros acompanham a cidade escolhida.

### Ficha do imóvel por perfil

Na lista de imóveis do painel, cada imóvel tem uma faixa de botões logo abaixo dele (Ficha, Editar e Ver no site à esquerda; Confirmar venda e Retirar, só do admin, à direita). O botão **Ficha** abre tudo o que o perfil logado pode ver daquele imóvel (anúncio, dados internos, proprietário e endereço) e a aba **Como o cliente vê**, só com o que aparece no site.

### Fotos passando sozinhas

Na página do imóvel, as fotos trocam a cada 1,5 s (constante `INTERVALO` em `js/paginas/imovel.js`). Param com o botão "Pausar fotos", com o mouse sobre a foto, com o foco do teclado na galeria e na tela cheia. Quem configurou o sistema para reduzir movimento começa com as fotos paradas.

### Validação dos campos

Todas as regras ficam em `js/validacao.js`: nome só com letras (nome e sobrenome), e-mail no formato certo, telefone com DDD e máscara, CPF e CNPJ com dígito verificador, CRECI, WhatsApp e senha de conta nova (8+ caracteres, com letras e números). Para usar num campo novo, ponha `data-mascara="telefone"` e `data-validar="telefone"` no `<input>`.

## Onde mexer no login

| Quero mudar… | Arquivo |
|---|---|
| O visual da página de login | `entrar.html` e `css/paginas.css` (seção ENTRAR) |
| O que acontece ao enviar o formulário (validação, mensagens, para onde vai depois) | `js/paginas/entrar.js` |
| O cadastro de cliente | `cadastro.html` e `js/paginas/cadastro.js` |
| A regra de login em si (`signIn`, `signUp`, `getSession`, `signOut`) | `js/auth.js` |
| As contas de exemplo | `js/dados-exemplo.js` (lista `usuarios`) |

Os dois arquivos de página (`entrar.js` e `cadastro.js`) estão comentados passo a
passo. A sessão é guardada no `localStorage` (chave `elo:sessao:v1`).

## Mapa das páginas

| Página | O que é |
|---|---|
| `index.html` | Home (ordem da seção 08 do manual) |
| `imoveis.html` | Busca com filtros e ordenação. Os filtros ficam na URL: `?finalidade=venda&bairro=Centro&dorms=2` |
| `imovel.html?codigo=ELO-1001` | Página do imóvel: galeria, dados, mapa, agendar visita, WhatsApp, favoritar |
| `sobre.html`, `contato.html`, `anuncie.html` | Institucionais |
| `entrar.html`, `cadastro.html` | Login e cadastro de cliente |
| `favoritos.html` | Área do cliente |
| `painel-imoveis.html` | Lista de imóveis (corretor e administrador) |
| `painel-imovel.html` | Cadastrar imóvel (`?id=p-1001` para editar) |
| `painel-favoritos.html`, `painel-notificacoes.html` | Quem favoritou e avisos de favorito (corretor: só os imóveis dele; admin: todos) |
| `painel-perfil.html` | Só corretor: os dados do perfil público |
| `painel-solicitacoes.html`, `painel-corretores.html`, `painel-clientes.html` | Só administrador |
| `seja-corretor.html` | Pedido de acesso de corretor |
| `minha-conta.html` | Cliente: meus dados e avaliar compra |
| `faq.html` | Perguntas frequentes |
| `privacidade.html` | Política de Privacidade (LGPD), com a seção de exclusão de dados exigida pela Meta (`#exclusao-de-dados`). Texto-base: precisa de revisão jurídica |
| `painel-empresa.html` | Só administrador: dados de contato da Elo (mudam o site todo, inclusive o WhatsApp) e conta do admin |
| `painel-blog.html` | Só administrador: adicionar, editar e excluir matérias (abre em nova aba) |
| `corretor.html?id=u-corretor-1` | Perfil público do corretor (o "Saiba mais" da home): bio, imóveis e avaliações |
| `blog.html`, `materia.html?slug=...` | Notícias: lista com filtro por categoria e a página de cada matéria |
| `links-uteis.html` | Links úteis (prefeitura, cartório, financiamento…) |
| `erro.html` / `404.html` | Página de erro, com botão para voltar ao login |

## Como o código está organizado

```
css/
  base.css          tokens do manual (:root), tipografia, botões, campos
  componentes.css   cabeçalho, rodapé, card, coração, toast, diálogos, estados, animações
  paginas.css       home, busca, página do imóvel, institucionais, login
  painel.css        áreas do corretor e do administrador
js/
  icones.js         ícones (Lucide) como texto SVG
  instituicao.js    endereço, telefone, CRECI… (selo A VALIDAR) e o menu
  dados-exemplo.js  os 12 imóveis, usuários e favoritos de exemplo
  dados.js          CAMADA DE DADOS: listProperties, createProperty, updateProperty,
                    deleteProperty, toggleFavorite, listFavorites, listUsers…
  auth.js           LOGIN: getSession, signIn, signUp, signOut, role
  ui.js             monta cabeçalho e rodapé, card de imóvel, toast, confirmação
  formulario.js     validação dos formulários de contato
  paginas/          um arquivo por página pública
  painel/           moldura do painel e um arquivo por tela
```

Cada página carrega os scripts nessa ordem, com `defer`. Tudo fica dentro de um
único objeto global, `Elo`: por exemplo, `Elo.dados.listProperties()` e
`Elo.auth.getSession()`. Abra o console do navegador e experimente.

O cabeçalho e o rodapé não estão escritos em cada HTML: o `ui.js` monta os dois
nos lugares marcados com `<div id="topo">` e `<div id="rodape">`. Para mudar o
menu (Venda, Locação, Informações e Contato, com os submenus), edite `Elo.MENU`
em `js/instituicao.js`. A newsletter fica no rodapé de todas as páginas.

O ícone da aba do navegador é `img/favicon.png`. Para trocar, substitua o arquivo.

### Trocar por Supabase depois

1. Reescreva o corpo das funções de `js/dados.js` e `js/auth.js` mantendo os mesmos nomes. As páginas não mudam.
2. Apague o bloco "Login de desenvolvimento" do `entrar.html` e a função `signInAsDev`.
3. Envie as fotos para o Storage em `js/painel/fotos.js`.

> **Regra de permissão (obrigatório antes de produção).** "Corretor não exclui;
> só o administrador exclui" hoje é garantido apenas escondendo o botão e por uma
> checagem no navegador, o que é só UX: qualquer pessoa contorna pelo console.
> Precisa virar política de RLS no banco. O `TODO` com o exemplo de policy está em
> `deleteProperty`, em [js/dados.js](js/dados.js).
>
> Valem a mesma coisa, também com RLS no banco: só corretor **ativo** cadastra imóveis;
> o corretor vê só os favoritos e as notificações dos imóveis dele; e os **dados do
> proprietário** ficam numa tabela separada, que só o corretor do imóvel e o administrador
> leem (`getOwner` em `js/dados.js`). Hoje tudo isso está no `localStorage`, que qualquer
> pessoa com acesso ao navegador consegue abrir: **não cadastre dados reais de proprietários neste esboço**.

## O que é provisório

- **Imóveis:** 12 anúncios fictícios em bairros reais de Presidente Prudente. Preços, áreas e endereços são inventados.
- **Fotos:** banco de imagens livre (Unsplash), carregadas por URL (precisa de internet). Não retratam os imóveis; o rodapé avisa.
- **Login:** simulado. Não há senha de verdade nem servidor; sessão, cadastros e favoritos ficam no `localStorage` de cada navegador.
- **Dados institucionais:** telefone, WhatsApp, e-mail, CRECI, CNPJ, horário e redes sociais foram tirados do site atual (`js/instituicao.js`). O **endereço** continua com o selo **A VALIDAR**: o site atual mostra o bairro como "Vila Mathilde Vieira" no texto e "Jardim Bongiovani" no rodapé.
- **Nota do Google:** a nota no topo da home é de exemplo (selo "NOTA DE EXEMPLO"). Para atualizar sozinha, falta um servidor que consulte a API do Google Places com uma chave secreta (que não pode ficar no navegador) e devolva `{ "nota": 4.9, "total": 37 }`. Basta colocar o endereço desse servidor em `Elo.GOOGLE.endpoint`, em `js/instituicao.js`.
- **FAQ:** perguntas e respostas genéricas, para a imobiliária revisar (`faq.html`).
- **Logotipo e ícone da aba:** `img/logo.png` e `img/favicon.png`, em baixa resolução. Trocar pelos arquivos vetoriais quando chegarem.
- **Corretores e avaliações:** perfis, CRECI e depoimentos são exemplos (o site mostra o selo A VALIDAR). Trocar por dados e depoimentos reais e autorizados.
- **Blog:** as 5 matérias foram escritas para o esboço e precisam de revisão da imobiliária (`materias` em `js/dados-exemplo.js`).
- **Newsletter:** a inscrição só fica guardada no navegador. Falta ligar a uma ferramenta de e-mail.
- **Textos institucionais** (home, Sobre, Anuncie): resumidos do site atual ou redigidos para o esboço; precisam de aprovação.
- **Formulários** (contato, anuncie, agendar visita, convite de corretor): envio simulado.
- **Mapas:** só o mapa do escritório, na home. Os imóveis não têm mapa: o endereço é sigiloso.
- **Notificações:** aparecem só dentro do painel. Falta decidir se também vão por e-mail ou WhatsApp.
- **Proprietários de exemplo:** nomes, documentos e telefones são fictícios.
- **Fotos enviadas pelo painel:** são reduzidas e guardadas no navegador, que tem pouco espaço (alguns megabytes).

## Próxima etapa

1. Validar com a imobiliária: endereço e bairro, CRECI, CNPJ, telefones, horário, logotipo vetorial e texto do Sobre.
2. Backend no Supabase: tabelas, Auth, Storage e **RLS** (incluindo a regra de exclusão).
3. Catálogo real (fotos, preços, status) e definição de quem marca "destaque".
4. Destino real dos formulários (e-mail ou CRM) e envio do convite de corretor.
5. Posição real no mapa e escolha do provedor de mapas.
6. SEO: como as páginas de imóvel são montadas por JavaScript, os buscadores leem pouco delas. Ao ligar o backend, gerar o HTML de cada imóvel no servidor (ou numa etapa de build), com título, descrição e imagem de compartilhamento.
7. Teste com leitor de tela e em aparelhos reais; revisão de desempenho com as fotos definitivas.
8. Páginas legais (privacidade/LGPD) e consentimento de cookies, se houver métricas.

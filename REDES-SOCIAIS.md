# Publicar imóveis automaticamente no Facebook e no Instagram

Guia passo a passo para fazer o botão **Divulgar** do painel publicar sozinho na
**Página do Facebook** e no **Instagram** da Elo.

> **Marketplace do Facebook:** não entra na automação. A Meta não oferece uma forma
> de um sistema publicar anúncios de imóveis no Marketplace. Ele continua manual,
> usando a aba "Marketplace" da janela Divulgar, que já traz os campos prontos.

As telas da Meta mudam de nome com frequência. Se algum botão não estiver
exatamente com o nome abaixo, procure pelo termo mais próximo. Os passos continuam
os mesmos.

---

## Visão geral

| Etapa | Quem faz | Tempo aproximado |
|---|---|---|
| 1. Preparar as contas da Elo (Página, Instagram, portfólio empresarial) | Imobiliária | 30 min |
| 2. Verificar a empresa na Meta | Imobiliária | de 1 a 10 dias (a Meta analisa) |
| 3. Criar o app no Meta for Developers | Desenvolvedor | 1 h |
| 4. Gerar a chave de acesso permanente (usuário do sistema) | Desenvolvedor + admin da Elo | 30 min |
| 5. Criar o backend no Supabase (fotos, tabelas, segredos) | Desenvolvedor | 2 a 4 h |
| 6. Criar a função que publica | Desenvolvedor | 4 a 8 h |
| 7. Ligar o botão do painel à função | Desenvolvedor | 1 a 2 h |
| 8. Testar e colocar no ar | Os dois | 1 dia |

Custo: a API da Meta é gratuita. O plano gratuito do Supabase atende uma
imobiliária no começo. O plano pago entra quando as fotos ocuparem mais espaço.

---

## Etapa 1: preparar as contas da Elo

Faça com a conta do Facebook de quem é **administrador** da página da Elo.

### 1.1 Confirmar que a Elo tem uma Página, e não um perfil pessoal

1. Abra a página da Elo no Facebook.
2. Se aparecer "Adicionar amigo", é um **perfil pessoal**, e a API não publica em perfil
   pessoal. Nesse caso, crie uma **Página** em *facebook.com/pages/create*.
3. Se aparecer "Curtir" ou "Seguir", é uma Página. Pode seguir.

### 1.2 Passar o Instagram para conta profissional

1. No app do Instagram, entre no perfil **@elo.imoveis.pp**.
2. Abra **Configurações e privacidade** e depois **Tipo de conta e ferramentas**.
3. Toque em **Mudar para conta profissional** e escolha **Empresa**.
4. Categoria: **Imobiliária**.

### 1.3 Ligar o Instagram à Página do Facebook

1. No Facebook, abra a Página da Elo e vá em **Configurações**.
2. Abra **Contas vinculadas**, depois **Instagram**, e clique em **Conectar conta**.
3. Entre com o login do Instagram da Elo e confirme.

### 1.4 Criar o portfólio empresarial (Meta Business Suite)

1. Acesse **business.facebook.com** e crie o **portfólio empresarial** (antes chamado
   "Gerenciador de Negócios") com o nome **Elo Imóveis**. Use o e-mail da empresa.
2. Em **Configurações**, abra **Contas** e depois **Páginas**. Clique em **Adicionar** e
   adicione a Página da Elo.
3. Ainda em **Contas**, abra **Contas do Instagram** e adicione o @elo.imoveis.pp.

---

## Etapa 2: verificar a empresa na Meta

A verificação comprova que a Elo é uma empresa real. A Meta pede isso para liberar
as permissões de publicação.

1. Em **business.facebook.com**, abra **Configurações** e depois **Central de segurança**.
2. Em **Verificação da empresa**, clique em **Iniciar verificação**.
3. Informe: razão social, **CNPJ 59.425.262/0001-40**, endereço, telefone e site.
4. Envie um documento que comprove os dados: cartão CNPJ ou contrato social, ou uma
   conta de luz ou telefone em nome da empresa.
5. Confirme o contato. A Meta envia um código por e-mail, telefone ou WhatsApp para
   um contato da empresa.
6. Aguarde a análise. Costuma levar de 1 a 10 dias úteis.

> O **nome, endereço e telefone** precisam ser **iguais** aos do CNPJ.
> Diferença de grafia é o motivo mais comum de recusa.

---

## Etapa 3: criar o app no Meta for Developers

### 3.1 Conta de desenvolvedor

1. Acesse **developers.facebook.com** com o Facebook do administrador da Página.
2. Clique em **Começar** e conclua o cadastro de desenvolvedor, confirmando o telefone.

### 3.2 Criar o app

1. Clique em **Meus apps** e depois **Criar app**.
2. Nome: **Elo Imóveis – Publicador**. E-mail de contato: o da empresa.
3. Quando pedir o **caso de uso** ou o **tipo de app**, escolha **Outro** e depois
   **Empresa** (*Business*).
4. Em **Portfólio empresarial**, selecione **Elo Imóveis** (o da Etapa 1.4).
5. Crie o app.

### 3.3 Adicionar os produtos

No painel do app, em **Adicionar produtos**:

1. **Login do Facebook para Empresas**: clique em **Configurar**.
2. **Instagram**: escolha **API do Instagram com login do Facebook**.

### 3.4 Preencher os dados básicos do app

Vá em **Configurações do app** e depois **Básico**:

- **URL da Política de Privacidade:** `https://SEU-DOMINIO/privacidade.html` (a página
  já existe no site; revise o texto com um advogado antes de publicar).
- **Instruções de exclusão de dados:** `https://SEU-DOMINIO/privacidade.html#exclusao-de-dados`.
- **Ícone do app:** o "E" da Elo (`img/favicon.png`).
- **Categoria:** Negócios e páginas.

### 3.5 Permissões que o app vai usar

| Permissão | Para quê |
|---|---|
| `pages_show_list` | Listar a Página da Elo |
| `pages_read_engagement` | Ler dados da Página (exigida junto com a de publicar) |
| `pages_manage_posts` | **Publicar** na Página do Facebook |
| `instagram_basic` | Ler a conta do Instagram |
| `instagram_content_publish` | **Publicar** no Instagram |
| `business_management` | Usar a Página e o Instagram que estão no portfólio empresarial |

> **Revisão do app (App Review):** como o app só vai publicar nas contas da própria
> Elo (que são do mesmo portfólio do app), em geral o **acesso padrão** basta e não
> é preciso pedir revisão. Se a Meta pedir **acesso avançado** para alguma permissão,
> faça a revisão em **Revisão do app** e depois **Permissões e recursos**: explique o
> uso ("publicar os anúncios de imóveis da própria imobiliária na sua Página e no seu
> Instagram") e grave um vídeo curto mostrando o botão Divulgar publicando.

### 3.6 Colocar o app em modo "Ao vivo"

No topo do painel do app, mude de **Desenvolvimento** para **Ao vivo** (*Live*).
A Meta só deixa mudar com a Política de Privacidade preenchida (passo 3.4).

---

## Etapa 4: gerar a chave de acesso permanente

A melhor forma para um servidor é um **usuário do sistema**: uma conta técnica do
portfólio, que não depende do Facebook pessoal de ninguém e cuja chave **não expira**.

1. Em **business.facebook.com**, abra **Configurações**, depois **Usuários** e
   **Usuários do sistema**.
2. Clique em **Adicionar**. Nome: **publicador-site**. Função: **Administrador**.
3. Selecione o usuário criado e clique em **Atribuir ativos**:
   - **Páginas:** a Página da Elo, com **controle total** (ou ao menos "Criar conteúdo");
   - **Contas do Instagram:** @elo.imoveis.pp, com permissão de conteúdo.
4. Ainda no usuário do sistema, clique em **Gerar novo token**:
   - **App:** Elo Imóveis – Publicador;
   - **Expiração:** **Nunca**;
   - **Permissões:** marque as seis da tabela da Etapa 3.5.
5. **Copie o token e guarde num lugar seguro.** Ele só aparece uma vez.

> **Este token é uma senha.** Quem tiver o token posta como a Elo. Nunca coloque o
> token no código do site, no GitHub, em e-mail ou em mensagem. Ele vai **só** para os
> segredos do servidor (Etapa 5.4).

### 4.1 Descobrir os números (IDs) da Página e do Instagram

Abra o **Explorador da API do Graph** (developers.facebook.com/tools/explorer), cole o
token do usuário do sistema e faça:

```
GET /me/accounts
```

Na resposta, anote o **`id`** da Página da Elo (`PAGE_ID`) e o **`access_token`**
que vem junto: é o **token da Página** (`PAGE_TOKEN`). Depois faça:

```
GET /PAGE_ID?fields=instagram_business_account
```

Anote o **`instagram_business_account.id`** (`IG_USER_ID`).

Ao final você tem três valores: **`PAGE_ID`**, **`PAGE_TOKEN`** e **`IG_USER_ID`**.

---

## Etapa 5: criar o backend no Supabase

### 5.1 Projeto

1. Crie uma conta em **supabase.com** e um projeto: **elo-imoveis**, região **São Paulo**.
2. Instale a ferramenta de linha de comando:
   ```
   npm install -g supabase
   supabase login
   supabase link --project-ref SEU_PROJECT_REF
   ```

### 5.2 Fotos com endereço público

A API do Instagram **não recebe o arquivo**: ela recebe o **endereço (URL)** da foto
e baixa de lá. Por isso as fotos precisam estar num lugar público.

1. No Supabase, abra **Storage** e clique em **New bucket**. Nome: `fotos-imoveis`,
   marcado como **Public**.
2. As fotos devem ser **JPEG**, com até **8 MB**, e a proporção precisa estar entre
   **4:5 e 1,91:1**. As de 1080 × 1080 que o painel gera (proporção 1:1) servem.
3. Ao cadastrar o imóvel, o painel envia as fotos (já com a marca d'água) para o
   bucket e guarda o endereço de cada uma.

### 5.3 Tabela de histórico das publicações

No **SQL Editor** do Supabase:

```sql
create table publicacoes_redes (
  id          uuid primary key default gen_random_uuid(),
  imovel_id   text not null,
  rede        text not null check (rede in ('facebook', 'instagram')),
  status      text not null check (status in ('publicado', 'erro')),
  post_id     text,          -- id do post na Meta (para editar/apagar depois)
  link        text,          -- endereço do post publicado
  erro        text,          -- mensagem da Meta, se falhar
  publicado_por uuid references auth.users(id),
  criado_em   timestamptz not null default now()
);

alter table publicacoes_redes enable row level security;

-- Só a equipe (admin e corretores ativos) lê o histórico.
create policy "equipe le publicacoes" on publicacoes_redes
  for select using (
    exists (select 1 from perfis where id = auth.uid()
            and role in ('admin', 'corretor') and situacao = 'ativo')
  );
-- Ninguém grava pelo navegador: só a função do servidor (que usa a service role).
```

### 5.4 Guardar os segredos

No terminal, na pasta do projeto:

```
supabase secrets set META_PAGE_ID=xxxxxxxx
supabase secrets set META_PAGE_TOKEN=EAAG...xxxx
supabase secrets set META_IG_USER_ID=xxxxxxxx
supabase secrets set META_API_VERSION=v21.0
```

> Use a **versão mais recente** da API do Graph (veja em developers.facebook.com/docs/graph-api/changelog).
> Cada versão vale por cerca de 2 anos.

---

## Etapa 6: criar a função que publica

```
supabase functions new publicar-redes
```

Arquivo `supabase/functions/publicar-redes/index.ts` (esboço comentado):

```ts
// Publica um imóvel na Página do Facebook e no Instagram da Elo.
// Chamada pelo botão "Publicar agora" do painel: { imovelId, legenda, textoFacebook, fotos: [url, ...] }
import { createClient } from "jsr:@supabase/supabase-js@2";

const V = Deno.env.get("META_API_VERSION")!;
const PAGE_ID = Deno.env.get("META_PAGE_ID")!;
const PAGE_TOKEN = Deno.env.get("META_PAGE_TOKEN")!;
const IG_ID = Deno.env.get("META_IG_USER_ID")!;
const GRAPH = `https://graph.facebook.com/${V}`;

/** POST na API da Meta; lança erro com a mensagem dela se falhar. */
async function meta(caminho: string, campos: Record<string, string>) {
  const corpo = new URLSearchParams({ ...campos, access_token: PAGE_TOKEN });
  const r = await fetch(`${GRAPH}/${caminho}`, { method: "POST", body: corpo });
  const json = await r.json();
  if (json.error) throw new Error(json.error.message);
  return json;
}

async function publicarFacebook(texto: string, fotos: string[]) {
  // 1. Sobe cada foto sem publicar (fica "anexável")
  const ids = [];
  for (const url of fotos.slice(0, 10)) {
    const f = await meta(`${PAGE_ID}/photos`, { url, published: "false" });
    ids.push(f.id);
  }
  // 2. Cria o post com o texto e as fotos anexadas
  const campos: Record<string, string> = { message: texto };
  ids.forEach((id, i) => (campos[`attached_media[${i}]`] = JSON.stringify({ media_fbid: id })));
  const post = await meta(`${PAGE_ID}/feed`, campos);
  return { postId: post.id, link: `https://www.facebook.com/${post.id}` };
}

/** Espera o Instagram terminar de processar o contêiner (status FINISHED). */
async function esperarPronto(containerId: string) {
  for (let i = 0; i < 20; i++) {
    const r = await fetch(`${GRAPH}/${containerId}?fields=status_code&access_token=${PAGE_TOKEN}`);
    const { status_code } = await r.json();
    if (status_code === "FINISHED") return;
    if (status_code === "ERROR") throw new Error("O Instagram não conseguiu processar uma das fotos.");
    await new Promise((ok) => setTimeout(ok, 3000));
  }
  throw new Error("O Instagram demorou demais para processar as fotos.");
}

async function publicarInstagram(legenda: string, fotos: string[]) {
  const lista = fotos.slice(0, 10); // carrossel: até 10
  let criacao: string;
  if (lista.length === 1) {
    criacao = (await meta(`${IG_ID}/media`, { image_url: lista[0], caption: legenda })).id;
  } else {
    // 1. Um contêiner para cada foto do carrossel
    const filhos = [];
    for (const url of lista) {
      const c = await meta(`${IG_ID}/media`, { image_url: url, is_carousel_item: "true" });
      await esperarPronto(c.id);
      filhos.push(c.id);
    }
    // 2. O contêiner do carrossel, com a legenda
    criacao = (await meta(`${IG_ID}/media`, { media_type: "CAROUSEL", children: filhos.join(","), caption: legenda })).id;
  }
  await esperarPronto(criacao);
  // 3. Publica
  const pub = await meta(`${IG_ID}/media_publish`, { creation_id: criacao });
  return { postId: pub.id, link: null };
}

Deno.serve(async (req) => {
  // Confere quem chamou: só admin ou corretor ativo pode publicar.
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const jwt = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  const { data: { user } } = await supabase.auth.getUser(jwt);
  if (!user) return new Response("Não autorizado", { status: 401 });
  const { data: perfil } = await supabase.from("perfis").select("role, situacao").eq("id", user.id).single();
  if (!perfil || perfil.situacao !== "ativo" || !["admin", "corretor"].includes(perfil.role)) {
    return new Response("Sem permissão", { status: 403 });
  }

  const { imovelId, legenda, textoFacebook, fotos } = await req.json();
  const resultado: Record<string, unknown> = {};

  for (const [rede, publicar] of [
    ["facebook", () => publicarFacebook(textoFacebook, fotos)],
    ["instagram", () => publicarInstagram(legenda, fotos)],
  ] as const) {
    try {
      const r = await publicar();
      resultado[rede] = { ok: true, ...r };
      await supabase.from("publicacoes_redes").insert({ imovel_id: imovelId, rede, status: "publicado", post_id: r.postId, link: r.link, publicado_por: user.id });
    } catch (e) {
      resultado[rede] = { ok: false, erro: (e as Error).message };
      await supabase.from("publicacoes_redes").insert({ imovel_id: imovelId, rede, status: "erro", erro: (e as Error).message, publicado_por: user.id });
    }
  }
  return Response.json(resultado);
});
```

Publicar no servidor:

```
supabase functions deploy publicar-redes
```

---

## Etapa 7: ligar o botão do painel

Na janela **Divulgar** (`js/painel/redes-sociais.js`), entra um botão **"Publicar agora"**
que:

1. envia a **capa 1080 × 1080** (gerada no painel) para o bucket `fotos-imoveis` e pega o endereço público;
2. chama a função com o texto revisado:
   ```js
   const { data, error } = await supabase.functions.invoke("publicar-redes", {
     body: { imovelId: p.id, legenda, textoFacebook, fotos: [urlCapa, ...urlsDasFotos] },
   });
   ```
3. mostra o resultado: "Publicado no Facebook ✓ (ver post)" e "Publicado no Instagram ✓",
   ou a mensagem de erro de cada rede.

O texto continua editável na janela antes do clique, para corrigir algo antes de publicar.

---

## Etapa 8: testar e colocar no ar

1. **Teste com um imóvel de teste.** Publique, confira no Facebook e no Instagram e
   apague os posts de teste depois.
2. **Confira a tabela `publicacoes_redes`.** Ela deve ter uma linha "publicado" para
   cada rede.
3. **Teste um erro de propósito**, por exemplo com uma foto com endereço inválido. A
   janela precisa mostrar a mensagem, e a tabela precisa registrar o erro.
4. Só então libere o botão para os corretores.

### Erros comuns

| Mensagem da Meta | O que fazer |
|---|---|
| *Invalid OAuth access token* | O token está errado ou foi apagado: gere de novo (Etapa 4) e atualize o segredo |
| *(#200) Permissions error* | Falta permissão no token ou o usuário do sistema não tem a Página e o Instagram atribuídos (Etapa 4, passo 3) |
| *The aspect ratio is not supported* | A foto fugiu da proporção aceita: use as de 1080 × 1080 |
| *Only photo or video can be accepted as media type* | O endereço da foto não é público ou não é JPEG (Etapa 5.2) |
| *Application request limit reached* / limite de publicações | O Instagram limita quantos posts uma conta publica por API em 24 h. Tente mais tarde |

### Manutenção

- **O token "Nunca expira"** deixa de funcionar se o usuário do sistema for apagado, se
  a Página ou o Instagram forem tirados dele ou se as permissões forem retiradas.
  Nesse caso, gere outro token e atualize o segredo.
- **Versão da API:** a cada ~2 anos, troque `META_API_VERSION` para uma versão nova.
- **Imóvel vendido:** a função pode ser estendida para apagar o post do Facebook
  (`DELETE /{post-id}`) ou publicar "VENDIDO". No Instagram, a API tem restrições para
  apagar posts.

---

## Checklist rápido

- [ ] Página do Facebook (não perfil pessoal)
- [ ] Instagram profissional (Empresa) ligado à Página
- [ ] Portfólio empresarial com Página e Instagram
- [ ] Empresa verificada na Meta
- [x] Página de **Política de Privacidade** no site (`privacidade.html`; falta a revisão jurídica e o nome do encarregado)
- [ ] App "Elo Imóveis – Publicador" criado, com Login do Facebook e Instagram
- [ ] App em modo **Ao vivo**
- [ ] Usuário do sistema com Página e Instagram atribuídos
- [ ] Token gerado (nunca expira) e guardado nos segredos do Supabase
- [ ] `PAGE_ID`, `PAGE_TOKEN` e `IG_USER_ID` anotados
- [ ] Bucket público `fotos-imoveis` e tabela `publicacoes_redes`
- [ ] Função `publicar-redes` no ar
- [ ] Botão "Publicar agora" ligado e testado

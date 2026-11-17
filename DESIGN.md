---
name: Elo Imóveis
description: Site imobiliário de Presidente Prudente/SP. As fotos dos imóveis são a estrela; a interface é clara, direta e confiável.
colors:
  brand-red: "#F20202"
  action-primary: "#D60000"
  action-hover: "#B80000"
  ink: "#101425"
  brand-navy: "#143052"
  text-body: "#374151"
  text-muted: "#5C6370"
  surface-base: "#FFFFFF"
  surface-subtle: "#F6F7FB"
  surface-section: "#F1F1F7"
  surface-footer: "#EBEEF3"
  surface-input-muted: "#E9E9ED"
  accent-soft-red: "#FCCBCB"
  accent-red-tint: "#FFF0F0"
  border-subtle: "#D4D9E1"
  border-strong: "#8B939C"
  success: "#19734B"
  warning: "#9A6700"
  error: "#B42318"
  focus: "#143052"
  whatsapp: "#25D366"
typography:
  hero:
    fontFamily: "Poppins, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 700
    lineHeight: "4rem"
    letterSpacing: "-0.02em"
  h1:
    fontFamily: "Poppins, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 600
    lineHeight: "3.375rem"
    letterSpacing: "-0.02em"
  h2:
    fontFamily: "Poppins, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: "2.75rem"
    letterSpacing: "-0.02em"
  h3:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: "2.25rem"
    letterSpacing: "-0.01em"
  h4:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: "1.875rem"
    letterSpacing: "-0.01em"
  card-title:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: "1.625rem"
  price:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 700
    lineHeight: "2.125rem"
  lead:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: "1.8125rem"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.625rem"
  small:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.375rem"
  menu:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: "1.5rem"
  button:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: "1.375rem"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
  tag:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: "1.125rem"
  meta:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: "1.25rem"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "40px"
  "8": "48px"
  "9": "64px"
  "10": "80px"
  "11": "96px"
  "12": "120px"
components:
  button-primary:
    backgroundColor: "{colors.action-primary}"
    textColor: "{colors.surface-base}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
  button-secondary:
    backgroundColor: "{colors.surface-base}"
    textColor: "{colors.action-primary}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.accent-red-tint}"
  field:
    backgroundColor: "{colors.surface-base}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
    height: "48px"
  tab-active:
    backgroundColor: "{colors.action-primary}"
    textColor: "{colors.surface-base}"
    typography: "{typography.button}"
    height: "48px"
  tab-inactive:
    backgroundColor: "{colors.surface-subtle}"
    textColor: "{colors.ink}"
  property-card:
    backgroundColor: "{colors.surface-base}"
    rounded: "{rounded.lg}"
    padding: "24px"
  badge:
    backgroundColor: "{colors.accent-red-tint}"
    textColor: "{colors.error}"
    typography: "{typography.tag}"
    rounded: "{rounded.sm}"
---

# Design System: Elo Imóveis

> **Fonte de verdade:** `Manual_Identidade_Visual_Elo_Imoveis_2026.docx` (v1.0, 13/11/2026).
> Este arquivo traduz o manual para o código. Em qualquer conflito, o manual vence.
> Os tokens vivem em `css/base.css` (`:root`). Os componentes usam sempre a variável, nunca o HEX solto.

## Overview

A Elo Imóveis é uma imobiliária de Presidente Prudente/SP. Quem usa o site está
procurando casa, quase sempre no celular, comparando ofertas entre uma tarefa e
outra. A interface existe para três coisas: **buscar**, **comparar** e **falar com
um corretor**.

Direção: **claro, direto, confiável**. Fundo branco, tinta azul-noite, um único
vermelho de ação. As fotos dos imóveis carregam a emoção; a interface não disputa
com elas. Nada de efeitos de tecnologia (shaders, vidro, brilho, gradiente em
texto): é uma imobiliária, não um produto de software.

O que torna a página reconhecível sem conteúdo:

- As **abas de pasta** da busca (Venda / Aluguel / Código) encaixadas sobre a foto do hero.
- O vermelho usado como **ação**, nunca como decoração: se é vermelho, é clicável.
- Títulos em Poppins semibold azul-noite sobre branco, alinhados à esquerda.
- Divisórias finas `#D4D9E1` no lugar de caixas dentro de caixas.

## Colors

Estratégia: **contida**. Neutros claros + um vermelho de ação + navy institucional.

### Primary

- `--action-primary #D60000`: botões primários, links, aba ativa. Branco por cima = 5,44:1 (AA).
- `--action-hover #B80000`: hover e pressed.
- `--brand-red #F20202`: **somente** logotipo e acentos sem texto. Branco por cima = 4,39:1, reprova.

### Secondary

- `--brand-navy #143052`: blocos institucionais e anel de foco.

### Neutral

- Texto: `--ink #101425` (títulos, navegação, preço), `--text-body #374151` (parágrafos), `--text-muted #5C6370` (metadados; 6,05:1 sobre branco).
- Superfícies, por seção da home: `#FFFFFF` base · `#F6F7FB` apresentação e abas inativas · `#F1F1F7` bairros · `#EBEEF3` rodapé · `#E9E9ED` só preenchimento de controle desabilitado.
- Bordas: `--border-subtle #D4D9E1` em cards e divisórias; `--border-strong #8B939C` em campos (3,11:1).
- Tints: `--accent-soft-red #FCCBCB` (círculo de ícone, seleção de texto) e `--accent-red-tint #FFF0F0` (selo, hover do botão secundário). Sempre com texto escuro.
- Feedback: sucesso `#19734B`, aviso `#9A6700`, erro `#B42318`. Sempre com texto e ícone, nunca só cor.
- `--whatsapp #25D366`: só no atalho flutuante, com ícone escuro.

### Named Rules

- **Vermelho é ação.** Nenhum vermelho decorativo: faixas, fundos de seção e ícones soltos não usam vermelho.
- **Nunca branco sobre `#F20202`** em texto comum.
- **A paleta é fechada.** Só existem as variáveis de `:root`; nenhuma cor nova fora delas.
- **Sobre foto, contraste se mede na foto.** Texto sobre imagem sempre com overlay de `--ink` (≥ 70% na área de leitura).

## Typography

- **Poppins** (500/600/700): títulos H1–H4, título de card, nome de bairro. Nunca em parágrafos.
- **Inter** (400/500/600/700): leitura, UI, preço, formulários, tabelas.
- Carregadas do Google Fonts (link no `<head>` de cada página). Para produção, avaliar hospedar os arquivos no próprio site (manual, seção 11).

### Hierarchy

Classes em `css/base.css`. Valores desktop → mobile (px, tamanho/entrelinha). A troca acontece em 768px.

| Classe | Fonte | Peso | Desktop | Mobile | Uso |
|---|---|---|---|---|---|
| `.t-hero` | Poppins | 700 | 56/64 | 36/44 | Chamada da home |
| `.t-h1` | Poppins | 600 | 44/54 | 32/40 | Título de página |
| `.t-h2` | Poppins | 600 | 36/44 | 28/36 | Título de seção |
| `.t-h3` | Poppins | 600 | 28/36 | 24/32 | Subseção |
| `.t-h4` | Poppins | 600 | 22/30 | 20/28 | Card especial |
| `.t-card` | Poppins | 600 | 18/26 | 17/25 | Nome do imóvel |
| `.t-preco` | Inter | 700 | 26/34 | 22/30 | Preço (numerais tabulares) |
| `.t-lead` | Inter | 400 | 18/29 | 17/27 | Introduções |
| `.t-corpo` | Inter | 400 | 16/26 | 16/26 | Texto corrido |
| `.t-pequeno` | Inter | 400 | 14/22 | 14/22 | Localização, atributos |
| `.t-rotulo` | Inter | 500 | 14/20 | 14/20 | Rótulo de campo |
| `.t-tag` | Inter | 600 | 12/18 | 12/18 | Selo, código |
| `.t-meta` | Inter | 400 | 13/20 | 13/20 | Data, rodapé |

### Named Rules

- Tracking: H1/H2 `-0.02em`, H3/H4 `-0.01em`, corpo `0`. Caixa-alta só em tags curtas (`+0.04em`).
- Peso 600 para títulos e ações; 700 só para hero e preço. Não misturar.
- Nada abaixo de 12px; corpo nunca abaixo de 14px. Parágrafos com 60 a 75 caracteres por linha.
- Títulos com `text-wrap: balance`, alinhados à esquerda.
- **Sem sobretítulo** (rótulo pequeno acima do título). O título se sustenta sozinho.

## Layout

- Container `.container`: máximo de 1280px; margens laterais 16px (mobile), 24px (≥ 768), 32px (≥ 1024).
- Grid: 4 colunas/gutter 16 (até 767) · 8 colunas/gutter 20 (768–1023) · 12 colunas/gutter 24 (≥ 1024).
- Cards de imóvel: 1 por linha (mobile), 2 (tablet), 3 (desktop).
- Espaçamento: **só** 4·8·12·16·24·32·40·48·64·80·96·120 (variáveis `--s1` a `--s12`).
- Ritmo vertical de seção: 64px (mobile) e 96px (desktop). Mais espaço acima do título do que abaixo.
- Navegação completa a partir de 1280px (`xl`); abaixo disso, menu recolhível.
- Home, na ordem do manual (seção 08): navegação → hero → busca → atalhos → apresentação → destaques → bairros → localização → rodapé.

## Elevation & Depth

Plano por padrão. Uma única sombra: `--shadow-card: 0 6px 24px rgb(16 20 37 / 8%)`.

- Usada no painel de busca (que flutua sobre o hero), no card de imóvel em hover, em menus, diálogos e toasts.
- Sombra **nunca** é o único contorno: todo elemento elevado também tem borda `--border-subtle`.

## Shapes

- `8px`: campos, selos, botões compactos.
- `12px`: botões principais, abas (só no topo).
- `16px`: cards de imóvel, painel de busca, blocos de foto, mapa.
- Círculo: só para o coração, o círculo de ícone dos atalhos e o atalho do WhatsApp.

## Components

### Buttons

- `.botao.botao--primario`: fundo `--action-primary`, texto branco, 48px de altura, raio 12. Hover `--action-hover`. Um por bloco.
- `.botao.botao--secundario`: fundo branco, texto e borda `--action-primary`. Hover `--accent-red-tint`.
- `.botao.botao--neutro`: borda `--border-strong`, texto `--ink`. Ações neutras em painéis (cancelar, filtrar).
- `.botao--pequeno`: 40px, raio 8. Mínimo de toque: 44 × 44.
- Pressionado: `scale(0.98)`. Desabilitado: fundo `--surface-input-muted`, texto `--text-muted`, com `disabled`/`aria-disabled` (nunca só opacidade).
- O rótulo diz o que acontece: "Buscar imóveis", "Agendar visita". Nunca "Clique aqui".
- `.link`: texto `--action-primary`, peso 600, sublinhado no hover e no foco.

### Chips

- **Selo de imóvel**: fundo `--accent-red-tint`, texto `--error`, Inter 600 12px, raio 8. Só aparece se o cadastro tiver o atributo real (`badge`).
- **Selo "A VALIDAR"** (`.a-validar`): borda tracejada `--warning`, texto `--warning`. Marca dado institucional ainda não confirmado (endereço, CRECI, telefone, horário). Some quando o dado for validado em `js/instituicao.js` (`validar: false`).

### Cards / Containers

**Card de imóvel** (`Elo.ui.cardImovel` em `js/ui.js`), na ordem do manual:

1. Foto 4:3, `object-fit: cover`, com o coração (44px, fundo branco) no canto superior direito.
2. Linha de selo (se verdadeiro) + tipo + código.
3. Título em `.t-card`, no máximo 2 linhas, título completo no atributo `title` e na página do imóvel.
4. Bairro, cidade/UF em `.t-pequeno` `--text-muted`.
5. Preço em `.t-preco`. Aluguel recebe "/mês". Condomínio vem em linha separada, menor, nunca somado.
6. Atributos com ícone e texto: dormitórios, suítes, vagas, m².
7. Link "Ver detalhes do imóvel". O card inteiro é clicável por esse link; o coração fica acima.

Branco, borda `--border-subtle`, raio 16. Hover: `--shadow-card` e foto em `scale(1.03)`.
Sem card dentro de card. Listas institucionais usam divisórias, não caixas.

### Inputs / Fields

- `.entrada`: fundo branco, borda 1px `--border-strong`, raio 8, 48px, texto `--ink` 16px.
- `.rotulo` sempre visível acima do campo. Placeholder em `--text-muted`, só como exemplo.
- Erro: `aria-invalid="true"` (borda `--error`) + `.erro-campo` com a mensagem ligada por `aria-describedby`. A mensagem diz o problema e como resolver.
- Foco: `outline: 3px solid --focus; outline-offset: 3px` em tudo. Sobre foto ou fundo escuro (`.escuro`), o anel fica branco.

### Navigation

- **Header**: branco, fixo no topo, 72px, borda inferior `--border-subtle`. Marca à esquerda; Comprar / Alugar / Imóveis em destaque / Anuncie seu imóvel / Sobre a Elo / Contato; botão "Entrar" (secundário, 40px) à direita.
- **Abas** (Venda / Aluguel / Código): `role="tablist"`, setas do teclado trocam a aba. Ativa: fundo `--action-primary`, texto branco, `aria-selected="true"`. Inativa: `--surface-subtle`, texto `--ink`.
- **Rodapé**: `--surface-footer`, títulos `--ink`, texto `--text-body`. Uma única menção a direitos reservados.

### Painel (áreas logadas)

Mesmo sistema, modo de trabalho: densidade confortável, sem foto de fundo.

- Fundo da página `--surface-subtle`; conteúdo em painéis brancos com borda `--border-subtle` e raio 16.
- Navegação lateral (≥ 1024) ou superior (mobile), item ativo com fundo `--accent-red-tint` e texto `--ink`.
- Tabelas: cabeçalho `.t-rotulo` `--text-muted`, linhas de 56px com divisória, numerais tabulares, ações à direita. No mobile, cada linha vira um bloco empilhado.
- Estados obrigatórios em toda lista: carregando (esqueleto), vazio (o que é + próxima ação), erro (o que houve + tentar de novo).
- **Excluir imóvel existe só para o administrador**, sempre com diálogo de confirmação que cita o código do imóvel. Corretor não vê esse botão.

### Movimento

Só anima o que dá retorno a uma ação. CSS puro, sem biblioteca. Tokens em `css/base.css`:
`--ease-out cubic-bezier(0.23, 1, 0.32, 1)` (entrar e sair), `--ease-in-out cubic-bezier(0.77, 0, 0.175, 1)`
(mover), `--ease-drawer cubic-bezier(0.32, 0.72, 0, 1)` (folha de filtros). UI sempre abaixo de 300ms.

| Interação | Movimento | Duração |
|---|---|---|
| Botão pressionado | `scale(0.98)` | 120ms |
| Coração | aperta a `0.9`; ao salvar, preenche de vermelho e o ícone assenta de `0.8` | 140 / 240ms |
| Toast | sobe de baixo e sai por baixo (transição, não keyframe) | 220 / 160ms |
| Diálogo de exclusão, galeria em tela cheia | opacidade + `scale(0.96)`, origem no centro | 200 / 150ms |
| Filtros no celular | folha sobe de baixo | 300 / 200ms |
| Menu mobile | desce 8px do cabeçalho | 180ms |
| Galeria | esmaecer na troca por clique; troca imediata pelo teclado | 220ms |
| Upload | miniatura entra com opacidade + `scale(0.95)`; reordenar desliza (FLIP) | 200 / 220ms |
| Card e bloco de bairro | sobem 2px, foto aproxima `1.03` (só com ponteiro fino) | 200 / 500ms |
| Hero | entrada única no carregamento | 600ms |

Sem animação ligada à rolagem, sem laços decorativos. Com `prefers-reduced-motion`,
ficam opacidade e cor; saem deslocamento e escala.

## Do's and Don'ts

### Do:

- Usar sempre o token (`bg-action`, `text-muted`), nunca o HEX solto.
- Dar à foto do imóvel o maior espaço do card e da página do imóvel.
- Escrever preço em pt-BR (`R$ 1.980.000`) e separar preço de condomínio e IPTU.
- Testar em 320, 375, 768, 1024 e 1440px, e com zoom de 200%.
- Respeitar `prefers-reduced-motion`. Animar só o que dá retorno a uma ação.

### Don't:

- Texto branco sobre `#F20202`. Verde do WhatsApp em qualquer CTA genérico.
- Selo ("Oportunidade", "Aceita permuta") sem o atributo no cadastro.
- Placeholder no lugar do rótulo. Ícone sem nome acessível.
- Gradiente em texto, vidro, brilho, sombra colorida, shaders, animação decorativa.
- Título de imóvel em caixa-alta ou truncado sem acesso ao texto completo.
- Publicar endereço, CRECI ou telefone sem remover o selo "A VALIDAR" por validação real.

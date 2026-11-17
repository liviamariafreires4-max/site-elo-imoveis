# Product

> Escrito a partir do briefing do projeto e do manual de identidade (13/11/2026).
> Itens marcados como **suposição** não foram confirmados pela imobiliária.

## Platform

web

## Stack

HTML, CSS e JavaScript puros, sem build nem framework. Sem backend nesta etapa:
dados de exemplo em `js/dados-exemplo.js`, camada de dados em `js/dados.js` e login
simulado em `js/auth.js`, prontos para trocar por Supabase.

## Users

- **Cliente**: procura imóvel para comprar ou alugar em Presidente Prudente e região, quase sempre no celular. Quer filtrar, comparar, salvar favoritos e falar com um corretor.
- **Corretor**: cadastra e edita os próprios imóveis. Não exclui.
- **Administrador**: vê todos os imóveis, é o único que exclui, gerencia corretores e consulta clientes.

## Product Purpose

Novo site da Elo Imóveis: vitrine de imóveis à venda e para alugar, com busca
por finalidade, tipo, bairro, preço e código, e uma área logada para cada perfil.

## Positioning

Imobiliária local de Presidente Prudente, fundada em 2023 (dado do site atual).
Atendimento próximo, com apoio em documentação e financiamento.

## Operating Context

Substitui https://www.eloimoveispp.com.br/. O site atual serve de referência
para a oferta e para os dados institucionais, não para o layout.

## Capabilities and Constraints

- Regra de negócio: corretor adiciona e edita, **só o administrador exclui**. No frontend isso é apenas UX; precisa ser garantido no banco (RLS) quando o backend entrar.
- Endereço, CRECI, telefone, e-mail e horário aparecem com o selo "A VALIDAR" até confirmação.
- Fotos e imóveis desta etapa são provisórios.

## Brand Commitments

- Identidade fixada pelo `Manual_Identidade_Visual_Elo_Imoveis_2026.docx`: vermelho + azul-escuro, Poppins + Inter, superfícies claras. O manual vence qualquer outra preferência.
- Logotipo vetorial oficial ainda não recebido: o site usa uma marca tipográfica provisória.

## Evidence on Hand

- Manual de identidade visual v1.0.
- Site atual (oferta, bairros, texto institucional).
- Nenhuma foto real de imóvel, nenhum depoimento, nenhum número de desempenho. Não inventar nenhum deles.

## Product Principles

1. A busca é o componente mais importante da home.
2. As fotos dos imóveis são a estrela; a interface não compete com elas.
3. Dado de imóvel nunca é enfeitado: selo só se for verdade, preço separado de condomínio e IPTU.
4. Vermelho significa ação.

## Accessibility & Inclusion

WCAG 2.2 AA. Rótulos sempre visíveis, foco de 3px em navy, alvos de toque de
44px, layout de 320 a 1440px e com zoom de 200%, `prefers-reduced-motion`
respeitado.

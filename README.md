# DropGames

DropGames é um projeto pensado para ajudar jogadores a encontrar melhores preços de jogos digitais em um só lugar. A ideia é simples: em vez de abrir várias lojas, comparar valores manualmente e torcer para não perder promoção, o usuário tem uma interface centralizada, visual e direta para descobrir jogos, ofertas e informações úteis.

O projeto nasceu como parte do Happy Game e foi evoluindo por fases. Nesta versão, o front foi refatorado para uma base mais moderna com React, Vite e Tailwind CSS, mantendo o mesmo estilo visual que já existia no protótipo original.

## O Que Tem No Projeto

- Home com hero de jogos em destaque
- Cards de jogos e promoções
- Página Sobre nós
- Página de Dados e pesquisa
- Página de Suporte
- Tela de confirmação de contato enviado
- Login e cadastro
- Componentes reutilizáveis como Header, Footer, cards e seções

## Tecnologias Usadas

| Tecnologia | Uso no projeto |
| --- | --- |
| React | Estrutura das telas e componentes |
| Vite | Ambiente de desenvolvimento e build |
| Tailwind CSS | Base moderna de estilização |
| CSS customizado | Preservação do visual original |
| JavaScript | Interações simples da interface |

## Por Que Refatorar?

Antes, o projeto estava em HTML, CSS e JavaScript separados. Funcionava, mas conforme o projeto cresce, fica mais difícil manter tudo organizado.

Com React, o front fica dividido em partes menores e reaproveitáveis. Isso ajuda muito quando uma mesma estrutura aparece várias vezes, como cards de jogos, seções de lista, header e footer.

## Estrutura Principal

```txt
src/
  components/
    Cards.jsx
    Layout.jsx
  data/
    homeData.js
  pages/
    AboutPage.jsx
    ContactSuccessPage.jsx
    DataPage.jsx
    HomePage.jsx
    LoginPage.jsx
    SignupPage.jsx
    SupportPage.jsx
  App.jsx
  main.jsx
  index.css
```

## Como Rodar Localmente

Instale as dependências:

```bash
npm install
```

Rode o projeto:

```bash
npm run dev
```

Gere a versão de produção:

```bash
npm run build
```

## Sobre A Identidade Visual

A proposta foi manter o visual escuro, gamer e direto do protótipo original. As imagens, cards, vídeos, botões e cores continuam seguindo o mesmo estilo, mas agora com uma estrutura de código mais profissional e preparada para crescer.

## Status

Parte 1 da Fase 4 concluída: front refatorado com React + Tailwind, mantendo as páginas e o design já existentes.

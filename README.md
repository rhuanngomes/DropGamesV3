# DropGames

DropGames é um projeto pensado para ajudar jogadores a encontrar melhores preços de jogos digitais em um só lugar. A ideia é simples: em vez de abrir várias lojas, comparar valores manualmente e torcer para não perder promoção, o usuário tem uma interface centralizada, visual e direta para descobrir jogos, ofertas e informações úteis.

O projeto nasceu como parte do Happy Game e foi evoluindo por fases. Nesta versão, o front foi refatorado para uma base mais moderna com React, Vite e Tailwind CSS, mantendo o mesmo estilo visual que já existia no protótipo original.

## O Que Tem No Projeto

- Home com hero de jogos em destaque e comparador de preços funcional
- Cards de jogos e promoções
- Página de detalhe do jogo com comparativo de lojas, reviews de usuários e requisitos de sistema
- Página Sobre nós
- Página de Dados e pesquisa
- Página de Suporte
- Tela de confirmação de contato enviado
- Login e cadastro
- Componentes reutilizáveis como Header, Footer, cards, seções e comparador
- API simulada em JSON local consumida com `fetch`, `async/await` e `useEffect`
- Integração real com a CheapShark API para ofertas, lojas e preços de jogos de PC
- Integração com endpoints públicos da Steam para reviews textuais e requisitos quando o jogo possui Steam AppID
- Validações de formulário centralizadas em funções React

## Tecnologias Usadas

| Tecnologia | Uso no projeto |
| --- | --- |
| React | Estrutura das telas e componentes |
| Vite | Ambiente de desenvolvimento e build |
| Tailwind CSS | Base moderna de estilização |
| CSS customizado | Preservação do visual original |
| JavaScript | Estado, filtros, validações e consumo da API simulada |

## Por Que Refatorar?

Antes, o projeto estava em HTML, CSS e JavaScript separados. Funcionava, mas conforme o projeto cresce, fica mais difícil manter tudo organizado.

Com React, o front fica dividido em partes menores e reaproveitáveis. Isso ajuda muito quando uma mesma estrutura aparece várias vezes, como cards de jogos, seções de lista, header e footer. A refatoração também removeu as páginas HTML e scripts vanilla antigos de `public`, deixando a aplicação 100% renderizada pela base React.

## Melhorias Feitas Para A Fase 4

- A home agora consome a CheapShark API por meio de `src/hooks/useGames.js` e `src/services/gameService.js`, mantendo `public/api/games.json` como fallback local.
- O comparador permite buscar jogos, filtrar por genero e ordenar por menor preco, maior desconto ou melhor avaliacao.
- Os cards "Melhores preços da semana" e "Mais populares" usam os dados carregados da API simulada, em vez de arrays fixos dentro da tela.
- Login, cadastro e suporte usam estado React e validacoes compartilhadas em `src/utils/validation.js`.
- Arquivos HTML e scripts JavaScript antigos foram removidos para evitar duplicidade de front-end e facilitar a manutencao.
- O build de producao foi validado com `npm run build`.

## Justificativa Tecnica

A camada `services` isola o detalhe de onde os dados vêm. Hoje os jogos vêm de um JSON local, mas no futuro a troca para uma API real de lojas ou backend proprio exige alterar menos codigo.

O hook `useGames` concentra `fetch`, `async/await`, `useEffect`, loading e erro. Isso evita repetir logica de carregamento dentro de varias paginas e deixa os componentes visuais focados em interface.

O `GameComparison` transforma a proposta do projeto em funcionalidade demonstravel: o usuario compara precos de um mesmo jogo em lojas diferentes, identifica a melhor oferta e interage com filtros. Essa era a lacuna apontada no feedback sobre API incompleta e demonstracao pratica.

## Integracao CheapShark

A CheapShark API e publica e nao exige chave de acesso. O projeto usa os endpoints de `stores`, `deals` e `games` para buscar lojas, jogos, descontos, nota Steam/Metacritic, preco normal, preco promocional e detalhes das ofertas.

Como a API exige um `User-Agent` descritivo, o Vite foi configurado com um proxy local em `/cheapshark`. Durante o desenvolvimento, o React chama `/cheapshark/api/1.0/...` e o Vite encaminha para `https://www.cheapshark.com/api/1.0/...` com o identificador do DropGames.

Observacao: os precos retornados pela CheapShark vem em USD, conforme documentacao oficial da API.

## Pagina Do Jogo

A rota `/jogo?gameID={id}` funciona como uma pagina de detalhe inspirada em lojas digitais. Ela mostra:

- Hero visual do jogo;
- Melhor oferta atual;
- Comparativo de preco, desconto e vantagem por loja;
- Reviews textuais de usuarios puxados da Steam quando existe `steamAppID`;
- Resumo de avaliacao Steam;
- Requisitos minimos e recomendados para PC quando a Steam disponibiliza esses dados;
- Link oficial de redirecionamento da CheapShark para a oferta.

Para buscar reviews e requisitos, o projeto usa proxy local em `/steam`, configurado no Vite. Isso evita problemas de CORS durante o desenvolvimento local.

## Estrutura Principal

```txt
public/
  api/
    games.json
src/
  components/
    games/
      GameComparison.jsx
      GameSections.jsx
      index.js
    layout/
      PageShell.jsx
      index.js
  data/
    home/
      homeData.js
      index.js
  hooks/
    index.js
    useGames.js
  pages/
    AboutPage.jsx
    ContactSuccessPage.jsx
    DataPage.jsx
    HomePage.jsx
    LoginPage.jsx
    SignupPage.jsx
    SupportPage.jsx
    GamePage.jsx
  services/
    index.js
    gameService.js
  utils/
    index.js
    validation.js
  App.jsx
  main.jsx
  routes.js
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

Fase 4 revisada: front refatorado para React, mais de 5 paginas navegaveis, Tailwind ativo, API simulada consumida dinamicamente, comparador funcional e validacoes migradas para a arquitetura React.

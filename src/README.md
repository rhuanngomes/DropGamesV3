# Guia Rapido Da Estrutura

Este projeto usa uma organizacao simples por responsabilidade. A ideia e que qualquer integrante consiga encontrar onde mexer sem precisar entender o projeto inteiro antes.

```txt
src/
  components/
    games/       componentes reutilizaveis ligados a jogos, cards, ofertas e comparacao
    layout/      estrutura compartilhada de pagina, como header, footer e PageShell
  data/
    home/        dados estaticos usados para montar secoes da home
  hooks/         hooks React que carregam ou controlam dados
  pages/         telas navegaveis da aplicacao
  services/      comunicacao com API e regras de transformacao de dados externos
  utils/         funcoes puras reaproveitaveis, como validacoes
```

## Onde Alterar Cada Coisa

- Nova pagina: crie em `pages/` e registre a rota em `routes.js`.
- Novo card ou secao de jogos: crie em `components/games/`.
- Header, footer ou estrutura geral: altere `components/layout/PageShell.jsx`.
- Dados mockados da home: altere `data/home/homeData.js`.
- Consumo de API: altere ou crie arquivos em `services/`.
- Estado reutilizavel com React: crie um hook em `hooks/`.
- Validacao ou formatacao compartilhada: crie em `utils/`.

## Regra De Ouro

Se um codigo pertence a uma pagina especifica e nao e reutilizado, ele pode ficar dentro da propria pagina. Se aparecer em duas telas ou mais, mova para `components`, `hooks`, `services` ou `utils`, conforme a responsabilidade.

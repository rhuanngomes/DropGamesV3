J(function () {
  'use strict';

  // ══════════════════════════════════════════════════════════════
  // DADOS DOS JOGOS
  // ══════════════════════════════════════════════════════════════

  var GAMES = [
    {
      title: 'The Last of Us Part I & II',
      desc: 'Viva desde o início os premiados jogos que inspiraram a série de TV, com as edições definitivas dessas duas histórias memoráveis e emocionantes oferecidas em conjunto pela primeira vez em uma coleção completa.',
      heroBg: 'img/hero-main.jpg',
      heroVideo: 'img/video-tlou.mp4',
      startAt: 15,
      logo: 'img/hero-logo-tlou.png',
      logoAlt: 'The Last of Us',
      logoW: 138, logoH: 257,
      platforms: [
        { src: 'img/platform-steam.png', alt: 'Steam' },
        { src: 'img/platform-ps.png', alt: 'PlayStation' },
      ],
      sidebarImg: 'img/sidebar-tlou.jpg',
      sidebarTitle: 'The Last of Us Part I & II',
      sidebarDesc: 'Viva desde o início os premiados jogos que inspiraram a série de TV...',
      precoOriginal: 249.90,
      desconto: 20,
      avaliacoes: 4820,
      notaMedia: 9.4,
    },
    {
      title: 'Resident Evil Requiem',
      desc: 'A história de Requiem se passa em outubro de 2026, 28 anos após a destruição de Raccoon City. Uma nova ameaça biológica emerge e apenas uma agente pode detê-la.',
      heroBg: 'img/hero-bg-re.jpg',
      heroVideo: 'img/video-re.mp4',
      logo: null,
      logoAlt: 'Resident Evil Requiem',
      logoW: 0, logoH: 0,
      platforms: [
        { src: 'img/platform-steam.png', alt: 'Steam' },
        { src: 'img/platform-ps.png', alt: 'PlayStation' },
      ],
      sidebarImg: 'img/sidebar-resident-evil.jpg',
      sidebarTitle: 'Resident Evil Requiem',
      sidebarDesc: 'A história de Requiem se passa em outubro de 2026, 28 anos após a destruição d...',
      precoOriginal: 299.90,
      desconto: 0,
      avaliacoes: 1230,
      notaMedia: 8.7,
    },
    {
      title: 'Nioh 3',
      desc: 'Embarque em um RPG de ação samurai sombrio ambientado em uma recriação do Japão do período Sengoku, infestado por demônios. Yokai monstruosos e famosos senhores da guerra travam uma luta de vida ou morte pela supremacia.',
      heroBg: 'img/sidebar-nioh3.jpg',
      heroVideo: 'img/video-nioh3.mp4',
      logo: 'img/hero-logo-nioh3.png',
      logoAlt: 'Nioh 3',
      logoW: 265, logoH: 174,
      platforms: [
        { src: 'img/platform-steam.png', alt: 'Steam' },
        { src: 'img/platform-ps.png', alt: 'PlayStation' },
      ],
      sidebarImg: 'img/sidebar-nioh3.jpg',
      sidebarTitle: 'Nioh 3',
      sidebarDesc: 'No terceiro jogo da série sombria de RPG de ação com samurais Nioh, você...',
      precoOriginal: 199.90,
      desconto: 15,
      avaliacoes: 870,
      notaMedia: 8.2,
    },
    {
      title: 'Monster Hunter Stories 3',
      desc: 'Monster Hunter Stories 3 é o novo capítulo da sub-série, cuja jogabilidade é baseada em batalhas por turnos. Crie laços com monstros lendários e comande-os em combate.',
      heroBg: 'img/sidebar-monster-hunter.jpg',
      heroVideo: 'img/video-mh3.mp4',
      logo: 'img/hero-logo-mh3.png',
      logoAlt: 'Monster Hunter Stories 3',
      logoW: 317, logoH: 170,
      platforms: [
        { src: 'img/platform-steam.png', alt: 'Steam' },
        { src: 'img/platform-ps.png', alt: 'PlayStation' },
      ],
      sidebarImg: 'img/sidebar-monster-hunter.jpg',
      sidebarTitle: 'Monster Hunter Stories 3',
      sidebarDesc: 'Monster Hunter Stories 3 é o novo capítulo da sub-série, cuja jogabilidade é...',
      precoOriginal: 219.90,
      desconto: 10,
      avaliacoes: 2100,
      notaMedia: 9.1,
    },
    {
      title: 'RIDE 6',
      desc: 'A nova versão traz um leque ainda maior de veículos licenciados, pistas e modos de jogo que entregam a experiência definitiva para os fãs de corrida de motocicletas.',
      heroBg: 'img/sidebar-ride6.jpg',
      heroVideo: 'img/video-ride6.mp4',
      logo: 'img/hero-logo-ride6.png',
      logoAlt: 'RIDE 6',
      logoW: 308, logoH: 174,
      platforms: [
        { src: 'img/platform-steam.png', alt: 'Steam' },
        { src: 'img/platform-ps.png', alt: 'PlayStation' },
      ],
      sidebarImg: 'img/sidebar-ride6.jpg',
      sidebarTitle: 'RIDE 6',
      sidebarDesc: 'A nova versão traz um leque ainda maior de veículos licenciados, pistas...',
      precoOriginal: 179.90,
      desconto: 25,
      avaliacoes: 540,
      notaMedia: 7.8,
    },
  ];

  // ══════════════════════════════════════════════════════════════
  // CONFIGURAÇÕES DO CARROSSEL
  // ══════════════════════════════════════════════════════════════

  var INTERVAL_MS = 60000;
  var FADE_MS = 400;

  var currentIndex = 0;
  var timer = null;

  // ══════════════════════════════════════════════════════════════
  // REFERÊNCIAS DO DOM
  // ══════════════════════════════════════════════════════════════

  var video = document.getElementById('hero-video');
  var imgWrap = document.getElementById('hero-img-wrap');
  var logoWrap = document.getElementById('hero-logo-wrap');
  var logoEl = document.getElementById('hero-logo');
  var descEl = document.getElementById('hero-desc');
  var platforms = document.getElementById('hero-platforms');
  var sidebar = document.getElementById('hero-sidebar');

  // ══════════════════════════════════════════════════════════════
  // FUNÇÕES MATEMÁTICAS
  // ══════════════════════════════════════════════════════════════

  /**
   * FUNÇÃO DE 1º GRAU — Cálculo do preço com desconto
   *
   * Modelo linear: precoFinal = precoOriginal * (1 - desconto / 100)
   *
   * A relação entre preço original (x) e preço final (y) é linear:
   *   f(x) = (1 - d/100) * x
   * onde d é o percentual de desconto fixo. Para um desconto de 20%:
   *   f(x) = 0.8x
   * Isso representa uma reta que passa pela origem — sem preço, sem desconto.
   *
   * @param {number} precoOriginal - Preço cheio do jogo em R$
   * @param {number} desconto      - Percentual de desconto (0–100)
   * @returns {number}             - Preço final após desconto
   */
  function calcularPrecoComDesconto(precoOriginal, desconto) {
    return precoOriginal * (1 - desconto / 100);
  }

  /**
   * FUNÇÃO DE 2º GRAU — Score de relevância do jogo
   *
   * Combina nota e volume de avaliações em um score quadrático para destacar
   * jogos que têm tanto nota alta quanto grande quantidade de avaliações.
   *
   * Fórmula: score = a * nota² + b * log10(avaliacoes + 1)
   *   a = 1.2 (peso do componente quadrático da nota)
   *   b = 5.0 (peso do componente logarítmico do volume)
   *
   * A parte quadrática penaliza notas baixas de forma mais severa que uma
   * função linear faria: nota 5 → 30 pts; nota 10 → 120 pts. Isso significa
   * que a diferença entre nota 9 e nota 10 (19 pts) é maior do que entre
   * nota 5 e nota 6 (13,2 pts), incentivando qualidade elevada.
   *
   * @param {number} nota       - Nota média de 0 a 10
   * @param {number} avaliacoes - Número total de avaliações
   * @returns {number}          - Score de relevância (maior = mais relevante)
   */
  function calcularScoreRelevancia(nota, avaliacoes) {
    var a = 1.2;
    var b = 5.0;
    return a * Math.pow(nota, 2) + b * Math.log10(avaliacoes + 1);
  }

  /**
   * Formata um número como moeda brasileira (R$).
   * @param {number} valor
   * @returns {string}
   */
  function formatarMoeda(valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
  }

  /**
   * Gera o HTML do bloco de preço para o hero, usando calcularPrecoComDesconto.
   * @param {Object} game
   * @returns {string} HTML do bloco de preço
   */
  function gerarHtmlPreco(game) {
    if (!game.precoOriginal) return '';
    var precoFinal = calcularPrecoComDesconto(game.precoOriginal, game.desconto);
    if (game.desconto > 0) {
      return (
        '<div class="dg-hero-preco">' +
        '<span class="dg-preco-badge">-' + game.desconto + '%</span>' +
        '<span class="dg-preco-original">' + formatarMoeda(game.precoOriginal) + '</span>' +
        '<span class="dg-preco-final">' + formatarMoeda(precoFinal) + '</span>' +
        '</div>'
      );
    }
    return (
      '<div class="dg-hero-preco">' +
      '<span class="dg-preco-final">' + formatarMoeda(game.precoOriginal) + '</span>' +
      '</div>'
    );
  }

  // ══════════════════════════════════════════════════════════════
  // ORDENAÇÃO DA SIDEBAR POR SCORE DE RELEVÂNCIA
  // ══════════════════════════════════════════════════════════════

  /**
   * Retorna os jogos da sidebar (todos exceto o em destaque),
   * ordenados pelo score de relevância decrescente.
   * @returns {Array.<Object>}
   */
  function getJogosOrdenadosPorScore() {
    var outros = [];
    for (var i = 0; i < GAMES.length; i++) {
      if (i === currentIndex) continue;
      outros.push({
        game: GAMES[i],
        score: calcularScoreRelevancia(GAMES[i].notaMedia, GAMES[i].avaliacoes),
      });
    }
    outros.sort(function (a, b) { return b.score - a.score; });
    return outros.map(function (item) { return item.game; });
  }

  // ══════════════════════════════════════════════════════════════
  // FUNÇÕES DE RENDERIZAÇÃO
  // ══════════════════════════════════════════════════════════════

  /**
   * Atualiza o vídeo/poster do hero com o jogo selecionado.
   * @param {Object} game
   */
  function renderizarVideo(game) {
    video.poster = game.heroBg;
    video.src = game.heroVideo;
    if (game.startAt) {
      var onMeta = function () {
        video.currentTime = game.startAt;
        video.removeEventListener('loadedmetadata', onMeta);
        video.play().catch(function () { });
      };
      video.addEventListener('loadedmetadata', onMeta);
    } else {
      video.play().catch(function () { });
    }
  }

  /**
   * Atualiza o logo do jogo em destaque no hero.
   * @param {Object} game
   */
  function renderizarLogo(game) {
    if (game.logo) {
      logoEl.src = game.logo;
      logoEl.alt = game.logoAlt;
      logoEl.style.width = game.logoW + 'px';
      logoEl.style.height = game.logoH + 'px';
      logoWrap.style.display = '';
    } else {
      logoWrap.style.display = 'none';
    }
  }

  /**
   * Atualiza descrição, plataformas e preço do hero.
   * @param {Object} game
   */
  function renderizarInfoHero(game) {
    descEl.textContent = game.desc;
    platforms.innerHTML = game.platforms
      .map(function (p) { return '<img src="' + p.src + '" alt="' + p.alt + '" />'; })
      .join('');
    var precoEl = document.getElementById('hero-preco');
    if (precoEl) precoEl.innerHTML = gerarHtmlPreco(game);
  }

  /**
   * Gera o HTML de um card da sidebar com score de relevância visível.
   * @param {Object} game
   * @returns {string}
   */
  function gerarHtmlCard(game) {
    var score = calcularScoreRelevancia(game.notaMedia, game.avaliacoes);
    return (
      '<div class="dg-hero-card">' +
      '<img src="' + game.sidebarImg + '" alt="' + game.sidebarTitle + '" class="dg-hero-card-img" />' +
      '<div class="dg-hero-card-info">' +
      '<div class="dg-hero-card-text">' +
      '<p class="dg-hero-card-title">' + game.sidebarTitle + '</p>' +
      '<p class="dg-hero-card-desc">' + game.sidebarDesc + '</p>' +
      '<p class="dg-hero-card-score">Score: ' + score.toFixed(1) + '</p>' +
      '</div>' +
      '<img src="img/icon-stars.svg" class="dg-stars-img" alt="Avaliação" />' +
      '</div>' +
      '</div>'
    );
  }

  /**
   * Renderiza os cards da sidebar ordenados por score de relevância.
   */
  function renderizarSidebar() {
    var jogosOrdenados = getJogosOrdenadosPorScore();
    sidebar.innerHTML = jogosOrdenados.map(gerarHtmlCard).join('');
  }

  /**
   * Orquestra a aplicação de todos os dados de um jogo na interface.
   * @param {Object} game
   */
  function aplicarJogo(game) {
    renderizarVideo(game);
    renderizarLogo(game);
    renderizarInfoHero(game);
    renderizarSidebar();
  }

  // ══════════════════════════════════════════════════════════════
  // CONTROLE DO CARROSSEL
  // ══════════════════════════════════════════════════════════════

  /**
   * Exibe o jogo no índice especificado, com ou sem fade.
   * @param {number}  index   - Índice do jogo em GAMES
   * @param {boolean} animate - Se true, aplica transição de opacidade
   */
  function mostrarJogo(index, animate) {
    currentIndex = index;
    if (!animate) {
      aplicarJogo(GAMES[index]);
      return;
    }
    imgWrap.classList.add('dg-hero-fading');
    setTimeout(function () {
      aplicarJogo(GAMES[index]);
      imgWrap.classList.remove('dg-hero-fading');
    }, FADE_MS);
  }

  /**
   * Avança para o próximo jogo na rotação circular.
   */
  function avancarJogo() {
    mostrarJogo((currentIndex + 1) % GAMES.length, true);
  }

  /**
   * Inicia o timer de rotação automática.
   */
  function iniciarTimer() {
    timer = setInterval(avancarJogo, INTERVAL_MS);
  }

  // ══════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO
  // ══════════════════════════════════════════════════════════════

  mostrarJogo(0, false);
  iniciarTimer();

}());

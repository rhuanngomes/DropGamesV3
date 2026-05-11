(function () {
  'use strict';

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
    },
  ];

  var INTERVAL_MS = 60000;
  var FADE_MS = 400;

  var currentIndex = 0;
  var timer = null;

  var video     = document.getElementById('hero-video');
  var imgWrap   = document.getElementById('hero-img-wrap');
  var logoWrap  = document.getElementById('hero-logo-wrap');
  var logoEl    = document.getElementById('hero-logo');
  var descEl    = document.getElementById('hero-desc');
  var platforms = document.getElementById('hero-platforms');
  var sidebar   = document.getElementById('hero-sidebar');

  function applyGame(game) {
    // Video / poster
    video.poster = game.heroBg;
    video.src    = game.heroVideo;

    if (game.startAt) {
      var onMeta = function () {
        video.currentTime = game.startAt;
        video.removeEventListener('loadedmetadata', onMeta);
        video.play().catch(function () {});
      };
      video.addEventListener('loadedmetadata', onMeta);
    } else {
      video.play().catch(function () {});
    }

    // Logo
    if (game.logo) {
      logoEl.src          = game.logo;
      logoEl.alt          = game.logoAlt;
      logoEl.style.width  = game.logoW + 'px';
      logoEl.style.height = game.logoH + 'px';
      logoWrap.style.display = '';
    } else {
      logoWrap.style.display = 'none';
    }

    // Description
    descEl.textContent = game.desc;

    // Platforms
    platforms.innerHTML = game.platforms
      .map(function (p) { return '<img src="' + p.src + '" alt="' + p.alt + '" />'; })
      .join('');

    // Sidebar: the 4 games that are not featured, in rotation order
    var cards = '';
    for (var i = 1; i < GAMES.length; i++) {
      var g = GAMES[(currentIndex + i) % GAMES.length];
      cards +=
        '<div class="dg-hero-card">' +
          '<img src="' + g.sidebarImg + '" alt="' + g.sidebarTitle + '" class="dg-hero-card-img" />' +
          '<div class="dg-hero-card-info">' +
            '<div class="dg-hero-card-text">' +
              '<p class="dg-hero-card-title">' + g.sidebarTitle + '</p>' +
              '<p class="dg-hero-card-desc">' + g.sidebarDesc + '</p>' +
            '</div>' +
            '<img src="img/icon-stars.svg" class="dg-stars-img" alt="Avaliação" />' +
          '</div>' +
        '</div>';
    }
    sidebar.innerHTML = cards;
  }

  function showGame(index, animate) {
    currentIndex = index;

    if (!animate) {
      applyGame(GAMES[index]);
      return;
    }

    imgWrap.classList.add('dg-hero-fading');
    setTimeout(function () {
      applyGame(GAMES[index]);
      imgWrap.classList.remove('dg-hero-fading');
    }, FADE_MS);
  }

  function advance() {
    showGame((currentIndex + 1) % GAMES.length, true);
  }

  function startTimer() {
    timer = setInterval(advance, INTERVAL_MS);
  }

  // Init: apply TLOU (index 0) without animation, then start rotation
  showGame(0, false);
  startTimer();
}());

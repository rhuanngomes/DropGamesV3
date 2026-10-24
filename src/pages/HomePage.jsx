import { useEffect, useMemo, useRef, useState } from 'react';
import { GameComparison, GameSection, PromoSection } from '../components/games/index.js';
import { PageShell } from '../components/layout/index.js';
import { useGames } from '../hooks/index.js';
import {
  buildGamerProfile,
  fetchSteamLibrary,
  fetchSteamRecentlyPlayed,
  fetchEpicFeaturedGames,
  formatPrice,
  getBestOffer,
  getSteamSession,
  recommendGamesForGamer,
} from '../services/index.js';

function getGameDetailUrl(title, id, steamAppID, detailLookup) {
  if (id && detailLookup !== 'title') return `/jogo?gameID=${encodeURIComponent(id)}`;
  if (steamAppID) return `/jogo?steamAppID=${encodeURIComponent(steamAppID)}&title=${encodeURIComponent(title)}`;
  return `/jogo?title=${encodeURIComponent(title.replace(/\.\.\.$/, '').trim())}`;
}

function Hero({ games, loading }) {
  const [active, setActive] = useState(0);

  useEffect(() => setActive(0), [games]);

  useEffect(() => {
    if (!games.length) return undefined;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % games.length), 10000);
    return () => window.clearInterval(timer);
  }, [games.length]);

  if (loading) return <HeroSkeleton />;
  if (!games.length) return null;

  const game = games[active] || games[0];

  const gameComparisonUrl = getGameDetailUrl(game.title, game.id, game.steamAppID, game.detailLookup);

  return (
    <section className="dg-hero">
      <div className="dg-hero-inner">
        <div className="dg-hero-featured">
          <div className="dg-hero-img-wrap">
            <a href={gameComparisonUrl} className="dg-hero-media-link" aria-label={`Comparar preços de ${game.title}`}>
              {game.video ? (
                <EpicHeroVideo src={game.video} type={game.videoType} poster={game.image} />
              ) : (
                <img className="dg-hero-video" src={game.image} alt="" />
              )}
            </a>
            <div className="dg-hero-overlay">
              <div className="dg-hero-game-logo">
                {game.logo ? <img src={game.logo} alt={game.logoAlt} className="dg-hero-game-logo-img" style={{ maxWidth: game.logoMaxWidth, maxHeight: game.logoMaxHeight }} /> : <h1 className="dg-hero-api-title">{game.title}</h1>}
              </div>
              <span className="dg-hero-source">{game.eyebrow || 'Destaque Epic Games'}</span>
              <p className="dg-hero-desc">{game.description}</p>
              <div className="dg-hero-cta">
                <a href={gameComparisonUrl} className="dg-btn dg-btn-dark">Ver detalhes</a>
                {game.price && <span className="dg-hero-epic-price">{game.price}</span>}
                <div className="dg-hero-platforms">
                  <span>{game.sourceLabel || 'EPIC GAMES'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="dg-hero-sidebar" style={{ '--dg-hero-card-count': games.length }}>
          {games.map((item, featuredIndex) => (
            <a
              key={item.id || item.title}
              href={getGameDetailUrl(item.title, item.id, item.steamAppID, item.detailLookup)}
              className={`dg-hero-card ${active === featuredIndex ? 'dg-hero-card--active' : ''}`}
              onMouseEnter={() => setActive(featuredIndex)}
              onFocus={() => setActive(featuredIndex)}
            >
              <img src={item.mobileImage || item.image} alt="" className="dg-hero-card-img" />
              <div className="dg-hero-card-info">
                <div className="dg-hero-card-text">
                  <p className="dg-hero-card-title">{item.title}</p>
                  <p className="dg-hero-card-desc">{item.price || item.eyebrow}</p>
                </div>
              </div>
            </a>
          ))}
        </aside>
      </div>
    </section>
  );
}

function HeroSkeleton() {
  return (
    <section className="dg-hero dg-hero-loading" aria-label="Carregando destaques" aria-busy="true">
      <div className="dg-hero-inner">
        <div className="dg-hero-featured dg-skeleton dg-hero-skeleton-main" />
        <aside className="dg-hero-sidebar" style={{ '--dg-hero-card-count': 4 }}>
          {Array.from({ length: 4 }, (_, index) => (
            <div className="dg-hero-card dg-hero-skeleton-card" key={index}>
              <span className="dg-skeleton dg-hero-skeleton-thumb" />
              <span className="dg-hero-skeleton-copy">
                <span className="dg-skeleton" />
                <span className="dg-skeleton" />
              </span>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}

function SectionSkeleton({ title }) {
  return (
    <section className="dg-section dg-home-section-loading" aria-label={`Carregando ${title}`} aria-busy="true">
      <div className="dg-section-inner">
        <div className="dg-skeleton dg-home-skeleton-title" />
        <div className="dg-home-skeleton-grid">
          {Array.from({ length: 5 }, (_, index) => (
            <div className="dg-home-skeleton-game" key={index}>
              <span className="dg-skeleton" />
              <span className="dg-skeleton" />
              <span className="dg-skeleton" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EpicHeroVideo({ src, type, poster }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return undefined;
    let active = true;
    let hlsInstance = null;

    if (type === 'application/x-mpegURL' && !video.canPlayType('application/vnd.apple.mpegurl')) {
      import('hls.js').then(({ default: Hls }) => {
        if (!active || !Hls.isSupported()) return;
        hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: false });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      }).catch(() => {});
    } else {
      video.src = src;
      video.play().catch(() => {});
    }

    return () => {
      active = false;
      hlsInstance?.destroy();
      video.removeAttribute('src');
    };
  }, [src, type]);

  return <video ref={videoRef} className="dg-hero-video" poster={poster} autoPlay loop playsInline muted />;
}

function ListSection({ columns }) {
  if (!columns.length) return null;

  return (
    <section className="dg-section dg-lists-section">
      <div className="dg-section-inner">
        <div className="dg-lists-grid">
          {columns.map((column, columnIndex) => (
            <div className="contents" key={column.title}>
              {columnIndex > 0 && <div className="dg-list-divider" />}
              <div className="dg-list-col">
                <h2 className="dg-section-title dg-list-title">
                  {column.title}
                  <img src="/img/icon-section-arrow.svg" className="dg-title-arrow" alt="" />
                </h2>
                <div className="dg-list-items">
                  {column.items.map(([image, title, price, badge, oldPrice, id, steamAppID]) => (
                    <a href={getGameDetailUrl(title, id, steamAppID)} className="dg-list-item" key={`${column.title}-${title}`}>
                      <img src={image?.startsWith('http') ? image : `/img/${image}`} alt={title} className="dg-list-thumb" />
                      <div className="dg-list-info">
                        <p className="dg-list-name">{title}</p>
                        {badge ? (
                          <div className="dg-price-row">
                            <span className="dg-badge">{badge}</span>
                            <span className="dg-price-old">{oldPrice}</span>
                            <span className="dg-list-price">{price}</span>
                          </div>
                        ) : (
                          <p className={`dg-list-price ${price.includes('Disponível') ? 'dg-price-date' : ''}`}>{price}</p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WeeklyGameBanner({ game }) {
  if (!game) return null;

  return (
    <section className="dg-section dg-banner-section">
      <div className="dg-section-inner dg-banner-inner">
        <div className="dg-banner-wrap">
          <img src={game.image} alt={game.title} className="dg-banner-bg" />
          <div className="dg-banner-content">
            <span className="dg-banner-eyebrow">Em alta nesta semana · {game.source}</span>
            <div className="dg-banner-text">
              <h2 className="dg-banner-title">Conheça {game.title}</h2>
              <p className="dg-banner-desc">{game.description}</p>
            </div>
            <div className="dg-banner-actions">
              <a href={getGameDetailUrl(game.title, game.id, game.steamAppID)} className="dg-btn dg-btn-white">Ver jogo e comparar preços</a>
              {game.price && <strong>{game.price}</strong>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const gamesApi = useGames();
  const [steamGamerProfile, setSteamGamerProfile] = useState(null);
  const [epicHighlights, setEpicHighlights] = useState([]);
  const [epicStatus, setEpicStatus] = useState('loading');
  const apiDeals = gamesApi.games.slice(0, 16).map((game) => {
    const offer = getBestOffer(game);

    return {
      id: game.id,
      steamAppID: game.steamAppID,
      image: game.image,
      title: game.title,
      platform: offer.store,
      price: formatPrice(offer.price, gamesApi.currency),
      priceClass: offer.price === 0 ? 'dg-price-free' : '',
    };
  });
  const personalizedGames = useMemo(
    () => recommendGamesForGamer(gamesApi.games, steamGamerProfile || {}, 16).map((game) => {
      const offer = getBestOffer(game);
      return {
        id: game.id,
        steamAppID: game.steamAppID,
        image: game.image,
        title: game.title,
        platform: `${game.recommendationScore}% de match · ${offer.store}`,
        price: formatPrice(offer.price, gamesApi.currency),
        priceClass: offer.price === 0 ? 'dg-price-free' : '',
      };
    }),
    [gamesApi.currency, gamesApi.games, steamGamerProfile],
  );
  const discoveryGames = useMemo(
    () => buildMixedDiscoveryGames(epicHighlights, gamesApi.games, gamesApi.currency),
    [epicHighlights, gamesApi.currency, gamesApi.games],
  );
  const steamCarouselGames = useMemo(
    () => buildSteamCarouselGames(gamesApi.games, gamesApi.currency),
    [gamesApi.currency, gamesApi.games],
  );
  const weeklySpotlight = useMemo(
    () => buildWeeklySpotlight(epicHighlights, gamesApi.games, gamesApi.currency),
    [epicHighlights, gamesApi.currency, gamesApi.games],
  );
  const liveOfferPromos = useMemo(
    () => buildLiveOfferPromos(gamesApi.games, gamesApi.currency),
    [gamesApi.currency, gamesApi.games],
  );
  const liveListColumns = useMemo(
    () => buildLiveListColumns(gamesApi.games, gamesApi.currency),
    [gamesApi.currency, gamesApi.games],
  );
  const heroGames = useMemo(
    () => epicHighlights.length ? epicHighlights : buildCatalogHeroGames(gamesApi.games, gamesApi.currency),
    [epicHighlights, gamesApi.currency, gamesApi.games],
  );

  useEffect(() => {
    let active = true;
    fetchEpicFeaturedGames()
      .then((payload) => {
        if (active) {
          setEpicHighlights(payload.items);
          setEpicStatus('success');
        }
      })
      .catch(() => {
        if (active) {
          setEpicHighlights([]);
          setEpicStatus('error');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const steamSession = getSteamSession();
    if (!steamSession?.steamId) return undefined;

    Promise.all([
      fetchSteamLibrary(steamSession.steamId),
      fetchSteamRecentlyPlayed(steamSession.steamId).catch(() => []),
    ])
      .then(([library, recent]) => {
        if (active) setSteamGamerProfile(buildGamerProfile(library, recent));
      })
      .catch(() => {
        if (active) setSteamGamerProfile(null);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <PageShell active="/">
      <Hero games={heroGames} loading={epicStatus === 'loading' || (epicStatus === 'error' && gamesApi.status === 'loading')} />
      {steamGamerProfile && personalizedGames.length > 0 && (
        <GameSection title="Recomendados para o seu perfil" games={personalizedGames} />
      )}
      <GameComparison {...gamesApi} />
      {gamesApi.status === 'loading'
        ? <SectionSkeleton title="melhores preços da semana" />
        : <GameSection title="Melhores preços da semana" games={apiDeals} />}
      {liveOfferPromos.length > 0 && <PromoSection promos={liveOfferPromos} />}
      {gamesApi.status === 'loading' || epicStatus === 'loading'
        ? <SectionSkeleton title="novos jogos" />
        : <GameSection title="Descubra algo novo" games={discoveryGames} />}
      <ListSection columns={liveListColumns} />
      <GameSection title="Mais populares" games={apiDeals} />
      <WeeklyGameBanner game={weeklySpotlight} />
      {gamesApi.status === 'loading'
        ? <SectionSkeleton title="jogos da Steam" />
        : <GameSection title="Exclusividade da Steam" games={steamCarouselGames} />}
    </PageShell>
  );
}

function buildCatalogHeroGames(catalog, currency) {
  return catalog
    .filter((game) => game?.title && (game.heroImage || game.image))
    .slice(0, 6)
    .map((game) => {
      const offer = getBestOffer(game);
      return {
        id: game.id,
        title: game.title,
        description: game.description || 'Compare preços e encontre a melhor oferta disponível agora.',
        image: game.heroImage || game.image,
        mobileImage: game.image,
        price: formatPrice(offer.price, currency),
        eyebrow: `Em destaque · ${offer.store}`,
        sourceLabel: offer.store?.toUpperCase() || 'LOJAS PARCEIRAS',
      };
    });
}

function buildMixedDiscoveryGames(epicGames, steamCatalog, steamCurrency) {
  const epic = epicGames.map((game) => ({
    image: game.image,
    title: game.title,
    platform: 'Recomendado na Epic Games',
    price: game.price || 'Ver ofertas',
  }));
  const steam = steamCatalog.slice(0, 16).map((game) => {
    const offer = getBestOffer(game);
    return {
      id: game.id,
      steamAppID: game.steamAppID,
      image: game.image,
      title: game.title,
      platform: 'Recomendado na Steam',
      price: formatPrice(offer.price, steamCurrency),
      priceClass: offer.price === 0 ? 'dg-price-free' : '',
    };
  });
  const mixed = [];
  const seen = new Set();
  const maxLength = Math.max(epic.length, steam.length);

  for (let index = 0; index < maxLength && mixed.length < 16; index += 1) {
    [epic[index], steam[index]].forEach((game) => {
      const key = normalizeGameTitle(game?.title);
      if (game && key && !seen.has(key) && mixed.length < 16) {
        seen.add(key);
        mixed.push(game);
      }
    });
  }

  return mixed;
}

function buildSteamCarouselGames(catalog, currency) {
  const seen = new Set();

  return catalog.reduce((games, game) => {
    if (games.length >= 16) return games;
    const key = normalizeGameTitle(game.title);
    if (!key || seen.has(key)) return games;

    const offer = getBestOffer(game);
    seen.add(key);
    games.push({
      id: game.id,
      steamAppID: game.steamAppID,
      image: game.image,
      title: game.title,
      platform: 'Steam',
      price: formatPrice(offer.price, currency),
      priceClass: offer.price === 0 ? 'dg-price-free' : '',
    });
    return games;
  }, []);
}

function buildWeeklySpotlight(epicGames, steamCatalog, currency) {
  const epicCandidates = epicGames.map((game) => ({
    id: game.id,
    title: game.title,
    image: game.image,
    description: game.description || 'Um dos destaques que estão movimentando a Epic Games nesta semana.',
    price: game.price,
    source: 'Epic Games',
  }));
  const steamCandidates = steamCatalog.slice(0, 16).map((game) => {
    const offer = getBestOffer(game);
    return {
      id: game.id,
      steamAppID: game.steamAppID,
      title: game.title,
      image: game.heroImage || game.image,
      description: game.description || 'Um dos jogos em alta entre os jogadores da Steam nesta semana.',
      price: formatPrice(offer.price, currency),
      source: 'Steam',
    };
  });
  const candidates = [...epicCandidates, ...steamCandidates].filter((game, index, items) => (
    game.title
    && game.image
    && items.findIndex((item) => normalizeGameTitle(item.title) === normalizeGameTitle(game.title)) === index
  ));
  if (!candidates.length) return null;

  const now = new Date();
  const startOfYear = Date.UTC(now.getUTCFullYear(), 0, 1);
  const week = Math.floor((Date.now() - startOfYear) / (7 * 24 * 60 * 60 * 1000));
  return candidates[((now.getUTCFullYear() * 53) + week) % candidates.length];
}

function buildLiveOfferPromos(catalog, currency) {
  const gamesWithOffers = catalog
    .filter((game) => game?.title && game?.image && game?.prices?.length)
    .map((game) => ({ game, offer: getBestOffer(game) }));
  if (!gamesWithOffers.length) return [];

  const discounted = [...gamesWithOffers]
    .filter(({ offer }) => offer.discount > 0)
    .sort((a, b) => b.offer.discount - a.offer.discount)[0];
  const free = gamesWithOffers.find(({ offer }) => offer.price === 0);
  const otherStore = [...gamesWithOffers]
    .filter(({ offer }) => offer.store && !/steam/i.test(offer.store))
    .sort((a, b) => a.offer.price - b.offer.price)[0];
  const popularFallback = [...gamesWithOffers]
    .sort((a, b) => (a.game.popularityRank || 999) - (b.game.popularityRank || 999));
  const selected = [];
  const candidates = [
    { entry: discounted, label: 'Maior desconto agora' },
    { entry: free, label: 'Jogue grátis' },
    { entry: otherStore, label: 'Oferta em outra loja' },
    ...popularFallback.map((entry) => ({ entry, label: 'Em alta agora' })),
  ];

  candidates.forEach(({ entry, label }) => {
    if (!entry || selected.length >= 3) return;
    if (selected.some(({ entry: current }) => normalizeGameTitle(current.game.title) === normalizeGameTitle(entry.game.title))) return;
    selected.push({ entry, label });
  });

  return selected.map(({ entry: { game, offer }, label }) => {
    const price = formatPrice(offer.price, currency);
    const discountCopy = offer.discount > 0 ? ` com ${offer.discount}% de desconto` : '';
    return {
      id: game.id,
      steamAppID: game.steamAppID,
      image: game.heroImage || game.image,
      title: game.title,
      desc: `${label}. Disponível na ${offer.store} por ${price}${discountCopy}. Compare antes de comprar.`,
      button: 'Comparar preços',
    };
  });
}

function buildLiveListColumns(catalog, currency) {
  if (!catalog.length) return [];

  const belongsTo = (game, category) => game.merchandisingCategories?.includes(category);
  const relevantPick = (games) => [...games]
    .sort((a, b) => (
      (a.popularityRank || 999) - (b.popularityRank || 999)
      || (b.steamRatingPercent || b.score || 0) - (a.steamRatingPercent || a.score || 0)
    ))
    .slice(0, 5);
  const topRated = [...catalog].sort((a, b) => (
    (b.steamRatingPercent || b.score || 0) - (a.steamRatingPercent || a.score || 0)
    || (a.popularityRank || 999) - (b.popularityRank || 999)
  ));
  const newReleases = catalog.filter((game) => belongsTo(game, 'new-release'));
  const comingSoon = catalog.filter((game) => belongsTo(game, 'coming-soon'));
  const fallback = catalog.filter((game) => !belongsTo(game, 'coming-soon'));

  const toItem = (game, upcoming = false) => {
    const offer = getBestOffer(game);
    const hasDiscount = !upcoming && offer.discount > 0 && offer.regularPrice > offer.price;
    return [
      game.image,
      game.title,
      upcoming ? `Em breve na ${offer.store || 'loja'}` : formatPrice(offer.price, currency),
      hasDiscount ? `-${offer.discount}%` : '',
      hasDiscount ? formatPrice(offer.regularPrice, currency) : '',
      game.id,
      game.steamAppID,
    ];
  };

  return [
    {
      title: 'Novos lançamentos',
      items: relevantPick(newReleases.length ? newReleases : fallback).map((game) => toItem(game)),
    },
    {
      title: 'Melhores classificados',
      items: topRated.slice(0, 5).map((game) => toItem(game)),
    },
    {
      title: 'Em breve',
      items: relevantPick(comingSoon.length ? comingSoon : fallback).map((game) => toItem(game, true)),
    },
  ];
}

function normalizeGameTitle(value = '') {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

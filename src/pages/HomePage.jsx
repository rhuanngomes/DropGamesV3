import { useEffect, useState } from 'react';
import { GameComparison, GameSection, PromoSection } from '../components/games/index.js';
import { PageShell } from '../components/layout/index.js';
import { useGames } from '../hooks/index.js';
import { formatPrice, getBestOffer } from '../services/index.js';
import {
  bottomPromos,
  featuredGames,
  listColumns,
  newDiscoveries,
  sidebarGames,
  steamGames,
  topPromos,
} from '../data/home/index.js';

function getGameDetailUrl(title, id) {
  if (id) return `/jogo?gameID=${encodeURIComponent(id)}`;
  return `/jogo?title=${encodeURIComponent(title.replace(/\.\.\.$/, '').trim())}`;
}

function Hero() {
  const [active, setActive] = useState(0);
  const game = featuredGames[active];

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % featuredGames.length), 60000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="dg-hero">
      <div className="dg-hero-inner">
        <div className="dg-hero-featured">
          <div className="dg-hero-img-wrap">
            <a href={getGameDetailUrl(game.title)} className="dg-hero-media-link" aria-label={`Ver detalhes de ${game.title}`}>
              <video className="dg-hero-video" src={`/img/${game.video}`} poster={`/img/${game.poster}`} autoPlay loop playsInline muted />
            </a>
            <div className="dg-hero-overlay">
              <div className="dg-hero-game-logo">
                <img
                  src={`/img/${game.logo}`}
                  alt={game.logoAlt}
                  className="dg-hero-game-logo-img"
                  style={{ maxWidth: game.logoMaxWidth, maxHeight: game.logoMaxHeight }}
                />
              </div>
              <p className="dg-hero-desc">{game.desc}</p>
              <div className="dg-hero-cta">
                <a href={getGameDetailUrl(game.title)} className="dg-btn dg-btn-dark">Compare agora</a>
                <div className="dg-hero-platforms">
                  <img src="/img/platform-steam.png" alt="Steam" />
                  <img src="/img/platform-ps.png" alt="PlayStation" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="dg-hero-sidebar">
          {sidebarGames.map(([image, title, desc, featuredIndex]) => (
            <a
              key={title}
              href={getGameDetailUrl(title)}
              className="dg-hero-card"
              onMouseEnter={() => setActive(featuredIndex)}
              onFocus={() => setActive(featuredIndex)}
            >
              <img src={`/img/${image}`} alt="" className="dg-hero-card-img" />
              <div className="dg-hero-card-info">
                <div className="dg-hero-card-text">
                  <p className="dg-hero-card-title">{title}</p>
                  <p className="dg-hero-card-desc">{desc}</p>
                </div>
                <span className="dg-stars-img" role="img" aria-label="Avaliação: 5 de 5 estrelas">
                  <img src="/img/icon-stars.svg" alt="" aria-hidden="true" />
                </span>
              </div>
            </a>
          ))}
        </aside>
      </div>
    </section>
  );
}

function ListSection() {
  return (
    <section className="dg-section dg-lists-section">
      <div className="dg-section-inner">
        <div className="dg-lists-grid">
          {listColumns.map((column, columnIndex) => (
            <div className="contents" key={column.title}>
              {columnIndex > 0 && <div className="dg-list-divider" />}
              <div className="dg-list-col">
                <h2 className="dg-section-title dg-list-title">
                  {column.title}
                  <img src="/img/icon-section-arrow.svg" className="dg-title-arrow" alt="" />
                </h2>
                <div className="dg-list-items">
                  {column.items.map(([image, title, price, badge, oldPrice]) => (
                    <a href={getGameDetailUrl(title)} className="dg-list-item" key={`${column.title}-${title}`}>
                      <img src={`/img/${image}`} alt={title} className="dg-list-thumb" />
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

function FortniteBanner() {
  return (
    <section className="dg-section dg-banner-section">
      <div className="dg-section-inner dg-banner-inner">
        <div className="dg-banner-wrap">
          <img src="/img/banner-fortnite-bg.jpg" alt="Esta semana no Fortnite" className="dg-banner-bg" />
          <div className="dg-banner-content">
            <div className="dg-banner-logos">
              <img src="/img/banner-image2.png" alt="Star Wars" className="dg-banner-logo1" />
              <div className="dg-banner-divider" />
              <img src="/img/banner-image3.png" alt="Fortnite" className="dg-banner-logo2" />
            </div>
            <div className="dg-banner-text">
              <h2 className="dg-banner-title">Esta semana no Fortnite</h2>
              <p className="dg-banner-desc">Confira todas as novidades do Fortnite em um só lugar.</p>
            </div>
            <button className="dg-btn dg-btn-white">Descubra já</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const gamesApi = useGames();
  const apiDeals = gamesApi.games.slice(0, 6).map((game) => {
    const offer = getBestOffer(game);

    return {
      id: game.id,
      image: game.image,
      title: game.title,
      platform: offer.store,
      price: formatPrice(offer.price, gamesApi.currency),
      priceClass: offer.price === 0 ? 'dg-price-free' : '',
    };
  });

  return (
    <PageShell active="/">
      <Hero />
      <GameComparison {...gamesApi} />
      <GameSection title="Melhores preços da semana" games={apiDeals} />
      <PromoSection promos={topPromos} />
      <GameSection title="Descubra algo novo" games={newDiscoveries} />
      <ListSection />
      <GameSection title="Mais populares" games={apiDeals.slice(0, 6)} />
      <FortniteBanner />
      <GameSection title="Exclusividade da Steam" games={steamGames} />
      <PromoSection promos={bottomPromos} />
    </PageShell>
  );
}

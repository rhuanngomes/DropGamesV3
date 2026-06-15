import { useEffect, useState } from 'react';
import { PageShell } from '../components/Layout.jsx';
import { GameSection, PromoSection } from '../components/Cards.jsx';
import {
  bottomPromos,
  featuredGames,
  listColumns,
  newDiscoveries,
  popularGames,
  sidebarGames,
  steamGames,
  topPromos,
  weeklyDeals,
} from '../data/homeData.js';

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
            <video className="dg-hero-video" src={`/img/${game.video}`} poster={`/img/${game.poster}`} autoPlay loop playsInline muted />
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
                <button className="dg-btn dg-btn-dark">Compare agora</button>
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
            <button key={title} className="dg-hero-card" onClick={() => setActive(featuredIndex)}>
              <img src={`/img/${image}`} alt={title} className="dg-hero-card-img" />
              <div className="dg-hero-card-info">
                <div className="dg-hero-card-text">
                  <p className="dg-hero-card-title">{title}</p>
                  <p className="dg-hero-card-desc">{desc}</p>
                </div>
                <img src="/img/icon-stars.svg" className="dg-stars-img" alt="Avaliação" />
              </div>
            </button>
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
                    <div className="dg-list-item" key={`${column.title}-${title}`}>
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
                    </div>
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
  return (
    <PageShell active="/">
      <Hero />
      <GameSection title="Melhores preços da semana" games={weeklyDeals} />
      <PromoSection promos={topPromos} />
      <GameSection title="Descubra algo novo" games={newDiscoveries} />
      <ListSection />
      <GameSection title="Mais populares" games={popularGames} />
      <FortniteBanner />
      <GameSection title="Exclusividade da Steam" games={steamGames} />
      <PromoSection promos={bottomPromos} />
    </PageShell>
  );
}

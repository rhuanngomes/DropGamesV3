import { useCallback, useEffect, useRef, useState } from 'react';

export function SectionHeader({ title, canScrollBack = false, canScrollForward = false, onBack, onForward }) {
  return (
    <div className="dg-section-header">
      <h2 className="dg-section-title">
        {title}
        <img src="/img/icon-section-arrow.svg" className="dg-title-arrow" alt="" />
      </h2>
      <div className="dg-nav-arrows">
        <button className="dg-arrow-btn" type="button" aria-label={`Ver jogos anteriores em ${title}`} disabled={!canScrollBack} onClick={onBack}><img src="/img/icon-arrow-left.svg" className="dg-arrow-icon dg-arrow-icon--left" alt="" /></button>
        <button className="dg-arrow-btn" type="button" aria-label={`Ver próximos jogos em ${title}`} disabled={!canScrollForward} onClick={onForward}><img src="/img/icon-arrow-right.svg" className="dg-arrow-icon" alt="" /></button>
      </div>
    </div>
  );
}

export function GameCard({ id, steamAppID, image, title, platform, price, priceClass = '' }) {
  const imageSrc = image?.startsWith('http') ? image : `/img/${image}`;

  return (
    <a className="dg-game-card" href={getGameDetailUrl(title, id, steamAppID)}>
      <div className="dg-game-card-img-wrap">
        <img src={imageSrc} alt={title} className="dg-game-card-img" />
      </div>
      <div className="dg-game-card-info">
        <span className="dg-platform">{platform}</span>
        <p className="dg-game-title">{title}</p>
        <p className={`dg-game-price ${priceClass}`}>{price}</p>
      </div>
    </a>
  );
}

export function GameSection({ title, games }) {
  const rowRef = useRef(null);
  const [scrollState, setScrollState] = useState({ back: false, forward: false });

  const updateScrollState = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;

    const maxScroll = Math.max(0, row.scrollWidth - row.clientWidth);
    setScrollState({
      back: row.scrollLeft > 2,
      forward: row.scrollLeft < maxScroll - 2,
    });
  }, []);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return undefined;

    updateScrollState();
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(row);
    window.addEventListener('resize', updateScrollState);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScrollState);
    };
  }, [games, updateScrollState]);

  const scroll = (direction) => {
    const row = rowRef.current;
    if (!row) return;

    const card = row.querySelector('.dg-game-card');
    const gap = Number.parseFloat(getComputedStyle(row).columnGap || getComputedStyle(row).gap) || 0;
    const cardWidth = card?.getBoundingClientRect().width || row.clientWidth;
    const visibleCards = Math.max(1, Math.floor((row.clientWidth + gap) / (cardWidth + gap)));
    row.scrollBy({ left: direction * (cardWidth + gap) * visibleCards, behavior: 'smooth' });
  };

  return (
    <section className="dg-section">
      <div className="dg-section-inner">
        <SectionHeader
          title={title}
          canScrollBack={scrollState.back}
          canScrollForward={scrollState.forward}
          onBack={() => scroll(-1)}
          onForward={() => scroll(1)}
        />
        <div
          className="dg-cards-row"
          ref={rowRef}
          onScroll={updateScrollState}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') scroll(-1);
            if (event.key === 'ArrowRight') scroll(1);
          }}
          tabIndex="0"
          aria-label={`Jogos em ${title}`}
        >
          {games.map((game) => <GameCard key={`${title}-${game.title}`} {...game} />)}
        </div>
      </div>
    </section>
  );
}

export function PromoCard({ id, steamAppID, image, title, desc, button }) {
  const imageSrc = image?.startsWith('http') ? image : `/img/${image}`;

  return (
    <a href={getGameDetailUrl(title, id, steamAppID)} className="dg-promo-card">
      <img src={imageSrc} alt={title} className="dg-promo-img" />
      <div className="dg-promo-body">
        <p className="dg-promo-title">{title}</p>
        <p className="dg-promo-desc">{desc}</p>
      </div>
      <span className="dg-btn dg-btn-dark dg-promo-btn">{button}</span>
    </a>
  );
}

export function PromoSection({ promos }) {
  return (
    <section className="dg-section dg-promo-section">
      <div className="dg-section-inner">
        <div className="dg-promo-grid">
          {promos.map((promo) => <PromoCard key={promo.title} {...promo} />)}
        </div>
      </div>
    </section>
  );
}

export function FeatureCard({ title, desc }) {
  return (
    <div className="dg-feature-card">
      <div className="dg-feature-icon-wrap">
        <img src="/img/icon-feature.svg" alt="" className="dg-feature-icon" />
      </div>
      <div className="dg-feature-text">
        <p className="dg-feature-title">{title}</p>
        <p className="dg-feature-desc">{desc}</p>
      </div>
    </div>
  );
}

function getGameDetailUrl(title, id, steamAppID) {
  if (id) return `/jogo?gameID=${encodeURIComponent(id)}`;
  if (steamAppID) return `/jogo?steamAppID=${encodeURIComponent(steamAppID)}&title=${encodeURIComponent(title)}`;
  return `/jogo?title=${encodeURIComponent(title.replace(/\.\.\.$/, '').trim())}`;
}

export function SectionHeader({ title }) {
  return (
    <div className="dg-section-header">
      <h2 className="dg-section-title">
        {title}
        <img src="/img/icon-section-arrow.svg" className="dg-title-arrow" alt="" />
      </h2>
      <div className="dg-nav-arrows">
        <button className="dg-arrow-btn" aria-label="Anterior"><img src="/img/icon-arrow-left.svg" className="dg-arrow-icon dg-arrow-icon--left" alt="" /></button>
        <button className="dg-arrow-btn" aria-label="Proximo"><img src="/img/icon-arrow-right.svg" className="dg-arrow-icon" alt="" /></button>
      </div>
    </div>
  );
}

export function GameCard({ id, image, title, platform, price, priceClass = '' }) {
  const imageSrc = image?.startsWith('http') ? image : `/img/${image}`;

  return (
    <a className="dg-game-card" href={getGameDetailUrl(title, id)}>
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
  return (
    <section className="dg-section">
      <div className="dg-section-inner">
        <SectionHeader title={title} />
        <div className="dg-cards-row">
          {games.map((game) => <GameCard key={`${title}-${game.title}`} {...game} />)}
        </div>
      </div>
    </section>
  );
}

export function PromoCard({ image, title, desc, button }) {
  return (
    <a href={getGameDetailUrl(title)} className="dg-promo-card">
      <img src={`/img/${image}`} alt={title} className="dg-promo-img" />
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

function getGameDetailUrl(title, id) {
  if (id) return `/jogo?gameID=${encodeURIComponent(id)}`;
  return `/jogo?title=${encodeURIComponent(title.replace(/\.\.\.$/, '').trim())}`;
}

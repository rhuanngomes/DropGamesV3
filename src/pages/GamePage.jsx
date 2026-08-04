import { useState } from 'react';
import { PageShell } from '../components/layout/index.js';
import { useGameDetails } from '../hooks/index.js';
import { analyzeGamePurchase, analyzeOfferSecurity, answerGameQuestion, formatPrice, generateGameAiResponse, getBestOffer, getGameYouthSafety } from '../services/index.js';

export default function GamePage() {
  const params = new URLSearchParams(window.location.search);
  const gameID = params.get('gameID');
  const title = params.get('title');
  const { game, meta, status, error } = useGameDetails({ gameID, title });

  return (
    <PageShell active="/">
      <section className="dg-game-detail-page">
        {status === 'loading' && <div className="dg-game-detail-loading">Carregando detalhes do jogo...</div>}
        {status === 'error' && <div className="dg-game-detail-loading">{error}</div>}
        {status === 'success' && game && <GameDetail game={game} meta={meta} />}
      </section>
    </PageShell>
  );
}

function GameDetail({ game, meta }) {
  const [activeAiQuestion, setActiveAiQuestion] = useState('buy');
  const [generativePrompt, setGenerativePrompt] = useState('Vale a pena comprar este jogo agora?');
  const [generativeAnswer, setGenerativeAnswer] = useState('');
  const [generativeStatus, setGenerativeStatus] = useState('idle');
  const [generativeError, setGenerativeError] = useState('');
  const bestOffer = getBestOffer(game);
  const prices = [...game.prices].sort((a, b) => a.price - b.price);
  const heroImage = game.heroImage?.startsWith('http') ? game.heroImage : game.image;
  const coverImage = game.image?.startsWith('http') ? game.image : `/img/${game.image}`;
  const gallery = [heroImage, coverImage, ...(game.screenshots || [])].filter(Boolean).slice(0, 6);
  const stores = getUniqueStores(prices);
  const totalStores = stores.length;
  const maxDiscount = Math.max(...prices.map((price) => price.discount || 0), 0);
  const priceHistory = buildPriceHistory(game, prices);
  const aiInsights = analyzeGamePurchase(game, meta);
  const youthSafety = getGameYouthSafety(game);
  const aiAnswer = answerGameQuestion(activeAiQuestion, aiInsights, game);
  const securityRatings = prices.map((offer) => ({
    offer,
    rating: analyzeOfferSecurity(offer, { bestOffer, game }),
  }));
  const bestSecurityRating = analyzeOfferSecurity(bestOffer, { bestOffer, game });

  async function handleGenerativeSubmit(event) {
    event.preventDefault();
    const question = generativePrompt.trim();

    if (!question) return;

    setGenerativeStatus('loading');
    setGenerativeError('');

    try {
      const answer = await generateGameAiResponse({
        question,
        game,
        insights: aiInsights,
        meta,
      });

      setGenerativeAnswer(answer);
      setGenerativeStatus('success');
    } catch (error) {
      setGenerativeError(error.message);
      setGenerativeStatus('error');
    }
  }

  return (
    <div className="dg-game-detail">
      <header className="dg-game-product-header">
        <h1>{game.title}</h1>
        <div className="dg-game-product-meta">
          <span>{game.steamRatingPercent ? `${game.steamRatingPercent}% positivas` : 'Sem media de usuarios'}</span>
          <span>{game.steamRatingCount ? `${game.steamRatingCount.toLocaleString('pt-BR')} reviews` : 'Reviews indisponiveis'}</span>
          <span>{game.genre}</span>
        </div>
        <nav className="dg-game-tabs" aria-label="Secoes do jogo">
          <a href="#overview">Visao geral</a>
          <a href="#prices">Precos</a>
          <a href="#history">Historico</a>
          <a href="#ai">IA</a>
          <a href="#reviews">Reviews</a>
          <a href="#requirements">Requisitos</a>
        </nav>
      </header>

      <div className="dg-game-product-grid" id="overview">
        <div className="dg-game-main-column">
          <div className="dg-game-media-frame">
            <img src={heroImage || coverImage} alt={game.title} className="dg-game-main-media" />
          </div>
          <div className="dg-game-gallery-strip" aria-label="Galeria do jogo">
            {gallery.map((image, index) => (
              <img src={image} alt="" key={`${image}-${index}`} />
            ))}
          </div>

          <div className="dg-game-snapshot">
            <SnapshotItem label="Menor preco" value={formatPrice(bestOffer.price, meta.currency)} />
            <SnapshotItem label="Lojas analisadas" value={totalStores} />
            <SnapshotItem label="Maior desconto" value={maxDiscount > 0 ? `${maxDiscount}%` : 'Sem desconto'} />
          </div>

          <p className="dg-game-description">{game.description}</p>

          <div className="dg-game-tag-groups">
            <TagGroup title="Generos" tags={[game.genre, ...game.tags].slice(0, 4)} />
            <TagGroup title="Dados" tags={[game.developers?.[0], game.publishers?.[0], game.steamRatingText].filter(Boolean)} />
          </div>
        </div>

        <aside className="dg-game-buy-panel">
          <img src={coverImage || heroImage} alt="" className="dg-game-cover" />
          <h2>{game.title}</h2>
          <div className="dg-game-buy-summary">
            <span className="dg-badge">{game.genre}</span>
            <strong>{formatPrice(bestOffer.price, meta.currency)}</strong>
            <p>Melhor oferta em {bestOffer.store}</p>
          </div>
          <a href={bestOffer.dealUrl} target="_blank" rel="noreferrer" className="dg-game-primary-action">Ver oferta</a>
          <a href="#prices" className="dg-game-secondary-action">Comparar lojas</a>
          <a href="#security" className={`dg-game-security-pill dg-risk-${bestSecurityRating.level}`}>{bestSecurityRating.label}</a>
          <div className="dg-game-meta-list">
            <MetaRow label="Reviews Steam" value={game.steamRatingText || 'Indisponivel'} />
            <MetaRow label="Avaliacao" value={game.steamRatingPercent ? `${game.steamRatingPercent}% positivas` : 'Sem dados'} />
            <MetaRow label="Historico minimo" value={game.cheapestPriceEver ? formatPrice(game.cheapestPriceEver.price, meta.currency) : 'Sem dados'} />
            <MetaRow label="Faixa etaria" value={youthSafety.label} />
            <MetaRow label="Fonte" value={meta.source} />
          </div>
        </aside>
      </div>

      <section className="dg-game-section dg-youth-safety-section">
        <div className="dg-game-section-header">
          <p className="dg-kicker">Protecao jovem</p>
          <h2>Classificacao e cuidados antes da compra</h2>
        </div>
        <article className="dg-youth-safety-card">
          <div className="dg-youth-rating">
            <strong>{youthSafety.label}</strong>
            <span>{youthSafety.isRestrictedForYouth ? 'Restrito para menores' : 'Uso com orientacao'}</span>
          </div>
          <div>
            <p>{youthSafety.policy}</p>
            <ul>
              {youthSafety.warnings.map((warning) => <li key={warning}>{warning}</li>)}
            </ul>
          </div>
        </article>
      </section>

      <section className="dg-game-section dg-offer-security-section" id="security">
        <div className="dg-game-section-header">
          <p className="dg-kicker">Defesa cibernetica</p>
          <h2>Risco das lojas e links externos</h2>
        </div>
        <div className="dg-offer-security-grid">
          <article className="dg-offer-security-main">
            <span className={`dg-risk-badge dg-risk-${bestSecurityRating.level}`}>{bestSecurityRating.label}</span>
            <h3>{bestSecurityRating.score}/100 de confianca na melhor oferta</h3>
            <p>{bestSecurityRating.recommendation}</p>
            <ul>
              {bestSecurityRating.findings.slice(0, 3).map((finding) => <li key={finding.type}>{finding.text}</li>)}
            </ul>
          </article>
          <article className="dg-offer-security-concepts">
            <span>Palo Alto Networks</span>
            <p>Aplicamos uma leitura inspirada em Zero Trust e Threat Prevention: validar dominio, HTTPS, reputacao da loja, padroes de phishing e anomalias de preco antes de mandar o usuario para fora da DropGames.</p>
          </article>
        </div>
      </section>

      <section className="dg-game-section dg-ai-section" id="ai">
        <div className="dg-game-section-header">
          <p className="dg-kicker">GamePulse AI</p>
          <h2>Inteligencia de compra e vitrine</h2>
        </div>

        <div className="dg-ai-hero-card">
          <div>
            <span className="dg-ai-verdict">{aiInsights.verdict}</span>
            <h3>{aiInsights.score}/100 de confianca</h3>
            <p>{aiInsights.summary}</p>
          </div>
          <div className="dg-ai-score-ring" style={{ '--dg-ai-score': `${aiInsights.score}%` }}>
            <strong>{aiInsights.score}</strong>
            <span>match</span>
          </div>
        </div>

        <div className="dg-ai-grid">
          {aiInsights.signals.map((signal) => (
            <article className="dg-ai-card" key={signal.label}>
              <span>{signal.label}</span>
              <p>{signal.value}</p>
            </article>
          ))}
        </div>

        <div className="dg-ai-split">
          <article className="dg-ai-panel">
            <span>Resumo dos jogadores</span>
            <p>{aiInsights.reviewSummary}</p>
          </article>

          <article className="dg-ai-panel">
            <span>Radar de risco</span>
            <ul>
              {aiInsights.risks.map((risk) => <li key={risk}>{risk}</li>)}
            </ul>
          </article>
        </div>

        <article className="dg-ai-storefront">
          <div>
            <span>Storefront Intelligence</span>
            <h3>Como vender este jogo melhor</h3>
            <p>{aiInsights.storefront.copySuggestion}</p>
          </div>
          <div>
            <strong>Segmentos provaveis</strong>
            <div className="dg-ai-chip-row">
              {aiInsights.storefront.targetSegments.map((segment) => <span key={segment}>{segment}</span>)}
            </div>
            <p>{aiInsights.storefront.promoStrategy}</p>
          </div>
        </article>

        <div className="dg-ai-assistant">
          <span className="dg-ai-assistant-label">Respostas rapidas</span>
          <div className="dg-ai-question-row">
            {AI_QUESTIONS.map((question) => (
              <button
                type="button"
                className={activeAiQuestion === question.id ? 'is-active' : ''}
                onClick={() => setActiveAiQuestion(question.id)}
                key={question.id}
              >
                {question.label}
              </button>
            ))}
          </div>
          <p>{aiAnswer}</p>
        </div>

        <form className="dg-ai-generative-form" onSubmit={handleGenerativeSubmit}>
          <div>
            <span className="dg-ai-assistant-label">Assistente generativo</span>
            <h3>Pergunte em linguagem natural</h3>
            <p>A resposta usa o contexto real deste jogo: precos, reviews, lojas, historico e sinais do GamePulse.</p>
          </div>
          <label>
            <span>Sua pergunta</span>
            <textarea
              value={generativePrompt}
              onChange={(event) => setGenerativePrompt(event.target.value)}
              placeholder="Ex: explique para mim se vale comprar agora ou esperar uma promocao melhor"
              maxLength="900"
            />
          </label>
          <button type="submit" disabled={generativeStatus === 'loading'}>
            {generativeStatus === 'loading' ? 'Gerando...' : 'Perguntar para IA'}
          </button>
          {generativeStatus === 'error' && <p className="dg-ai-generative-error">{generativeError}</p>}
          {generativeAnswer && <div className="dg-ai-generative-answer">{generativeAnswer}</div>}
        </form>
      </section>

      <section className="dg-game-section" id="prices">
        <div className="dg-game-section-header">
          <p className="dg-kicker">Comparativo de lojas</p>
          <h2>Precos e vantagens</h2>
        </div>
        <StoreLogoStrip stores={stores} />
        <div className="dg-store-cards">
          {prices.map((offer, index) => (
            <a href={offer.dealUrl} target="_blank" rel="noreferrer" className="dg-store-offer-card" key={`${offer.storeID}-${offer.dealID}`}>
              <StoreLogo offer={offer} />
              <div className="dg-store-offer-main">
                <span>{index === 0 ? 'Melhor escolha' : 'Oferta disponivel'}</span>
                <strong>{offer.store}</strong>
                <p>{getOfferAdvantage(offer, bestOffer)}</p>
              </div>
              <div className="dg-store-offer-price">
                <SecurityOfferBadge rating={securityRatings.find((item) => item.offer === offer)?.rating} />
                <span className="dg-store-price">{formatPrice(offer.price, meta.currency)}</span>
                {offer.regularPrice > offer.price && <span className="dg-store-old-price">{formatPrice(offer.regularPrice, meta.currency)}</span>}
                {offer.discount > 0 && <span className="dg-discount-badge">-{offer.discount}%</span>}
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="dg-game-section dg-game-chart-section" id="history">
        <div className="dg-game-section-header">
          <p className="dg-kicker">Historico de preco</p>
          <h2>Evolucao na linha do tempo</h2>
        </div>
        <PriceHistoryChart points={priceHistory} currency={meta.currency} />
      </section>

      <section className="dg-game-section" id="reviews">
        <div className="dg-game-section-header">
          <p className="dg-kicker">Reviews de usuarios</p>
          <h2>O que jogadores dizem</h2>
        </div>
        {game.reviews.length > 0 ? (
          <div className="dg-review-grid">
            {game.reviews.map((review) => <ReviewCard review={review} key={review.id} />)}
          </div>
        ) : (
          <div className="dg-game-empty">Reviews textuais nao disponiveis para este jogo. A CheapShark fornece precos e ratings; reviews textuais aparecem quando ha Steam AppID publico.</div>
        )}
      </section>

      <section className="dg-game-section dg-game-requirements-section" id="requirements">
        <div className="dg-game-section-header">
          <p className="dg-kicker">Sistema</p>
          <h2>Requisitos para rodar no PC</h2>
        </div>
        <div className="dg-requirements-grid">
          <RequirementBlock title="Minimos" text={game.requirements?.minimum} />
          <RequirementBlock title="Recomendados" text={game.requirements?.recommended} />
        </div>
      </section>
    </div>
  );
}

function SecurityOfferBadge({ rating }) {
  if (!rating) return null;

  return <span className={`dg-risk-mini dg-risk-${rating.level}`}>{rating.label}</span>;
}

const AI_QUESTIONS = [
  { id: 'buy', label: 'Vale comprar?' },
  { id: 'audience', label: 'Combina com quem?' },
  { id: 'risk', label: 'Qual risco?' },
  { id: 'business', label: 'Uso B2B' },
];

function StoreLogoStrip({ stores }) {
  if (!stores.length) return null;

  return (
    <div className="dg-store-logo-strip" aria-label="Lojas comparadas">
      {stores.map((store) => (
        <span className="dg-store-logo-chip" title={store.name} key={store.id || store.name}>
          {store.logoUrl || store.iconUrl ? <img src={store.logoUrl || store.iconUrl} alt={store.name} /> : <span>{getInitials(store.name)}</span>}
        </span>
      ))}
    </div>
  );
}

function StoreLogo({ offer }) {
  return (
    <span className="dg-store-offer-logo" aria-hidden="true">
      {offer.storeLogoUrl || offer.storeIconUrl ? <img src={offer.storeLogoUrl || offer.storeIconUrl} alt="" /> : <span>{getInitials(offer.store)}</span>}
    </span>
  );
}

function PriceHistoryChart({ points, currency }) {
  const width = 720;
  const height = 260;
  const padding = 34;
  const values = points.map((point) => point.price);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const coordinates = points.map((point, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(points.length - 1, 1);
    const y = height - padding - ((point.price - min) / range) * (height - padding * 2);
    return { ...point, x, y };
  });
  const linePath = coordinates.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const areaPath = `${linePath} L ${coordinates.at(-1).x} ${height - padding} L ${coordinates[0].x} ${height - padding} Z`;

  return (
    <div className="dg-price-chart-card">
      <div className="dg-price-chart-summary">
        <div>
          <span>Menor ponto</span>
          <strong>{formatPrice(min, currency)}</strong>
        </div>
        <div>
          <span>Maior ponto</span>
          <strong>{formatPrice(max, currency)}</strong>
        </div>
      </div>
      <svg className="dg-price-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Grafico de evolucao de preco">
        <defs>
          <linearGradient id="dg-price-chart-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(0, 191, 255, 0.3)" />
            <stop offset="100%" stopColor="rgba(0, 191, 255, 0)" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((line) => {
          const y = padding + line * ((height - padding * 2) / 3);
          return <line x1={padding} x2={width - padding} y1={y} y2={y} key={line} />;
        })}
        <path d={areaPath} className="dg-price-chart-area" />
        <path d={linePath} className="dg-price-chart-line" />
        {coordinates.map((point) => (
          <g className="dg-price-chart-point" key={`${point.label}-${point.price}`}>
            <circle cx={point.x} cy={point.y} r="4" />
            <text x={point.x} y={height - 9}>{point.label}</text>
            <text x={point.x} y={Math.max(point.y - 12, 16)}>{formatPrice(point.price, currency)}</text>
          </g>
        ))}
      </svg>
      <p>Grafico construido com os precos atuais por loja e o menor preco historico retornado pela CheapShark quando disponivel.</p>
    </div>
  );
}

function SnapshotItem({ label, value }) {
  return (
    <div className="dg-game-snapshot-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getUniqueStores(prices) {
  const stores = prices.reduce((acc, offer) => {
    const key = offer.storeID || offer.store;
    if (!acc.has(key)) {
      acc.set(key, {
        id: key,
        name: offer.store,
        logoUrl: offer.storeLogoUrl,
        iconUrl: offer.storeIconUrl,
      });
    }

    return acc;
  }, new Map());

  return Array.from(stores.values()).slice(0, 10);
}

function buildPriceHistory(game, prices) {
  const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
  const currentBest = sortedPrices[0]?.price || 0;
  const currentAverage = sortedPrices.length
    ? sortedPrices.reduce((total, offer) => total + offer.price, 0) / sortedPrices.length
    : currentBest;
  const regularReference = Math.max(...sortedPrices.map((offer) => offer.regularPrice || offer.price), currentAverage);
  const historicLow = game.cheapestPriceEver?.price ? Number(game.cheapestPriceEver.price) : currentBest;
  const historicLabel = game.cheapestPriceEver?.date ? new Date(game.cheapestPriceEver.date).getFullYear().toString() : 'Historico';

  return [
    { label: 'Referencia', price: regularReference },
    { label: historicLabel, price: historicLow },
    { label: 'Media atual', price: currentAverage },
    { label: 'Hoje', price: currentBest },
  ].filter((point) => Number.isFinite(point.price));
}

function getInitials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function TagGroup({ title, tags }) {
  return (
    <div className="dg-game-tag-group">
      <span>{title}</span>
      <div>
        {tags.map((tag) => <strong key={tag}>{tag}</strong>)}
      </div>
    </div>
  );
}

function getOfferAdvantage(offer, bestOffer) {
  if (offer.price === bestOffer.price) return 'Menor preco encontrado agora entre as lojas comparadas.';
  if (offer.discount > 0) return `${offer.discount}% abaixo do preco original informado pela loja.`;
  return 'Opcao alternativa para comparar disponibilidade e loja favorita.';
}

function MetaRow({ label, value }) {
  return (
    <div className="dg-game-meta-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ReviewCard({ review }) {
  const AuthorTag = review.profileUrl ? 'a' : 'div';
  const profileProps = review.profileUrl
    ? { href: review.profileUrl, target: '_blank', rel: 'noreferrer' }
    : {};

  return (
    <article className="dg-review-card">
      <div className="dg-review-card-header">
        <AuthorTag className="dg-review-author" {...profileProps}>
          {review.avatarUrl ? (
            <img src={review.avatarUrl} alt="" />
          ) : (
            <span className="dg-review-avatar-fallback">{review.author.slice(0, 1).toUpperCase()}</span>
          )}
          <div>
            <strong>{review.author}</strong>
            <span>{review.playtimeHours}h jogadas</span>
          </div>
        </AuthorTag>
        <span className={review.votedUp ? 'dg-review-positive' : 'dg-review-negative'}>{review.votedUp ? 'Recomenda' : 'Nao recomenda'}</span>
      </div>
      <p>{review.text}</p>
    </article>
  );
}

function RequirementBlock({ title, text }) {
  return (
    <article className="dg-requirement-card">
      <h3>{title}</h3>
      <pre>{text || 'Requisito nao informado pela loja.'}</pre>
    </article>
  );
}

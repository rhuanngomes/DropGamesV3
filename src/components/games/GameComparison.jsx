import { useEffect, useMemo, useState } from 'react';
import { formatPrice, getBestOffer, searchGamesByTitle } from '../../services/index.js';

const sortOptions = [
  { value: 'popular', label: 'Popularidade' },
  { value: 'best-price', label: 'Menor preco' },
  { value: 'discount', label: 'Maior desconto' },
  { value: 'score', label: 'Melhor avaliacao' },
];

export default function GameComparison({ games, status, error, updatedAt, source, currency = 'USD' }) {
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('Todos');
  const [sortBy, setSortBy] = useState('popular');
  const [catalogGames, setCatalogGames] = useState([]);
  const [catalogStatus, setCatalogStatus] = useState('idle');
  const [catalogError, setCatalogError] = useState('');

  const normalizedSearch = search.trim().toLowerCase();
  const isCatalogSearch = normalizedSearch.length >= 2;

  useEffect(() => {
    let cancelled = false;

    if (!isCatalogSearch) {
      setCatalogGames([]);
      setCatalogStatus('idle');
      setCatalogError('');
      return undefined;
    }

    setCatalogStatus('loading');
    setCatalogError('');

    const timer = window.setTimeout(async () => {
      try {
        const payload = await searchGamesByTitle(search);
        if (!cancelled) {
          setCatalogGames(payload.games);
          setCatalogStatus('success');
        }
      } catch (requestError) {
        if (!cancelled) {
          setCatalogGames([]);
          setCatalogError(requestError.message);
          setCatalogStatus('error');
        }
      }
    }, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isCatalogSearch, search]);

  const comparisonGames = isCatalogSearch ? catalogGames : games;
  const genres = useMemo(() => ['Todos', ...new Set(comparisonGames.map((game) => game.genre))], [comparisonGames]);

  const filteredGames = useMemo(() => {
    return comparisonGames
      .filter((game) => {
        const matchesSearch = isCatalogSearch || !normalizedSearch || game.title.toLowerCase().includes(normalizedSearch) || game.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch));
        const matchesGenre = genre === 'Todos' || game.genre === genre;
        return matchesSearch && matchesGenre;
      })
      .sort((a, b) => {
        const offerA = getBestOffer(a);
        const offerB = getBestOffer(b);

        if (sortBy === 'popular') return (a.popularityRank || 999) - (b.popularityRank || 999);
        if (sortBy === 'discount') return offerB.discount - offerA.discount;
        if (sortBy === 'score') return b.score - a.score;
        return offerA.price - offerB.price;
      });
  }, [comparisonGames, genre, isCatalogSearch, normalizedSearch, sortBy]);

  const visibleStatus = isCatalogSearch ? catalogStatus : status;
  const visibleError = isCatalogSearch ? catalogError : error;
  const statusText = isCatalogSearch
    ? `${catalogGames.length} resultados encontrados`
    : `${games.length} jogos carregados`;

  return (
    <section className="dg-section dg-comparison-section">
      <div className="dg-section-inner">
        <div className="dg-comparison-header">
          <div className="dg-comparison-copy">
            <p className="dg-kicker">Ofertas em destaque</p>
            <h2 className="dg-comparison-title">Compare jogos populares em varias lojas.</h2>
            <p className="dg-comparison-desc">
              Comece pelos titulos mais conhecidos e use os filtros para encontrar menor preco, maior desconto ou melhor avaliacao.
            </p>
          </div>
          <div className="dg-api-status">
            {visibleStatus === 'loading' && (isCatalogSearch ? 'Buscando no catalogo...' : 'Carregando ofertas...')}
            {visibleStatus === 'error' && visibleError}
            {visibleStatus === 'success' && statusText}
            <span>{isCatalogSearch ? 'CheapShark catalog search' : source}</span>
            {updatedAt && <span>Atualizado em {new Date(updatedAt).toLocaleString('pt-BR')}</span>}
          </div>
        </div>

        <div className="dg-filter-bar">
          <label className="block">
            <span className="sr-only">Buscar jogo</span>
            <input
              className="dg-field dg-field-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar qualquer jogo por nome, ex: Celeste, Doom, Zelda"
            />
          </label>
          <label className="block">
            <span className="sr-only">Filtrar por genero</span>
            <select className="dg-field" value={genre} onChange={(event) => setGenre(event.target.value)}>
              {genres.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="sr-only">Ordenar jogos</span>
            <select className="dg-field" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              {sortOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        {visibleStatus === 'loading' && (
          <div className="dg-comparison-grid">
            {[1, 2, 3, 4].map((item) => <div className="dg-skeleton-card" key={item} />)}
          </div>
        )}

        {visibleStatus === 'success' && (
          <div className="dg-comparison-grid">
            {filteredGames.map((game) => <ComparisonCard game={game} currency={currency} key={game.id || game.steamAppID || game.title} />)}
          </div>
        )}

        {visibleStatus === 'success' && filteredGames.length === 0 && (
          <div className="dg-empty-state">
            Nenhum jogo com ofertas foi encontrado na CheapShark para esta busca. Alguns titulos de consoles fechados podem nao aparecer em lojas de PC.
          </div>
        )}
      </div>
    </section>
  );
}

function ComparisonCard({ game, currency }) {
  const bestOffer = getBestOffer(game);
  const sortedPrices = [...game.prices].sort((a, b) => a.price - b.price);
  const imageSrc = game.image?.startsWith('http') ? game.image : `/img/${game.image}`;
  const detailUrl = game.id ? `/jogo?gameID=${encodeURIComponent(game.id)}` : getGameDetailUrl(game.title);

  return (
    <article className="dg-comparison-card">
      <div className="dg-comparison-image-wrap">
        <img src={imageSrc} alt={game.title} className="dg-comparison-image" />
      </div>
      <div className="dg-comparison-card-body">
        <div>
          <div className="dg-card-meta">
            <span className="dg-badge">{game.genre}</span>
            <span>{game.score ? `${game.score}/100` : 'Sem nota'}</span>
          </div>
          <h3 className="dg-comparison-game-title">{game.title}</h3>
        </div>

        <div className="dg-best-offer">
          <p>Melhor oferta</p>
          <div className="dg-best-offer-row">
            <div>
              <strong>{formatPrice(bestOffer.price, currency)}</strong>
              <span>{bestOffer.store} - {bestOffer.platform}</span>
            </div>
            {bestOffer.discount > 0 && <span className="dg-discount-badge">-{bestOffer.discount}%</span>}
          </div>
        </div>

        <div className="dg-price-list">
          {sortedPrices.map((offer) => (
            <div className="dg-price-list-row" key={`${game.id}-${offer.store}`}>
              <span>{offer.store}</span>
              <strong className={offer.price === bestOffer.price ? 'dg-best-price' : ''}>{formatPrice(offer.price, currency)}</strong>
            </div>
          ))}
        </div>
        <div className="dg-comparison-actions">
          <a className="dg-deal-link" href={detailUrl}>Detalhes</a>
          {bestOffer.dealUrl && <a className="dg-deal-link dg-deal-link--primary" href={bestOffer.dealUrl} target="_blank" rel="noreferrer">Ver oferta</a>}
        </div>
      </div>
    </article>
  );
}

function getGameDetailUrl(title) {
  return `/jogo?title=${encodeURIComponent(title.replace(/\.\.\.$/, '').trim())}`;
}

import { expandGameSearchQuery } from '../utils/gameSearch.js';

const CHEAPSHARK_API_URL = '/cheapshark/api/1.0';
const CHEAPSHARK_REDIRECT_URL = 'https://www.cheapshark.com/redirect';
const STEAM_STORE_URL = '/steam';
const CATALOG_SEARCH_CACHE_MS = 5 * 60 * 1000;
const catalogSearchCache = new Map();
let cheapSharkStoresCache = null;

async function readJsonResponse(response, fallbackMessage) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error(fallbackMessage);
  }

  try {
    return await response.json();
  } catch {
    throw new Error(fallbackMessage);
  }
}

export async function fetchGames() {
  try {
    const steamFeatured = await fetchSteamFeaturedCategories();
    const steamTopSellers = normalizeSteamCategory(steamFeatured?.top_sellers?.items || [], { limit: 36, category: 'top-seller' });
    const steamNewReleases = normalizeSteamCategory(steamFeatured?.new_releases?.items || [], { limit: 24, category: 'new-release' });
    const steamComingSoon = normalizeSteamCategory(steamFeatured?.coming_soon?.items || [], { limit: 24, category: 'coming-soon' });
    const steamCatalog = mergeSteamCategories([...steamTopSellers, ...steamNewReleases, ...steamComingSoon]);

    if (steamCatalog.length) {
      return {
        source: 'Steam Store - mais vendidos',
        updatedAt: new Date().toISOString(),
        currency: 'BRL',
        games: steamCatalog,
      };
    }

    const [stores, deals] = await Promise.all([
      fetchCheapSharkStores(),
      fetchCheapSharkDealsBySort('Reviews', { pageSize: '60' }),
    ]);

    return {
      source: 'CheapShark API - populares por reviews',
      updatedAt: new Date().toISOString(),
      currency: 'USD',
      games: normalizeCheapSharkDeals(deals, stores, { limit: 36, preserveApiOrder: true }),
    };
  } catch (error) {
    console.warn('CheapShark API unavailable, using local fallback.', error);
    return fetchLocalGamesFallback();
  }
}

export async function fetchGameDetails({ gameID, steamAppID, title } = {}) {
  if (steamAppID) {
    try {
      const cheapSharkGameID = await findCheapSharkGameIDBySteamAppID(steamAppID);
      if (cheapSharkGameID) return fetchAggregatedGameDetails(cheapSharkGameID);
    } catch {
      // Keep the internal game page available when CheapShark is rate-limited.
    }
    return fetchSteamGameDetails({ steamAppID, title });
  }

  const resolvedGameID = gameID || await findCheapSharkGameID(title);

  if (!resolvedGameID) {
    throw new Error('Jogo nao encontrado.');
  }

  return fetchAggregatedGameDetails(resolvedGameID);
}

async function fetchAggregatedGameDetails(resolvedGameID) {
  const [stores, cheapSharkGame] = await Promise.all([
    fetchCheapSharkStores(),
    fetchCheapSharkGame(resolvedGameID),
  ]);

  const game = normalizeCheapSharkGameLookup(resolvedGameID, cheapSharkGame, stores);
  const resolvedSteamAppID = game.steamAppID;

  let steamDetails = null;
  let steamReviews = null;

  if (resolvedSteamAppID) {
    const [detailsResult, reviewsResult] = await Promise.allSettled([
      fetchSteamDetails(resolvedSteamAppID),
      fetchSteamReviews(resolvedSteamAppID),
    ]);
    steamDetails = detailsResult.status === 'fulfilled' ? detailsResult.value : null;
    steamReviews = reviewsResult.status === 'fulfilled' ? reviewsResult.value : null;
  }

  return {
    source: 'CheapShark API + Steam',
    updatedAt: new Date().toISOString(),
    currency: 'USD',
    game: mergeSteamData(game, steamDetails, steamReviews),
  };
}

async function fetchSteamGameDetails({ steamAppID, title }) {
  const [detailsResult, reviewsResult] = await Promise.allSettled([
    fetchSteamDetails(steamAppID),
    fetchSteamReviews(steamAppID),
  ]);
  const steamDetails = detailsResult.status === 'fulfilled' ? detailsResult.value : null;
  const steamReviews = reviewsResult.status === 'fulfilled' ? reviewsResult.value : null;
  const comingSoon = Boolean(steamDetails?.release_date?.coming_soon);
  const priceOverview = steamDetails?.price_overview;
  const hasPublishedPrice = Boolean(priceOverview) || steamDetails?.is_free === true;
  const price = steamDetails?.is_free ? 0 : Number(priceOverview?.final || 0) / 100;
  const regularPrice = steamDetails?.is_free ? 0 : Number(priceOverview?.initial || priceOverview?.final || 0) / 100;
  const storeUrl = `https://store.steampowered.com/app/${encodeURIComponent(steamAppID)}`;
  const baseGame = {
    id: '',
    steamAppID: String(steamAppID),
    slug: `steam-${steamAppID}`,
    title: steamDetails?.name || title || 'Jogo da Steam',
    image: steamDetails?.header_image || `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamAppID}/header.jpg`,
    heroImage: steamDetails?.background_raw || steamDetails?.background || steamDetails?.header_image || `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamAppID}/header.jpg`,
    genre: comingSoon ? 'Em breve' : 'PC',
    tags: ['Steam Store'],
    score: 0,
    releaseDate: steamDetails?.release_date?.date || '',
    prices: [{
      store: 'Steam',
      storeID: '1',
      platform: 'PC',
      price,
      regularPrice,
      discount: Number(priceOverview?.discount_percent || 0),
      dealID: String(steamAppID),
      dealUrl: storeUrl,
      unavailable: !hasPublishedPrice,
    }],
    reviews: [],
    requirements: null,
    description: steamDetails?.short_description || 'A Steam ainda não disponibilizou informações completas para este jogo.',
    availability: {
      status: comingSoon ? 'coming-soon' : (!steamDetails || !steamReviews?.query_summary?.total_reviews ? 'limited' : 'available'),
      releaseDate: steamDetails?.release_date?.date || '',
      hasPublishedPrice,
    },
  };

  return {
    source: 'Steam Store',
    updatedAt: new Date().toISOString(),
    currency: steamDetails?.price_overview?.currency || 'BRL',
    game: mergeSteamData(baseGame, steamDetails, steamReviews),
  };
}

export async function searchGamesByTitle(title) {
  const cleanedTitle = expandGameSearchQuery(title);
  if (!cleanedTitle || cleanedTitle.length < 2) {
    return {
      source: 'CheapShark API',
      updatedAt: new Date().toISOString(),
      currency: 'USD',
      games: [],
    };
  }

  const cacheKey = cleanedTitle.toLowerCase();
  const cached = catalogSearchCache.get(cacheKey);
  if (cached?.expiresAt > Date.now()) return cached.payload;

  let payload;
  try {
    const [stores, deals] = await Promise.all([
      fetchCheapSharkStores(),
      fetchCheapSharkDealsByTitle(cleanedTitle),
    ]);
    const games = normalizeCheapSharkDeals(deals, stores, { limit: 24, preserveApiOrder: true });
    if (!games.length) throw new Error('A CheapShark não retornou ofertas para esta busca.');
    payload = {
      source: 'CheapShark catalog search',
      updatedAt: new Date().toISOString(),
      currency: 'USD',
      resolvedQuery: cleanedTitle,
      games,
    };
  } catch (cheapSharkError) {
    const games = await searchSteamStore(cleanedTitle);
    if (!games.length) throw cheapSharkError;
    payload = {
      source: 'Steam Store search',
      updatedAt: new Date().toISOString(),
      currency: 'BRL',
      resolvedQuery: cleanedTitle,
      games,
    };
  }
  catalogSearchCache.set(cacheKey, { payload, expiresAt: Date.now() + CATALOG_SEARCH_CACHE_MS });
  return payload;
}

async function fetchCheapSharkStores() {
  if (cheapSharkStoresCache?.expiresAt > Date.now()) return cheapSharkStoresCache.stores;

  const response = await fetch(`${CHEAPSHARK_API_URL}/stores`);

  if (!response.ok) {
    throw new Error('Nao foi possivel carregar as lojas da CheapShark.');
  }

  const stores = await readJsonResponse(response, 'A CheapShark retornou uma resposta inválida ao carregar as lojas.');

  const normalizedStores = stores.reduce((acc, store) => {
    acc[store.storeID] = {
      id: store.storeID,
      name: store.storeName,
      isActive: store.isActive === 1 || store.isActive === '1',
      iconUrl: store.images?.icon ? `https://www.cheapshark.com${store.images.icon}` : '',
      logoUrl: store.images?.logo ? `https://www.cheapshark.com${store.images.logo}` : '',
    };

    return acc;
  }, {});
  cheapSharkStoresCache = { stores: normalizedStores, expiresAt: Date.now() + CATALOG_SEARCH_CACHE_MS };
  return normalizedStores;
}

async function fetchCheapSharkDealsByTitle(title) {
  const params = new URLSearchParams({
    title,
    pageNumber: '0',
    pageSize: '60',
    sortBy: 'Deal Rating',
    desc: '1',
  });
  const response = await fetch(`${CHEAPSHARK_API_URL}/deals?${params.toString()}`);
  if (!response.ok) {
    if (response.status === 429) throw new Error('A busca atingiu o limite temporário da CheapShark. Aguarde alguns minutos e tente novamente.');
    throw new Error('Nao foi possivel buscar jogos na CheapShark.');
  }
  return readJsonResponse(response, 'A busca deste jogo retornou dados inválidos.');
}

async function searchSteamStore(title) {
  const params = new URLSearchParams({ term: title, l: 'brazilian', cc: 'BR' });
  const response = await fetch(`${STEAM_STORE_URL}/api/storesearch/?${params.toString()}`);
  if (!response.ok) return [];
  const payload = await readJsonResponse(response, 'A Steam retornou dados inválidos para esta busca.');
  return (payload.items || []).filter((item) => item?.type === 'app' && item?.id && item?.name).map((item, index) => {
    const finalPrice = Number(item.price?.final || 0) / 100;
    const regularPrice = Number(item.price?.initial || item.price?.final || 0) / 100;
    return {
      id: '',
      steamAppID: String(item.id),
      slug: `steam-${item.id}`,
      title: item.name,
      image: item.tiny_image || `https://cdn.cloudflare.steamstatic.com/steam/apps/${item.id}/header.jpg`,
      heroImage: item.tiny_image || `https://cdn.cloudflare.steamstatic.com/steam/apps/${item.id}/header.jpg`,
      genre: 'PC',
      tags: ['Steam Store'],
      score: Number(item.metascore || 0),
      popularityRank: index + 1,
      prices: [{
        store: 'Steam',
        storeID: '1',
        platform: 'PC',
        price: finalPrice,
        regularPrice,
        discount: regularPrice > 0 ? Math.round(((regularPrice - finalPrice) / regularPrice) * 100) : 0,
        dealID: String(item.id),
        dealUrl: `https://store.steampowered.com/app/${item.id}`,
        unavailable: !item.price,
      }],
      reviews: [],
      requirements: null,
      description: 'Resultado encontrado diretamente no catálogo da Steam Store.',
    };
  });
}

async function fetchCheapSharkDealsBySort(sortBy, options = {}) {
  const params = new URLSearchParams({
    pageNumber: '0',
    pageSize: options.pageSize || '24',
    sortBy,
    desc: '1',
  });

  if (options.onSale) params.set('onSale', options.onSale);

  const response = await fetch(`${CHEAPSHARK_API_URL}/deals?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Nao foi possivel carregar jogos por ${sortBy} na CheapShark.`);
  }

  return readJsonResponse(response, 'A CheapShark retornou dados inválidos para esta lista.');
}

async function fetchSteamFeaturedCategories() {
  const params = new URLSearchParams({
    cc: 'br',
    l: 'brazilian',
  });
  const response = await fetch(`${STEAM_STORE_URL}/api/featuredcategories?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Nao foi possivel carregar os mais vendidos da Steam.');
  }

  return readJsonResponse(response, 'A Steam retornou dados inválidos para os destaques.');
}

async function fetchCheapSharkGame(gameID) {
  const response = await fetch(`${CHEAPSHARK_API_URL}/games?id=${encodeURIComponent(gameID)}`);

  if (!response.ok) {
    throw new Error('Nao foi possivel carregar os detalhes do jogo na CheapShark.');
  }

  return readJsonResponse(response, 'Os detalhes deste jogo ainda não estão disponíveis.');
}

async function findCheapSharkGameID(title) {
  if (!title) return '';

  const cleanedTitle = title.replace(/[™®]/g, '').replace(/\.\.\.$/, '').trim();
  const params = new URLSearchParams({
    title: cleanedTitle,
    limit: '1',
  });

  const response = await fetch(`${CHEAPSHARK_API_URL}/games?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Nao foi possivel buscar o jogo na CheapShark.');
  }

  const games = await readJsonResponse(response, 'Não foi possível interpretar os dados deste jogo.');
  return games?.[0]?.gameID || '';
}

async function findCheapSharkGameIDBySteamAppID(steamAppID) {
  const params = new URLSearchParams({ steamAppID: String(steamAppID) });
  const response = await fetch(`${CHEAPSHARK_API_URL}/games?${params.toString()}`);
  if (!response.ok) throw new Error('Nao foi possivel localizar este jogo no comparador.');
  const games = await readJsonResponse(response, 'O comparador retornou dados inválidos para este jogo.');
  return games?.[0]?.gameID || '';
}

async function fetchSteamDetails(steamAppID) {
  const params = new URLSearchParams({
    appids: steamAppID,
    l: 'brazilian',
  });

  const response = await fetch(`${STEAM_STORE_URL}/api/appdetails?${params.toString()}`);

  if (!response.ok) return null;

  const payload = await readJsonResponse(response, 'A Steam ainda não disponibilizou os detalhes deste jogo.');
  const appPayload = payload?.[steamAppID];

  return appPayload?.success ? appPayload.data : null;
}

async function fetchSteamReviews(steamAppID) {
  const params = new URLSearchParams({
    json: '1',
    language: 'brazilian,english',
    purchase_type: 'all',
    num_per_page: '6',
    filter: 'recent',
  });

  const response = await fetch(`${STEAM_STORE_URL}/appreviews/${steamAppID}?${params.toString()}`);

  if (!response.ok) return null;

  return readJsonResponse(response, 'As avaliações deste jogo ainda não estão disponíveis.');
}

async function fetchLocalGamesFallback() {
  const response = await fetch('/api/games.json');

  if (!response.ok) {
    throw new Error('Nao foi possivel carregar os dados de jogos.');
  }

  const payload = await response.json();
  return {
    ...payload,
    source: payload.source || 'DropGames local fallback',
    currency: payload.currency || 'BRL',
    games: Array.isArray(payload.games) ? payload.games : [],
  };
}

function normalizeCheapSharkDeals(deals, stores, options = {}) {
  const dealOrder = new Map();
  const groupedDeals = deals.reduce((acc, deal) => {
    const gameID = deal.gameID || deal.dealID;
    if (!dealOrder.has(gameID)) dealOrder.set(gameID, dealOrder.size + 1);
    if (!acc[gameID]) {
      acc[gameID] = {
        id: gameID,
        slug: deal.internalName?.toLowerCase() || gameID,
        title: deal.title,
        image: deal.thumb,
        genre: getDealGenre(deal),
        score: Number(deal.metacriticScore) || Number(deal.steamRatingPercent) || Math.round(Number(deal.dealRating || 0) * 10),
        tags: [
          deal.steamRatingText,
          deal.metacriticScore && `Metacritic ${deal.metacriticScore}`,
          deal.isOnSale === '1' && 'Em promocao',
        ].filter(Boolean),
        steamRatingText: deal.steamRatingText || 'Sem avaliacao Steam',
        steamRatingPercent: Number(deal.steamRatingPercent) || 0,
        metacriticScore: Number(deal.metacriticScore) || 0,
        dealRating: Number(deal.dealRating) || 0,
        popularityRank: dealOrder.get(gameID),
        releaseDate: deal.releaseDate ? new Date(Number(deal.releaseDate) * 1000).toISOString() : '',
        prices: [],
      };
    }

    const store = stores[deal.storeID];

    acc[gameID].prices.push({
      store: store?.name || `Loja ${deal.storeID}`,
      storeID: deal.storeID,
      storeLogoUrl: store?.logoUrl || '',
      storeIconUrl: store?.iconUrl || '',
      platform: 'PC',
      price: Number(deal.salePrice),
      regularPrice: Number(deal.normalPrice),
      discount: Math.round(Number(deal.savings) || 0),
      dealID: deal.dealID,
      dealUrl: `${CHEAPSHARK_REDIRECT_URL}?dealID=${deal.dealID}`,
    });

    return acc;
  }, {});

  const normalized = Object.values(groupedDeals).filter((game) => game.prices.length > 0);

  if (options.preserveApiOrder) {
    return normalized
      .sort((a, b) => a.popularityRank - b.popularityRank)
      .slice(0, options.limit || 24);
  }

  return normalized
    .sort((a, b) => getBestOffer(a).price - getBestOffer(b).price)
    .slice(0, options.limit || 24);
}

function normalizeSteamCategory(items, options = {}) {
  return items
    .filter((item) => item?.id && item?.name && (item.large_capsule_image || item.header_image || item.small_capsule_image))
    .map((item, index) => {
      const finalPrice = Number(item.final_price || 0) / 100;
      const originalPrice = Number(item.original_price || item.final_price || 0) / 100;

      return {
        id: '',
        steamAppID: item.id,
        slug: `steam-${item.id}`,
        title: item.name,
        image: item.large_capsule_image || item.header_image || item.small_capsule_image,
        heroImage: item.large_capsule_image || item.header_image || item.small_capsule_image,
        genre: options.category === 'coming-soon' ? 'Em breve' : options.category === 'new-release' ? 'Novo lançamento' : 'Mais vendido',
        tags: ['Steam Store', options.category || 'top-seller'],
        merchandisingCategories: [options.category || 'top-seller'],
        score: Number(item.review_score || 0),
        steamRatingPercent: Number(item.review_score || 0),
        steamRatingText: item.review_desc || 'Steam Store',
        popularityRank: index + 1,
        releaseDate: '',
        prices: [
          {
            store: 'Steam',
            storeID: '1',
            platform: 'PC',
            price: finalPrice,
            regularPrice: originalPrice,
            discount: Number(item.discount_percent || 0),
            dealID: String(item.id),
            dealUrl: `https://store.steampowered.com/app/${item.id}`,
          },
        ],
        reviews: [],
        requirements: null,
        description: 'Jogo em destaque entre os mais vendidos da Steam Store.',
      };
    })
    .slice(0, options.limit || 24);
}

function mergeSteamCategories(games) {
  const merged = new Map();

  games.forEach((game) => {
    const key = String(game.steamAppID || game.title).toLowerCase();
    const current = merged.get(key);
    if (!current) {
      merged.set(key, game);
      return;
    }

    current.merchandisingCategories = [...new Set([
      ...(current.merchandisingCategories || []),
      ...(game.merchandisingCategories || []),
    ])];
    current.tags = [...new Set([...(current.tags || []), ...(game.tags || [])])];
  });

  return [...merged.values()];
}

function normalizeCheapSharkGameLookup(gameID, payload, stores) {
  const info = payload.info || {};
  const deals = Array.isArray(payload.deals) ? payload.deals : [];
  const prices = deals.map((deal) => {
    const store = stores[deal.storeID];
    const price = Number(deal.price);
    const regularPrice = Number(deal.retailPrice);

    return {
      store: store?.name || `Loja ${deal.storeID}`,
      storeID: deal.storeID,
      storeLogoUrl: store?.logoUrl || '',
      storeIconUrl: store?.iconUrl || '',
      platform: 'PC',
      price,
      regularPrice,
      discount: regularPrice > 0 ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0,
      dealID: deal.dealID,
      dealUrl: `${CHEAPSHARK_REDIRECT_URL}?dealID=${deal.dealID}`,
    };
  });

  return {
    id: gameID,
    slug: String(gameID),
    title: info.title || 'Jogo',
    image: info.thumb || '',
    heroImage: info.thumb || '',
    genre: 'PC',
    tags: ['PC', 'Comparador', 'CheapShark'],
    score: 0,
    steamAppID: info.steamAppID,
    cheapestPriceEver: payload.cheapestPriceEver
      ? {
          price: Number(payload.cheapestPriceEver.price),
          date: payload.cheapestPriceEver.date ? new Date(Number(payload.cheapestPriceEver.date) * 1000).toISOString() : '',
        }
      : null,
    prices,
    reviews: [],
    requirements: null,
    description: '',
  };
}

function mergeSteamData(game, steamDetails, steamReviews) {
  const summary = steamReviews?.query_summary;
  const reviewScore = Number(summary?.review_score) || 0;
  const reviewPercent = Number(summary?.total_positive) && Number(summary?.total_reviews)
    ? Math.round((Number(summary.total_positive) / Number(summary.total_reviews)) * 100)
    : 0;

  return {
    ...game,
    title: steamDetails?.name || game.title,
    image: steamDetails?.header_image || game.image,
    heroImage: steamDetails?.background_raw || steamDetails?.header_image || game.heroImage || game.image,
    description: steamDetails?.short_description || 'Compare as ofertas disponiveis e escolha a loja com melhor vantagem para comprar.',
    genre: steamDetails?.genres?.[0]?.description || game.genre,
    tags: [
      ...(steamDetails?.genres || []).slice(0, 3).map((genre) => genre.description),
      ...(steamDetails?.developers || []).slice(0, 1),
    ].filter(Boolean),
    score: reviewPercent || reviewScore * 10 || game.score,
    steamRatingText: summary?.review_score_desc || game.steamRatingText || 'Sem resumo Steam',
    steamRatingPercent: reviewPercent || game.steamRatingPercent || 0,
    steamRatingCount: Number(summary?.total_reviews) || game.steamRatingCount || 0,
    reviews: normalizeSteamReviews(steamReviews?.reviews || []),
    requirements: normalizeSteamRequirements(steamDetails?.pc_requirements),
    screenshots: (steamDetails?.screenshots || []).slice(0, 4).map((screenshot) => screenshot.path_thumbnail),
    publishers: steamDetails?.publishers || [],
    developers: steamDetails?.developers || [],
  };
}

function normalizeSteamReviews(reviews) {
  return reviews.map((review) => ({
    id: review.recommendationid,
    author: review.author?.personaname || `Usuario Steam ${review.author?.steamid?.slice(-4) || ''}`.trim(),
    avatarUrl: review.author?.avatar ? `https://avatars.steamstatic.com/${review.author.avatar}_medium.jpg` : '',
    profileUrl: review.author?.profile_url || '',
    votedUp: Boolean(review.voted_up),
    playtimeHours: Math.round((Number(review.author?.playtime_forever) || 0) / 60),
    text: review.review,
    createdAt: review.timestamp_created ? new Date(Number(review.timestamp_created) * 1000).toISOString() : '',
  }));
}

function normalizeSteamRequirements(requirements) {
  if (!requirements) return null;

  return {
    minimum: cleanRequirementText(requirements.minimum),
    recommended: cleanRequirementText(requirements.recommended),
  };
}

function cleanRequirementText(value = '') {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function getDealGenre(deal) {
  if (Number(deal.steamRatingPercent) >= 85) return 'Bem avaliado';
  if (Number(deal.savings) >= 75) return 'Grande oferta';
  if (deal.isOnSale === '1') return 'Promocao';
  return 'PC';
}

export function getBestOffer(game) {
  return [...game.prices].sort((a, b) => a.price - b.price)[0];
}

export function formatPrice(value, currency = 'USD') {
  if (value === 0) return 'Gratuito';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
}

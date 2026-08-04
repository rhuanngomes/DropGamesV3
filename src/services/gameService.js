const CHEAPSHARK_API_URL = '/cheapshark/api/1.0';
const CHEAPSHARK_REDIRECT_URL = 'https://www.cheapshark.com/redirect';
const STEAM_STORE_URL = '/steam';

export async function fetchGames() {
  try {
    const steamFeatured = await fetchSteamFeaturedCategories();
    const steamTopSellers = normalizeSteamCategory(steamFeatured?.top_sellers?.items || [], { limit: 36 });

    if (steamTopSellers.length) {
      return {
        source: 'Steam Store - mais vendidos',
        updatedAt: new Date().toISOString(),
        currency: 'BRL',
        games: steamTopSellers,
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

export async function fetchGameDetails({ gameID, title } = {}) {
  const resolvedGameID = gameID || await findCheapSharkGameID(title);

  if (!resolvedGameID) {
    throw new Error('Jogo nao encontrado.');
  }

  const [stores, cheapSharkGame] = await Promise.all([
    fetchCheapSharkStores(),
    fetchCheapSharkGame(resolvedGameID),
  ]);

  const game = normalizeCheapSharkGameLookup(resolvedGameID, cheapSharkGame, stores);
  const steamAppID = game.steamAppID;

  const [steamDetails, steamReviews] = steamAppID
    ? await Promise.all([
        fetchSteamDetails(steamAppID),
        fetchSteamReviews(steamAppID),
      ])
    : [null, null];

  return {
    source: 'CheapShark API + Steam',
    updatedAt: new Date().toISOString(),
    currency: 'USD',
    game: mergeSteamData(game, steamDetails, steamReviews),
  };
}

export async function searchGamesByTitle(title) {
  const cleanedTitle = title?.replace(/[™®]/g, '').trim();
  if (!cleanedTitle || cleanedTitle.length < 2) {
    return {
      source: 'CheapShark API',
      updatedAt: new Date().toISOString(),
      currency: 'USD',
      games: [],
    };
  }

  const [stores, searchResults] = await Promise.all([
    fetchCheapSharkStores(),
    searchCheapSharkGames(cleanedTitle),
  ]);

  const detailResults = await Promise.allSettled(
    searchResults.slice(0, 12).map((game) => fetchCheapSharkGame(game.gameID)),
  );

  const games = detailResults
    .map((result, index) => {
      if (result.status !== 'fulfilled') return null;
      const searchResult = searchResults[index];
      const normalized = normalizeCheapSharkGameLookup(searchResult.gameID, result.value, stores);

      return {
        ...normalized,
        title: normalized.title || searchResult.external,
        image: normalized.image || searchResult.thumb,
        heroImage: normalized.heroImage || searchResult.thumb,
      };
    })
    .filter((game) => game?.prices?.length > 0)
    .sort((a, b) => getBestOffer(a).price - getBestOffer(b).price);

  return {
    source: 'CheapShark catalog search',
    updatedAt: new Date().toISOString(),
    currency: 'USD',
    games,
  };
}

async function fetchCheapSharkStores() {
  const response = await fetch(`${CHEAPSHARK_API_URL}/stores`);

  if (!response.ok) {
    throw new Error('Nao foi possivel carregar as lojas da CheapShark.');
  }

  const stores = await response.json();

  return stores.reduce((acc, store) => {
    acc[store.storeID] = {
      id: store.storeID,
      name: store.storeName,
      isActive: store.isActive === 1 || store.isActive === '1',
      iconUrl: store.images?.icon ? `https://www.cheapshark.com${store.images.icon}` : '',
      logoUrl: store.images?.logo ? `https://www.cheapshark.com${store.images.logo}` : '',
    };

    return acc;
  }, {});
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

  return response.json();
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

  return response.json();
}

async function fetchCheapSharkGame(gameID) {
  const response = await fetch(`${CHEAPSHARK_API_URL}/games?id=${encodeURIComponent(gameID)}`);

  if (!response.ok) {
    throw new Error('Nao foi possivel carregar os detalhes do jogo na CheapShark.');
  }

  return response.json();
}

async function searchCheapSharkGames(title, limit = '24') {
  const params = new URLSearchParams({
    title,
    limit,
  });

  const response = await fetch(`${CHEAPSHARK_API_URL}/games?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Nao foi possivel buscar jogos na CheapShark.');
  }

  return response.json();
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

  const games = await response.json();
  return games?.[0]?.gameID || '';
}

async function fetchSteamDetails(steamAppID) {
  const params = new URLSearchParams({
    appids: steamAppID,
    l: 'brazilian',
  });

  const response = await fetch(`${STEAM_STORE_URL}/api/appdetails?${params.toString()}`);

  if (!response.ok) return null;

  const payload = await response.json();
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

  return response.json();
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
        genre: 'Mais vendido',
        tags: ['Steam Store', 'Mais vendido'],
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

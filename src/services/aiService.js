import { formatPrice, getBestOffer } from './gameService.js';

const MARKET_TAGS = {
  rpg: ['rpg', 'role-playing', 'mundo aberto', 'open world', 'aventura', 'adventure', 'skyrim', 'elden', 'witcher'],
  competitive: ['competitive', 'competitivo', 'multiplayer', 'online', 'pvp', 'fps', 'battle royale', 'counter-strike', 'dota', 'apex'],
  horror: ['horror', 'terror', 'survival', 'resident evil', 'zombie'],
  action: ['action', 'acao', 'aventura', 'shooter', 'souls', 'nioh'],
  indie: ['indie', 'roguelike', 'pixel', 'platformer', 'celeste', 'hollow knight', 'hades'],
  racing: ['racing', 'corrida', 'ride', 'motogp', 'forza'],
};

export function analyzeGamePurchase(game, meta = {}) {
  const prices = Array.isArray(game?.prices) ? game.prices.filter((offer) => Number.isFinite(Number(offer.price))) : [];
  const bestOffer = prices.length ? getBestOffer({ ...game, prices }) : null;
  const discount = Math.max(...prices.map((offer) => Number(offer.discount) || 0), 0);
  const rating = Number(game?.steamRatingPercent || game?.score || 0);
  const reviewCount = Number(game?.steamRatingCount || 0);
  const historicLow = Number(game?.cheapestPriceEver?.price || 0);
  const bestPrice = Number(bestOffer?.price || 0);
  const storeCount = new Set(prices.map((offer) => offer.storeID || offer.store)).size;
  const pricePosition = getPricePosition(bestPrice, historicLow);
  const tags = normalizeText([game?.title, game?.genre, ...(game?.tags || [])].join(' '));
  const segments = detectSegments(tags);
  const reviewSignal = getReviewSignal(rating, reviewCount);
  const priceSignal = getPriceSignal(bestPrice, discount, pricePosition);
  const availabilitySignal = getAvailabilitySignal(storeCount);
  const requirementSignal = game?.requirements?.minimum || game?.requirements?.recommended
    ? 'Requisitos tecnicos encontrados para reduzir duvida antes da compra.'
    : 'Requisitos nao retornados pela loja; mostrar esse aviso evita expectativa errada.';
  const risks = buildRiskRadar({ rating, reviewCount, storeCount, pricePosition, hasRequirements: Boolean(game?.requirements) });
  const score = clamp(
    42
      + Math.min(discount, 80) * 0.28
      + Math.min(rating, 100) * 0.22
      + Math.min(storeCount, 6) * 3
      + (pricePosition === 'historic-low' ? 12 : 0)
      + (pricePosition === 'above-history' ? -10 : 0)
      + (reviewCount > 1000 ? 6 : 0)
      - risks.length * 2,
    12,
    96,
  );
  const verdict = getVerdict(score, discount, pricePosition, rating);
  const currency = meta.currency || 'USD';

  return {
    score,
    verdict,
    summary: buildSummary({ game, bestOffer, score, verdict, discount, rating, pricePosition, currency }),
    signals: [
      { label: 'Preco', value: priceSignal },
      { label: 'Reviews', value: reviewSignal },
      { label: 'Lojas', value: availabilitySignal },
      { label: 'Sistema', value: requirementSignal },
    ],
    risks,
    segments,
    reviewSummary: summarizeReviews(game?.reviews || [], rating),
    storefront: buildStorefrontInsights({ game, bestOffer, discount, rating, pricePosition, segments, currency }),
  };
}

export function getGameYouthSafety(game) {
  const text = normalizeText([game?.title, game?.genre, game?.description, ...(game?.tags || [])].join(' '));
  const hasViolence = matchesAny(text, ['violence', 'violent', 'gore', 'blood', 'mature', 'zombie', 'terror', 'horror', 'survival', 'resident evil']);
  const hasOnlineInteraction = matchesAny(text, ['online', 'multiplayer', 'battle royale', 'pvp', 'co-op', 'cooperative', 'competitivo']);
  const hasMicrotransactionRisk = matchesAny(text, ['fortnite', 'free to play', 'gratuito', 'battle pass', 'season', 'v-bucks', 'microtransaction']);
  const hasCompulsiveRisk = matchesAny(text, ['ranked', 'competitivo', 'battle royale', 'live service', 'temporada', 'season']);
  const minimumAge = hasViolence ? 18 : hasOnlineInteraction || hasMicrotransactionRisk ? 13 : 10;
  const label = minimumAge >= 18 ? '18+' : minimumAge >= 13 ? '13+' : '10+';
  const warnings = [
    hasViolence && 'Pode conter violencia, terror ou temas maduros.',
    hasOnlineInteraction && 'Pode envolver interacao online entre usuarios.',
    hasMicrotransactionRisk && 'Pode envolver compras digitais, passes, moedas virtuais ou itens pagos.',
    hasCompulsiveRisk && 'Pode estimular recorrencia intensa por ranking, temporada ou recompensas.',
  ].filter(Boolean);

  return {
    label,
    minimumAge,
    isRestrictedForYouth: minimumAge >= 18,
    warnings: warnings.length ? warnings : ['Sem sinais fortes de risco etario nos dados disponiveis.'],
    policy: 'Classificacao estimada pelo DropGames a partir dos dados publicos do jogo. Em producao, deve ser substituida ou confirmada por classificacao indicativa oficial.',
  };
}

export function generateGamerAiInsights(profile, demoProfile) {
  const topGames = profile?.topGames || [];
  const recentGames = profile?.recentlyPlayed || [];
  const allNames = [...topGames, ...recentGames].map((game) => game.name).join(' ');
  const segments = detectSegments(normalizeText([allNames, demoProfile?.description].join(' ')));
  const totalHours = Number(profile?.totalHours || 0);
  const playedRatio = profile?.totalGames ? Math.round((Number(profile.playedGames || 0) / profile.totalGames) * 100) : 0;
  const retentionRisk = getRetentionRisk(totalHours, playedRatio, recentGames.length);
  const primarySegment = segments[0] || 'Explorador PC';

  return {
    primarySegment,
    matchScore: clamp(48 + Math.min(totalHours / 20, 24) + Math.min(playedRatio / 2, 20) + recentGames.length * 2, 20, 96),
    cards: [
      {
        title: 'DNA gamer',
        text: demoProfile?.description || `Perfil com tendencia para ${primarySegment.toLowerCase()}, calculado a partir de biblioteca, horas e recorrencia.`,
      },
      {
        title: 'Risco de abandono',
        text: retentionRisk,
      },
      {
        title: 'Uso B2B',
        text: 'A loja pode vender campanhas por segmento anonimo: match alto, desconto ideal e chance de jogo ser aproveitado apos a compra.',
      },
      {
        title: 'Vitrine recomendada',
        text: buildShelfStrategy(primarySegment, totalHours, playedRatio),
      },
    ],
  };
}

export function answerGameQuestion(questionId, insights, game) {
  const title = game?.title || 'este jogo';
  const firstRisk = insights.risks[0] || 'Nenhum risco forte detectado com os dados atuais.';
  const firstSegment = insights.segments[0] || 'jogadores de PC que comparam preco antes de comprar';

  const answers = {
    buy: `${insights.verdict}. ${insights.summary}`,
    audience: `${title} combina melhor com ${firstSegment.toLowerCase()}. Para a loja, esse segmento deve receber uma mensagem direta, com preco, prova social e vantagem da melhor oferta.`,
    risk: `Principal ponto de atencao: ${firstRisk} A recomendacao segura e mostrar o dado com transparencia e evitar promessa que a API ainda nao sustenta.`,
    business: `${insights.storefront.copySuggestion} Oportunidade B2B: usar esse score para ordenar vitrines, campanhas e bundles sem expor dados individuais do jogador.`,
  };

  return answers[questionId] || answers.buy;
}

export async function generateGameAiResponse({ question, game, insights, meta }) {
  const payload = {
    question,
    currency: meta?.currency || 'USD',
    game: buildGameContext(game),
    insights: buildInsightContext(insights),
  };

  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Nao foi possivel conversar com a IA generativa.');
  }

  return data.answer;
}

export async function generateSecurityAiResponse({ question, securityAnalysis }) {
  const payload = {
    question,
    security: securityAnalysis,
    insights: {
      summary: securityAnalysis?.summary,
      risks: securityAnalysis?.findings?.map((finding) => finding.text) || [],
    },
  };

  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.safeFallback || data.error || 'Nao foi possivel analisar seguranca com IA.');
  }

  return data.answer;
}

function buildSummary({ game, bestOffer, score, verdict, discount, rating, pricePosition, currency }) {
  const priceText = bestOffer ? `${formatPrice(bestOffer.price, currency)} na ${bestOffer.store}` : 'sem oferta disponivel';
  const discountText = discount > 0 ? `com ${discount}% de desconto` : 'sem desconto relevante';
  const ratingText = rating ? `e ${rating}% de aprovacao` : 'e poucos dados publicos de reviews';
  const historyText = pricePosition === 'historic-low'
    ? 'O preco atual esta muito perto do menor historico.'
    : pricePosition === 'above-history'
      ? 'O preco atual esta acima do menor historico conhecido.'
      : 'O preco atual esta em uma faixa aceitavel frente ao historico.';

  return `${verdict} para ${game?.title || 'o jogo'}: melhor oferta em ${priceText}, ${discountText}, ${ratingText}. ${historyText} Score da IA: ${score}/100.`;
}

function buildGameContext(game) {
  const prices = Array.isArray(game?.prices) ? game.prices : [];

  return {
    title: game?.title,
    genre: game?.genre,
    tags: game?.tags,
    description: game?.description,
    steamRatingText: game?.steamRatingText,
    steamRatingPercent: game?.steamRatingPercent,
    steamRatingCount: game?.steamRatingCount,
    cheapestPriceEver: game?.cheapestPriceEver,
    youthSafety: getGameYouthSafety(game),
    requirements: game?.requirements,
    prices: prices.slice(0, 8).map((offer) => ({
      store: offer.store,
      price: offer.price,
      regularPrice: offer.regularPrice,
      discount: offer.discount,
      platform: offer.platform,
    })),
    reviews: (game?.reviews || []).slice(0, 4).map((review) => ({
      author: review.author,
      votedUp: review.votedUp,
      playtimeHours: review.playtimeHours,
      text: String(review.text || '').slice(0, 420),
    })),
  };
}

function buildInsightContext(insights) {
  return {
    score: insights.score,
    verdict: insights.verdict,
    summary: insights.summary,
    signals: insights.signals,
    risks: insights.risks,
    segments: insights.segments,
    reviewSummary: insights.reviewSummary,
    storefront: insights.storefront,
  };
}

function buildStorefrontInsights({ game, bestOffer, discount, rating, pricePosition, segments, currency }) {
  const bestPrice = bestOffer ? formatPrice(bestOffer.price, currency) : 'preco indisponivel';
  const segment = segments[0] || 'Jogadores sensiveis a preco';
  const promoStrategy = discount >= 60
    ? 'Manter destaque de campanha enquanto o desconto estiver ativo.'
    : pricePosition === 'above-history'
      ? 'Esperar ou negociar uma promocao mais agressiva antes de empurrar como destaque.'
      : 'Testar desconto medio e comparar conversao com jogos similares.';

  return {
    targetSegments: segments.length ? segments : ['Jogadores de PC', 'Comparadores de preco'],
    promoStrategy,
    copySuggestion: `${game?.title || 'Este jogo'} deve ser apresentado para ${segment.toLowerCase()} com chamada de melhor preco (${bestPrice}), prova social (${rating || 'sem'}% positivas) e comparacao clara entre lojas.`,
  };
}

function summarizeReviews(reviews, rating) {
  if (!reviews.length) {
    return rating
      ? `A Steam informa ${rating}% de aprovacao, mas nao retornou reviews textuais suficientes para resumir comentarios.`
      : 'Sem reviews textuais suficientes. A IA evita inferir sentimento sem base.';
  }

  const positive = reviews.filter((review) => review.votedUp).length;
  const negative = reviews.length - positive;
  const avgPlaytime = Math.round(reviews.reduce((total, review) => total + Number(review.playtimeHours || 0), 0) / reviews.length);

  return `${positive} de ${reviews.length} reviews recentes recomendam o jogo. Tempo medio dos autores: ${avgPlaytime}h. ${negative > 0 ? 'Ha sinais mistos que merecem leitura antes da compra.' : 'A amostra textual recente e majoritariamente positiva.'}`;
}

function buildRiskRadar({ rating, reviewCount, storeCount, pricePosition, hasRequirements }) {
  const risks = [];

  if (!rating || reviewCount < 100) risks.push('Base de reviews pequena ou indisponivel.');
  if (rating > 0 && rating < 70) risks.push('Aprovacao abaixo do ideal para recomendar sem contexto.');
  if (storeCount <= 1) risks.push('Poucas lojas comparadas, reduzindo confianca no melhor preco.');
  if (pricePosition === 'above-history') risks.push('Preco atual acima do menor historico conhecido.');
  if (!hasRequirements) risks.push('Requisitos de sistema nao foram encontrados automaticamente.');

  return risks.length ? risks : ['Dados atuais indicam baixo risco comercial para destacar a oferta.'];
}

function getPricePosition(bestPrice, historicLow) {
  if (!bestPrice || !historicLow) return 'unknown';
  if (bestPrice <= historicLow * 1.08) return 'historic-low';
  if (bestPrice >= historicLow * 1.35) return 'above-history';
  return 'normal';
}

function getPriceSignal(bestPrice, discount, pricePosition) {
  if (!bestPrice) return 'Sem preco confiavel para recomendar.';
  if (discount >= 70) return 'Desconto agressivo, bom para vitrine principal.';
  if (pricePosition === 'historic-low') return 'Muito proximo do menor historico conhecido.';
  if (pricePosition === 'above-history') return 'Pode valer esperar uma promocao melhor.';
  return 'Preco competitivo, mas nao extraordinario.';
}

function getReviewSignal(rating, reviewCount) {
  if (!rating) return 'Sem avaliacao suficiente para inferir sentimento.';
  if (rating >= 85 && reviewCount >= 1000) return 'Forte prova social, com volume relevante de reviews.';
  if (rating >= 75) return 'Recepcao positiva, boa para recomendacao com contexto.';
  if (rating >= 60) return 'Recepcao mista; recomendar para nichos certos.';
  return 'Recepcao fraca; exige cautela na vitrine.';
}

function getAvailabilitySignal(storeCount) {
  if (storeCount >= 5) return 'Boa competicao entre lojas, comparacao mais convincente.';
  if (storeCount >= 2) return 'Comparacao util, mas ainda com mercado limitado.';
  return 'Apenas uma loja forte no momento.';
}

function getVerdict(score, discount, pricePosition, rating) {
  if (score >= 82) return 'Comprar agora';
  if (score >= 68) return 'Boa oportunidade';
  if (discount >= 50 && rating >= 65) return 'Promocao interessante';
  if (pricePosition === 'above-history') return 'Esperar promocao';
  return 'Avaliar com cautela';
}

function detectSegments(text) {
  const segments = [];

  if (matchesAny(text, MARKET_TAGS.rpg)) segments.push('RPG e campanha longa');
  if (matchesAny(text, MARKET_TAGS.competitive)) segments.push('Competitivo online');
  if (matchesAny(text, MARKET_TAGS.horror)) segments.push('Terror e survival');
  if (matchesAny(text, MARKET_TAGS.action)) segments.push('Acao e desafio');
  if (matchesAny(text, MARKET_TAGS.indie)) segments.push('Indie de alto engajamento');
  if (matchesAny(text, MARKET_TAGS.racing)) segments.push('Corrida e simulacao');

  return [...new Set(segments)].slice(0, 4);
}

function buildShelfStrategy(segment, totalHours, playedRatio) {
  if (segment.includes('Competitivo')) return 'Priorizar jogos vivos, multiplayer, conteudo recorrente e beneficios de permanencia.';
  if (segment.includes('RPG')) return 'Priorizar campanhas longas, mundo aberto, bundles completos e desconto em edicoes definitivas.';
  if (segment.includes('Indie')) return 'Priorizar custo-beneficio, curadoria e jogos com alta taxa de conclusao/comunidade.';
  if (totalHours > 500 || playedRatio > 70) return 'Mostrar recomendacoes mais especificas, pois o usuario tem historico suficiente para match fino.';
  return 'Comecar com recomendacoes amplas e coletar feedback explicito para melhorar o perfil.';
}

function getRetentionRisk(totalHours, playedRatio, recentCount) {
  if (totalHours > 500 && recentCount >= 3) return 'Baixo: historico forte e atividade recente indicam boa chance de uso real apos compra.';
  if (playedRatio < 35) return 'Medio: biblioteca pode ter muitos jogos pouco usados, entao desconto sozinho nao garante aproveitamento.';
  if (recentCount === 0) return 'Medio: faltam sinais recentes para prever engajamento com confianca.';
  return 'Controlado: ha dados suficientes para recomendar por genero e comportamento.';
}

function matchesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function normalizeText(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

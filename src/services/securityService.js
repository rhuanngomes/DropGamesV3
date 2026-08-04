const TRUSTED_HOSTS = [
  'cheapshark.com',
  'www.cheapshark.com',
  'store.steampowered.com',
  'steamcommunity.com',
  'www.humblebundle.com',
  'www.fanatical.com',
  'www.greenmangaming.com',
  'www.gog.com',
  'www.gamersgate.com',
  'www.gamebillet.com',
  'www.wingamestore.com',
];

const SUSPICIOUS_TERMS = [
  'free-steam',
  'steamgift',
  'gift-card',
  'nitro',
  'keygen',
  'crack',
  'warez',
  'pirate',
  'telegram',
  'whatsapp',
  'discord.gg',
  'bit.ly',
  'tinyurl',
  'claim',
  'airdrop',
];

const TRUSTED_STORES = new Map([
  ['1', { name: 'Steam', trust: 96 }],
  ['2', { name: 'GamersGate', trust: 82 }],
  ['7', { name: 'GOG', trust: 88 }],
  ['8', { name: 'Origin', trust: 86 }],
  ['11', { name: 'Humble Store', trust: 90 }],
  ['15', { name: 'Fanatical', trust: 87 }],
  ['25', { name: 'Epic Games Store', trust: 90 }],
  ['27', { name: 'GameBillet', trust: 82 }],
  ['30', { name: 'IndieGala', trust: 74 }],
  ['31', { name: 'Blizzard Shop', trust: 88 }],
  ['33', { name: 'DLGamer', trust: 80 }],
  ['34', { name: 'Noctre', trust: 76 }],
  ['35', { name: 'DreamGame', trust: 76 }],
]);

export function analyzeOfferSecurity(offer = {}, context = {}) {
  const urlRisk = analyzeExternalLink(offer.dealUrl);
  const storeRisk = analyzeStoreRisk(offer);
  const priceRisk = analyzePriceRisk(offer, context.bestOffer);
  const findings = [...urlRisk.findings, ...storeRisk.findings, ...priceRisk.findings];
  const score = clamp(100 - findings.reduce((total, item) => total + item.weight, 0), 0, 100);
  const level = score >= 78 ? 'baixo' : score >= 52 ? 'medio' : 'alto';

  return {
    score,
    level,
    label: level === 'baixo' ? 'Risco baixo' : level === 'medio' ? 'Risco medio' : 'Risco alto',
    recommendation: getRiskRecommendation(level),
    findings: findings.length ? findings : [{ type: 'trusted', text: 'Link e loja seguem os criterios de confianca definidos para o prototipo.', weight: 0 }],
    checks: {
      link: urlRisk,
      store: storeRisk,
      price: priceRisk,
    },
  };
}

export function analyzeExternalLink(url = '') {
  const findings = [];

  if (!url) {
    return {
      status: 'unknown',
      host: '',
      isTrusted: false,
      findings: [{ type: 'missing-url', text: 'Oferta sem link externo para validacao.', weight: 26 }],
    };
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return {
      status: 'invalid',
      host: '',
      isTrusted: false,
      findings: [{ type: 'invalid-url', text: 'URL invalida ou malformada.', weight: 32 }],
    };
  }

  const host = parsed.hostname.toLowerCase();
  const isHttps = parsed.protocol === 'https:';
  const isTrusted = TRUSTED_HOSTS.some((trustedHost) => host === trustedHost || host.endsWith(`.${trustedHost}`));
  const normalizedUrl = url.toLowerCase();

  if (!isHttps) findings.push({ type: 'no-https', text: 'Link externo nao usa HTTPS.', weight: 22 });
  if (!isTrusted) findings.push({ type: 'unknown-domain', text: 'Dominio fora da lista de lojas e redirecionadores conhecidos.', weight: 24 });
  if (SUSPICIOUS_TERMS.some((term) => normalizedUrl.includes(term))) {
    findings.push({ type: 'suspicious-term', text: 'URL contem termo comum em golpes, phishing ou ofertas falsas.', weight: 28 });
  }

  return {
    status: findings.length ? 'review' : 'trusted',
    host,
    isTrusted,
    findings,
  };
}

export function getStoreTrustProfile(offer = {}) {
  const storeID = String(offer.storeID || '');
  const trusted = TRUSTED_STORES.get(storeID);

  if (trusted) return trusted;

  const storeName = String(offer.store || '').toLowerCase();
  const knownByName = Array.from(TRUSTED_STORES.values()).find((store) => store.name.toLowerCase() === storeName);
  return knownByName || { name: offer.store || 'Loja desconhecida', trust: 58 };
}

export function buildSecurityOverview() {
  return [
    {
      title: 'Autenticacao segura',
      text: 'Login local com hash PBKDF2, salt unico, cookie HttpOnly, SameSite e sessao curta de 30 minutos.',
    },
    {
      title: 'API keys protegidas',
      text: 'Chaves de Steam, OpenAI e Anthropic ficam no servidor Vite/.env. O front consome rotas internas sem expor segredo no navegador.',
    },
    {
      title: 'Anti-phishing de ofertas',
      text: 'Links externos passam por validacao de HTTPS, dominio permitido, termos suspeitos e confianca da loja.',
    },
    {
      title: 'IA com escopo defensivo',
      text: 'A IA recebe contexto minimo, prompt server-side, filtros de entrada, limite de uso e fallback quando a pergunta sai do escopo.',
    },
  ];
}

export function buildCyberDefenseConcepts() {
  return [
    ['Zero Trust', 'Nenhum link externo e assumido como confiavel sem validacao de dominio, protocolo e sinais de risco.'],
    ['Threat Prevention', 'Ofertas com termos de golpe, desconto anormal ou loja desconhecida recebem alerta antes do clique.'],
    ['Data Protection', 'Dados pessoais e API keys sao minimizados e mantidos fora do bundle do navegador.'],
    ['Security Monitoring', 'Tentativas de login e uso abusivo da IA sao limitados e registrados em memoria no servidor local.'],
  ];
}

function analyzeStoreRisk(offer) {
  const profile = getStoreTrustProfile(offer);
  const findings = [];

  if (profile.trust < 65) {
    findings.push({ type: 'low-store-trust', text: 'Loja sem reputacao forte no catalogo de confianca do DropGames.', weight: 22 });
  } else if (profile.trust < 80) {
    findings.push({ type: 'medium-store-trust', text: 'Loja conhecida, mas exige revisao adicional antes de destacar como recomendacao principal.', weight: 10 });
  }

  return {
    status: profile.trust >= 80 ? 'trusted' : profile.trust >= 65 ? 'review' : 'risky',
    trust: profile.trust,
    findings,
  };
}

function analyzePriceRisk(offer, bestOffer) {
  const findings = [];
  const discount = Number(offer.discount || 0);
  const price = Number(offer.price || 0);
  const reference = Number(bestOffer?.price || price || 0);

  if (discount >= 92) findings.push({ type: 'extreme-discount', text: 'Desconto extremo exige validacao para evitar oferta falsa ou key suspeita.', weight: 18 });
  if (reference > 0 && price > reference * 1.6) findings.push({ type: 'price-outlier', text: 'Preco muito acima da melhor oferta encontrada.', weight: 8 });
  if (price <= 0 && discount > 0) findings.push({ type: 'inconsistent-price', text: 'Preco e desconto parecem inconsistentes.', weight: 16 });

  return {
    status: findings.length ? 'review' : 'normal',
    findings,
  };
}

function getRiskRecommendation(level) {
  if (level === 'alto') return 'Nao recomendamos abrir esta oferta sem verificacao manual da loja e do dominio.';
  if (level === 'medio') return 'Compare a loja, confira o dominio e evite inserir credenciais fora da plataforma oficial.';
  return 'Oferta dentro dos criterios de seguranca do prototipo. Ainda assim, confira o dominio antes de finalizar a compra.';
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

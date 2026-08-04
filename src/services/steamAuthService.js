const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';
const STEAM_OPENID_PROXY_URL = '/steam-community/openid/login';
const STEAM_API_PROXY_URL = '/steam-api';
const STEAM_SESSION_KEY = 'dropgames:steam-session';
const MOCK_PROFILE_KEY = 'dropgames:mock-gamer-profile';
const GAMER_DATA_CONSENT_KEY = 'dropgames:gamer-data-consent';
const STEAM_SESSION_TTL_MS = 30 * 60 * 1000;

const MOCK_GAMER_PROFILES = [
  {
    id: 'rpg-deep-player',
    name: 'RPG Imersivo',
    description: 'Perfil focado em campanha longa, mundo aberto, progressao e alta tolerancia a jogos densos.',
    library: [
      createMockGame(1245620, 'ELDEN RING', 184, 'b6e290e071771b8dd6d1f6f0bb5e97e5d2c1c5f0'),
      createMockGame(292030, 'The Witcher 3: Wild Hunt', 142, '871184d9b002bce4dd538ebd1c62b4d6e1dfe21b'),
      createMockGame(1091500, 'Cyberpunk 2077', 96, '0d5d5a88b8f476dba3d275ad2c7b02f0a8a03f7e'),
      createMockGame(1086940, 'Baldur`s Gate 3', 128, 'd866cae7ea95f9d0a36b2a0b5aa50eb3d3cfc1e5'),
      createMockGame(489830, 'The Elder Scrolls V: Skyrim Special Edition', 210, '0dfe3eed5658f9fbd8b62f8021038c0a4190f21d'),
      createMockGame(1151640, 'Horizon Zero Dawn Complete Edition', 58, '9bd08a1014f43c408a87f8b4b1c0b7f74a8288e7'),
    ],
    recentIds: [1245620, 1086940, 1091500],
  },
  {
    id: 'competitive-player',
    name: 'Competitivo Online',
    description: 'Perfil de alta recorrencia em partidas curtas, multiplayer e jogos com curva de habilidade.',
    library: [
      createMockGame(730, 'Counter-Strike 2', 920, '8dacdb7c0e3c47d77ebd6a9bdb4123619d0140a1'),
      createMockGame(570, 'Dota 2', 640, '0bbb630d63262dd66d2fdd0f7d37e8661a410075'),
      createMockGame(1172470, 'Apex Legends', 218, '070902d2389878ac4bf29efb5b92832b3c1b1c7d'),
      createMockGame(252490, 'Rust', 180, '820be4782639f9c4b64fa3ca7e6c26a95ae4fd1c'),
      createMockGame(578080, 'PUBG: BATTLEGROUNDS', 124, 'f85ab7bb6f81b0d6e84e0919c69f2d6c75003e92'),
      createMockGame(291550, 'Brawlhalla', 88, 'c43fac31b8bf8821764603a14d09412bc3d45f66'),
    ],
    recentIds: [730, 1172470, 570],
  },
  {
    id: 'deal-hunter',
    name: 'Cacador de Promocoes',
    description: 'Perfil que compra muitos jogos em desconto, testa varios generos e valoriza custo-beneficio.',
    library: [
      createMockGame(504230, 'Celeste', 32, '5b9b1dc9dff87cc7d1a16586d40d6cd61dc0d93b'),
      createMockGame(367520, 'Hollow Knight', 46, '7dfb2a9c9b7f57f0769f3b498de7da0a20f738f1'),
      createMockGame(1145360, 'Hades', 74, '01723f524a41e5e9f4507a7cf2e8c4f48f6f9a4a'),
      createMockGame(588650, 'Dead Cells', 51, 'a431361e5dae5fd6ac2433064e5c3bd61790d747'),
      createMockGame(413150, 'Stardew Valley', 120, '35d1377200084a4034238c05b0c8930451e2fb40'),
      createMockGame(250900, 'The Binding of Isaac: Rebirth', 84, '16ee718efd8a3b799df9b06e1c9a59221867c1ae'),
    ],
    recentIds: [1145360, 367520, 504230],
  },
];

export function startSteamLogin() {
  const returnTo = `${window.location.origin}/auth/steam/callback`;
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': returnTo,
    'openid.realm': window.location.origin,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });

  window.location.href = `${STEAM_OPENID_URL}?${params.toString()}`;
}

export async function finishSteamLogin(searchParams) {
  const params = new URLSearchParams(searchParams);
  const mode = params.get('openid.mode');
  const claimedId = params.get('openid.claimed_id') || '';
  const steamId = claimedId.match(/\/id\/(\d+)$/)?.[1] || '';

  if (mode !== 'id_res' || !steamId) {
    throw new Error('A Steam nao retornou uma autenticacao valida.');
  }

  const verificationParams = new URLSearchParams(params);
  verificationParams.set('openid.mode', 'check_authentication');

  const response = await fetch(STEAM_OPENID_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: verificationParams.toString(),
  });

  if (!response.ok) {
    throw new Error('Nao foi possivel verificar o login com a Steam.');
  }

  const payload = await response.text();
  const isValid = payload.includes('is_valid:true');

  if (!isValid) {
    throw new Error('A Steam nao confirmou a validade deste login.');
  }

  const session = {
    provider: 'steam',
    steamId,
    verifiedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + STEAM_SESSION_TTL_MS).toISOString(),
  };

  localStorage.setItem(STEAM_SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSteamSession() {
  try {
    const session = JSON.parse(localStorage.getItem(STEAM_SESSION_KEY)) || null;
    if (!session?.expiresAt) return session;
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      clearSteamSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearSteamSession() {
  localStorage.removeItem(STEAM_SESSION_KEY);
}

export function getMockGamerProfiles() {
  return MOCK_GAMER_PROFILES;
}

export function saveMockGamerProfile(profileId) {
  const profile = MOCK_GAMER_PROFILES.find((candidate) => candidate.id === profileId) || MOCK_GAMER_PROFILES[0];
  localStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify({ profileId: profile.id, selectedAt: new Date().toISOString() }));
  return profile;
}

export function getMockGamerProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(MOCK_PROFILE_KEY));
    return MOCK_GAMER_PROFILES.find((profile) => profile.id === saved?.profileId) || null;
  } catch {
    return null;
  }
}

export function clearMockGamerProfile() {
  localStorage.removeItem(MOCK_PROFILE_KEY);
}

export function saveGamerDataConsent(settings = {}) {
  const consent = {
    accepted: true,
    collectLibrary: Boolean(settings.collectLibrary),
    collectRecentGames: Boolean(settings.collectRecentGames),
    collectPlaytime: Boolean(settings.collectPlaytime),
    allowPersonalizedRecommendations: Boolean(settings.allowPersonalizedRecommendations),
    youthMode: Boolean(settings.youthMode),
    acceptedAt: new Date().toISOString(),
    retention: 'Dados locais podem ser apagados a qualquer momento. Sessoes Steam expiram em 30 minutos.',
  };

  localStorage.setItem(GAMER_DATA_CONSENT_KEY, JSON.stringify(consent));
  return consent;
}

export function getGamerDataConsent() {
  try {
    return JSON.parse(localStorage.getItem(GAMER_DATA_CONSENT_KEY)) || null;
  } catch {
    return null;
  }
}

export function clearGamerDataConsent() {
  localStorage.removeItem(GAMER_DATA_CONSENT_KEY);
}

export async function fetchSteamPlayerProfile(steamId) {
  const response = await fetch(`${STEAM_API_PROXY_URL}/ISteamUser/GetPlayerSummaries/v2/?steamids=${encodeURIComponent(steamId)}`);

  if (!response.ok) {
    throw new Error('Configure STEAM_WEB_API_KEY no servidor para carregar o perfil Steam.');
  }

  const payload = await response.json();
  return payload.response?.players?.[0] || null;
}

export async function fetchSteamLibrary(steamId) {
  const params = new URLSearchParams({
    steamid: steamId,
    include_appinfo: 'true',
    include_played_free_games: 'true',
  });
  const response = await fetch(`${STEAM_API_PROXY_URL}/IPlayerService/GetOwnedGames/v1/?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Configure STEAM_WEB_API_KEY no servidor para carregar biblioteca e horas jogadas.');
  }

  const payload = await response.json();
  return payload.response?.games || [];
}

export async function fetchSteamRecentlyPlayed(steamId) {
  const params = new URLSearchParams({
    steamid: steamId,
    count: '8',
  });
  const response = await fetch(`${STEAM_API_PROXY_URL}/IPlayerService/GetRecentlyPlayedGames/v1/?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Configure STEAM_WEB_API_KEY no servidor para carregar jogos recentes.');
  }

  const payload = await response.json();
  return payload.response?.games || [];
}

export function buildGamerProfile(library = [], recentlyPlayed = []) {
  const sortedByPlaytime = [...library].sort((a, b) => Number(b.playtime_forever || 0) - Number(a.playtime_forever || 0));
  const totalMinutes = library.reduce((total, game) => total + Number(game.playtime_forever || 0), 0);
  const playedGames = library.filter((game) => Number(game.playtime_forever || 0) > 0);

  return {
    totalGames: library.length,
    playedGames: playedGames.length,
    totalHours: Math.round(totalMinutes / 60),
    topGames: sortedByPlaytime.slice(0, 6),
    recentlyPlayed,
    engagementLabel: getEngagementLabel(totalMinutes, playedGames.length),
  };
}

export function getMockProfileData(profile) {
  const recentIds = new Set(profile.recentIds);
  const recentlyPlayed = profile.library.filter((game) => recentIds.has(game.appid));

  return {
    player: {
      personaname: profile.name,
      avatarfull: '',
    },
    library: profile.library,
    recentlyPlayed,
  };
}

function getEngagementLabel(totalMinutes, playedCount) {
  if (totalMinutes > 60000 && playedCount > 40) return 'Jogador altamente engajado';
  if (totalMinutes > 12000 && playedCount > 15) return 'Jogador recorrente';
  if (totalMinutes > 1200) return 'Jogador casual com historico';
  return 'Perfil em construcao';
}

function createMockGame(appid, name, hours, imgIconUrl = '') {
  return {
    appid,
    name,
    img_icon_url: imgIconUrl,
    playtime_forever: hours * 60,
  };
}

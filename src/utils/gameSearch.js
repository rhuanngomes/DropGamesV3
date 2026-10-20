const GAME_SEARCH_ALIASES = {
  'ac': "Assassin's Creed",
  'bg': "Baldur's Gate",
  'bg3': "Baldur's Gate 3",
  'cod': 'Call of Duty',
  'cod bo': 'Call of Duty Black Ops',
  'cod mw': 'Call of Duty Modern Warfare',
  'cs': 'Counter-Strike',
  'cs2': 'Counter-Strike 2',
  'cyberpunk': 'Cyberpunk 2077',
  'dbz': 'Dragon Ball Z',
  'fc': 'EA Sports FC',
  'ff': 'Final Fantasy',
  'forza': 'Forza Horizon',
  'gow': 'God of War',
  'gta': 'Grand Theft Auto',
  'gta v': 'Grand Theft Auto V',
  'lol': 'League of Legends',
  'mk': 'Mortal Kombat',
  'nfs': 'Need for Speed',
  'ow': 'Overwatch',
  'pes': 'eFootball PES',
  'pubg': 'PlayerUnknown Battlegrounds',
  'r6': 'Rainbow Six',
  'r6s': 'Rainbow Six Siege',
  'rdr': 'Red Dead Redemption',
  'rdr2': 'Red Dead Redemption 2',
  're': 'Resident Evil',
  'sf': 'Street Fighter',
  'spiderman': 'Spider-Man',
  'tlou': 'The Last of Us',
  'tes': 'The Elder Scrolls',
  'tw3': 'The Witcher 3',
  'wow': 'World of Warcraft',
};

const aliasKeys = Object.keys(GAME_SEARCH_ALIASES).sort((a, b) => b.length - a.length);

export function expandGameSearchQuery(value = '') {
  const original = String(value).replace(/[™®]/g, '').trim().replace(/\s+/g, ' ');
  const normalized = normalizeAlias(original);
  if (!normalized) return '';

  for (const alias of aliasKeys) {
    if (normalized === alias) return GAME_SEARCH_ALIASES[alias];
    if (normalized.startsWith(`${alias} `)) {
      const suffix = original.split(/\s+/).slice(alias.split(' ').length).join(' ');
      return `${GAME_SEARCH_ALIASES[alias]} ${suffix}`.trim();
    }
  }

  return original;
}

function normalizeAlias(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export async function fetchEpicFeaturedGames() {
  const response = await fetch('/api/epic/featured', {
    headers: { Accept: 'application/json' },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || 'Nao foi possivel carregar os destaques da Epic Games.');
  }

  return {
    source: payload.source || 'Epic Games Store',
    updatedAt: payload.updatedAt || '',
    items: Array.isArray(payload.items) ? payload.items : [],
  };
}

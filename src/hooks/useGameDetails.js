import { useEffect, useState } from 'react';
import { fetchGameDetails } from '../services/index.js';

export function useGameDetails(params) {
  const [game, setGame] = useState(null);
  const [meta, setMeta] = useState({ source: '', updatedAt: '', currency: 'USD' });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadDetails() {
      try {
        setStatus('loading');
        const payload = await fetchGameDetails(params);
        if (!isMounted) return;
        setGame(payload.game);
        setMeta({
          source: payload.source,
          updatedAt: payload.updatedAt,
          currency: payload.currency || 'USD',
        });
        setStatus('success');
      } catch (err) {
        if (!isMounted) return;
        setError(err.message);
        setStatus('error');
      }
    }

    loadDetails();

    return () => {
      isMounted = false;
    };
  }, [params?.gameID, params?.title]);

  return { game, meta, status, error };
}

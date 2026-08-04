import { useEffect, useState } from 'react';
import { fetchGames } from '../services/index.js';

export function useGames() {
  const [games, setGames] = useState([]);
  const [updatedAt, setUpdatedAt] = useState('');
  const [source, setSource] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadGames() {
      try {
        const payload = await fetchGames();
        if (!isMounted) return;
        setGames(payload.games);
        setUpdatedAt(payload.updatedAt);
        setSource(payload.source);
        setCurrency(payload.currency || 'USD');
        setStatus('success');
      } catch (err) {
        if (!isMounted) return;
        setError(err.message);
        setStatus('error');
      }
    }

    loadGames();

    return () => {
      isMounted = false;
    };
  }, []);

  return { games, updatedAt, source, currency, status, error };
}

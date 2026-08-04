import { useEffect, useState } from 'react';
import { finishSteamLogin } from '../services/index.js';

export default function SteamCallbackPage() {
  const [status, setStatus] = useState('Verificando login com a Steam...');

  useEffect(() => {
    let cancelled = false;

    async function verifyLogin() {
      try {
        await finishSteamLogin(window.location.search);
        if (!cancelled) {
          setStatus('Login Steam confirmado. Redirecionando...');
          window.location.replace('/perfil-gamer');
        }
      } catch (error) {
        if (!cancelled) setStatus(error.message);
      }
    }

    verifyLogin();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="dg-auth-callback-page">
      <section className="dg-auth-callback-card">
        <img src="/img/logo-dropgames.svg" alt="DropGames" />
        <p>{status}</p>
        <a href="/login">Voltar para login</a>
      </section>
    </main>
  );
}

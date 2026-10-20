import { useEffect, useMemo, useState } from 'react';
import { PageShell } from '../components/layout/index.js';
import { useGames } from '../hooks/index.js';
import {
  buildGamerProfile,
  clearGamerDataConsent,
  clearMockGamerProfile,
  clearSteamSession,
  deleteEmailAccount,
  exportAccountData,
  fetchSteamLibrary,
  fetchSteamPlayerProfile,
  fetchSteamRecentlyPlayed,
  formatPrice,
  generateGamerAiInsights,
  getGamerDataConsent,
  getMockGamerProfile,
  getMockGamerProfiles,
  getMockProfileData,
  getSteamSession,
  getBestOffer,
  logoutEmailSession,
  saveGamerDataConsent,
  saveMockGamerProfile,
  startSteamLogin,
  recommendGamesForGamer,
} from '../services/index.js';

const demoProfiles = getMockGamerProfiles();

export default function GamerProfilePage() {
  const gamesApi = useGames();
  const [session, setSession] = useState(() => getSteamSession());
  const [mockProfile, setMockProfile] = useState(() => getMockGamerProfile());
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [privacyMessage, setPrivacyMessage] = useState('');
  const [consent, setConsent] = useState(() => getGamerDataConsent());
  const [player, setPlayer] = useState(null);
  const [library, setLibrary] = useState([]);
  const [recent, setRecent] = useState([]);
  const gamerProfile = useMemo(() => buildGamerProfile(library, recent), [library, recent]);
  const gamerAi = useMemo(() => generateGamerAiInsights(gamerProfile, mockProfile), [gamerProfile, mockProfile]);
  const recommendations = useMemo(
    () => recommendGamesForGamer(gamesApi.games, gamerProfile),
    [gamesApi.games, gamerProfile],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadSteamData() {
      if (mockProfile) {
        const mockData = getMockProfileData(mockProfile);
        setPlayer(mockData.player);
        setLibrary(mockData.library);
        setRecent(mockData.recentlyPlayed);
        setStatus('demo');
        setError('');
        return;
      }

      if (!session?.steamId) return;

      setStatus('loading');
      setError('');

      try {
        const [profileData, libraryData, recentData] = await Promise.all([
          fetchSteamPlayerProfile(session.steamId),
          fetchSteamLibrary(session.steamId),
          fetchSteamRecentlyPlayed(session.steamId),
        ]);

        if (!cancelled) {
          setPlayer(profileData);
          setLibrary(libraryData);
          setRecent(recentData);
          setStatus('success');
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message);
          setStatus('needs-key');
        }
      }
    }

    loadSteamData();

    return () => {
      cancelled = true;
    };
  }, [session, mockProfile]);

  function activateDemoProfile(profileId) {
    if (!consent?.accepted) {
      setPrivacyMessage('Aceite o uso dos dados antes de carregar um perfil gamer.');
      return;
    }

    const profile = saveMockGamerProfile(profileId);
    setMockProfile(profile);
  }

  function handleSteamLogin() {
    if (!consent?.accepted) {
      setPrivacyMessage('Aceite o uso dos dados antes de conectar a Steam.');
      return;
    }

    startSteamLogin();
  }

  function acceptGamerConsent(settings) {
    const saved = saveGamerDataConsent(settings);
    setConsent(saved);
    setPrivacyMessage('');
  }

  async function exportGamerData() {
    const payload = {
      exportedAt: new Date().toISOString(),
      consent,
      steamSession: session ? { provider: session.provider, verifiedAt: session.verifiedAt, expiresAt: session.expiresAt } : null,
      mockProfile: mockProfile ? { id: mockProfile.id, name: mockProfile.name } : null,
      player,
      library,
      recent,
      gamerProfile,
      authAccount: null,
    };

    try {
      const account = await exportAccountData();
      payload.authAccount = account;
    } catch {
      payload.authAccount = 'Nenhuma sessao de email ativa.';
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'dropgames-dados-gamer.json';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function disconnectSteam() {
    clearSteamSession();
    clearMockGamerProfile();
    clearGamerDataConsent();
    try {
      await deleteEmailAccount();
    } catch {
      // Email account is optional in this local prototype.
    }
    setSession(null);
    setMockProfile(null);
    setConsent(null);
    setPlayer(null);
    setLibrary([]);
    setRecent([]);
    setStatus('idle');
  }

  async function signOutAccount() {
    clearSteamSession();
    clearMockGamerProfile();
    try {
      await logoutEmailSession();
    } catch {
      // The user may be using only Steam or a demo profile.
    }
    setSession(null);
    setMockProfile(null);
    setPlayer(null);
    setLibrary([]);
    setRecent([]);
    setStatus('idle');
  }

  if (!consent?.accepted) {
    return (
      <GamerProfileShell>
        <PrivacyConsentGate onAccept={acceptGamerConsent} message={privacyMessage} />
      </GamerProfileShell>
    );
  }

  if (!session && !mockProfile) {
    return (
      <GamerProfileShell>
        <section className="dg-gamer-profile-empty">
          <p className="dg-kicker">GamePulse AI</p>
          <h1>Crie seu DNA gamer</h1>
          <p>Conecte a Steam quando houver uma conta com biblioteca ou use um perfil demonstrativo para apresentar o motor de match agora.</p>
          <button type="button" className="dg-steam-login-btn" onClick={handleSteamLogin}>Entrar com Steam</button>
          <DemoProfilePicker profiles={demoProfiles} onSelect={activateDemoProfile} />
          <a href="/" className="dg-gamer-skip">Fazer isso depois e voltar à DropGames</a>
        </section>
      </GamerProfileShell>
    );
  }

  return (
    <GamerProfileShell>
      <section className="dg-gamer-profile-header">
        <div>
          <p className="dg-kicker">GamePulse AI</p>
          <h1>{player?.personaname || 'Perfil gamer'}</h1>
          <p>{mockProfile ? 'Perfil demonstrativo para pitch e validacao da IA.' : `SteamID verificado: ${session?.steamId}`}</p>
        </div>
        {player?.avatarfull && <img src={player.avatarfull} alt="" />}
      </section>

      {status === 'loading' && <div className="dg-gamer-notice">Carregando biblioteca, horas jogadas e jogos recentes...</div>}

      {status === 'needs-key' && (
        <section className="dg-gamer-notice">
          <strong>Login Steam verificado com seguranca.</strong>
          <p>{error}</p>
          <p>Enquanto a chave real nao estiver disponivel, use um perfil demo para demonstrar o GamePulse AI com biblioteca, horas e jogos recentes simulados.</p>
          <DemoProfilePicker profiles={demoProfiles} onSelect={activateDemoProfile} compact />
        </section>
      )}

      {(status === 'success' || status === 'demo') && (
        <>
          <section className="dg-gamer-stats">
            <ProfileStat label="Jogos na biblioteca" value={gamerProfile.totalGames} />
            <ProfileStat label="Jogos com horas" value={gamerProfile.playedGames} />
            <ProfileStat label="Horas registradas" value={gamerProfile.totalHours.toLocaleString('pt-BR')} />
            <ProfileStat label="Match da IA" value={`${gamerAi.matchScore}/100`} />
          </section>

          <section className="dg-gamer-profile-grid">
            <GameList title="Mais jogados" games={gamerProfile.topGames} emptyText="Biblioteca privada ou sem dados de horas." />
            <GameList title="Recentes" games={gamerProfile.recentlyPlayed} emptyText="Nenhum jogo recente retornado pela Steam." />
          </section>

          <RecommendationShelf games={recommendations} currency={gamesApi.currency} />

          <section className="dg-gamer-ai-panel">
            <div className="dg-gamer-ai-header">
              <div>
                <p className="dg-kicker">IA comportamental</p>
                <h2>{gamerAi.primarySegment}</h2>
              </div>
              <span>{gamerProfile.engagementLabel}</span>
            </div>
            <div className="dg-gamer-ai-grid">
              {gamerAi.cards.map((card) => <InsightCard title={card.title} text={card.text} key={card.title} />)}
            </div>
            <p className="dg-gamer-ai-note">Modelo local e explicavel: usa biblioteca, horas, recorrencia e perfis anonimizados. Em producao, esses sinais devem ser agregados por consentimento e nunca vendidos como historico individual.</p>
          </section>
        </>
      )}

      <section className="dg-gamer-privacy">
        <h2>Como esses dados alimentam a IA</h2>
        <p>O DropGames transforma biblioteca, horas e recorrencia em sinais agregados de gosto. Para uso B2B, a recomendacao segura e trabalhar com segmentos anonimos, nunca vender historico individual.</p>
        <div className="dg-privacy-actions">
          <button type="button" onClick={exportGamerData}>Exportar meus dados</button>
          <button type="button" onClick={signOutAccount}>Sair da conta</button>
          <button type="button" onClick={disconnectSteam}>{mockProfile ? 'Apagar perfil demo' : 'Apagar dados e desconectar'}</button>
        </div>
      </section>
    </GamerProfileShell>
  );
}

function GamerProfileShell({ children }) {
  return (
    <PageShell bodyClass="dg-gamer-profile-shell min-h-screen">
      <div className="dg-gamer-profile-page">{children}</div>
    </PageShell>
  );
}

function PrivacyConsentGate({ onAccept, message }) {
  const [settings, setSettings] = useState({
    collectLibrary: true,
    collectRecentGames: true,
    collectPlaytime: true,
    allowPersonalizedRecommendations: true,
    youthMode: false,
  });

  function updateSetting(field, value) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="dg-gamer-profile-empty dg-privacy-consent-panel">
      <p className="dg-kicker">Privacidade e LGPD</p>
      <h1>Antes de criar seu DNA gamer</h1>
      <p>O DropGames so usa dados com consentimento. Biblioteca, horas jogadas e jogos recentes ajudam a IA a recomendar melhor, mas voce pode exportar ou apagar esses dados a qualquer momento.</p>
      <div className="dg-consent-list">
        <ConsentToggle checked={settings.collectLibrary} onChange={(value) => updateSetting('collectLibrary', value)} text="Autorizar leitura da biblioteca de jogos." />
        <ConsentToggle checked={settings.collectRecentGames} onChange={(value) => updateSetting('collectRecentGames', value)} text="Autorizar leitura de jogos recentes." />
        <ConsentToggle checked={settings.collectPlaytime} onChange={(value) => updateSetting('collectPlaytime', value)} text="Autorizar uso de horas jogadas para calcular match." />
        <ConsentToggle checked={settings.allowPersonalizedRecommendations} onChange={(value) => updateSetting('allowPersonalizedRecommendations', value)} text="Permitir recomendacoes personalizadas e anonimizadas." />
        <ConsentToggle checked={settings.youthMode} onChange={(value) => updateSetting('youthMode', value)} text="Ativar modo jovem: recomendações mais conservadoras e avisos de faixa etaria." />
      </div>
      {message && <span className="dg-field-error">{message}</span>}
      <button type="button" className="dg-steam-login-btn" onClick={() => onAccept(settings)}>Aceitar e continuar</button>
      <a href="/" className="dg-gamer-skip">Agora não. Continuar sem o DNA gamer</a>
    </section>
  );
}

function ConsentToggle({ checked, onChange, text }) {
  return (
    <label className="dg-consent-check">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{text}</span>
    </label>
  );
}

function DemoProfilePicker({ profiles, onSelect, compact = false }) {
  return (
    <div className={compact ? 'dg-demo-profile-picker dg-demo-profile-picker--compact' : 'dg-demo-profile-picker'}>
      <span>Perfis demonstrativos</span>
      <div>
        {profiles.map((profile) => (
          <button type="button" onClick={() => onSelect(profile.id)} key={profile.id}>
            <strong>{profile.name}</strong>
            {!compact && <small>{profile.description}</small>}
          </button>
        ))}
      </div>
    </div>
  );
}

function InsightCard({ title, text }) {
  return (
    <article className="dg-gamer-ai-card">
      <span>{title}</span>
      <p>{text}</p>
    </article>
  );
}

function ProfileStat({ label, value }) {
  return (
    <article className="dg-gamer-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function RecommendationShelf({ games, currency }) {
  if (!games.length) return null;

  return (
    <section className="dg-gamer-recommendations">
      <div className="dg-gamer-recommendations-heading">
        <div>
          <p className="dg-kicker">Escolhidos para você</p>
          <h2>Jogos que combinam com seu DNA gamer</h2>
        </div>
        <span>GamePulse AI</span>
      </div>
      <div className="dg-gamer-recommendation-grid">
        {games.map((game) => {
          const offer = getBestOffer(game);
          const image = game.image?.startsWith('http') ? game.image : `/img/${game.image}`;
          const href = game.id
            ? `/jogo?gameID=${encodeURIComponent(game.id)}`
            : `/jogo?title=${encodeURIComponent(game.title)}`;

          return (
            <a className="dg-gamer-recommendation-card" href={href} key={game.steamAppID || game.id || game.title}>
              <img src={image} alt={game.title} loading="lazy" />
              <div>
                <span>{game.recommendationScore}% de match</span>
                <h3>{game.title}</h3>
                <p>{game.recommendationReason}</p>
                <strong>{offer ? formatPrice(offer.price, currency) : 'Ver ofertas'}</strong>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function GameList({ title, games, emptyText }) {
  return (
    <section className="dg-gamer-list">
      <h2>{title}</h2>
      {games.length > 0 ? (
        games.map((game) => (
          <article className="dg-gamer-list-item" key={game.appid}>
            <GameArtwork game={game} />
            <div>
              <strong>{game.name}</strong>
              <span>{Math.round(Number(game.playtime_forever || 0) / 60)}h jogadas</span>
            </div>
          </article>
        ))
      ) : (
        <p>{emptyText}</p>
      )}
    </section>
  );
}

function GameArtwork({ game }) {
  const iconUrl = !game.isMock && game.img_icon_url
    ? `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
    : '';
  const sources = [
    iconUrl,
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/capsule_184x69.jpg`,
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
  ].filter(Boolean);
  const [sourceIndex, setSourceIndex] = useState(0);

  if (!sources[sourceIndex]) {
    return <span className="dg-gamer-game-fallback" aria-hidden="true">{game.name?.slice(0, 1).toUpperCase() || '?'}</span>;
  }

  return (
    <img
      src={sources[sourceIndex]}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setSourceIndex((current) => current + 1)}
    />
  );
}

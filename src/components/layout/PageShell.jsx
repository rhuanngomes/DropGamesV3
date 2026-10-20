import { useEffect, useRef, useState } from 'react';
import {
  clearSteamSession,
  fetchSteamPlayerProfile,
  getEmailSession,
  getSteamSession,
  logoutEmailSession,
} from '../../services/index.js';
import { SkipLink } from './SkipLink.jsx';

const navItems = [
  { href: '/', label: 'Descobrir', chevron: true },
  { href: '/sobre-nos', label: 'Sobre nós', chevron: true },
  { href: '/seguranca', label: 'Segurança' },
  { href: '/suporte', label: 'Suporte' },
];

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function MenuIcon({ open }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {open ? <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
    </svg>
  );
}

export function Header({ active = '/' }) {
  const [session, setSession] = useState(null);
  const [steamProfile, setSteamProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const steamSession = getSteamSession();
      const emailSession = await getEmailSession().catch(() => null);
      const currentSession = steamSession
        ? { ...emailSession, ...steamSession, user: emailSession?.user }
        : emailSession;

      if (!active) return;
      setSession(currentSession);

      if (steamSession?.steamId) {
        const profile = await fetchSteamPlayerProfile(steamSession.steamId).catch(() => null);
        if (active) setSteamProfile(profile);
      }
    }

    loadSession();
    const closeMenu = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', closeMenu);
    return () => {
      active = false;
      document.removeEventListener('pointerdown', closeMenu);
    };
  }, []);

  async function signOut() {
    clearSteamSession();
    await logoutEmailSession().catch(() => {});
    window.location.href = '/';
  }

  const profileName = steamProfile?.personaname || session?.user?.name || 'Perfil Steam';
  const profileDetail = session?.steamId ? `SteamID ${session.steamId}` : (session?.user?.email || 'Conta conectada');
  const profileAvatar = steamProfile?.avatarfull || '/img/header-avatar.jpg';

  return (
    <header className="dg-header">
      <div className="dg-header-inner">
        <a href="/" className="dg-logo">
          <img src="/img/logo-dropgames.svg" alt="DropGames" className="dg-logo-img" />
        </a>
        <nav className={`dg-nav ${mobileNavOpen ? 'dg-nav--open' : ''}`} aria-label="Navegação principal">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className={`dg-nav-link ${active === item.href ? 'dg-nav-link--active' : ''}`}>
              {item.label}
              {item.chevron && <img src="/img/icon-chevron.svg" className="dg-nav-chevron" alt="" />}
            </a>
          ))}
          {!session && <div className="dg-mobile-auth-links"><a href="/login">Entrar</a><a href="/signup">Criar conta</a></div>}
        </nav>
        <div className="dg-header-actions">
          <button className="dg-btn dg-btn-ghost dg-language-button" aria-label="Idioma"><GlobeIcon /></button>
          {!session && <><a href="/login" className="dg-btn dg-btn-secondary">Entrar</a><a href="/signup" className="dg-btn dg-btn-primary">Cadastrar</a></>}
          {session && <div className="dg-profile-menu" ref={menuRef}>
            <button className="dg-header-avatar" type="button" aria-label="Abrir menu do perfil" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
              <img
                src={profileAvatar}
                alt={`Foto de ${profileName}`}
                referrerPolicy="no-referrer"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = '/img/header-avatar.jpg';
                }}
              />
            </button>
            {menuOpen && <div className="dg-profile-dropdown">
              <div className="dg-profile-summary"><strong>{profileName}</strong><span>{profileDetail}</span></div>
              <a href="/perfil-gamer">GamePulse AI</a>
              {session.user?.role === 'admin' && <a href="/dados"><span>Visão do produto</span><small>Admin</small></a>}
              <button type="button" onClick={signOut}>Sair</button>
            </div>}
          </div>}
          <button className="dg-mobile-menu-button" type="button" aria-label={mobileNavOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((value) => !value)}>
            <MenuIcon open={mobileNavOpen} />
          </button>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="dg-footer">
      <div className="dg-footer-inner">
        <a href="/" className="dg-logo">
          <img src="/img/logo-dropgames-footer.svg" alt="DropGames" className="dg-logo-img" />
        </a>
        <nav className="dg-footer-nav">
          <a href="/">Descobrir</a>
          <a href="/sobre-nos">Sobre nós</a>
          <a href="/suporte">Suporte</a>
          <a href="#">Help</a>
          <a href="#">Privacy</a>
        </nav>
      </div>
      <div className="dg-footer-bottom">
        <span>Drop Games. All rights reserved</span>
        <nav className="dg-footer-legal">
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Cookies</a>
        </nav>
      </div>
    </footer>
  );
}

export function PageShell({ active, bodyClass, children }) {
  return (
    <div className={`dg-page-shell ${bodyClass || ''}`.trim()}>
      <SkipLink />
      <Header active={active} />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <Footer />
    </div>
  );
}

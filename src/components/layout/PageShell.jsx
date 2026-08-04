const navItems = [
  { href: '/', label: 'Descobrir', chevron: true },
  { href: '/sobre-nos', label: 'Sobre nós', chevron: true },
  { href: '/dados', label: 'Dados' },
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

export function Header({ active = '/' }) {
  return (
    <header className="dg-header">
      <div className="dg-header-inner">
        <a href="/" className="dg-logo">
          <img src="/img/logo-dropgames.svg" alt="DropGames" className="dg-logo-img" />
        </a>
        <nav className="dg-nav">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className={`dg-nav-link ${active === item.href ? 'dg-nav-link--active' : ''}`}>
              {item.label}
              {item.chevron && <img src="/img/icon-chevron.svg" className="dg-nav-chevron" alt="" />}
            </a>
          ))}
        </nav>
        <div className="dg-header-actions">
          <button className="dg-btn dg-btn-ghost" aria-label="Idioma"><GlobeIcon /></button>
          <a href="/login" className="dg-btn dg-btn-secondary dg-auth-only">Entrar</a>
          <a href="/signup" className="dg-btn dg-btn-primary dg-auth-only">Cadastrar</a>
          <div className="dg-header-notif dg-logged-only">
            <img src="/img/header-bell.svg" alt="" className="dg-notif-icon" />
            <span className="dg-notif-badge">2</span>
          </div>
          <div className="dg-header-avatar dg-logged-only">
            <img src="/img/header-avatar.jpg" alt="Perfil" />
          </div>
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
          <a href="/dados">Dados</a>
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
    <div className={bodyClass || 'min-h-screen'}>
      <Header active={active} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

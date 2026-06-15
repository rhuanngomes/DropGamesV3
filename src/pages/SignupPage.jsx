import { useMemo, useState } from 'react';

const criteria = [
  ['A senha deve ter no mínimo 8 caracteres.', (p) => p.length >= 8],
  ['Deve conter ao menos 1 letra maiúscula.', (p) => /[A-Z]/.test(p)],
  ['Deve conter ao menos 1 número.', (p) => /[0-9]/.test(p)],
  ['Deve conter ao menos 1 caractere especial', (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p)],
  ['Não use senhas comuns ou fáceis de adivinhar.', (p) => p.length > 0 && !['123456', 'password', 'qwerty', 'admin'].includes(p.toLowerCase())],
  ['Evite repetições como 1111 ou aaaa.', (p) => p.length > 0 && !/(.)\1{3,}/.test(p)],
  ['Evite sequências como 123 ou abc.', (p) => p.length > 0 && !/123|234|345|abc|bcd|cde/i.test(p)],
];

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const met = useMemo(() => criteria.map(([, check]) => check(password)), [password]);

  return (
    <div className="dg-login-page">
      <div className="dg-login-left">
        <a href="/" className="dg-login-logo"><img src="/img/logo-dropgames.svg" alt="DropGames" /></a>
        <div className="dg-login-form-wrap">
          <form className="dg-login-form" noValidate onSubmit={(event) => { event.preventDefault(); window.location.href = '/login'; }}>
            <div className="dg-login-heading-block"><p className="dg-login-title">Cadastre-se</p><p className="dg-login-subtitle">Inicie o seu trial de 30 dias gratuito</p></div>
            <div className="dg-login-field"><label className="dg-login-label" htmlFor="signup-nome">Nome</label><div className="dg-login-input-wrap"><input id="signup-nome" type="text" className="dg-login-input" placeholder="Seu nome" /></div><span className="dg-field-error" /></div>
            <div className="dg-login-field"><label className="dg-login-label" htmlFor="signup-email">Email</label><div className="dg-login-input-wrap"><input id="signup-email" type="email" className="dg-login-input" placeholder="Seu email" /></div><span className="dg-field-error" /></div>
            <div className="dg-login-field">
              <label className="dg-login-label" htmlFor="signup-password">Senha</label>
              <div className="dg-login-input-wrap">
                <input id="signup-password" value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} className="dg-login-input" placeholder="*********" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Mostrar senha"><img src="/img/login-eye.svg" alt="" className="dg-login-eye" /></button>
              </div>
              <span className="dg-field-error" />
            </div>
            <div className="dg-signup-criteria">
              {criteria.map(([label], index) => (
                <div className={`dg-signup-criteria-item ${met[index] ? 'criterio-met' : ''}`} key={label}>
                  <img src="/img/signup-check.svg" alt="" className="dg-signup-check-icon" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <button type="submit" className="dg-login-btn-primary">Comece agora</button>
            <button type="button" className="dg-login-btn-google"><img src="/img/login-google-icon.png" alt="Google" className="dg-login-google-icon" />Cadastrar com o Google</button>
            <div className="dg-login-signup-row"><span>Ja possui uma conta?</span><a href="/login">Entrar</a></div>
          </form>
        </div>
        <p className="dg-login-copyright">Drop Games. All rights reserved. 2026</p>
      </div>
      <div className="dg-login-right"><video className="dg-login-video" src="/img/signup-video.mp4" autoPlay loop playsInline muted /></div>
    </div>
  );
}

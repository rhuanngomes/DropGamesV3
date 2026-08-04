import { useState } from 'react';
import { loginWithEmail, requestPasswordRecovery, startSteamLogin } from '../services/index.js';
import { validateEmail } from '../utils/index.js';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {
      email: validateEmail(form.email),
      password: form.password ? '' : 'Digite sua senha.',
    };

    setErrors(nextErrors);

    if (!Object.values(nextErrors).every((error) => !error)) return;

    setStatus('loading');

    try {
      await loginWithEmail(form);
      setStatus('success');
      window.location.href = '/perfil-gamer';
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
    }
  }

  async function handleRecovery(event) {
    event.preventDefault();
    const emailError = validateEmail(form.email);
    setErrors((current) => ({ ...current, email: emailError }));
    if (emailError) return;

    setStatus('loading');

    try {
      const result = await requestPasswordRecovery(form.email);
      setStatus('idle');
      setMessage(result.message);
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
    }
  }

  return (
    <div className="dg-login-page">
      <div className="dg-login-left">
        <a href="/" className="dg-login-logo"><img src="/img/logo-dropgames.svg" alt="DropGames" /></a>
        <div className="dg-login-form-wrap">
          <form className="dg-login-form" noValidate onSubmit={handleSubmit}>
            <div className="dg-login-heading-block"><p className="dg-login-title">Entre com seu perfil gamer</p><p className="dg-login-subtitle">Use uma conta de loja para gerar recomendacoes com base no seu historico real.</p></div>
            <button type="button" className="dg-steam-login-btn" onClick={startSteamLogin}>Entrar com Steam</button>
            <p className="dg-login-security-note">Login oficial via Steam. O DropGames nao acessa sua senha.</p>
            <div className="dg-login-divider"><span>ou use email como fallback</span></div>
            <div className="dg-login-field"><label className="dg-login-label" htmlFor="login-email">Email</label><div className="dg-login-input-wrap"><input id="login-email" type="email" className="dg-login-input" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="Seu email" /></div>{errors.email && <span className="dg-field-error">{errors.email}</span>}</div>
            <div className="dg-login-field">
              <label className="dg-login-label" htmlFor="login-password">Senha</label>
              <div className="dg-login-input-wrap">
                <input id="login-password" type={showPassword ? 'text' : 'password'} className="dg-login-input" value={form.password} onChange={(event) => updateField('password', event.target.value)} placeholder="*********" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Mostrar senha"><img src="/img/login-eye.svg" alt="" className="dg-login-eye" /></button>
              </div>
              {errors.password && <span className="dg-field-error">{errors.password}</span>}
            </div>
            <div className="dg-login-remember-row"><label className="dg-login-remember"><input type="checkbox" className="dg-login-checkbox" disabled /><span className="dg-login-remember-label">Sessao segura de 30 min</span></label><button type="button" className="dg-login-forgot dg-link-button" onClick={handleRecovery}>Recuperar senha</button></div>
            <section className="dg-auth-policy-card">
              <strong>Protecao contra brute force</strong>
              <p>Apos 5 tentativas invalidas, o backend local bloqueia novos logins por 10 minutos para o mesmo email e origem.</p>
            </section>
            {message && <p className={status === 'error' ? 'dg-auth-message dg-auth-message--error' : 'dg-auth-message'}>{message}</p>}
            <button type="submit" className="dg-login-btn-primary" disabled={status === 'loading'}>{status === 'loading' ? 'Verificando...' : 'Entrar'}</button>
            <div className="dg-login-signup-row"><span>Nao possui uma conta?</span><a href="/signup">Cadastrar</a></div>
          </form>
        </div>
        <p className="dg-login-copyright">Drop Games. All rights reserved. 2026</p>
      </div>
      <div className="dg-login-right"><video className="dg-login-video" src="/img/login-video.mp4" autoPlay loop playsInline muted /></div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { signupWithEmail, startSteamLogin } from '../services/index.js';
import {
  getAgeProtectionPolicy,
  getPasswordStrength,
  passwordRules,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateRequiredName,
} from '../utils/index.js';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    ageGroup: 'adult',
    guardianConsent: false,
    privacyConsent: false,
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const met = useMemo(() => passwordRules.map(([, check]) => check(form.password)), [form.password]);
  const passwordStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);
  const agePolicy = useMemo(() => getAgeProtectionPolicy(form.ageGroup), [form.ageGroup]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {
      name: validateRequiredName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirmPassword: validatePasswordConfirmation(form.password, form.confirmPassword),
      ageGroup: agePolicy.canCreateAccount ? '' : 'Este prototipo bloqueia cadastro abaixo de 13 anos.',
      guardianConsent: form.ageGroup === 'teen' && !form.guardianConsent ? 'Perfis de adolescentes exigem ciencia de um responsavel.' : '',
      privacyConsent: form.privacyConsent ? '' : 'Aceite a politica de privacidade para continuar.',
    };

    setErrors(nextErrors);

    if (!Object.values(nextErrors).every((error) => !error)) return;

    setStatus('loading');

    try {
      await signupWithEmail(form);
      setStatus('success');
      window.location.href = '/perfil-gamer';
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
            <div className="dg-login-heading-block"><p className="dg-login-title">Crie seu DNA gamer</p><p className="dg-login-subtitle">Conecte uma conta gamer para personalizar ofertas, matches e insights.</p></div>
            <button type="button" className="dg-steam-login-btn" onClick={startSteamLogin}>Cadastrar com Steam</button>
            <p className="dg-login-security-note">Login oficial via Steam. O DropGames nao acessa sua senha.</p>
            <div className="dg-login-divider"><span>ou cadastre com email</span></div>
            <div className="dg-login-field"><label className="dg-login-label" htmlFor="signup-nome">Nome</label><div className="dg-login-input-wrap"><input id="signup-nome" type="text" className="dg-login-input" value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Seu nome" /></div>{errors.name && <span className="dg-field-error">{errors.name}</span>}</div>
            <div className="dg-login-field"><label className="dg-login-label" htmlFor="signup-email">Email</label><div className="dg-login-input-wrap"><input id="signup-email" type="email" className="dg-login-input" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="Seu email" /></div>{errors.email && <span className="dg-field-error">{errors.email}</span>}</div>
            <div className="dg-login-field">
              <label className="dg-login-label" htmlFor="signup-age">Faixa etaria</label>
              <select id="signup-age" className="dg-login-input" value={form.ageGroup} onChange={(event) => updateField('ageGroup', event.target.value)}>
                <option value="adult">18 anos ou mais</option>
                <option value="teen">13 a 17 anos</option>
                <option value="under13">Menor de 13 anos</option>
              </select>
              <p className="dg-security-inline-note">{agePolicy.text}</p>
              {errors.ageGroup && <span className="dg-field-error">{errors.ageGroup}</span>}
            </div>
            <div className="dg-login-field">
              <label className="dg-login-label" htmlFor="signup-password">Senha</label>
              <div className="dg-login-input-wrap">
                <input id="signup-password" value={form.password} onChange={(event) => updateField('password', event.target.value)} type={showPassword ? 'text' : 'password'} className="dg-login-input" placeholder="*********" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Mostrar senha"><img src="/img/login-eye.svg" alt="" className="dg-login-eye" /></button>
              </div>
              <PasswordStrengthMeter strength={passwordStrength} />
              {errors.password && <span className="dg-field-error">{errors.password}</span>}
            </div>
            <div className="dg-login-field"><label className="dg-login-label" htmlFor="signup-confirm-password">Confirmar senha</label><div className="dg-login-input-wrap"><input id="signup-confirm-password" value={form.confirmPassword} onChange={(event) => updateField('confirmPassword', event.target.value)} type={showPassword ? 'text' : 'password'} className="dg-login-input" placeholder="Repita a senha" /></div>{errors.confirmPassword && <span className="dg-field-error">{errors.confirmPassword}</span>}</div>
            <div className="dg-signup-criteria">
              {passwordRules.map(([label], index) => (
                <div className={`dg-signup-criteria-item ${met[index] ? 'criterio-met' : ''}`} key={label}>
                  <img src="/img/signup-check.svg" alt="" className="dg-signup-check-icon" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
            {passwordStrength.isCompromised && <span className="dg-field-error">Essa senha se parece com senhas comuns ou vazadas.</span>}
            {form.ageGroup === 'teen' && (
              <label className="dg-consent-check">
                <input type="checkbox" checked={form.guardianConsent} onChange={(event) => updateField('guardianConsent', event.target.checked)} />
                <span>Confirmo que um responsavel esta ciente do uso do DropGames e das recomendacoes de jogos.</span>
              </label>
            )}
            <label className="dg-consent-check">
              <input type="checkbox" checked={form.privacyConsent} onChange={(event) => updateField('privacyConsent', event.target.checked)} />
              <span>Aceito o uso minimo dos meus dados para conta, seguranca, recomendacoes e comparacao de ofertas.</span>
            </label>
            {errors.guardianConsent && <span className="dg-field-error">{errors.guardianConsent}</span>}
            {errors.privacyConsent && <span className="dg-field-error">{errors.privacyConsent}</span>}
            <section className="dg-auth-policy-card">
              <strong>Politica de senha e conta segura</strong>
              <p>Senhas de email sao enviadas apenas ao backend local, processadas com salt e PBKDF2, e a sessao usa cookie HttpOnly com expiracao. Em producao, a mesma regra deve rodar em um backend persistente com HTTPS.</p>
            </section>
            {message && <span className="dg-field-error">{message}</span>}
            <button type="submit" className="dg-login-btn-primary" disabled={status === 'loading'}>{status === 'loading' ? 'Criando conta...' : 'Comece agora'}</button>
            <div className="dg-login-signup-row"><span>Ja possui uma conta?</span><a href="/login">Entrar</a></div>
          </form>
        </div>
        <p className="dg-login-copyright">Drop Games. All rights reserved. 2026</p>
      </div>
      <div className="dg-login-right"><video className="dg-login-video" src="/img/signup-video.mp4" autoPlay loop playsInline muted /></div>
    </div>
  );
}

function PasswordStrengthMeter({ strength }) {
  return (
    <div className={`dg-password-meter dg-password-meter--${strength.level}`}>
      <div><span style={{ width: `${strength.score}%` }} /></div>
      <strong>{strength.label}</strong>
    </div>
  );
}

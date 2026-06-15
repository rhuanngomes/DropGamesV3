import { useState } from 'react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="dg-login-page">
      <div className="dg-login-left">
        <a href="/" className="dg-login-logo"><img src="/img/logo-dropgames.svg" alt="DropGames" /></a>
        <div className="dg-login-form-wrap">
          <form className="dg-login-form" noValidate>
            <div className="dg-login-heading-block"><p className="dg-login-title">Bem-vindo de volta!</p><p className="dg-login-subtitle">Bem-vindo de volta! Por favor, insira seus dados.</p></div>
            <div className="dg-login-field"><label className="dg-login-label" htmlFor="login-email">Email</label><div className="dg-login-input-wrap"><input id="login-email" type="email" className="dg-login-input" placeholder="Seu email" /></div></div>
            <div className="dg-login-field">
              <label className="dg-login-label" htmlFor="login-password">Password</label>
              <div className="dg-login-input-wrap">
                <input id="login-password" type={showPassword ? 'text' : 'password'} className="dg-login-input" placeholder="*********" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Mostrar senha"><img src="/img/login-eye.svg" alt="" className="dg-login-eye" /></button>
              </div>
            </div>
            <div className="dg-login-remember-row"><label className="dg-login-remember"><input type="checkbox" className="dg-login-checkbox" /><span className="dg-login-remember-label">Lembrar por 30 dias</span></label><a href="#" className="dg-login-forgot">Forgot password</a></div>
            <button type="submit" className="dg-login-btn-primary">Entrar</button>
            <button type="button" className="dg-login-btn-google"><img src="/img/login-google-icon.png" alt="Google" className="dg-login-google-icon" />Sign in with Google</button>
            <div className="dg-login-signup-row"><span>Don`t have an account?</span><a href="/signup">Sign up</a></div>
          </form>
        </div>
        <p className="dg-login-copyright">Drop Games. All rights reserved. 2026</p>
      </div>
      <div className="dg-login-right"><video className="dg-login-video" src="/img/login-video.mp4" autoPlay loop playsInline muted /></div>
    </div>
  );
}

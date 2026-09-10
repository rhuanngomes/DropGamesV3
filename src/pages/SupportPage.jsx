import { useState } from 'react';
import { PageShell } from '../components/layout/index.js';
import { formatPhone, validateEmail, validatePhone, validateRequiredName } from '../utils/index.js';

export default function SupportPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', privacy: false });
  const [errors, setErrors] = useState({});

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: field === 'phone' ? formatPhone(value) : value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {
      firstName: validateRequiredName(form.firstName, 'primeiro nome'),
      lastName: validateRequiredName(form.lastName, 'ultimo nome'),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      privacy: form.privacy ? '' : 'Aceite a politica de privacidade para continuar.',
    };

    const firstInvalidField = ['firstName', 'lastName', 'email', 'phone', 'privacy'].find((field) => nextErrors[field]);
    setErrors(nextErrors);

    if (Object.values(nextErrors).every((message) => !message)) {
      window.location.href = '/contato-enviado';
      return;
    }

    const fieldIds = { firstName: 'primeiro-nome', lastName: 'ultimo-nome', email: 'email', phone: 'telefone', privacy: 'privacidade' };
    window.requestAnimationFrame(() => document.getElementById(fieldIds[firstInvalidField])?.focus());
  }

  return (
    <PageShell active="/suporte" bodyClass="dg-suporte-page min-h-screen">
      <section className="dg-contact-section">
        <div className="dg-contact-inner">
          <div className="dg-contact-form-col">
            <div className="dg-contact-heading-block">
              <h1 id="support-form-title" className="dg-contact-heading">Entre em contato</h1>
              <p className="dg-contact-sub">Nossa equipe atenciosa adoraria ouvir de você.</p>
            </div>
            <form className="dg-contact-form-body" noValidate onSubmit={handleSubmit} aria-labelledby="support-form-title">
              <div className="dg-contact-fields">
                <div className="dg-contact-row">
                  <div className="dg-contact-field dg-contact-field--half"><label className="dg-contact-label" htmlFor="primeiro-nome">Primeiro nome <span aria-hidden="true">*</span></label><input id="primeiro-nome" name="firstName" type="text" autoComplete="given-name" required aria-invalid={Boolean(errors.firstName)} aria-describedby={errors.firstName ? 'primeiro-nome-error' : undefined} className="dg-contact-input" value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} placeholder="Primeiro nome" />{errors.firstName && <span id="primeiro-nome-error" className="dg-field-error" role="alert">{errors.firstName}</span>}</div>
                  <div className="dg-contact-field dg-contact-field--half"><label className="dg-contact-label" htmlFor="ultimo-nome">Último nome <span aria-hidden="true">*</span></label><input id="ultimo-nome" name="lastName" type="text" autoComplete="family-name" required aria-invalid={Boolean(errors.lastName)} aria-describedby={errors.lastName ? 'ultimo-nome-error' : undefined} className="dg-contact-input" value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} placeholder="Ultimo nome" />{errors.lastName && <span id="ultimo-nome-error" className="dg-field-error" role="alert">{errors.lastName}</span>}</div>
                </div>
                <div className="dg-contact-field"><label className="dg-contact-label" htmlFor="email">Email <span aria-hidden="true">*</span></label><input id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} className="dg-contact-input" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="you@gmail.com" />{errors.email && <span id="email-error" className="dg-field-error" role="alert">{errors.email}</span>}</div>
                <div className="dg-contact-field"><label className="dg-contact-label" htmlFor="telefone">Telefone <span aria-hidden="true">*</span></label><input id="telefone" name="phone" type="tel" autoComplete="tel" required aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'telefone-error' : undefined} className="dg-contact-input" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="+55 (21) 98834-8765" />{errors.phone && <span id="telefone-error" className="dg-field-error" role="alert">{errors.phone}</span>}</div>
                <div className="dg-contact-checkbox-wrap"><input type="checkbox" id="privacidade" name="privacy" className="dg-contact-checkbox" checked={form.privacy} onChange={(event) => updateField('privacy', event.target.checked)} required aria-invalid={Boolean(errors.privacy)} aria-describedby={errors.privacy ? 'privacidade-error' : undefined} /><label htmlFor="privacidade" className="dg-contact-checkbox-label">Você concorda com nossa política de privacidade amigável.</label></div>
                {errors.privacy && <span id="privacidade-error" className="dg-field-error" role="alert">{errors.privacy}</span>}
              </div>
              <button type="submit" className="dg-contact-submit">Enviar</button>
            </form>
          </div>
          <img src="/img/contact-hero.jpg" alt="" className="dg-contact-img" />
        </div>
      </section>
    </PageShell>
  );
}

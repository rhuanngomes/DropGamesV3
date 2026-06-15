import { PageShell } from '../components/Layout.jsx';

export default function SupportPage() {
  return (
    <PageShell active="/suporte" bodyClass="dg-suporte-page min-h-screen">
      <section className="dg-contact-section">
        <div className="dg-contact-inner">
          <div className="dg-contact-form-col">
            <div className="dg-contact-heading-block">
              <h1 className="dg-contact-heading">Entre em contato</h1>
              <p className="dg-contact-sub">Nossa equipe atenciosa adoraria ouvir de você.</p>
            </div>
            <form className="dg-contact-form-body" onSubmit={(event) => { event.preventDefault(); window.location.href = '/contato-enviado'; }}>
              <div className="dg-contact-fields">
                <div className="dg-contact-row">
                  <div className="dg-contact-field dg-contact-field--half"><label className="dg-contact-label" htmlFor="primeiro-nome">Primeiro nome <span>*</span></label><input id="primeiro-nome" type="text" className="dg-contact-input" placeholder="Primeiro nome" /></div>
                  <div className="dg-contact-field dg-contact-field--half"><label className="dg-contact-label" htmlFor="ultimo-nome">Último nome <span>*</span></label><input id="ultimo-nome" type="text" className="dg-contact-input" placeholder="Ultimo nome" /></div>
                </div>
                <div className="dg-contact-field"><label className="dg-contact-label" htmlFor="email">Email <span>*</span></label><input id="email" type="email" className="dg-contact-input" placeholder="you@gmail.com" /></div>
                <div className="dg-contact-field"><label className="dg-contact-label" htmlFor="telefone">Telefone <span>*</span></label><input id="telefone" type="tel" className="dg-contact-input" placeholder="+55 (21) 98834-8765" /></div>
                <div className="dg-contact-checkbox-wrap"><input type="checkbox" id="privacidade" className="dg-contact-checkbox" /><label htmlFor="privacidade" className="dg-contact-checkbox-label">Você concorda com nossa política de privacidade amigável.</label></div>
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

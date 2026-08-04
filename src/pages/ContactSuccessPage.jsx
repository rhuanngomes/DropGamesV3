import { PageShell } from '../components/layout/index.js';

export default function ContactSuccessPage() {
  return (
    <PageShell active="/suporte" bodyClass="dg-success-page min-h-screen">
      <section className="dg-success-section">
        <div className="dg-success-inner">
          <div className="dg-success-card">
            <div className="dg-success-content">
              <div className="dg-success-icon-wrap"><img src="/img/icon-feature.svg" alt="" className="dg-success-icon" /></div>
              <div className="dg-success-text"><p className="dg-success-title">Contato enviado!</p><p className="dg-success-desc">Recebemos seus dados de contato. Fique atento, pois nosso time entrará em contato!</p></div>
            </div>
            <a href="/suporte" className="dg-success-btn">Voltar</a>
          </div>
          <div className="dg-success-img-panel"><img src="/img/contact-success-mario.png" alt="" className="dg-success-mario" /></div>
        </div>
      </section>
    </PageShell>
  );
}

import { PageShell } from '../components/Layout.jsx';

const stats = [
  ['82,8%', 'Dos brasileiros consomem jogos digitais em 2025'],
  ['103 mi', 'de jogadores no Brasil'],
  ['R$12 BI', 'Movimentados pelo mercado de games no Brasil'],
  ['05', 'Lojas onde os preços do jogo variam 40% sem ninguem ver'],
];

const featureRows = [
  {
    title: 'O problema que resolvemos',
    desc: 'O gamer brasileiro gasta tempo e dinheiro desnecessários na hora de comprar um jogo. Sem uma ferramenta centralizada em português, a decisão de compra depende de sorte, de grupos de WhatsApp ou de amigos que acompanham promoções o tempo todo.',
    image: 'dados-feature1.jpg',
    bullets: ['Preços variam entre lojas sem aviso', 'Promoções têm prazo e o jogador perde por falta de informação', 'Interfaces de comparadores globais são pouco acessíveis'],
  },
  {
    title: 'Como chegamos na solução',
    desc: 'Mapeamos o comportamento de compra de jogadores em diferentes plataformas e faixas de renda. Identificamos que o maior valor de um comparador não é mostrar o menor preço, mas traduzir a confusão do mercado em uma tela clara.',
    image: 'dados-feature2.jpg',
    reverse: true,
    bullets: ['Uma tela. Todas as lojas. O melhor preço.', 'Interface em português, preços em real', 'Desenvolvido por gamers, para gamers'],
  },
  {
    title: 'O que vem pela frente',
    desc: 'O DropGames está em evolução contínua. Com a base estática entregue na Fase 1 e a interatividade da Fase 2, as próximas entregas incluem comparação de preços em tempo real, histórico de preços e recomendações por IA baseadas no perfil do usuário.',
    image: 'dados-feature3.jpg',
    wrapped: true,
    bullets: ['Integração com APIs de lojas parceiras', 'Histórico e gráfico de evolução de preços', 'Recomendações personalizadas por IA'],
  },
];

function FeatureText({ row }) {
  return (
    <div className="dg-dados-feature-text">
      <div className="dg-dados-feature-header">
        <div className="dg-dados-feature-icon"><img src="/img/icon-feature.svg" alt="" /></div>
        <div className="dg-dados-feature-titles"><p className="dg-dados-feature-title">{row.title}</p><p className="dg-dados-feature-desc">{row.desc}</p></div>
      </div>
      <div className="dg-dados-bullets">
        {row.bullets.map((bullet) => (
          <div className="dg-dados-bullet" key={bullet}>
            <img src="/img/dados-bullet.svg" alt="" className="dg-dados-bullet-icon" />
            <p className="dg-dados-bullet-text">{bullet}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DataPage() {
  return (
    <PageShell active="/dados" bodyClass="dg-dados-page min-h-screen">
      <section className="dg-dados-hero">
        <div className="dg-dados-hero-inner">
          <p className="dg-dados-label">Pesquisa e dados</p>
          <h1 className="dg-dados-heading">Os números que nos fizeram construir o DropGames</h1>
          <p className="dg-dados-subheading">Antes de qualquer linha de código, estudamos o mercado. Aqui estão os dados reais sobre o jogador brasileiro que embasaram cada decisão do projeto, da interface ao escopo de funcionalidades.</p>
        </div>
      </section>
      <section className="dg-dados-stats">
        <div className="dg-dados-stats-inner">
          <img src="/img/dados-stats-image.jpg" alt="" className="dg-dados-stats-img" />
          <div className="dg-dados-stats-content">
            <div className="dg-dados-stats-header"><p className="dg-dados-label">O mercado que nos motivou</p><h2 className="dg-dados-stats-heading">Estamos só no começo dessa jornada.</h2></div>
            <div className="dg-dados-stats-grid">
              {[0, 2].map((start) => (
                <div className="dg-dados-stats-row" key={start}>
                  {stats.slice(start, start + 2).map(([number, desc]) => (
                    <div className="dg-dados-stat" key={number}><p className="dg-dados-stat-number">{number}</p><p className="dg-dados-stat-desc">{desc}</p></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="dg-dados-story">
        <div className="dg-dados-story-inner">
          <div className="dg-dados-story-header">
            <div className="dg-dados-story-titles"><p className="dg-dados-label">Nossa história</p><h2 className="dg-dados-story-heading">Comceçamos do zero. Assim como todo bom jogo.</h2></div>
            <p className="dg-dados-story-sub">It is a long established fact that a reader will be distracted by the readable</p>
          </div>
          <div className="dg-dados-story-cols">
            <div className="dg-dados-story-col">
              <p>A ideia do DropGames surgiu de uma observação simples: o Brasil é um dos maiores mercados de games do mundo, com mais de 103 milhões de jogadores, mas ainda não tinha um comparador de preços feito para o jogador brasileiro de verdade.</p>
              <p>As ferramentas existentes eram globais, em inglês, com preços em dólar e interfaces confusas que cansavam mais do que ajudavam.</p>
              <p>A partir desses dados, definimos o escopo: um comparador focado no Brasil, em português, com preços em real, que centralizasse Steam, Epic, Origin e outras lojas em uma tela só.</p>
            </div>
            <div className="dg-dados-story-col">
              <p>O perfil do gamer brasileiro também nos surpreendeu durante a pesquisa. A maioria dos jogadores pertence à classe média, totalizando 64,8% do público.</p>
              <p>As plataformas preferidas são smartphones, com 48,8%, seguidos por computadores, com 22,6%, e consoles, com 21,7%.</p>
              <p>Com esse embasamento, o grupo dividiu responsabilidades, criou os wireframes, codificou cada página e entregou a primeira versão em março de 2026.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="dg-dados-features">
        <div className="dg-dados-features-header"><h2 className="dg-dados-features-heading">Um projeto com propósito.</h2><p className="dg-dados-features-sub">Cada decisão do DropGames foi baseada em dados reais sobre como o jogador brasileiro compra, economiza e joga.</p></div>
        <div className="dg-dados-features-list">
          {featureRows.map((row) => (
            <div className="dg-dados-feature-row" key={row.title}>
              <div className="dg-dados-feature-inner">
                {!row.reverse && <FeatureText row={row} />}
                {row.wrapped ? <div className="dg-dados-feature-img-wrap"><img src={`/img/${row.image}`} alt="" /></div> : <img src={`/img/${row.image}`} alt="" className="dg-dados-feature-img" />}
                {row.reverse && <FeatureText row={row} />}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="dg-dados-cta">
        <div className="dg-dados-cta-inner">
          <div className="dg-dados-cta-text"><h2 className="dg-dados-cta-heading">Seu próximo jogo pode estar em promoção agora.</h2><p className="dg-dados-cta-sub">Cadastre seu e-mail e seja o primeiro a saber quando o preço cair.</p></div>
          <div className="dg-dados-cta-form"><div className="dg-dados-input-wrap"><input type="email" className="dg-dados-input" placeholder="Enter your email" /><p className="dg-dados-input-hint">Seus dados estão seguros. Consulte nossa política de privacidade</p></div><button className="dg-btn dg-btn-primary dg-btn-lg">Receber alertas</button></div>
        </div>
      </section>
    </PageShell>
  );
}

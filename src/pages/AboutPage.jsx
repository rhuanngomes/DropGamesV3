import { FeatureCard } from '../components/games/index.js';
import { PageShell } from '../components/layout/index.js';

const team = [
  ['team-member-1.jpg', 'Gabriela de Souza Neves', 'Design e apresentação', 'Responsável pela identidade visual, wireframes e pela forma como o DropGames se comunica visualmente.'],
  ['team-member-2.jpg', 'Valentino Matos Carvalho', 'Front-end e responsividade', 'Transformou layouts em código. Garante que o DropGames funcione bem em qualquer tela, do celular ao desktop.'],
  ['team-member-3.jpg', 'Enzo Almeida Veríssimo', 'Interface e experiência do usuário', 'Cuida da home e da primeira impressão. Se o site parece intuitivo, é porque o Enzo fez funcionar assim.'],
  ['team-member-4.jpg', 'Rhuann Gomes dos Santos', 'Back-end e arquitetura', 'Responsável pela lógica de validação, segurança de dados e estrutura que sustenta o DropGames por dentro.'],
  ['team-member-5.jpg', 'Leonardo Dias de Oliveira', 'Pesquisa e conteúdo', 'Mergulhou nos dados do mercado de games para entender o jogador brasileiro antes de escrever uma linha de código.'],
];

const features = [
  ['Comparador de preços', 'Reunimos em uma tela só os preços dos principais jogos digitais nas maiores lojas do mercado. Sem abrir várias abas, sem perder tempo.'],
  ['Feito para o Brasil', 'Preços em real, lojas brasileiras e interface em português. Cada detalhe foi pensado para o jogador daqui.'],
  ['Pesquisa de verdade', 'Antes de escrever uma linha de código, estudamos o comportamento de compra do gamer brasileiro. O produto nasceu desses dados.'],
  ['Protótipo em evolução', 'O que você vê hoje é o começo. A cada fase, novas funcionalidades são adicionadas: login, histórico de preços e recomendações por IA.'],
  ['Projeto acadêmico real', 'Desenvolvido por cinco estudantes de Sistemas de Informação da FIAP, o DropGames é um projeto acadêmico tratado como produto real.'],
  ['Código aberto e documentado', 'Todo o desenvolvimento está disponível no GitHub, com documentação atualizada a cada entrega e com histórico de contribuições.'],
];

function TeamCard({ member }) {
  const [image, name, role, desc] = member;
  return (
    <div className="dg-team-card">
      <div className="dg-team-photo-wrap"><img src={`/img/${image}`} alt={name} className="dg-team-photo" /></div>
      <div className="dg-team-info">
        <div><p className="dg-team-name">{name}</p><p className="dg-team-role">{role}</p></div>
        <p className="dg-team-desc">{desc}</p>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <PageShell active="/sobre-nos" bodyClass="dg-about-page min-h-screen">
      <section className="dg-about-hero">
        <div className="dg-about-hero-inner">
          <p className="dg-about-label">Sobre nós</p>
          <h1 className="dg-about-heading">Feito para quem ama o game.</h1>
          <p className="dg-about-subheading">O DropGames nasceu de uma frustração real: jogos bons custam caro, e encontrar o melhor preço consome tempo que poderia ser gasto jogando. Construímos uma solução simples, direta e pensada para o jogador brasileiro.</p>
        </div>
      </section>
      <section className="dg-team-section">
        <div className="dg-team-header">
          <div className="dg-team-header-text">
            <p className="dg-about-label">Conheça o time</p>
            <h2 className="dg-team-heading">Cinco pessoas. Uma missão.</h2>
            <p className="dg-team-subheading">Somos estudantes de Sistemas de Informação da FIAP que transformaram uma dor do dia a dia em um produto real.</p>
          </div>
          <div className="dg-team-header-actions"><button className="dg-btn dg-btn-outline-dark dg-btn-lg">Sobre o projeto</button><button className="dg-btn dg-btn-primary dg-btn-lg">Ver os jogos</button></div>
        </div>
        <div className="dg-team-grid">
          <div className="dg-team-row">{team.slice(0, 3).map((member) => <TeamCard key={member[1]} member={member} />)}</div>
          <div className="dg-team-row dg-team-row--centered">{team.slice(3).map((member) => <TeamCard key={member[1]} member={member} />)}</div>
        </div>
      </section>
      <section className="dg-features-section">
        <div className="dg-features-header"><p className="dg-about-label">O projeto</p><h2 className="dg-features-heading">O que é o DropGames? Muita coisa. Mas resumindo:</h2></div>
        <div className="dg-features-grid">{features.map(([title, desc]) => <FeatureCard key={title} title={title} desc={desc} />)}</div>
      </section>
      <section className="dg-origin-section">
        <div className="dg-origin-inner">
          <div className="dg-origin-text">
            <div className="dg-origin-copy">
              <p className="dg-about-label">A origem do DropGames</p>
              <h2 className="dg-origin-heading">Começamos com uma dor simples.</h2>
              <p className="dg-origin-desc">Todo gamer já perdeu tempo abrindo aba após aba tentando descobrir onde o mesmo jogo estava mais barato. O DropGames nasceu para acabar com isso. Uma tela. Todas as lojas. O melhor preço na sua frente.</p>
            </div>
            <div className="dg-origin-actions"><button className="dg-btn dg-btn-outline-dark dg-btn-lg">Nossa proposta</button><button className="dg-btn dg-btn-primary dg-btn-lg">Explorar jogos</button></div>
          </div>
          <div className="dg-collage">
            <div className="dg-collage-row dg-collage-row--top"><div className="dg-collage-img dg-collage-img--sq160"><img src="/img/about-collage-1.jpg" alt="" /></div><div className="dg-collage-img dg-collage-img--p160"><img src="/img/about-collage-2.jpg" alt="" /></div></div>
            <div className="dg-collage-row dg-collage-row--bottom"><div className="dg-collage-img dg-collage-img--sq192"><img src="/img/about-collage-3.jpg" alt="" /></div><div className="dg-collage-img dg-collage-img--p160"><img src="/img/about-collage-4.png" alt="" /></div><div className="dg-collage-img dg-collage-img--sq192"><img src="/img/about-collage-5.png" alt="" /></div></div>
          </div>
        </div>
      </section>
      <section className="dg-about-cta">
        <div className="dg-about-cta-inner">
          <div className="dg-about-cta-text"><h2 className="dg-about-cta-heading">Seu próximo jogo pode estar em promoção agora.</h2><p className="dg-about-cta-sub">Cadastre seu e-mail e seja o primeiro a saber quando o preço cair.</p></div>
          <div className="dg-about-cta-form"><div className="dg-about-input-wrap"><div className="dg-about-input-group"><input type="email" className="dg-about-input" placeholder="Enter your email" /></div><p className="dg-about-input-hint">Seus dados estão seguros. Consulte nossa política de privacidade</p></div><button className="dg-btn dg-btn-primary dg-btn-lg">Receber alertas</button></div>
        </div>
      </section>
    </PageShell>
  );
}

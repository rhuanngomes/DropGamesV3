import { useEffect, useState } from 'react';
import { PageShell } from '../components/layout/index.js';
import { getAdminMetrics, getEmailSession } from '../services/index.js';
import { projectUsers } from '../utils/userProjection.js';

const mockInsights = [
  { label: 'Retenção em 7 dias', value: '68%', trend: '+4,2%', note: 'Coorte demonstrativa' },
  { label: 'Ofertas visualizadas', value: '1.284', trend: '+12,6%', note: 'Últimas 24 horas · mock' },
  { label: 'Alertas criados', value: '186', trend: '+8,1%', note: 'Últimos 7 dias · mock' },
  { label: 'Conversão em oferta', value: '14,7%', trend: '+1,8%', note: 'Amostra demonstrativa' },
];

function GrowthModel() {
  const [values, setValues] = useState({ initialUsers: 1000, monthlyRate: 5, months: 12 });
  const series = projectUsers(values);
  const result = series.at(-1).users;
  const update = (field) => (event) => {
    const limits = field === 'monthlyRate' ? [-50, 50] : field === 'months' ? [1, 36] : [1, 1000000];
    const value = Math.min(limits[1], Math.max(limits[0], Number(event.target.value) || limits[0]));
    setValues((current) => ({ ...current, [field]: value }));
  };

  return <section className="dg-admin-panel dg-admin-model">
    <div className="dg-admin-panel-heading"><div><p className="dg-admin-eyebrow">Planejamento</p><h2>Imagine o próximo capítulo.</h2></div><p>Uma simulação simples para explorar a evolução da comunidade. Não representa uma previsão.</p></div>
    <div className="dg-admin-model-body"><div className="dg-admin-model-fields">
      <label>Base atual<input type="number" min="1" max="1000000" value={values.initialUsers} onChange={update('initialUsers')} /></label>
      <label>Variação mensal<input type="number" min="-50" max="50" value={values.monthlyRate} onChange={update('monthlyRate')} /><span>%</span></label>
      <label>Período<input type="number" min="1" max="36" value={values.months} onChange={update('months')} /><span>meses</span></label>
    </div><div className="dg-admin-model-result"><span>Cenário ao final do período</span><strong>{Math.round(result).toLocaleString('pt-BR')}</strong><small>usuários estimados</small></div></div>
  </section>;
}

function LoadingState() {
  return <main className="dg-admin-gate"><div className="dg-admin-gate-card"><span className="dg-admin-spinner" /><p>Preparando sua visão do produto…</p></div></main>;
}

export default function DataPage() {
  const [state, setState] = useState({ status: 'loading', metrics: null, user: null });

  useEffect(() => {
    let active = true;
    Promise.all([getEmailSession(), getAdminMetrics()])
      .then(([session, metrics]) => active && setState({ status: 'ready', metrics, user: session.user }))
      .catch(() => active && setState({ status: 'denied', metrics: null, user: null }));
    return () => { active = false; };
  }, []);

  if (state.status === 'loading') return <LoadingState />;
  if (state.status === 'denied') {
    return <main className="dg-admin-gate"><div className="dg-admin-gate-card"><p className="dg-admin-eyebrow">Área reservada</p><h1>Esta visão pede acesso de administrador.</h1><p>Entre com uma conta autorizada para acompanhar a operação da DropGames.</p><a className="dg-btn dg-btn-primary" href="/login">Entrar com outra conta</a></div></main>;
  }

  const { metrics, user } = state;
  const primaryMetrics = [
    { label: 'Agora na plataforma', value: metrics.activeUsers, note: 'sessões autenticadas ativas' },
    { label: 'Contas cadastradas', value: metrics.registeredUsers, note: 'registros reais neste ambiente' },
    { label: 'Tempo médio hoje', value: `${metrics.averageDailyMinutes} min`, note: 'por sessão autenticada' },
    { label: 'Novas contas hoje', value: metrics.newUsersToday, note: 'desde 00:00' },
  ];

  return (
    <PageShell active="/dados" bodyClass="dg-dados-page dg-admin-page min-h-screen">
      <section className="dg-admin-hero">
        <div><p className="dg-admin-eyebrow">Visão do produto</p><h1>O essencial, em um só olhar.</h1><p>Olá, {user.name.split(' ')[0]}. Acompanhe os sinais que ajudam a DropGames a ficar mais útil a cada dia.</p></div>
        <span className="dg-admin-live"><i /> Atualizado agora</span>
      </section>

      <section className="dg-admin-content">
        <div className="dg-admin-kpis">
          {primaryMetrics.map((item) => <article className="dg-admin-kpi" key={item.label}><p>{item.label}</p><strong>{item.value}</strong><span>{item.note}</span></article>)}
        </div>

        <section className="dg-admin-panel">
          <div className="dg-admin-panel-heading"><div><p className="dg-admin-eyebrow">Pulso da experiência</p><h2>As pessoas estão encontrando valor.</h2></div><p>Indicadores de comportamento para orientar as próximas melhorias.</p></div>
          <div className="dg-admin-insights">
            {mockInsights.map((item) => <article key={item.label}><p>{item.label}</p><strong>{item.value}</strong><span className="dg-admin-trend">{item.trend}</span><small>{item.note}</small></article>)}
          </div>
        </section>

        <GrowthModel />

        <section className="dg-admin-grid">
          <article className="dg-admin-panel dg-admin-health"><p className="dg-admin-eyebrow">Operação</p><h2>Tudo funcionando como deveria.</h2><div><span><i className="ok" />Autenticação</span><b>Operacional</b></div><div><span><i className="ok" />Catálogo e ofertas</span><b>Operacional</b></div><div><span><i className="ok" />Recomendações</span><b>Operacional</b></div></article>
          <article className="dg-admin-panel dg-admin-team"><p className="dg-admin-eyebrow">Acesso</p><h2>Um espaço de quem cuida do produto.</h2><p>{metrics.adminUsers} administradores podem consultar esta visão. {metrics.sessionsExpiringSoon ? `${metrics.sessionsExpiringSoon} sessão expira em breve.` : 'Nenhuma sessão expira nos próximos minutos.'}</p><small>Os indicadores sem a marca “mock” vêm do servidor local em tempo real.</small></article>
        </section>
      </section>
    </PageShell>
  );
}

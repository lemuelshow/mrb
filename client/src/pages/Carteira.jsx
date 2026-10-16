import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';
import Icon from '../components/Icon.jsx';
import PromotionCard from '../components/PromotionCard.jsx';
import {
  firstName,
  formatLongToday,
  formatMoney,
  formatNumber,
  formatShortDate
} from '../utils/format.js';

const TYPE_LABEL = { cashback: 'Cashback', bonus: 'Bônus', resgate: 'Resgate', pontos: 'Pontos' };

function formatTransactionValue(t) {
  if (t.points) return `+ ${formatNumber(t.points)} pts`;
  const sign = t.amount < 0 ? '-' : '+';
  return `${sign} ${formatMoney(Math.abs(t.amount))}`;
}

export default function Carteira() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    Promise.all([api.wallet(), api.transactions(5), api.missions(), api.promotions(), api.campaign()])
      .then(([wallet, transactions, missions, promotions, campaign]) => {
        if (!ignore) setData({ wallet, transactions, missions, promotions: promotions.slice(0, 3), campaign });
      })
      .catch((err) => !ignore && setError(err.message));
    return () => {
      ignore = true;
    };
  }, []);

  async function togglePromotion(promotion) {
    const updated = promotion.active ? await api.deactivate(promotion.id) : await api.activate(promotion.id);
    const wallet = await api.wallet();
    setData((current) => ({
      ...current,
      wallet,
      promotions: current.promotions.map((p) => (p.id === updated.id ? updated : p))
    }));
  }

  if (error) return <div className="alert alert--error" role="alert">{error}</div>;
  if (!data) return <div className="page-loading" role="status">Carregando sua carteira…</div>;

  const { wallet, transactions, missions, promotions, campaign } = data;
  const { level } = wallet;

  return (
    <div className="stack-xl">
      <div className="page-header">
        <div className="stack-xs">
          <span className="text-muted text-strong">{formatLongToday()}</span>
          <h1 className="heading-xl">Olá, {firstName(user?.name)}</h1>
        </div>
        <Link to="/promocoes" className="button button--dark">
          Ver promoções da semana <Icon name="arrowRight" size={16} />
        </Link>
      </div>

      <section aria-label="Resumo da carteira" className="summary-grid">
        <article className="summary-card summary-card--accent dotted">
          <div className="summary-card__head">
            <span className="eyebrow">SALDO DE BÔNUS</span>
            <Icon name="wallet" size={22} />
          </div>
          <span className="summary-card__value">{formatMoney(wallet.balance)}</span>
          <span className="summary-card__note">+ {formatMoney(wallet.earnedThisWeek)} nesta semana</span>
        </article>

        <article className="summary-card">
          <span className="eyebrow">PONTOS MRB</span>
          <span className="summary-card__value">
            {formatNumber(wallet.points)} <small>pts</small>
          </span>
          <span className="text-success">+ {formatNumber(wallet.pointsThisMonth)} pts este mês</span>
          {wallet.pointsExpiring && (
            <span className="text-muted summary-card__foot">
              {formatNumber(wallet.pointsExpiring.amount)} pts expiram em {formatShortDate(wallet.pointsExpiring.date)}
            </span>
          )}
        </article>

        <article className="summary-card">
          <span className="eyebrow">CUPONS ATIVOS</span>
          <span className="summary-card__value">{wallet.activeCoupons}</span>
          {wallet.couponsExpiringSoon > 0 && (
            <span className="text-promo">
              {wallet.couponsExpiringSoon === 1 ? '1 cupom vence' : `${wallet.couponsExpiringSoon} cupons vencem`} em até 1 dia
            </span>
          )}
          <Link to="/cupons" className="link-strong summary-card__foot">
            Ver meus cupons
          </Link>
        </article>

        <article className="summary-card">
          <div className="summary-card__head">
            <span className="eyebrow">SEU NÍVEL</span>
            <span className="pill pill--neutral">{level.current}</span>
          </div>
          <span className="heading-md">
            {level.next ? `Faltam ${formatNumber(level.pointsToNext)} pts para ${level.next}` : 'Você está no nível máximo'}
          </span>
          <div
            className="progress"
            role="progressbar"
            aria-label={level.next ? `Progresso para o nível ${level.next}` : 'Nível máximo'}
            aria-valuenow={level.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${level.progress}%` }} />
          </div>
          {level.nextBenefit && <span className="text-muted">No {level.next}: {level.nextBenefit.toLowerCase()}</span>}
        </article>
      </section>

      <section className="campaign">
        <div className="campaign__text">
          <span className="pill pill--promo">{campaign.badge}</span>
          <h2 className="campaign__title">{campaign.title}</h2>
          <p>{campaign.description}</p>
        </div>
        <Link to="/promocoes" className="button button--light button--lg campaign__cta">
          Ativar campanha
        </Link>
      </section>

      <section className="stack-md">
        <div className="section-header">
          <h2 className="heading-md">Promoções para você</h2>
          <Link to="/promocoes" className="link-strong">Ver todas</Link>
        </div>
        <div className="card-grid">
          {promotions.map((promotion) => (
            <PromotionCard key={promotion.id} promotion={promotion} onToggle={togglePromotion} compact />
          ))}
        </div>
      </section>

      <div className="split">
        <section className="panel split__main">
          <div className="section-header panel__header">
            <h2 className="heading-md">Atividade recente</h2>
            <a href="#extrato" className="link-strong">Extrato completo</a>
          </div>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">DATA</th>
                  <th scope="col">DESCRIÇÃO</th>
                  <th scope="col">TIPO</th>
                  <th scope="col" className="align-right">VALOR</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{formatShortDate(t.date)}</td>
                    <td>{t.description}</td>
                    <td>{TYPE_LABEL[t.type]}</td>
                    <td className={`align-right text-strong ${t.amount < 0 ? 'text-danger' : 'text-success'}`}>
                      {formatTransactionValue(t)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel split__side stack-md">
          <h2 className="heading-md">Missões do mês</h2>
          {missions.map((mission) => {
            const done = mission.progress >= mission.goal;
            if (done) {
              return (
                <div key={mission.id} className="mission mission--done">
                  <Icon name="check" strokeWidth={2.4} /> {mission.title} — concluída
                </div>
              );
            }
            return (
              <div key={mission.id} className="mission stack-xs">
                <div className="mission__row">
                  <span>{mission.title}</span>
                  <span className="text-muted">
                    {mission.progress}/{mission.goal}
                  </span>
                </div>
                <div
                  className="progress progress--sm"
                  role="progressbar"
                  aria-label={mission.title}
                  aria-valuenow={mission.progress}
                  aria-valuemin={0}
                  aria-valuemax={mission.goal}
                >
                  <span style={{ width: `${(mission.progress / mission.goal) * 100}%` }} />
                </div>
                <span className="text-muted">Recompensa: {mission.reward}</span>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { describeValidity } from '../utils/format.js';

export default function PromotionCard({ promotion, onToggle, compact = false }) {
  const [busy, setBusy] = useState(false);
  const urgent = promotion.daysLeft <= 1;

  async function handleClick() {
    setBusy(true);
    try {
      await onToggle(promotion);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className={`promo-card${compact ? ' promo-card--compact' : ''}`}>
      <div className={`promo-card__band${promotion.highlight ? ' promo-card__band--accent' : ''}`}>
        <span className="promo-card__discount">{promotion.discount}</span>
        <span className="promo-card__category">{promotion.category}</span>
      </div>
      <div className="promo-card__body">
        <div className="stack-xs">
          <h3 className="promo-card__title">{promotion.title}</h3>
          <p className="text-muted">{promotion.rule}</p>
        </div>
        <div className="promo-card__footer">
          <span className={urgent ? 'text-promo' : 'text-muted'}>
            {describeValidity(promotion.daysLeft, promotion.validUntil)}
          </span>
          <button
            type="button"
            className={`button button--sm ${promotion.active ? 'button--success' : 'button--primary'}`}
            aria-pressed={promotion.active}
            onClick={handleClick}
            disabled={busy}
          >
            {promotion.active ? 'Ativado' : 'Ativar cupom'}
          </button>
        </div>
      </div>
    </article>
  );
}

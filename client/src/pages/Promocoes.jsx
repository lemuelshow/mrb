import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import Icon from '../components/Icon.jsx';
import PromotionCard from '../components/PromotionCard.jsx';
import { describeValidity } from '../utils/format.js';

const STEPS = [
  { icon: 'gift', title: '1. Ative o cupom', text: 'Ele fica salvo na sua carteira.' },
  { icon: 'cart', title: '2. Compre na MRB', text: 'Informe seu CPF ou o código no caixa.' },
  { icon: 'coin', title: '3. Receba o bônus', text: 'Desconto aplicado e cashback no saldo.' }
];

export default function Promocoes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = location.pathname === '/cupons' ? 'cupons' : 'promocoes';
  const query = searchParams.get('q') ?? '';

  const [categories, setCategories] = useState(['Todas']);
  const [category, setCategory] = useState('Todas');
  const [promotions, setPromotions] = useState(null);
  const [coupons, setCoupons] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(query);

  useEffect(() => setSearch(query), [query]);

  useEffect(() => {
    api.categories().then(setCategories).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    let ignore = false;
    setPromotions(null);
    api
      .promotions({ category, q: query })
      .then((list) => !ignore && setPromotions(list))
      .catch((err) => !ignore && setError(err.message));
    return () => {
      ignore = true;
    };
  }, [category, query]);

  useEffect(() => {
    api.coupons().then(setCoupons).catch((err) => setError(err.message));
  }, []);

  async function togglePromotion(promotion) {
    try {
      const updated = promotion.active ? await api.deactivate(promotion.id) : await api.activate(promotion.id);
      setPromotions((list) => list.map((p) => (p.id === updated.id ? updated : p)));
      setCoupons(await api.coupons());
    } catch (err) {
      setError(err.message);
    }
  }

  async function copyCode(coupon) {
    try {
      await navigator.clipboard.writeText(coupon.code);
    } catch {
      // Sem permissão de área de transferência: o código continua visível para cópia manual.
    }
    setCopiedId(coupon.id);
    setTimeout(() => setCopiedId((id) => (id === coupon.id ? null : id)), 2000);
  }

  function handleSearch(event) {
    event.preventDefault();
    const q = search.trim();
    setSearchParams(q ? { q } : {});
  }

  return (
    <div className="stack-lg">
      <div className="page-header">
        <div className="stack-xs page-header__text">
          <h1 className="heading-xl">Promoções e cupons</h1>
          <p className="text-muted">
            Ative um cupom e ele vai direto para a sua carteira. O desconto é aplicado na próxima compra.
          </p>
        </div>
        <form className="search search--large" role="search" onSubmit={handleSearch}>
          <label htmlFor="busca-promocoes" className="sr-only">
            Buscar promoções
          </label>
          <Icon name="search" />
          <input
            id="busca-promocoes"
            type="search"
            placeholder="Buscar por loja, produto ou categoria"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      {error && (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      )}

      <div role="tablist" aria-label="Seções" className="tabs">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'promocoes'}
          className="tab"
          onClick={() => navigate({ pathname: '/promocoes', search: location.search })}
        >
          Promoções
          <span className="count">{promotions?.length ?? '–'}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'cupons'}
          className="tab"
          onClick={() => navigate('/cupons')}
        >
          Meus cupons
          <span className="count">{coupons?.length ?? '–'}</span>
        </button>
      </div>

      {tab === 'promocoes' ? (
        <div role="tabpanel" className="stack-md">
          <div role="group" aria-label="Filtrar por categoria" className="chips">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className="chip"
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {query && (
            <p className="text-muted">
              Resultados para <strong>“{query}”</strong>.{' '}
              <button type="button" className="link-button" onClick={() => setSearchParams({})}>
                Limpar busca
              </button>
            </p>
          )}

          {!promotions ? (
            <div className="page-loading" role="status">Carregando promoções…</div>
          ) : promotions.length === 0 ? (
            <p className="empty">Nenhuma promoção encontrada.</p>
          ) : (
            <div className="card-grid card-grid--fill">
              {promotions.map((promotion) => (
                <PromotionCard key={promotion.id} promotion={promotion} onToggle={togglePromotion} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div role="tabpanel">
          {!coupons ? (
            <div className="page-loading" role="status">Carregando cupons…</div>
          ) : coupons.length === 0 ? (
            <p className="empty">
              Você ainda não ativou cupons.{' '}
              <button type="button" className="link-button" onClick={() => navigate('/promocoes')}>
                Ver promoções
              </button>
            </p>
          ) : (
            <div className="coupon-grid">
              {coupons.map((coupon) => (
                <article key={coupon.id} className="coupon">
                  <span className="coupon__value">{coupon.discount}</span>
                  <div className="coupon__body">
                    <div className="stack-xs">
                      <h3 className="promo-card__title">{coupon.title}</h3>
                      <span className="text-muted">{describeValidity(coupon.daysLeft, coupon.validUntil)}</span>
                    </div>
                    <div className="coupon__actions">
                      <code className="coupon__code">{coupon.code}</code>
                      <button type="button" className="button button--outline button--sm" onClick={() => copyCode(coupon)}>
                        <Icon name={copiedId === coupon.id ? 'check' : 'copy'} size={16} />
                        {copiedId === coupon.id ? 'Copiado' : 'Copiar código'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      <section className="panel steps" aria-label="Como usar">
        {STEPS.map((step) => (
          <div key={step.title} className="step">
            <span className="icon-tile">
              <Icon name={step.icon} size={20} />
            </span>
            <div>
              <div className="text-strong">{step.title}</div>
              <div className="text-muted">{step.text}</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

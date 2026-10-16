import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { daysUntil } from '../services/wallet.js';

export const promotionsRouter = Router();
promotionsRouter.use(requireAuth);

function withUserState(req, promotion) {
  const { store, now } = req.app.locals;
  return {
    ...promotion,
    active: store.isActive(req.user.id, promotion.id),
    daysLeft: daysUntil(promotion.validUntil, now())
  };
}

promotionsRouter.get('/', (req, res) => {
  const { store } = req.app.locals;
  const category = req.query.category;
  const search = String(req.query.q ?? '').trim().toLowerCase();

  const promotions = store
    .listPromotions()
    .filter((p) => !category || category === 'Todas' || p.category === category)
    .filter((p) => !search || `${p.title} ${p.rule} ${p.category}`.toLowerCase().includes(search))
    .map((p) => withUserState(req, p))
    .filter((p) => p.daysLeft >= 0);

  res.json(promotions);
});

promotionsRouter.get('/categories', (req, res) => {
  const categories = [...new Set(req.app.locals.store.listPromotions().map((p) => p.category))];
  res.json(['Todas', ...categories]);
});

promotionsRouter.get('/campaign', (req, res) => {
  res.json(req.app.locals.store.getCampaign());
});

function setActivation(active) {
  return (req, res) => {
    const { store } = req.app.locals;
    const promotion = store.findPromotion(Number(req.params.id));
    if (!promotion) return res.status(404).json({ message: 'Promoção não encontrada.' });

    store.setActive(req.user.id, promotion.id, active);
    return res.json(withUserState(req, promotion));
  };
}

promotionsRouter.post('/:id/activate', setActivation(true));
promotionsRouter.delete('/:id/activate', setActivation(false));

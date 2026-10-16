import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { buildCouponCode, daysUntil, getBalance, getEarnedSince, getLevel } from '../services/wallet.js';

export const walletRouter = Router();
walletRouter.use(requireAuth);

walletRouter.get('/', (req, res) => {
  const { store, now } = req.app.locals;
  const today = now();
  const transactions = store.listTransactions(req.user.id);
  const weekAgo = new Date(today.getTime() - 7 * 86_400_000).toISOString().slice(0, 10);
  const monthStart = today.toISOString().slice(0, 8) + '01';

  const activeCoupons = store.listPromotions().filter((p) => store.isActive(req.user.id, p.id));
  const expiringSoon = activeCoupons.filter((p) => {
    const days = daysUntil(p.validUntil, today);
    return days >= 0 && days <= 1;
  }).length;

  const pointsThisMonth = transactions
    .filter((t) => t.date >= monthStart)
    .reduce((sum, t) => sum + (t.points ?? 0), 0);

  res.json({
    balance: getBalance(transactions),
    earnedThisWeek: getEarnedSince(transactions, weekAgo),
    points: req.user.points,
    pointsThisMonth,
    pointsExpiring: req.user.pointsExpiring,
    activeCoupons: activeCoupons.length,
    couponsExpiringSoon: expiringSoon,
    level: getLevel(req.user.points)
  });
});

walletRouter.get('/transactions', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  res.json(req.app.locals.store.listTransactions(req.user.id).slice(0, limit));
});

walletRouter.get('/missions', (req, res) => {
  res.json(req.app.locals.store.listMissions(req.user.id));
});

walletRouter.get('/coupons', (req, res) => {
  const { store, now } = req.app.locals;
  const today = now();
  const coupons = store
    .listPromotions()
    .filter((p) => store.isActive(req.user.id, p.id))
    .map((p) => ({ ...p, code: buildCouponCode(p), daysLeft: daysUntil(p.validUntil, today) }));
  res.json(coupons);
});

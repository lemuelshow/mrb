export const LEVELS = [
  { name: 'Bronze', minPoints: 0, benefit: 'Cashback de 1%' },
  { name: 'Prata', minPoints: 1000, benefit: 'Cashback de 3%' },
  { name: 'Ouro', minPoints: 3000, benefit: 'Cashback de 5% e frete grátis' },
  { name: 'Diamante', minPoints: 6000, benefit: 'Cashback de 8%, frete grátis e ofertas antecipadas' }
];

export function getLevel(points) {
  const index = LEVELS.findLastIndex((level) => points >= level.minPoints);
  const current = LEVELS[index];
  const next = LEVELS[index + 1] ?? null;

  if (!next) return { current: current.name, next: null, pointsToNext: 0, progress: 100, nextBenefit: null };

  const span = next.minPoints - current.minPoints;
  return {
    current: current.name,
    next: next.name,
    pointsToNext: next.minPoints - points,
    progress: Math.round(((points - current.minPoints) / span) * 100),
    nextBenefit: next.benefit
  };
}

export function getBalance(transactions) {
  const cents = transactions.reduce((sum, t) => sum + Math.round((t.amount ?? 0) * 100), 0);
  return cents / 100;
}

// Soma do que entrou na carteira (valores positivos) a partir de uma data.
export function getEarnedSince(transactions, isoDate) {
  const cents = transactions
    .filter((t) => t.date >= isoDate && (t.amount ?? 0) > 0)
    .reduce((sum, t) => sum + Math.round(t.amount * 100), 0);
  return cents / 100;
}

export function buildCouponCode(promotion) {
  const letters = promotion.title.normalize('NFD').replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase();
  return `MRB${letters}${String(promotion.id).padStart(2, '0')}`;
}

export function daysUntil(isoDate, today) {
  const end = Date.UTC(...isoDate.split('-').map((n, i) => (i === 1 ? Number(n) - 1 : Number(n))));
  const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.round((end - start) / 86_400_000);
}

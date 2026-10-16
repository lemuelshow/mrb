const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const number = new Intl.NumberFormat('pt-BR');

export const formatMoney = (value) => currency.format(value ?? 0);
export const formatNumber = (value) => number.format(value ?? 0);

// Datas ISO "AAAA-MM-DD" exibidas como "DD/MM", sem conversão de fuso.
export function formatShortDate(iso) {
  const [, month, day] = iso.split('-');
  return `${day}/${month}`;
}

export function formatLongToday(date = new Date()) {
  const text = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function firstName(name = '') {
  return name.split(' ')[0];
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function describeValidity(daysLeft, validUntil) {
  if (daysLeft === 0) return 'Vence hoje';
  if (daysLeft === 1) return 'Vence amanhã';
  return `Até ${formatShortDate(validUntil)}`;
}

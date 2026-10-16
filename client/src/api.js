const TOKEN_KEY = 'mrb.token';

// "Manter conectado" guarda o token no localStorage; sem a opção, só dura a aba (sessionStorage).
export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY),
  set: (token, remember) => {
    tokenStorage.clear();
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

let onUnauthorized = () => {};
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function request(path, { method = 'GET', body } = {}) {
  const token = tokenStorage.get();
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    throw new ApiError(data.message ?? 'Não foi possível concluir a operação.', res.status);
  }
  return data;
}

export const api = {
  login: (login, password) => request('/auth/login', { method: 'POST', body: { login, password } }),
  me: () => request('/auth/me'),
  wallet: () => request('/wallet'),
  transactions: (limit = 10) => request(`/wallet/transactions?limit=${limit}`),
  missions: () => request('/wallet/missions'),
  coupons: () => request('/wallet/coupons'),
  campaign: () => request('/promotions/campaign'),
  categories: () => request('/promotions/categories'),
  promotions: ({ category, q } = {}) => {
    const params = new URLSearchParams();
    if (category && category !== 'Todas') params.set('category', category);
    if (q) params.set('q', q);
    const query = params.toString();
    return request(`/promotions${query ? `?${query}` : ''}`);
  },
  activate: (id) => request(`/promotions/${id}/activate`, { method: 'POST' }),
  deactivate: (id) => request(`/promotions/${id}/activate`, { method: 'DELETE' })
};

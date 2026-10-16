import bcrypt from 'bcryptjs';
import * as seed from './seed.js';

// Armazenamento em memória: cada chamada de createStore() começa do seed.
// Para persistir, troque esta camada por um repositório de banco de dados
// mantendo as mesmas funções.
export function createStore() {
  const users = seed.users.map(({ password, ...user }) => ({
    ...user,
    passwordHash: bcrypt.hashSync(password, 10)
  }));
  const transactions = structuredClone(seed.transactions);
  const missions = structuredClone(seed.missions);
  const activations = new Set(seed.activations.map((a) => `${a.userId}:${a.promotionId}`));

  return {
    findUserByLogin(login) {
      const value = String(login ?? '').trim().toLowerCase();
      const digits = value.replace(/\D/g, '');
      return users.find((u) => u.email === value || (digits.length === 11 && u.cpf === digits));
    },
    findUserById(id) {
      return users.find((u) => u.id === id);
    },
    listPromotions() {
      return seed.promotions;
    },
    findPromotion(id) {
      return seed.promotions.find((p) => p.id === id);
    },
    getCampaign() {
      return seed.campaign;
    },
    listTransactions(userId) {
      return transactions
        .filter((t) => t.userId === userId)
        .sort((a, b) => b.date.localeCompare(a.date));
    },
    listMissions(userId) {
      return missions.filter((m) => m.userId === userId);
    },
    isActive(userId, promotionId) {
      return activations.has(`${userId}:${promotionId}`);
    },
    setActive(userId, promotionId, active) {
      const key = `${userId}:${promotionId}`;
      if (active) activations.add(key);
      else activations.delete(key);
    }
  };
}

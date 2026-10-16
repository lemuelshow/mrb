// Dados de exemplo para desenvolvimento. Substituir por um banco de dados real.

export const users = [
  {
    id: 1,
    name: 'Mariana Alves',
    email: 'mariana@mrb.com.br',
    cpf: '12345678909',
    // senha: 123456
    password: '123456',
    points: 2450,
    pointsExpiring: { amount: 300, date: '2026-11-30' }
  }
];

export const promotions = [
  { id: 1, discount: '-30%', category: 'Alimentação', title: 'Mercado da semana', rule: 'Compras acima de R$ 150', validUntil: '2026-10-20', highlight: false },
  { id: 2, discount: '2x', category: 'Eletrônicos', title: 'Cashback em dobro', rule: 'Em eletrônicos selecionados', validUntil: '2026-10-31', highlight: true },
  { id: 3, discount: 'R$ 25', category: 'Moda', title: 'Desconto na coleção nova', rule: 'Compras acima de R$ 200', validUntil: '2026-10-17', highlight: false },
  { id: 4, discount: '-15%', category: 'Serviços', title: 'Lavagem e revisão', rule: 'Em qualquer serviço da oficina', validUntil: '2026-11-05', highlight: true },
  { id: 5, discount: '-40%', category: 'Moda', title: 'Semana MRB', rule: 'Itens marcados na loja', validUntil: '2026-10-18', highlight: false },
  { id: 6, discount: '+500', category: 'Alimentação', title: 'Pontos extras no café', rule: 'Pontos em dobro de manhã', validUntil: '2026-11-15', highlight: true }
];

export const campaign = {
  title: 'Semana MRB: até 40% OFF + bônus em dobro',
  description: 'Ative a campanha e ganhe o dobro de bônus em todas as compras participantes.',
  badge: 'SÓ ATÉ DOMINGO'
};

// type: cashback | bonus | resgate | pontos. amount em reais (pontos em points).
export const transactions = [
  { id: 1, userId: 1, date: '2026-09-28', description: 'Saldo acumulado em setembro', type: 'bonus', amount: 96.4 },
  { id: 2, userId: 1, date: '2026-10-04', description: 'Indicação de amigo', type: 'bonus', amount: 20 },
  { id: 3, userId: 1, date: '2026-10-08', description: 'Campanha de aniversário', type: 'bonus', amount: 30 },
  { id: 4, userId: 1, date: '2026-10-10', description: 'Missão concluída: 3 compras', type: 'pontos', points: 150 },
  { id: 5, userId: 1, date: '2026-10-12', description: 'Cupom Mercado da semana', type: 'resgate', amount: -30 },
  { id: 6, userId: 1, date: '2026-10-15', description: 'Compra loja Centro', type: 'cashback', amount: 12 }
];

export const missions = [
  { id: 1, userId: 1, title: 'Faça 3 compras', progress: 2, goal: 3, reward: '+ 150 pts' },
  { id: 2, userId: 1, title: 'Indique um amigo', progress: 0, goal: 1, reward: 'R$ 20,00 de bônus' },
  { id: 3, userId: 1, title: 'Complete seu perfil', progress: 1, goal: 1, reward: '+ 50 pts' }
];

// Promoções já ativadas por usuário (userId -> ids).
export const activations = [{ userId: 1, promotionId: 2 }];

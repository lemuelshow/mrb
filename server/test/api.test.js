import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

const TODAY = new Date('2026-10-16T12:00:00Z');
let server;
let baseUrl;

before(async () => {
  server = createApp({ now: () => TODAY }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://localhost:${server.address().port}/api`;
});

after(() => server.close());

async function request(path, { token, ...options } = {}) {
  const res = await fetch(baseUrl + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  return { status: res.status, body: await res.json() };
}

async function login(loginValue = 'mariana@mrb.com.br', password = '123456') {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ login: loginValue, password }) });
}

describe('autenticação', () => {
  it('entra com e-mail e senha corretos', async () => {
    const { status, body } = await login();
    assert.equal(status, 200);
    assert.ok(body.token);
    assert.equal(body.user.name, 'Mariana Alves');
    assert.equal(body.user.passwordHash, undefined);
  });

  it('entra com CPF formatado', async () => {
    const { status } = await login('123.456.789-09');
    assert.equal(status, 200);
  });

  it('recusa senha errada', async () => {
    const { status, body } = await login('mariana@mrb.com.br', 'errada');
    assert.equal(status, 401);
    assert.match(body.message, /incorretos/);
  });

  it('exige token nas rotas da carteira', async () => {
    const { status } = await request('/wallet');
    assert.equal(status, 401);
  });
});

describe('carteira', () => {
  it('resume saldo, pontos e nível', async () => {
    const { body: auth } = await login();
    const { status, body } = await request('/wallet', { token: auth.token });

    assert.equal(status, 200);
    assert.equal(body.balance, 128.4);
    assert.equal(body.points, 2450);
    assert.equal(body.level.current, 'Prata');
    assert.equal(body.level.next, 'Ouro');
    assert.equal(body.level.pointsToNext, 550);
  });

  it('lista a atividade da mais recente para a mais antiga', async () => {
    const { body: auth } = await login();
    const { body } = await request('/wallet/transactions?limit=2', { token: auth.token });

    assert.equal(body.length, 2);
    assert.equal(body[0].date, '2026-10-15');
  });
});

describe('promoções', () => {
  it('filtra por categoria', async () => {
    const { body: auth } = await login();
    const { body } = await request('/promotions?category=Moda', { token: auth.token });

    assert.ok(body.length > 0);
    assert.ok(body.every((p) => p.category === 'Moda'));
  });

  it('ativar uma promoção a coloca nos cupons e desativar a remove', async () => {
    const { body: auth } = await login();

    const ativada = await request('/promotions/1/activate', { method: 'POST', token: auth.token });
    assert.equal(ativada.body.active, true);

    let cupons = await request('/wallet/coupons', { token: auth.token });
    const cupom = cupons.body.find((c) => c.id === 1);
    assert.ok(cupom);
    assert.match(cupom.code, /^MRB[A-Z]{4}01$/);

    await request('/promotions/1/activate', { method: 'DELETE', token: auth.token });
    cupons = await request('/wallet/coupons', { token: auth.token });
    assert.equal(cupons.body.some((c) => c.id === 1), false);
  });

  it('responde 404 para promoção inexistente', async () => {
    const { body: auth } = await login();
    const { status } = await request('/promotions/999/activate', { method: 'POST', token: auth.token });
    assert.equal(status, 404);
  });
});

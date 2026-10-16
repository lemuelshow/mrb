import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { createStore } from './data/store.js';
import { authRouter } from './routes/auth.js';
import { walletRouter } from './routes/wallet.js';
import { promotionsRouter } from './routes/promotions.js';

const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');

export function createApp({ store = createStore(), now = () => new Date() } = {}) {
  const app = express();
  app.locals.store = store;
  app.locals.now = now;

  app.use(cors({ origin: config.clientUrl }));
  app.use(express.json());

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', authRouter);
  app.use('/api/wallet', walletRouter);
  app.use('/api/promotions', promotionsRouter);

  app.use('/api', (req, res) => res.status(404).json({ message: 'Rota não encontrada.' }));

  // Em produção a API também entrega o front já compilado (client/dist), com fallback da SPA.
  if (existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('/{*rota}', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Erro interno. Tente novamente.' });
  });

  return app;
}

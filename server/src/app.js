import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { createStore } from './data/store.js';
import { authRouter } from './routes/auth.js';
import { walletRouter } from './routes/wallet.js';
import { promotionsRouter } from './routes/promotions.js';

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

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Erro interno. Tente novamente.' });
  });

  return app;
}

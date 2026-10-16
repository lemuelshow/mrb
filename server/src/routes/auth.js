import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { requireAuth, signToken } from '../middleware/auth.js';

export const authRouter = Router();

const publicUser = ({ id, name, email }) => ({ id, name, email });

authRouter.post('/login', async (req, res) => {
  const { login, password } = req.body ?? {};
  if (!login || !password) {
    return res.status(400).json({ message: 'Informe e-mail ou CPF e a senha.' });
  }

  const user = req.app.locals.store.findUserByLogin(login);
  const valid = user && (await bcrypt.compare(String(password), user.passwordHash));
  if (!valid) {
    return res.status(401).json({ message: 'E-mail, CPF ou senha incorretos.' });
  }

  return res.json({ token: signToken(user), user: publicUser(user) });
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

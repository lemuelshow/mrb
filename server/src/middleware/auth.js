import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function signToken(user) {
  return jwt.sign({ sub: String(user.id) }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

export function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Faça login para continuar.' });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = req.app.locals.store.findUserById(Number(payload.sub));
    if (!user) return res.status(401).json({ message: 'Sessão inválida.' });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Sessão expirada. Entre novamente.' });
  }
}

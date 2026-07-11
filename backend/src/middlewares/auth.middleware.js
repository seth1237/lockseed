import { getCurrentUser, sanitizeUser } from '../services/auth.service.js';

export async function requireAuth(req, res, next) {
  try {
    const user = await getCurrentUser(req, res);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function attachUserIfPresent(req, res, next) {
  getCurrentUser(req, res)
    .then((user) => {
      if (user) req.user = user;
      next();
    })
    .catch(next);
}

export { sanitizeUser };

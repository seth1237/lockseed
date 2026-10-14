import { getCurrentUser, sanitizeUser } from '../services/auth.service.js';

/** Shared admin password — env preferred, fixed fallback for production until env is set. */
export function getAdminSecret() {
  return process.env.ADMIN_KEY || process.env.ADMIN_PASSWORD || 'Lockseed123Qp1';
}

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

/** Protects admin-only routes with ADMIN_KEY (header x-admin-key or ?key=). */
export function requireAdminKey(req, res, next) {
  const configured = getAdminSecret();
  if (!configured) {
    return res.status(503).json({
      error: 'Admin access is not configured. Set ADMIN_KEY on the backend.',
    });
  }

  const provided =
    req.headers['x-admin-key'] ||
    (typeof req.query.key === 'string' ? req.query.key : '') ||
    '';

  if (provided !== configured) {
    return res.status(401).json({ error: 'Invalid admin key' });
  }

  next();
}

export { sanitizeUser };

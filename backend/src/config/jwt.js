import jwt from 'jsonwebtoken';

export const ACCESS_COOKIE = 'lockseed_access';
export const REFRESH_COOKIE = 'lockseed_refresh';

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is not configured');
  return s;
}

function refreshSecret() {
  return process.env.JWT_REFRESH_SECRET || secret();
}

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email, name: user.name },
    secret(),
    { expiresIn: '15m' }
  );
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user._id.toString() }, refreshSecret(), { expiresIn: '30d' });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, secret());
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, refreshSecret());
}

export function generateRandomPassword(len = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function cookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  // Cross-site cookies (frontend and backend on different domains) require
  // SameSite=None, which browsers only accept together with Secure (HTTPS).
  // In local dev we fall back to Lax so cookies work over plain http://localhost.
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  };
}

export function setAuthCookies(res, accessToken, refreshToken) {
  const opts = cookieOptions();
  res.cookie(ACCESS_COOKIE, accessToken, { ...opts, maxAge: 15 * 60 * 1000 });
  res.cookie(REFRESH_COOKIE, refreshToken, { ...opts, maxAge: 30 * 24 * 60 * 60 * 1000 });
}

export function clearAuthCookies(res) {
  // Clear options must match the attributes used when setting the cookies,
  // otherwise the browser won't remove them.
  const { httpOnly, secure, sameSite, path } = cookieOptions();
  res.clearCookie(ACCESS_COOKIE, { httpOnly, secure, sameSite, path });
  res.clearCookie(REFRESH_COOKIE, { httpOnly, secure, sameSite, path });
}

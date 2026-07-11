import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { Session } from '../models/Session.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  generateRandomPassword,
} from '../config/jwt.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from './email.service.js';
import { Notification } from '../models/Notification.js';
import { PasswordReset } from '../models/PasswordReset.js';

const ROUNDS = 12;

export function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    erpClientId: user.erpClientId,
    name: user.name,
    email: user.email,
    phone: user.phone,
    company: user.company,
    country: user.country,
    address: user.address,
    emailVerified: user.emailVerified,
    status: user.status,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  };
}

async function persistSession(userId, refreshToken, meta) {
  const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await Session.create({
    userId,
    refreshTokenHash: hash,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    ...meta,
  });
}

export async function issueSession(res, user, meta) {
  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);
  await persistSession(user._id, refresh, meta);
  setAuthCookies(res, access, refresh);
}

export async function registerUser(res, input) {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const user = await User.create({
    email: input.email.toLowerCase(),
    name: input.name,
    company: input.company || input.name,
    phone: input.phone,
    passwordHash: await bcrypt.hash(input.password, ROUNDS),
    status: 'active',
  });

  await issueSession(res, user);
  return sanitizeUser(user);
}

export async function loginUser(res, email, password, meta) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || user.status !== 'active') {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }
  user.lastLogin = new Date();
  await user.save();
  await issueSession(res, user, meta);
  return sanitizeUser(user);
}

export async function logoutUser(req, res) {
  const refresh = req.cookies?.[REFRESH_COOKIE];
  if (refresh) {
    const hash = crypto.createHash('sha256').update(refresh).digest('hex');
    await Session.deleteOne({ refreshTokenHash: hash });
  }
  clearAuthCookies(res);
}

export async function getCurrentUser(req, res) {
  const access = req.cookies?.[ACCESS_COOKIE];
  if (access) {
    try {
      const payload = verifyAccessToken(access);
      return User.findById(payload.sub);
    } catch {
      /* try refresh */
    }
  }

  const refresh = req.cookies?.[REFRESH_COOKIE];
  if (!refresh) return null;

  try {
    const payload = verifyRefreshToken(refresh);
    const hash = crypto.createHash('sha256').update(refresh).digest('hex');
    const session = await Session.findOne({ refreshTokenHash: hash, expiresAt: { $gt: new Date() } });
    if (!session) return null;
    const user = await User.findById(payload.sub);
    if (!user || user.status !== 'active') return null;
    if (res) await issueSession(res, user);
    return user;
  } catch {
    return null;
  }
}

export async function findOrCreateForQuote(input) {
  let user = await User.findOne({ email: input.email.toLowerCase() });
  if (user) {
    if (input.location && !user.address) {
      user.address = input.location;
      await user.save();
    }
    return { user, isNewUser: false };
  }

  const password = generateRandomPassword();
  user = await User.create({
    email: input.email.toLowerCase(),
    name: input.name,
    company: input.name,
    phone: input.phone,
    address: input.location,
    passwordHash: await bcrypt.hash(password, ROUNDS),
    status: 'active',
  });

  await sendWelcomeEmail({ to: user.email, name: user.name, temporaryPassword: password });
  await Notification.create({
    userId: user._id,
    title: 'Welcome to Lockseed',
    message: 'Your account was created from your first quote request.',
  });

  return { user, isNewUser: true };
}

export async function updateProfile(userId, updates) {
  const user = await User.findByIdAndUpdate(userId, updates, { new: true });
  if (!user) throw new Error('User not found');
  return sanitizeUser(user);
}

export async function requestPasswordReset(email) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return;

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  await PasswordReset.deleteMany({ userId: user._id, used: false });
  await PasswordReset.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    used: false,
  });

  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3001';
  await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    resetUrl: `${baseUrl}/auth/reset-password?token=${token}`,
  });
}

export async function resetPasswordWithToken(token, newPassword) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const reset = await PasswordReset.findOne({
    tokenHash,
    used: false,
    expiresAt: { $gt: new Date() },
  });
  if (!reset) {
    const err = new Error('Invalid or expired reset token');
    err.status = 400;
    throw err;
  }

  const user = await User.findById(reset.userId);
  if (!user) throw new Error('User not found');

  user.passwordHash = await bcrypt.hash(newPassword, ROUNDS);
  await user.save();
  reset.used = true;
  await reset.save();
}

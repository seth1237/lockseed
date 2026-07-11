import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { connectDB } from '@/lib/db/mongoose';
import { User, type IUser } from '@/lib/models/User';
import { Session } from '@/lib/models/Session';
import { Notification } from '@/lib/models/Notification';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateRandomPassword,
} from '@/lib/auth/jwt';
import {
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
  setAuthCookies,
  clearAuthCookies,
} from '@/lib/auth/cookies';
import { sendWelcomeEmail, sendPasswordResetEmail } from '@/lib/services/email.service';
import { PasswordReset } from '@/lib/models/PasswordReset';

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

async function persistSession(
  userId: string,
  refreshToken: string,
  meta?: { device?: string; ipAddress?: string }
) {
  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await Session.create({
    userId,
    refreshTokenHash,
    expiresAt,
    device: meta?.device,
    ipAddress: meta?.ipAddress,
  });
}

export async function issueAuthSession(user: IUser, meta?: { device?: string; ipAddress?: string }) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await persistSession(user._id.toString(), refreshToken, meta);
  await setAuthCookies(accessToken, refreshToken);
  return { accessToken, refreshToken };
}

export async function registerUser(input: {
  email: string;
  name: string;
  password: string;
  phone?: string;
  company?: string;
}) {
  await connectDB();

  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw new Error('Email already registered');
  }

  const user = await User.create({
    email: input.email.toLowerCase(),
    name: input.name,
    company: input.company || input.name,
    phone: input.phone,
    passwordHash: await hashPassword(input.password),
    emailVerified: false,
    status: 'active',
  });

  await issueAuthSession(user);
  return sanitizeUser(user);
}

export async function loginUser(email: string, password: string, meta?: { device?: string; ipAddress?: string }) {
  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || user.status !== 'active') {
    throw new Error('Invalid email or password');
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  user.lastLogin = new Date();
  await user.save();
  await issueAuthSession(user, meta);
  return sanitizeUser(user);
}

export async function logoutUser() {
  await connectDB();
  const refreshToken = await getRefreshTokenFromCookies();
  if (refreshToken) {
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await Session.deleteOne({ refreshTokenHash: hash });
  }
  await clearAuthCookies();
}

export async function getCurrentUser(): Promise<IUser | null> {
  await connectDB();

  const accessToken = await getAccessTokenFromCookies();
  if (accessToken) {
    try {
      const payload = verifyAccessToken(accessToken);
      return User.findById(payload.sub);
    } catch {
      // fall through to refresh
    }
  }

  const refreshToken = await getRefreshTokenFromCookies();
  if (!refreshToken) return null;

  try {
    const payload = verifyRefreshToken(refreshToken);
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const session = await Session.findOne({ refreshTokenHash: hash, expiresAt: { $gt: new Date() } });
    if (!session) return null;

    const user = await User.findById(payload.sub);
    if (!user || user.status !== 'active') return null;

    await issueAuthSession(user);
    return user;
  } catch {
    return null;
  }
}

export async function findOrCreateUserForQuote(input: {
  email: string;
  name: string;
  phone: string;
  location?: string;
}): Promise<{ user: IUser; isNewUser: boolean; generatedPassword?: string }> {
  await connectDB();

  let user = await User.findOne({ email: input.email.toLowerCase() });
  if (user) {
    if (input.location && !user.address) {
      user.address = input.location;
      await user.save();
    }
    return { user, isNewUser: false };
  }

  const generatedPassword = generateRandomPassword();
  user = await User.create({
    email: input.email.toLowerCase(),
    name: input.name,
    company: input.name,
    phone: input.phone,
    address: input.location,
    passwordHash: await hashPassword(generatedPassword),
    emailVerified: false,
    status: 'active',
  });

  await sendWelcomeEmail({
    to: user.email,
    name: user.name,
    temporaryPassword: generatedPassword,
  });

  await Notification.create({
    userId: user._id,
    title: 'Welcome to Lockseed',
    message: 'Your account was created when you submitted your first quote request.',
  });

  return { user, isNewUser: true, generatedPassword };
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<{
    name: string;
    phone: string;
    company: string;
    country: string;
    address: string;
  }>
) {
  await connectDB();
  const user = await User.findByIdAndUpdate(userId, updates, { new: true });
  if (!user) throw new Error('User not found');
  return sanitizeUser(user);
}

export async function changeUserPassword(userId: string, currentPassword: string, newPassword: string) {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) throw new Error('Current password is incorrect');

  user.passwordHash = await hashPassword(newPassword);
  await user.save();
}

export async function requestPasswordReset(email: string) {
  await connectDB();
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    resetUrl: `${baseUrl}/auth/reset-password?token=${token}`,
  });
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  await connectDB();
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const reset = await PasswordReset.findOne({ tokenHash, used: false, expiresAt: { $gt: new Date() } });
  if (!reset) throw new Error('Invalid or expired reset token');

  const user = await User.findById(reset.userId);
  if (!user) throw new Error('User not found');

  user.passwordHash = await hashPassword(newPassword);
  await user.save();
  reset.used = true;
  await reset.save();
}

export function sanitizeUser(user: IUser) {
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

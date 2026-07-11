import jwt from 'jsonwebtoken';
import type { IUser } from '@/lib/models/User';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  name: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET is not configured');
  return secret;
}

export function signAccessToken(user: IUser): string {
  const payload: AccessTokenPayload = {
    sub: user._id.toString(),
    email: user.email,
    name: user.name,
  };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '15m' });
}

export function signRefreshToken(user: IUser): string {
  return jwt.sign({ sub: user._id.toString() }, getRefreshSecret(), { expiresIn: '30d' });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, getJwtSecret()) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, getRefreshSecret()) as { sub: string };
}

export function generateRandomPassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

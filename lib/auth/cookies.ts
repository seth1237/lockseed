import { cookies } from 'next/headers';

export const ACCESS_COOKIE = 'lockseed_access';
export const REFRESH_COOKIE = 'lockseed_refresh';

const isProd = process.env.NODE_ENV === 'production';

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  });
  store.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function getAccessTokenFromCookies(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value;
}

export async function getRefreshTokenFromCookies(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE)?.value;
}

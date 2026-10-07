import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { API_URL } from './constants';
import type { User, UserRole } from './types';

export function getApiUrl(): string {
  return API_URL;
}

async function refreshSession(): Promise<boolean> {
  try {
    const cookie = (await cookies()).toString();
    const res = await fetch(`${getApiUrl()}/auth/refresh`, {
      method: 'POST',
      headers: { cookie },
      cache: 'no-store',
    });
    if (!res.ok) return false;
    const store = await cookies();
    res.headers.getSetCookie?.().forEach((raw) => {
      const pair = raw.split(';')[0];
      const eq = pair.indexOf('=');
      if (eq <= 0) return;
      store.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim(), { httpOnly: true, path: '/' });
    });
    return true;
  } catch {
    return false;
  }
}

async function fetchWithCookie<T>(path: string, init: { cache?: RequestCache; tags?: string[] } = {}, retried = false): Promise<T | null> {
  try {
    const cookie = (await cookies()).toString();
    const res = await fetch(`${getApiUrl()}${path}`, {
      headers: { cookie },
      cache: init.cache ?? 'no-store',
      next: init.tags ? { tags: init.tags } : undefined,
    });
    if (res.status === 401 && !retried) {
      const renewed = await refreshSession();
      if (renewed) return fetchWithCookie<T>(path, init, true);
      return null;
    }
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const getCachedSessionUser = cache(async (): Promise<User | null> => {
  const user = await fetchWithCookie<User>('/auth/profile');
  if (!user || !(user as Partial<User>).username) return null;
  return user;
});

export async function getSessionUser(): Promise<User | null> {
  return getCachedSessionUser();
}

export async function requireUser(next?: string): Promise<User> {
  const user = await getSessionUser();
  if (!user) {
    redirect(next ? `/login?next=${encodeURIComponent(next)}` : '/login');
  }
  return user;
}

export async function requireRole(allowed: UserRole[], next?: string): Promise<User> {
  const user = await requireUser(next);
  if (!allowed.includes(user.role)) redirect('/dashboard');
  return user;
}

export async function apiServer<T>(path: string, init: { cache?: RequestCache; tags?: string[] } = {}): Promise<T | null> {
  return fetchWithCookie<T>(path, init);
}

export async function apiCatalog<T>(tag: string, path: string): Promise<T | null> {
  return fetchWithCookie<T>(path, { cache: 'force-cache', tags: [tag] });
}

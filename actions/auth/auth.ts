'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { API_URL, MESSAGES, ROUTES } from '@/lib/constants';
import { parseApiError } from '@/lib/utils';
import type { ActionState } from '../farms/farms';
import { forwardCookies } from '../farms/farms';

export async function loginAction(
  _prev: ActionState = { ok: false, message: null },
  formData: FormData,
): Promise<ActionState> {
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (username.length < 4) return { ok: false, message: MESSAGES.usernameMin };
  if (password.length < 5) return { ok: false, message: MESSAGES.passwordMin };

  let res: Response | null = null;
  try {
    res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      cache: 'no-store',
    });
  } catch {
    return { ok: false, message: MESSAGES.noConnection };
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, MESSAGES.invalidCredentials) };
  }
  await forwardCookies(res);
  await res.json().catch(() => null);
  redirect(ROUTES.dashboard);
}

export async function logoutAction(): Promise<void> {
  try {
    const cookie = (await cookies()).toString();
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { cookie },
      cache: 'no-store',
    });
  } catch {
  }
  const store = await cookies();
  store.delete('access_token');
  store.delete('refresh_token');
  redirect(ROUTES.login);
}

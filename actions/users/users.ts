'use server';

import { cookies } from 'next/headers';
import { revalidatePath, updateTag } from 'next/cache';
import { API_URL, CACHE_TAGS, MESSAGES, ROUTES } from '@/lib/constants';
import { parseApiError } from '@/lib/utils';

export interface ActionState {
  ok: boolean;
  message: string | null;
}

const initial: ActionState = { ok: false, message: null };

async function backend(path: string, init: RequestInit): Promise<Response | null> {
  try {
    const cookie = (await cookies()).toString();
    return await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', cookie, ...(init.headers ?? {}) },
      cache: 'no-store',
    });
  } catch {
    return null;
  }
}

export async function createUserAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  const lastName = String(formData.get('lastName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  if (username.length < 4) return { ok: false, message: MESSAGES.usernameMin };
  if (password.length < 5) return { ok: false, message: MESSAGES.passwordMin };

  const res = await backend('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password,
      name: name || undefined,
      lastName: lastName || undefined,
      email: email || undefined,
      phone: phone || undefined,
    }),
  });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  revalidatePath(ROUTES.admin);
  updateTag(CACHE_TAGS.users);
  return { ok: true, message: null };
}

export async function activateUserAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const userId = Number(formData.get('userId'));
  if (!Number.isFinite(userId) || userId < 1) return { ok: false, message: MESSAGES.invalidId };
  const res = await backend(`/users/${userId}/activate`, { method: 'PATCH' });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  revalidatePath(ROUTES.admin);
  updateTag(CACHE_TAGS.users);
  return { ok: true, message: null };
}

export async function deactivateUserAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const userId = Number(formData.get('userId'));
  if (!Number.isFinite(userId) || userId < 1) return { ok: false, message: MESSAGES.invalidId };
  const res = await backend(`/users/${userId}/deactivate`, { method: 'PATCH' });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  revalidatePath(ROUTES.admin);
  updateTag(CACHE_TAGS.users);
  return { ok: true, message: null };
}

export async function changeUserRoleAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const userId = Number(formData.get('userId'));
  const role = String(formData.get('role') ?? '');
  if (!Number.isFinite(userId) || userId < 1) return { ok: false, message: MESSAGES.invalidId };
  if (!['SUPERVISOR', 'ADMINISTRATION', 'MANAGEMENT'].includes(role))
    return { ok: false, message: 'El rol debe ser SUPERVISOR, ADMINISTRATION o MANAGEMENT.' };
  const res = await backend(`/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  revalidatePath(ROUTES.admin);
  updateTag(CACHE_TAGS.users);
  return { ok: true, message: null };
}

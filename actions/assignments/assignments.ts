'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { API_URL, MESSAGES, ROUTES } from '@/lib/constants';
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

export async function createAssignmentAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const userId = Number(formData.get('userId'));
  const plotId = Number(formData.get('plotId'));
  if (!Number.isFinite(userId) || userId < 1) return { ok: false, message: 'Debes seleccionar un supervisor.' };
  if (!Number.isFinite(plotId) || plotId < 1) return { ok: false, message: 'Debes seleccionar una parcela.' };

  const res = await backend(ROUTES.assignments, {
    method: 'POST',
    body: JSON.stringify({ userId, plotId }),
  });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  revalidatePath(ROUTES.assignments);
  return { ok: true, message: null };
}

export async function closeAssignmentAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const assignmentId = Number(formData.get('assignmentId'));
  if (!Number.isFinite(assignmentId) || assignmentId < 1)
    return { ok: false, message: MESSAGES.invalidId };
  const res = await backend(`${ROUTES.assignments}/${assignmentId}/close`, { method: 'PATCH' });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  revalidatePath(ROUTES.assignments);
  return { ok: true, message: null };
}

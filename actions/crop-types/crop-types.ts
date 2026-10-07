'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
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

function readCropTypeFields(formData: FormData) {
  return {
    name: String(formData.get('name') ?? '').trim(),
    description: String(formData.get('description') ?? ''),
  };
}

function validateCropType(fields: { name: string; description: string }) {
  if (fields.name.length < 3) return MESSAGES.cropTypeNameMin;
  if (fields.description.length > 500) return MESSAGES.descriptionMax;
  return null;
}

export async function createCropTypeAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const fields = readCropTypeFields(formData);
  const error = validateCropType(fields);
  if (error) return { ok: false, message: error };

  const res = await backend(ROUTES.cropTypes, {
    method: 'POST',
    body: JSON.stringify({ name: fields.name, description: fields.description || undefined }),
  });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  revalidatePath(ROUTES.cropTypes);
  return { ok: true, message: null };
}

export async function updateCropTypeAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const cropTypeId = Number(formData.get('cropTypeId'));
  if (!Number.isFinite(cropTypeId) || cropTypeId < 1)
    return { ok: false, message: MESSAGES.invalidId };
  const fields = readCropTypeFields(formData);
  const error = validateCropType(fields);
  if (error) return { ok: false, message: error };

  const res = await backend(`${ROUTES.cropTypes}/${cropTypeId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name: fields.name, description: fields.description || undefined }),
  });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  revalidatePath(ROUTES.cropTypes);
  revalidatePath(`${ROUTES.cropTypes}/${cropTypeId}`);
  return { ok: true, message: null };
}

export async function deactivateCropTypeAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const cropTypeId = Number(formData.get('cropTypeId'));
  if (!Number.isFinite(cropTypeId) || cropTypeId < 1)
    return { ok: false, message: MESSAGES.invalidId };
  const res = await backend(`${ROUTES.cropTypes}/${cropTypeId}`, { method: 'DELETE' });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  revalidatePath(ROUTES.cropTypes);
  redirect(ROUTES.cropTypes);
}

export async function activateCropTypeAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const cropTypeId = Number(formData.get('cropTypeId'));
  if (!Number.isFinite(cropTypeId) || cropTypeId < 1)
    return { ok: false, message: MESSAGES.invalidId };
  const res = await backend(`${ROUTES.cropTypes}/${cropTypeId}/activate`, { method: 'PATCH' });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  revalidatePath(ROUTES.cropTypes);
  revalidatePath(`${ROUTES.cropTypes}/${cropTypeId}`);
  return { ok: true, message: null };
}

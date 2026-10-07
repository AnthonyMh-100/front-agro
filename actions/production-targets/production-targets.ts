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

export async function createTargetAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const campaignId = Number(formData.get('campaignId'));
  const plotId = formData.get('plotId') ? Number(formData.get('plotId')) : undefined;
  const targetWeight = Number(formData.get('targetWeight'));
  if (!Number.isFinite(campaignId) || campaignId < 1)
    return { ok: false, message: MESSAGES.invalidId };
  if (plotId !== undefined && (!Number.isFinite(plotId) || plotId < 1))
    return { ok: false, message: 'Debes seleccionar una parcela válida.' };
  if (!Number.isFinite(targetWeight) || targetWeight <= 0)
    return { ok: false, message: 'La meta debe ser mayor a 0.' };

  const res = await backend('/production-targets', {
    method: 'POST',
    body: JSON.stringify({ campaignId, plotId, targetWeight }),
  });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  revalidatePath(`${ROUTES.campaigns}/${campaignId}`);
  revalidatePath(ROUTES.reports);
  updateTag(CACHE_TAGS.targets);
  updateTag(CACHE_TAGS.reports);
  return { ok: true, message: null };
}

export async function updateTargetAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const targetId = Number(formData.get('targetId'));
  const campaignId = Number(formData.get('campaignId'));
  const targetWeight = Number(formData.get('targetWeight'));
  if (!Number.isFinite(targetId) || targetId < 1) return { ok: false, message: MESSAGES.invalidId };
  if (!Number.isFinite(targetWeight) || targetWeight <= 0)
    return { ok: false, message: 'La meta debe ser mayor a 0.' };

  const res = await backend(`/production-targets/${targetId}`, {
    method: 'PATCH',
    body: JSON.stringify({ targetWeight }),
  });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  revalidatePath(ROUTES.campaigns);
  if (Number.isFinite(campaignId) && campaignId >= 1) revalidatePath(`${ROUTES.campaigns}/${campaignId}`);
  revalidatePath(ROUTES.reports);
  updateTag(CACHE_TAGS.targets);
  updateTag(CACHE_TAGS.reports);
  return { ok: true, message: null };
}

export async function deleteTargetAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const targetId = Number(formData.get('targetId'));
  const campaignId = Number(formData.get('campaignId'));
  if (!Number.isFinite(targetId) || targetId < 1) return { ok: false, message: MESSAGES.invalidId };
  const res = await backend(`/production-targets/${targetId}`, { method: 'DELETE' });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  revalidatePath(ROUTES.campaigns);
  if (Number.isFinite(campaignId) && campaignId >= 1) revalidatePath(`${ROUTES.campaigns}/${campaignId}`);
  revalidatePath(ROUTES.reports);
  updateTag(CACHE_TAGS.targets);
  updateTag(CACHE_TAGS.reports);
  return { ok: true, message: null };
}

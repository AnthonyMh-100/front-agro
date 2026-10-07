'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
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

function readCampaignFields(formData: FormData) {
  return {
    name: String(formData.get('name') ?? '').trim(),
    startDate: String(formData.get('startDate') ?? ''),
    endDate: String(formData.get('endDate') ?? ''),
  };
}

function validateCampaign(fields: { name: string; startDate: string; endDate: string }) {
  if (fields.name.length < 3) return MESSAGES.campaignNameMin;
  if (!fields.startDate) return 'Debes seleccionar una fecha de inicio.';
  if (!fields.endDate) return 'Debes seleccionar una fecha de fin.';
  if (fields.endDate < fields.startDate)
    return 'La fecha de fin debe ser posterior a la fecha de inicio.';
  return null;
}

export async function createCampaignAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const fields = readCampaignFields(formData);
  const error = validateCampaign(fields);
  if (error) return { ok: false, message: error };

  const res = await backend(ROUTES.campaigns, {
    method: 'POST',
    body: JSON.stringify(fields),
  });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  revalidatePath(ROUTES.campaigns);
  updateTag(CACHE_TAGS.campaigns);
  return { ok: true, message: null };
}

export async function updateCampaignAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const campaignId = Number(formData.get('campaignId'));
  if (!Number.isFinite(campaignId) || campaignId < 1)
    return { ok: false, message: MESSAGES.invalidId };
  const fields = readCampaignFields(formData);
  const error = validateCampaign(fields);
  if (error) return { ok: false, message: error };

  const res = await backend(`${ROUTES.campaigns}/${campaignId}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  revalidatePath(ROUTES.campaigns);
  updateTag(CACHE_TAGS.campaigns);
  revalidatePath(`${ROUTES.campaigns}/${campaignId}`);
  return { ok: true, message: null };
}

export async function deactivateCampaignAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const campaignId = Number(formData.get('campaignId'));
  if (!Number.isFinite(campaignId) || campaignId < 1)
    return { ok: false, message: MESSAGES.invalidId };
  const res = await backend(`${ROUTES.campaigns}/${campaignId}`, { method: 'DELETE' });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  revalidatePath(ROUTES.campaigns);
  updateTag(CACHE_TAGS.campaigns);
  redirect(ROUTES.campaigns);
}

export async function activateCampaignAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const campaignId = Number(formData.get('campaignId'));
  if (!Number.isFinite(campaignId) || campaignId < 1)
    return { ok: false, message: MESSAGES.invalidId };
  const res = await backend(`${ROUTES.campaigns}/${campaignId}/activate`, { method: 'PATCH' });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  revalidatePath(ROUTES.campaigns);
  updateTag(CACHE_TAGS.campaigns);
  revalidatePath(`${ROUTES.campaigns}/${campaignId}`);
  return { ok: true, message: null };
}

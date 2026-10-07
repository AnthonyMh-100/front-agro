'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { API_URL, MESSAGES, ROUTES } from '@/lib/constants';
import { parseApiError } from '@/lib/utils';

export interface ActionState {
  ok: boolean;
  message: string | null;
  id?: number;
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

export async function createProductionDayAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const plotId = Number(formData.get('plotId'));
  const campaignId = Number(formData.get('campaignId'));
  const date = String(formData.get('date') ?? '');
  const notes = String(formData.get('notes') ?? '');
  if (!Number.isFinite(plotId) || plotId < 1) return { ok: false, message: 'Debes seleccionar una parcela.' };
  if (!Number.isFinite(campaignId) || campaignId < 1)
    return { ok: false, message: 'Debes seleccionar una campaña.' };
  if (!date) return { ok: false, message: 'Debes seleccionar una fecha.' };
  if (notes.length > 500) return { ok: false, message: MESSAGES.descriptionMax };

  const res = await backend('/production-days', {
    method: 'POST',
    body: JSON.stringify({ plotId, campaignId, date, notes: notes || undefined }),
  });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (res.status === 409) {
    const existing = await backend(
      `/production-days?plotId=${plotId}&campaignId=${campaignId}&page=1&limit=50`,
      {},
    );
    const days = (((await existing?.json().catch(() => null)) as { productionDays?: { id: number; date: string }[] } | null)?.productionDays ?? []).filter(
      (day) => String(day.date).slice(0, 10) === date.slice(0, 10),
    );
    revalidatePath(ROUTES.production);
    if (days[0]) redirect(`${ROUTES.production}/${days[0].id}`);
    return { ok: false, message: 'El día de producción ya existe' };
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  const created = (await res.json().catch(() => null)) as { id?: number } | null;
  revalidatePath(ROUTES.production);
  if (created?.id) redirect(`${ROUTES.production}/${created.id}`);
  return { ok: true, message: null };
}

export async function updateProductionDayAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const productionDayId = Number(formData.get('productionDayId'));
  const date = String(formData.get('date') ?? '');
  const notes = String(formData.get('notes') ?? '');
  if (!Number.isFinite(productionDayId) || productionDayId < 1)
    return { ok: false, message: MESSAGES.invalidId };
  if (!date) return { ok: false, message: 'Debes seleccionar una fecha.' };
  if (notes.length > 500) return { ok: false, message: MESSAGES.descriptionMax };

  const res = await backend(`/production-days/${productionDayId}`, {
    method: 'PATCH',
    body: JSON.stringify({ date, notes: notes || undefined }),
  });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  revalidatePath(ROUTES.production);
  revalidatePath(`${ROUTES.production}/${productionDayId}`);
  return { ok: true, message: null };
}

export async function createWeighingAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const productionDayId = Number(formData.get('productionDayId'));
  const weight = Number(formData.get('weight'));
  if (!Number.isFinite(productionDayId) || productionDayId < 1)
    return { ok: false, message: MESSAGES.invalidId };
  if (!Number.isFinite(weight) || weight <= 0)
    return { ok: false, message: 'El peso debe ser mayor a 0.' };

  const res = await backend('/weighings', {
    method: 'POST',
    body: JSON.stringify({ productionDayId, weight }),
  });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  revalidatePath(`${ROUTES.production}/${productionDayId}`);
  revalidatePath(ROUTES.production);
  return { ok: true, message: null };
}

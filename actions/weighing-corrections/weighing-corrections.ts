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

export async function createCorrectionAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const weighingId = Number(formData.get('weighingId'));
  const productionDayId = Number(formData.get('productionDayId'));
  const correctedValue = Number(formData.get('correctedValue'));
  const reason = String(formData.get('reason') ?? '');
  if (!Number.isFinite(weighingId) || weighingId < 1)
    return { ok: false, message: MESSAGES.invalidId };
  if (!Number.isFinite(correctedValue) || correctedValue <= 0)
    return { ok: false, message: 'El valor corregido debe ser mayor a 0.' };
  if (reason.length > 500) return { ok: false, message: MESSAGES.descriptionMax };

  try {
    const cookie = (await cookies()).toString();
    const res = await fetch(`${API_URL}/weighing-corrections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie },
      body: JSON.stringify({ weighingId, correctedValue, reason: reason || undefined }),
      cache: 'no-store',
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return { ok: false, message: parseApiError(body, res.statusText) };
    }
  } catch {
    return { ok: false, message: MESSAGES.noConnection };
  }
  if (Number.isFinite(productionDayId) && productionDayId >= 1)
    revalidatePath(`${ROUTES.production}/${productionDayId}`);
  revalidatePath(ROUTES.production);
  revalidatePath(ROUTES.reports);
  return { ok: true, message: null };
}

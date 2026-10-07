'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ACCEPTED_IMAGE_TYPES, API_URL, MAX_IMAGE_FILES, MESSAGES, ROUTES } from '@/lib/constants';
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

function readPlotFields(formData: FormData) {
  return {
    farmId: Number(formData.get('farmId')),
    cropTypeId: formData.get('cropTypeId') ? Number(formData.get('cropTypeId')) : undefined,
    name: String(formData.get('name') ?? '').trim(),
    description: String(formData.get('description') ?? ''),
  };
}

function validatePlot(fields: { farmId: number; cropTypeId?: number; name: string; description: string }) {
  if (!Number.isFinite(fields.farmId) || fields.farmId < 1)
    return 'Debes seleccionar un fundo.';
  if (fields.cropTypeId !== undefined && (!Number.isFinite(fields.cropTypeId) || fields.cropTypeId < 1))
    return 'El cultivo seleccionado no es válido.';
  if (fields.name.length < 3) return MESSAGES.plotNameMin;
  if (fields.description.length > 500) return MESSAGES.descriptionMax;
  return null;
}

function selectedFiles(formData: FormData): File[] {
  return formData
    .getAll('images')
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

function validateFiles(files: File[]): string | null {
  if (!files.every((file) => (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)))
    return 'Solo se permiten imágenes PNG, JPG o WEBP.';
  if (files.length > MAX_IMAGE_FILES) return `Máximo ${MAX_IMAGE_FILES} imágenes.`;
  return null;
}

async function uploadImages(path: string, files: File[]): Promise<string | null> {
  const payload = new FormData();
  files.forEach((file) => payload.append('images', file));
  try {
    const cookie = (await cookies()).toString();
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { cookie },
      body: payload,
      cache: 'no-store',
    });
    if (res.ok) return null;
    const body = await res.json().catch(() => null);
    return parseApiError(body, res.statusText);
  } catch {
    return MESSAGES.noConnection;
  }
}

export async function createPlotAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const fields = readPlotFields(formData);
  const error = validatePlot(fields);
  if (error) return { ok: false, message: error };

  const res = await backend(ROUTES.plots, {
    method: 'POST',
    body: JSON.stringify({
      name: fields.name,
      farmId: fields.farmId,
      cropTypeId: fields.cropTypeId,
      description: fields.description || undefined,
    }),
  });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  const created = (await res.json().catch(() => null)) as { id?: number } | null;
  const files = selectedFiles(formData);
  if (files.length > 0 && created?.id) {
    const filesError = validateFiles(files);
    if (filesError) return { ok: false, message: `Parcela creada. ${filesError}` };
    const uploadError = await uploadImages(`/plots/${created.id}/images`, files);
    if (uploadError)
      return { ok: false, message: `Parcela creada. No se pudieron subir las imágenes: ${uploadError}` };
  }
  revalidatePath(ROUTES.plots);
  return { ok: true, message: null };
}

export async function updatePlotAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const plotId = Number(formData.get('plotId'));
  if (!Number.isFinite(plotId) || plotId < 1) return { ok: false, message: MESSAGES.invalidId };
  const fields = readPlotFields(formData);
  const error = validatePlot(fields);
  if (error) return { ok: false, message: error };

  const res = await backend(`${ROUTES.plots}/${plotId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name: fields.name,
      farmId: fields.farmId,
      cropTypeId: fields.cropTypeId,
      description: fields.description || undefined,
    }),
  });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  const files = selectedFiles(formData);
  if (files.length > 0) {
    const filesError = validateFiles(files);
    if (filesError) return { ok: false, message: filesError };
    const uploadError = await uploadImages(`/plots/${plotId}/images`, files);
    if (uploadError)
      return { ok: false, message: `Parcela actualizada. No se pudieron subir las imágenes: ${uploadError}` };
  }
  revalidatePath(ROUTES.plots);
  revalidatePath(`${ROUTES.plots}/${plotId}`);
  return { ok: true, message: null };
}

export async function deactivatePlotAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const plotId = Number(formData.get('plotId'));
  if (!Number.isFinite(plotId) || plotId < 1) return { ok: false, message: MESSAGES.invalidId };
  const res = await backend(`${ROUTES.plots}/${plotId}`, { method: 'DELETE' });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  revalidatePath(ROUTES.plots);
  redirect(ROUTES.plots);
}

export async function activatePlotAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const plotId = Number(formData.get('plotId'));
  if (!Number.isFinite(plotId) || plotId < 1) return { ok: false, message: MESSAGES.invalidId };
  const res = await backend(`${ROUTES.plots}/${plotId}/activate`, { method: 'PATCH' });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  revalidatePath(ROUTES.plots);
  revalidatePath(`${ROUTES.plots}/${plotId}`);
  return { ok: true, message: null };
}

export async function uploadPlotImagesAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const plotId = Number(formData.get('plotId'));
  if (!Number.isFinite(plotId) || plotId < 1) return { ok: false, message: MESSAGES.invalidId };
  const files = selectedFiles(formData);
  if (files.length === 0) return { ok: false, message: 'Debes seleccionar al menos una imagen.' };
  const filesError = validateFiles(files);
  if (filesError) return { ok: false, message: filesError };
  const uploadError = await uploadImages(`/plots/${plotId}/images`, files);
  if (uploadError) return { ok: false, message: uploadError };
  revalidatePath(ROUTES.plots);
  revalidatePath(`${ROUTES.plots}/${plotId}`);
  return { ok: true, message: null };
}

export async function deletePlotImageAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const plotId = Number(formData.get('plotId'));
  const imageUrl = String(formData.get('imageUrl') ?? '');
  if (!Number.isFinite(plotId) || plotId < 1) return { ok: false, message: MESSAGES.invalidId };
  if (!imageUrl) return { ok: false, message: 'Debes indicar la imagen a eliminar.' };
  try {
    const cookie = (await cookies()).toString();
    const res = await fetch(`${API_URL}/plots/${plotId}/images`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', cookie },
      body: JSON.stringify({ imageUrl }),
      cache: 'no-store',
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return { ok: false, message: parseApiError(body, res.statusText) };
    }
  } catch {
    return { ok: false, message: MESSAGES.noConnection };
  }
  revalidatePath(ROUTES.plots);
  revalidatePath(`${ROUTES.plots}/${plotId}`);
  return { ok: true, message: null };
}

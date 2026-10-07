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

async function forwardCookies(res: Response): Promise<void> {
  const store = await cookies();
  const setCookies = res.headers.getSetCookie?.() ?? [];
  setCookies.forEach((raw) => {
    const [pair, ...attrs] = raw.split(';');
    const eq = pair.indexOf('=');
    if (eq <= 0) return;
    const name = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    const lower = attrs.join(';').toLowerCase();
    store.set(name, value, {
      httpOnly: lower.includes('httponly'),
      path: '/',
      maxAge: name === 'access_token' ? 15 * 60 : 7 * 24 * 60 * 60,
    });
  });
}

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

export async function createFarmAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '');
  if (name.length < 3) return { ok: false, message: MESSAGES.farmNameMin };
  if (description.length > 500) return { ok: false, message: MESSAGES.descriptionMax };

  const res = await backend('/farms', {
    method: 'POST',
    body: JSON.stringify({ name, description: description || undefined }),
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
    if (filesError) return { ok: false, message: `Fundo creado. ${filesError}` };
    const uploadError = await uploadImages(`/farms/${created.id}/images`, files);
    if (uploadError)
      return { ok: false, message: `Fundo creado. No se pudieron subir las imágenes: ${uploadError}` };
  }
  revalidatePath(ROUTES.farms);
  return { ok: true, message: null };
}

export async function updateFarmAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const farmId = Number(formData.get('farmId'));
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '');
  if (!Number.isFinite(farmId) || farmId < 1) return { ok: false, message: 'Fundo inválido.' };
  if (name.length < 3) return { ok: false, message: MESSAGES.farmNameMin };
  if (description.length > 500) return { ok: false, message: MESSAGES.descriptionMax };

  const res = await backend(`/farms/${farmId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name, description: description || undefined }),
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
    const uploadError = await uploadImages(`/farms/${farmId}/images`, files);
    if (uploadError)
      return { ok: false, message: `Fundo actualizado. No se pudieron subir las imágenes: ${uploadError}` };
  }
  revalidatePath(ROUTES.farms);
  revalidatePath(`/farms/${farmId}`);
  return { ok: true, message: null };
}

export async function deactivateFarmAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const farmId = Number(formData.get('farmId'));
  if (!Number.isFinite(farmId) || farmId < 1) return { ok: false, message: 'Fundo inválido.' };
  const res = await backend(`/farms/${farmId}`, { method: 'DELETE' });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  revalidatePath(ROUTES.farms);
  redirect(ROUTES.farms);
}

export async function activateFarmAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const farmId = Number(formData.get('farmId'));
  if (!Number.isFinite(farmId) || farmId < 1) return { ok: false, message: MESSAGES.invalidId };
  const res = await backend(`/farms/${farmId}/activate`, { method: 'PATCH' });
  if (!res) return { ok: false, message: MESSAGES.noConnection };
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return { ok: false, message: parseApiError(body, res.statusText) };
  }
  revalidatePath(ROUTES.farms);
  revalidatePath(`/farms/${farmId}`);
  return { ok: true, message: null };
}

export async function uploadFarmImagesAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const farmId = Number(formData.get('farmId'));
  if (!Number.isFinite(farmId) || farmId < 1) return { ok: false, message: MESSAGES.invalidId };
  const files = selectedFiles(formData);
  if (files.length === 0) return { ok: false, message: 'Debes seleccionar al menos una imagen.' };
  const filesError = validateFiles(files);
  if (filesError) return { ok: false, message: filesError };
  const uploadError = await uploadImages(`/farms/${farmId}/images`, files);
  if (uploadError) return { ok: false, message: uploadError };
  revalidatePath(ROUTES.farms);
  revalidatePath(`/farms/${farmId}`);
  return { ok: true, message: null };
}

export async function deleteFarmImageAction(
  _prev: ActionState = initial,
  formData: FormData,
): Promise<ActionState> {
  const farmId = Number(formData.get('farmId'));
  const imageUrl = String(formData.get('imageUrl') ?? '');
  if (!Number.isFinite(farmId) || farmId < 1) return { ok: false, message: MESSAGES.invalidId };
  if (!imageUrl) return { ok: false, message: 'Debes indicar la imagen a eliminar.' };
  try {
    const cookie = (await cookies()).toString();
    const res = await fetch(`${API_URL}/farms/${farmId}/images`, {
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
  revalidatePath(ROUTES.farms);
  revalidatePath(`/farms/${farmId}`);
  return { ok: true, message: null };
}

export { forwardCookies };

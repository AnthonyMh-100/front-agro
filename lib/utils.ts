import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWeight(value: number | string): string {
  return `${Number(value).toFixed(2)} kg`;
}

export function parseApiError(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const msg = (body as { message?: unknown }).message;
    if (Array.isArray(msg)) return msg.join('\n');
    if (typeof msg === 'string') return msg;
  }
  return fallback;
}

---
name: agro-frontend-auth
description: Use when implementing login, logout, session, middleware, or role guards in frontend-agro with Next.js 16 against NestJS cookie JWT auth.
---

# Agro Frontend Auth (Next.js 16 + Nest Cookies)

Backend: `api-agro/src/auth/auth.controller.ts`, `auth.guard.ts`, `auth.service.ts`.
Cookies `httpOnly, SameSite=lax, secure:false en dev, path:/`. JS nunca lee tokens.

## Cliente base

```ts
// lib/api.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include', // obligatorio, si no 401 aunque el login sea 200
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  if (res.status === 401) {
    // intentar 1 refresh y reintentar 1 vez
    const r = await fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (!r.ok) throw new Error('Credenciales inválidas');
    const retry = await fetch(`${API_URL}${path}`, { ...init, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) } });
    if (!retry.ok) throw new Error(await retry.text());
    return retry.json() as Promise<T>;
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    const msg = Array.isArray(body.message) ? body.message.join('\n') : (body.message ?? res.statusText);
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}
```

Nunca guardar `accessToken/refreshToken` en `localStorage`. `login` retorna solo `user`.

## Flujos

- Login client component: `POST /auth/login {username, password}` vía `api()`, luego `router.push('/dashboard')` + `router.refresh()`. Validar `username>=4, password>=5` igual que `AuthDto` para error instantáneo.
- Session: Server Component `fetch(${API_URL}/auth/profile, {headers: {cookie: cookies().toString()}})` o Route Handler con `credentials:include`. No llamar `/auth/profile` desde cliente sin cookies.
- Logout: `POST /auth/logout` + limpiar estado + `redirect('/login')`.
- Register: solo para bootstrap / admin. Primer usuario crea `ADMINISTRATION`.

## Middleware Next 16

Leer guía en `node_modules/next/dist/docs/` antes de tocar middleware (breaking changes en 16). Patrón:

```ts
// middleware.ts
import { NextResponse } from 'next/server';
export async function middleware(req: Request) {
  // revalidar con backend: GET /auth/profile con cookie entrante
  // si 401 → una vez POST /auth/refresh, si falla → redirect /login
  // adjuntar x-user-role para Server Components y proteger /admin/* solo ADMINISTRATION
}
export const config = { matcher: ['/dashboard/:path*', '/admin/:path*'] };
```

No redirigir por JWT decodificado en cliente — la cookie es `httpOnly`.

## Roles en UI

```ts
export type UserRole = 'SUPERVISOR' | 'ADMINISTRATION' | 'MANAGEMENT';
export function canManage(r?: UserRole) { return r === 'ADMINISTRATION'; }
export function canWeigh(r?: UserRole) { return r === 'ADMINISTRATION' || r === 'SUPERVISOR'; }
```

`SUPERVISOR` ve solo sus parcelas asignadas (usar `/assignments?userId=me&openOnly=true`). `MANAGEMENT` = lectura + reportes.

## Dev / prod checklist

- `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:3001`. API `PORT=3001`, `CORS_ORIGIN=http://localhost:3000`.
- Prod: backend `secure:true, sameSite:'none'`, front HTTPS, `credentials:include` se mantiene.

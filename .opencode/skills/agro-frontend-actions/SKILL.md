---
name: agro-frontend-actions
description: Use when creating frontend-agro components, forms, server actions, constants, or utils. Enforces components folder in English, no API calls in components, useActionState forms, business logic in server actions.
---

# Agro Frontend Actions & Structure Rules

Siempre aplicar en `frontend-agro`. Si una regla choca con otra skill, esta manda en estructura.

## 1. Carpeta en inglés

- Reutilizables en `components/[nombre]/[nombre].tsx` (ej. `components/button/button.tsx`). Nunca `componentes/`.
- Imports vía alias: `@/components/button/button`. Prohibido importar desde `app/` hacia `app/`.

## 2. Componentes nunca llaman a la API

- Prohibido `fetch` / `api()` dentro de `components/` o client components.
- Toda interacción con `api-agro` va en **Server Actions** (`actions/[dominio]/[dominio].ts` con `'use server'`).
- El componente solo invoca la action y renderiza `state`.

## 3. Formularios con useActionState

- Usar `useActionState(action, initialState)` de React para `login, create, update, deactivate/activate`.
- `state = { ok: boolean; message: string | null }`. Mensajes en español del backend tal cual.
- Validación cliente mínima espejando DTO (`name>=3, desc<=500, username>=4, password>=5, weight>0`) + error final del backend.
- Botón con `aria-busy`, `disabled` en `pending`. Errores con `role="alert"`.
- Iconos siempre `react-icons/io5`.

## 4. Lógica de negocio en Server Actions

- Estructura por carpeta: `actions/farms/farms.ts`, `actions/auth/auth.ts`. Nunca `actions/farms.ts` plano.
- `actions/farms/farms.ts`: `createFarmAction, updateFarmAction, deactivateFarmAction, activateFarmAction`.
- `actions/auth/auth.ts`: `loginAction, logoutAction`.
- Cada action: leer `cookies()` para reenviar `cookie` al backend, `revalidatePath` tras mutar, retornar `{ ok, message }`.
- Login/logout propagan `Set-Cookie` del backend con `cookies().set`.
- `lib/auth-server.ts` solo lectura (`getSessionUser, requireUser, requireRole, apiServer`). Mutaciones solo en `actions/`.

## 5. Constantes y utils centralizados

- Constantes en `lib/constants.ts`: `API_URL, DEFAULT_PAGE_SIZE, ROUTES, MESSAGES`. Nada hardcodeado en componentes.
- Utils en `lib/utils.ts`: `cn, formatWeight, parseApiError`. Nada duplicado.
- Roles en `lib/roles.ts`: `canManage, canWeigh`.

## 6. Sin comentarios en el código

- Prohibido `//`, `/* */`, `{/* */}`, `#` y `eslint-disable` en `app/`, `actions/`, `components/`, `lib/` y `.env.example`.
- El código debe explicarse solo: nombres claros, validaciones visibles, estructura por carpeta.
- Para imágenes remotas usar `next/image` con `width/height`, nunca `<img>` con `eslint-disable`.

## 7. Pages de formulario a ancho completo

- Las pages con formulario (`app/(agro)/farms/new`) usan ancho completo como la page de lista. Prohibido `max-w-2xl` centrado.
- Formularios de creación/edición viven en `components/` y la page solo aporta header (volver, título) + form.

## 8. Imágenes por archivo vía backend (Cloudinary)

- Sin campo de URLs: solo `input file multiple` (`ImagePicker`, PNG/JPG/WEBP, máx 10, preview temporal con `URL.createObjectURL` revocado).
- Prohibido guardar archivos en el front. La subida va a `POST /farms|plots/:id/images` (multipart `images`) y el borrado a `DELETE .../images {imageUrl}`.
- Actions `upload*ImagesAction/delete*ImageAction` con cookie de sesión; galería administrable en `components/image-gallery`.

## 9. Sin bucles for, lógica funcional

- Prohibido `for`, `for...of`, `for...in`, `while` en `app/`, `actions/`, `components/`, `lib/`.
- Usar funciones de orden superior: `forEach, map, filter, reduce, find, some, every`.
- Para efectos con cleanup usar `forEach` dentro del `return` del `useEffect`.

## 10. Fechas solo con moment

- Prohibido `new Date`, `toLocaleDateString`, `toISOString` en `app/`, `actions/`, `components/`, `lib/`.
- Toda fecha pasa por `lib/dates.ts` (moment con locale `es`): `todayISO, formatDayShort, formatDayLong, formatTime, formatDateRange, coversToday`.
- Fechas solo-día (campañas, jornadas) se parsean en UTC (`moment.utc`); horas de pesaje en local.

## 11. Caché de datos por alcance

- `apiCatalog(tag, path)` para catálogos con `force-cache` + tag (`CACHE_TAGS`). Las mutaciones invalidan con `revalidatePath` + `updateTag` (Next 16 exige `updateTag` en Server Actions).
- `no-store` (defecto) en todo lo filtrado por usuario: asignaciones, días, pesajes, correcciones y resúmenes personales del supervisor. El Data Cache es compartido por URL y filtraría datos entre usuarios.
- Sesión (`getSessionUser`) con `cache()` de React: memoización por request, nunca entre usuarios.

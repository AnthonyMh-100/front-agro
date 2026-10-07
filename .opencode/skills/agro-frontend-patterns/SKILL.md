---
name: agro-frontend-patterns
description: Use when creating pages, forms, tables, or reports in frontend-agro with Next.js 16 App Router, Tailwind 4, and agro domain hierarchy Farm Plot Campaign Weighing.
---

# Agro Frontend Patterns

Stack: `next 16.3.8, react 19, tailwind 4`. Antes de codificar leer `node_modules/next/dist/docs/` (AGENTS.md advierte breaking changes en 16). No asumir APIs de Next 14.

## Estructura exigida

```
lib/api.ts         // fetch con credentials:include + refresh 1x (ver agro-frontend-auth)
lib/types.ts       // User, Farm, Plot, Campaign, ProductionDay, Weighing, ReportByPlot
lib/roles.ts       // canManage, canWeigh
app/login/page.tsx // 'use client', form username/password
app/(app)/layout.tsx // sidebar: Fincas, Parcelas, Campañas, Jornadas, Pesajes, Reportes, Usuarios(admin)
app/(app)/farms/page.tsx, app/(app)/reports/page.tsx, ...
middleware.ts      // protege /dashboard/*, /admin/*
```

Alias `@/*` ya configurado en `tsconfig.json:22`.

## Server vs Client

- Server Components por defecto para listados: `GET /farms?page&limit&search`, `GET /reports/production/*`. Pasar `cookie` del request.
- `'use client'` solo para: formularios, filtros con `useState`, tablas interactivas, barra `progress`.
- No crear `lib/store` global sin necesidad; `fetch` + `router.refresh()` basta para MVP.

## Formularios

Validar en cliente espejando `class-validator` del backend para feedback inmediato, pero el error final es el del backend (español):

- Farm: `name>=3, description<=500, imageUrls=url[]`
- Plot: `name, farmId>=1, cropTypeId?`
- Campaign: `name, startDate<endDate ISO`
- ProductionDay: `plotId, campaignId, date ISO, notes<=500`
- Weighing: `productionDayId>=1, weight>0 max2dec`
- Correction (solo ADMIN): `weighingId, correctedValue>0, reason?`

En `catch(e)` mostrar `e.message` directo (ya viene en español). Si `message` es array, unir.

## Tablas y reportes

- Reusar forma paginada: `page, limit, search` en URL `?page=` para que atrás/adelante funcione. Respetar `totalPages`.
- Pesos: `Number(w).toFixed(2) + ' kg'`. Nunca sumar en cliente para totales oficiales, usar `/reports/production/summary`.
- By-plot: `progress!=null ? Math.min(progress*100,100) : null`. `null` → badge `Sin meta`. Barra Tailwind `bg-green-600`, ancho `style={{width: pct%}}`.
- Filtros reportes: `campaignId` requerido para by-plot, `farmId` opcional. Cambiar filtro → nuevo `fetch`, no filtrado en memoria.

## Tailwind 4 + i18n

- Ya existe `@import "tailwindcss"` en `app/globals.css`. Usar `dark:` variants existentes, `rounded-full`, `bg-foreground` como en `page.tsx`.
- Idioma UI español (backend ya responde español). `html lang="es"` en `layout.tsx` al salir del starter.
- Imágenes `imageUrls` con `next/image`; dominio externo debe declararse en `next.config.ts` o falla en build.

## Anti-patrones prohibidos

1. Sin `fetch` sin `credentials:'include'` — causa 401 fantasma.
2. Sin hardcodear `http://localhost:3000` como API — usar `NEXT_PUBLIC_API_URL`.
3. Sin guardar tokens en `localStorage/sessionStorage`.
4. Sin `Bearer` header — el `AuthGuard` solo lee cookie.
5. Sin mutar `AGENTS.md` generado por `next dev`.

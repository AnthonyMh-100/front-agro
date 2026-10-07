---
name: agro-api-contracts
description: Use when building frontend-agro against api-agro. Covers REST endpoints, DTOs, pagination, roles, errors, and Decimal handling for farms, plots, campaigns, weighings, reports.
---

# Agro API Contracts

Backend fuente de verdad: `../api-agro/src/`, `../api-agro/prisma/schema.prisma`.
Base URL dev: `http://localhost:3001` (API en 3001, front en 3000 para evitar choque CORS).

## Convenciones globales

- `ValidationPipe({whitelist:true, transform:true})` — enviar solo campos del DTO.
- Paginación listados: `GET ?page=1&limit=10&search=` → `{ items|farms|weighings..., totalItems, currentPage, itemsPerPage, totalPages }`. `limit` max 50.
- Errores Nest: `{ statusCode, message: string|string[], error }`. Mensajes en español, ej. `El fundo debe tener al menos 3 caracteres`, `Credenciales inválidas`, `No tiene permiso para esta acción`. Mostrar `message` tal cual, si es array unir con `\n`.
- Pesos: Prisma `Decimal(10,2)` serializado como string/number. Frontend siempre `Number(x)` y formatear a 2 decimales. Enviar `weight` como number con max 2 decimales, `>0`.
- Fechas: ISO `IsDateString`, ej. `2026-03-01`. `ProductionDay` único por `[plotId,campaignId,date]`.
- `imageUrls?: string[]` debe ser URLs válidas (`IsUrl each:true`).
- Todos excepto `POST /auth/*` requieren cookie `access_token`. No usar header `Authorization`.

## Matriz endpoints + roles

Roles: `SUPERVISOR | ADMINISTRATION | MANAGEMENT`. `MANAGEMENT` hoy sin rutas propias, tratar como solo-lectura salvo que backend lo amplíe.

```
POST /auth/register (público) {username>=4, password>=5, name?, lastName?, email?, phone?} → 201 User sin password. Primer usuario = ADMINISTRATION.
POST /auth/login (público) {username, password} → 200 User + set-cookie access_token(15m), refresh_token(7d)
POST /auth/refresh (cookie refresh_token) → rota ambas cookies
POST /auth/logout → clear cookies
GET  /auth/profile (auth) → {id, username, role}

GET  /farms?page&limit&search / GET /farms/:id (todos autenticados)
POST /farms, PATCH /farms/:id, DELETE /farms/:id (=soft isActive=false), PATCH /farms/:id/activate → solo ADMINISTRATION
  CreateFarm {name>=3, description?<=500, imageUrls?: url[]}

Mismo patrón CRUD para:
 /crop-types {name>=3 unique, description?, isActive}
 /plots {name, farmId>=1, cropTypeId?>=1, description?, imageUrls?} único [farmId,name]
 /campaigns {name unique, startDate ISO, endDate ISO, isActive}
 /production-targets {campaignId, plotId?, targetWeight>0} único [campaignId,plotId]

GET  /users, GET /users/:id, PATCH /users/:id/activate|deactivate|role → solo ADMINISTRATION

POST /assignments {userId, plotId} (ADMIN) | GET /assignments?userId?&plotId?&openOnly? | GET /assignments/:id | PATCH /assignments/:id/close (ADMIN)

POST /production-days {plotId, campaignId, date ISO, notes?<=500} (ADMIN,SUPERVISOR)
GET  /production-days?plotId?&campaignId?&from?&to?&page&limit | GET /production-days/:id | PATCH /production-days/:id (ADMIN,SUPERVISOR)

POST /weighings {productionDayId>=1, weight>0 max2dec} (ADMIN,SUPERVISOR; SUPERVISOR requiere assignment abierto en ese plot o 403)
GET  /weighings?productionDayId?&page&limit | GET /weighings/:id (incluye corrections[])

POST /weighing-corrections {weighingId, correctedValue>0, reason?} (solo ADMIN) | GET /weighing-corrections?weighingId? | GET /weighing-corrections/:id

GET /reports/production/summary?campaignId?&plotId?&farmId? → {totalWeight:number, weighingCount, productionDayCount}
GET /reports/production/by-plot?campaignId!&farmId? → [{plotId, plotName, totalWeight, targetWeight|null, progress|null}] progress = total/target
```

## Reglas frontend obligatorias

1. Ocultar botones crear/editar/desactivar si `user.role !== 'ADMINISTRATION'`, salvo `production-days` y `weighings` que también permiten `SUPERVISOR`.
2. Selects en cascada: Farm → Plot (filtrar por `farmId`) → ProductionDay (filtrar por `plotId+campaignId`) → Weighing.
3. Tras `POST /weighings` o correction, revalidar `GET /reports/...` — no calcular totales en cliente.
4. `targetWeight=null` → mostrar `Sin meta`, `progress=null` → no mostrar barra.
5. `unassignedAt!=null` = assignment cerrado, no permitir pesar a ese supervisor.

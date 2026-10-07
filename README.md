# Frontend Agro

## Resumen

Interfaz en español para el sistema agrícola, conectada a `api-agro` por cookies `httpOnly`. El supervisor solo ve sus parcelas asignadas: abre su día de producción, suma pesajes en kg y sigue su avance; el administrador gestiona fundos, parcelas, cultivos, campañas, metas, asignaciones y usuarios desde un panel con reportes y ranking por parcela.

## Qué se aprendió

- App Router con Server Components y Server Actions: las mutaciones viven en `actions/[dominio]/[dominio].ts` y los formularios usan `useActionState`, sin llamadas a la API desde componentes.
- Sesión por cookies con renovación automática ante `401` y memoización por request.
- Caché con criterio según la documentación de Next.js: `force-cache` solo en catálogos compartidos, `no-store` en datos por usuario para no filtrar información entre sesiones.
- Sistema de diseño propio con tokens semánticos, primitivas componibles (`cva` + `cn`), iconos IO5 y fechas con Moment en UTC.
- Reglas de trabajo vivas en skills versionados junto al código.

## Tecnologías

Next.js 16, React 19, Tailwind CSS 4, TypeScript, Moment, React Icons (IO5), clsx, tailwind-merge, class-variance-authority.

## Desarrollo

```bash
cp .env.example .env.local
npm install
npm run dev
```

import Link from 'next/link';
import {
  IoAddOutline,
  IoAlertCircleOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoLinkOutline,
} from 'react-icons/io5';
import { apiServer, requireUser } from '@/lib/auth-server';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import type { AssignmentsResponse, PlotsResponse, UsersResponse } from '@/lib/types';
import { Button } from '@/components/button/button';
import { Card } from '@/components/card/card';
import { Select } from '@/components/select/select';
import { AssignmentCard } from '@/components/assignment-card/assignment-card';

export default async function AssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; userId?: string; plotId?: string; state?: string }>;
}) {
  const user = await requireUser('/assignments');
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const userId = sp.userId ?? '';
  const plotId = sp.plotId ?? '';
  const state = sp.state ?? 'open';
  const isAdmin = user.role === 'ADMINISTRATION';

  const params = new URLSearchParams({ page: String(page), limit: String(DEFAULT_PAGE_SIZE) });
  if (isAdmin) {
    if (userId) params.set('userId', userId);
  } else {
    params.set('userId', String(user.id));
  }
  if (plotId) params.set('plotId', plotId);
  params.set('activeOnly', state === 'all' ? 'false' : 'true');
  const [data, users, plots, ownPool] = await Promise.all([
    apiServer<AssignmentsResponse>(`/assignments?${params.toString()}`),
    isAdmin ? apiServer<UsersResponse>('/users?page=1&limit=50', { cache: 'force-cache' }) : Promise.resolve(null),
    apiServer<PlotsResponse>('/plots?page=1&limit=50', { cache: 'force-cache' }),
    isAdmin ? Promise.resolve(null) : apiServer<AssignmentsResponse>(`/assignments?userId=${user.id}&page=1&limit=50`),
  ]);
  const supervisors = (users?.users ?? []).filter(
    (candidate) => candidate.role === 'SUPERVISOR' && candidate.isActive,
  );
  const plotOptions = isAdmin
    ? (plots?.plots ?? []).map((plot) => ({ id: plot.id, name: plot.name }))
    : (ownPool?.assignments ?? [])
        .filter((assignment) => assignment.unassignedAt === null)
        .map((assignment) => ({
          id: assignment.assignedPlot?.id ?? assignment.plotId,
          name: assignment.assignedPlot?.name ?? `Parcela ${assignment.plotId}`,
        }));

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-[2px] bg-primary text-primary-foreground">
            <IoLinkOutline aria-hidden size={18} />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Asignaciones</h1>
            <p className="text-xs text-muted-foreground">
              {data ? `${data.totalItems} registros` : 'Supervisor → parcela'}
            </p>
          </div>
        </div>
        {isAdmin && (
          <Link
            href="/assignments/new"
            className="inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-1 rounded-[2px] bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <IoAddOutline aria-hidden size={18} />
            Nueva asignación
          </Link>
        )}
      </div>

      <form method="get" className="mt-4 flex flex-col gap-2 sm:flex-row">
        {isAdmin && supervisors.length > 0 && (
          <Select
            name="userId"
            defaultValue={userId}
            aria-label="Filtrar por supervisor"
            className="sm:max-w-xs"
          >
            <option value="">Todos los supervisores</option>
            {supervisors.map((supervisor) => (
              <option key={supervisor.id} value={supervisor.id}>
                {supervisor.name ?? supervisor.username}
              </option>
            ))}
          </Select>
        )}
        <Select
          name="plotId"
          defaultValue={plotId}
          aria-label="Filtrar por parcela"
          className="sm:max-w-xs"
        >
          <option value="">Todas las parcelas</option>
          {plotOptions.map((plot) => (
            <option key={plot.id} value={plot.id}>
              {plot.name}
            </option>
          ))}
        </Select>
        <Select name="state" defaultValue={state} aria-label="Filtrar por estado" className="sm:max-w-xs">
          <option value="open">Abiertas</option>
          <option value="all">Todas</option>
        </Select>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      {!data ? (
        <Card className="mt-4">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <IoAlertCircleOutline aria-hidden size={18} />
            Sin conexión con la API.
          </p>
        </Card>
      ) : data.assignments.length === 0 ? (
        <Card className="mt-4">
          <p className="text-sm text-muted-foreground">Sin asignaciones.</p>
        </Card>
      ) : (
        <>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.assignments.map((assignment) => (
              <li key={assignment.id}>
                <AssignmentCard assignment={assignment} canClose={isAdmin} />
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              Página {data.currentPage} de {data.totalPages} ({data.totalItems})
            </span>
            {data.currentPage > 1 && (
              <Link
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-[2px] border border-border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={`/assignments?page=${data.currentPage - 1}${userId ? `&userId=${userId}` : ''}${plotId ? `&plotId=${plotId}` : ''}&state=${state}`}
              >
                <IoChevronBackOutline aria-hidden size={16} />
                Anterior
              </Link>
            )}
            {data.currentPage < data.totalPages && (
              <Link
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-[2px] border border-border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={`/assignments?page=${data.currentPage + 1}${userId ? `&userId=${userId}` : ''}${plotId ? `&plotId=${plotId}` : ''}&state=${state}`}
              >
                Siguiente
                <IoChevronForwardOutline aria-hidden size={16} />
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}

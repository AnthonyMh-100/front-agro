import Link from 'next/link';
import {
  IoAddOutline,
  IoAlertCircleOutline,
  IoCalendarOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoScaleOutline,
} from 'react-icons/io5';
import { apiServer, requireUser } from '@/lib/auth-server';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import type {
  AssignmentsResponse,
  FarmsResponse,
  PlotsResponse,
  ProductionDaysResponse,
  WeighingsResponse,
} from '@/lib/types';
import { formatWeight } from '@/lib/utils';
import { Button } from '@/components/button/button';
import { Card } from '@/components/card/card';
import { Select } from '@/components/select/select';
import { ProductionDayCard } from '@/components/production-day-card/production-day-card';

export default async function ProductionPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; plotId?: string; farmId?: string }>;
}) {
  const user = await requireUser('/production');
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const plotId = sp.plotId ?? '';
  const farmId = sp.farmId ?? '';
  const isSupervisor = user.role === 'SUPERVISOR';

  const [assignments, allPlots, farms] = await Promise.all([
    isSupervisor ? apiServer<AssignmentsResponse>(`/assignments?userId=${user.id}`) : Promise.resolve(null),
    apiServer<PlotsResponse>('/plots?page=1&limit=50', { cache: 'force-cache' }),
    apiServer<FarmsResponse>('/farms?page=1&limit=50', { cache: 'force-cache' }),
  ]);
  const myPlotIds = (assignments?.assignments ?? [])
    .filter((assignment) => assignment.unassignedAt === null)
    .map((assignment) => assignment.plotId);
  const visiblePlots = isSupervisor
    ? (allPlots?.plots ?? []).filter((plot) => myPlotIds.includes(plot.id))
    : (allPlots?.plots ?? []);

  const params = new URLSearchParams({ page: String(page), limit: String(DEFAULT_PAGE_SIZE) });
  if (plotId) params.set('plotId', plotId);
  const farmIdNumber = farmId ? Number(farmId) : undefined;
  const farmIdByPlotId = new Map((allPlots?.plots ?? []).map((plot) => [plot.id, plot.farmId]));
  const matchesFilters = (day: { plotId: number }) =>
    (isSupervisor ? myPlotIds.includes(day.plotId) : true) &&
    (farmIdNumber ? farmIdByPlotId.get(day.plotId) === farmIdNumber : true);

  let days: ProductionDaysResponse['productionDays'] = [];
  let totalItems = 0;
  let totalPages = 1;
  let currentPage = page;
  let connected = true;
  if (isSupervisor) {
    const pool = await apiServer<ProductionDaysResponse>(
      `/production-days?${plotId ? `plotId=${plotId}&` : ''}page=1&limit=50`,
    );
    connected = pool !== null;
    const mine = (pool?.productionDays ?? []).filter(matchesFilters);
    totalItems = mine.length;
    totalPages = Math.max(1, Math.ceil(totalItems / DEFAULT_PAGE_SIZE));
    currentPage = Math.min(page, totalPages);
    days = mine.slice((currentPage - 1) * DEFAULT_PAGE_SIZE, currentPage * DEFAULT_PAGE_SIZE);
  } else {
    const data = await apiServer<ProductionDaysResponse>(`/production-days?${params.toString()}`);
    connected = data !== null;
    days = (data?.productionDays ?? []).filter(matchesFilters);
    totalItems = data?.totalItems ?? 0;
    totalPages = data?.totalPages ?? 1;
    currentPage = data?.currentPage ?? page;
  }

  const plotNameById = new Map(visiblePlots.map((plot) => [plot.id, plot.name]));
  const totals = await Promise.all(
    days.map(async (day) => {
      const weighings = await apiServer<WeighingsResponse>(
        `/weighings?productionDayId=${day.id}&page=1&limit=50`,
      );
      const total = (weighings?.weighings ?? []).reduce((sum, weighing) => sum + Number(weighing.weight), 0);
      return { dayId: day.id, total, count: weighings?.totalItems ?? 0 };
    }),
  );
  const totalByDayId = new Map(totals.map((entry) => [entry.dayId, entry]));
  const farmTotal = days.reduce((sum, day) => sum + (totalByDayId.get(day.id)?.total ?? 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-[2px] bg-primary text-primary-foreground">
            <IoScaleOutline aria-hidden size={18} />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Producción</h1>
            <p className="text-xs text-muted-foreground">
              Registro diario en kg por parcela
            </p>
          </div>
        </div>
        <Link
          href="/production/new"
          className="inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-1 rounded-[2px] bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <IoAddOutline aria-hidden size={18} />
          Nuevo día
        </Link>
      </div>

      {isSupervisor && visiblePlots.length > 0 && (
        <div className="mt-4">
          <h2 className="text-sm font-medium">Mis parcelas hoy</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {visiblePlots.map((plot) => (
              <li key={plot.id}>
                <Link
                  href={`/production/new?plotId=${plot.id}`}
                  className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-[2px] border border-border bg-surface px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground"
                >
                  <IoAddOutline aria-hidden size={16} />
                  {plot.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form method="get" className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Select
          name="plotId"
          defaultValue={plotId}
          aria-label="Filtrar por parcela"
          className="sm:max-w-xs"
        >
          <option value="">Mis parcelas</option>
          {visiblePlots.map((plot) => (
            <option key={plot.id} value={plot.id}>
              {plot.name}
            </option>
          ))}
        </Select>
        <Select
          name="farmId"
          defaultValue={farmId}
          aria-label="Filtrar por fundo"
          className="sm:max-w-xs"
        >
          <option value="">Todos los fundos</option>
          {(farms?.farms ?? []).map((farm) => (
            <option key={farm.id} value={farm.id}>
              {farm.name}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      {(farmId || plotId) && (
        <Card className="mt-4">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <IoCalendarOutline aria-hidden size={16} />
            Total en vista
          </p>
          <p className="text-xl font-semibold">{formatWeight(farmTotal)}</p>
        </Card>
      )}

      {!connected ? (
        <Card className="mt-4">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <IoAlertCircleOutline aria-hidden size={18} />
            Sin conexión con la API.
          </p>
        </Card>
      ) : days.length === 0 ? (
        <Card className="mt-4">
          <p className="text-sm text-muted-foreground">Sin días de producción.</p>
        </Card>
      ) : (
        <>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {days.map((day) => (
              <li key={day.id}>
                <ProductionDayCard
                  day={{
                    ...day,
                    dayPlot: { id: day.plotId, name: plotNameById.get(day.plotId) ?? `Parcela ${day.plotId}`, farmId: 0 },
                  }}
                  total={totalByDayId.get(day.id)?.total ?? 0}
                />
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              Página {currentPage} de {totalPages} ({totalItems})
            </span>
            {currentPage > 1 && (
              <Link
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-[2px] border border-border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={`/production?page=${currentPage - 1}${plotId ? `&plotId=${plotId}` : ''}${farmId ? `&farmId=${farmId}` : ''}`}
              >
                <IoChevronBackOutline aria-hidden size={16} />
                Anterior
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-[2px] border border-border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={`/production?page=${currentPage + 1}${plotId ? `&plotId=${plotId}` : ''}${farmId ? `&farmId=${farmId}` : ''}`}
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

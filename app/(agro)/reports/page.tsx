import {
  IoBarChartOutline,
  IoCalendarOutline,
  IoScaleOutline,
  IoTrophyOutline,
} from 'react-icons/io5';
import { formatWeight } from '@/lib/utils';
import { apiCatalog, apiServer, requireUser } from '@/lib/auth-server';
import { CACHE_TAGS } from '@/lib/constants';
import type {
  AssignmentsResponse,
  CampaignsResponse,
  FarmsResponse,
  PlotsResponse,
  ProductionByPlot,
  ProductionDay,
  ProductionSummary,
  WeighingsResponse,
} from '@/lib/types';
import { Button } from '@/components/button/button';
import { Card } from '@/components/card/card';
import { Select } from '@/components/select/select';

interface ProductionTargetRow {
  plotId: number | null;
  targetWeight: number | string;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ campaignId?: string; farmId?: string }>;
}) {
  const user = await requireUser('/reports');
  const sp = await searchParams;
  const campaignId = sp.campaignId?.trim() ?? '';
  const farmId = sp.farmId?.trim() ?? '';
  const isSupervisor = user.role === 'SUPERVISOR';

  const [campaigns, farms] = await Promise.all([
    apiCatalog<CampaignsResponse>(CACHE_TAGS.campaigns, '/campaigns?page=1&limit=50'),
    apiCatalog<FarmsResponse>(CACHE_TAGS.farms, '/farms?page=1&limit=50'),
  ]);
  const campaignName = (campaigns?.campaigns ?? []).find(
    (campaign) => String(campaign.id) === campaignId,
  )?.name;
  const farmName = (farms?.farms ?? []).find((farm) => String(farm.id) === farmId)?.name;

  let summary: ProductionSummary | null = null;
  let byPlot: ProductionByPlot[] | null = null;

  if (isSupervisor) {
    const [assignments, allPlots] = await Promise.all([
      apiServer<AssignmentsResponse>(`/assignments?userId=${user.id}`),
      apiServer<PlotsResponse>('/plots?page=1&limit=50'),
    ]);
    const myPlotIds = (assignments?.assignments ?? [])
      .filter((assignment) => assignment.unassignedAt === null)
      .map((assignment) => assignment.plotId);
    const farmIdNumber = farmId ? Number(farmId) : undefined;
    const plotById = new Map((allPlots?.plots ?? []).map((plot) => [plot.id, plot]));
    const ownPlotIds = myPlotIds.filter((plotId) =>
      farmIdNumber ? plotById.get(plotId)?.farmId === farmIdNumber : true,
    );
    const daysQuery = new URLSearchParams({ page: '1', limit: '50' });
    if (campaignId) daysQuery.set('campaignId', campaignId);
    const days = (
      (
        await apiServer<{ productionDays?: ProductionDay[] }>(
          `/production-days?${daysQuery.toString()}`,
        )
      )?.productionDays ?? []
    ).filter((day) => ownPlotIds.includes(day.plotId));
    const totals = await Promise.all(
      days.map(async (day) => {
        const weighings = await apiServer<WeighingsResponse>(
          `/weighings?productionDayId=${day.id}&page=1&limit=50`,
        );
        const entries = weighings?.weighings ?? [];
        return {
          plotId: day.plotId,
          total: entries.reduce((sum, weighing) => sum + Number(weighing.weight), 0),
          count: entries.length,
        };
      }),
    );
    const totalByPlotId = new Map<number, { total: number; count: number }>();
    totals.forEach((entry) => {
      const current = totalByPlotId.get(entry.plotId) ?? { total: 0, count: 0 };
      totalByPlotId.set(entry.plotId, {
        total: current.total + entry.total,
        count: current.count + entry.count,
      });
    });
    summary = {
      totalWeight: totals.reduce((sum, entry) => sum + entry.total, 0),
      weighingCount: totals.reduce((sum, entry) => sum + entry.count, 0),
      productionDayCount: days.length,
    };
    if (campaignId) {
      const targets = await apiServer<{ productionTargets?: ProductionTargetRow[] } | ProductionTargetRow[]>(
        `/production-targets?campaignId=${campaignId}&page=1&limit=50`,
      );
      const rows = Array.isArray(targets) ? targets : (targets?.productionTargets ?? []);
      const targetByPlotId = new Map(
        rows
          .filter((target) => target.plotId !== null)
          .map((target) => [target.plotId as number, Number(target.targetWeight)]),
      );
      byPlot = ownPlotIds
        .map((plotId) => {
          const plot = plotById.get(plotId);
          if (!plot) return null;
          const weighed = totalByPlotId.get(plotId) ?? { total: 0, count: 0 };
          const target = targetByPlotId.get(plotId) ?? null;
          return {
            plotId: plot.id,
            plotName: plot.name,
            totalWeight: weighed.total,
            targetWeight: target,
            progress: target ? weighed.total / target : null,
          };
        })
        .filter((row): row is ProductionByPlot => row !== null)
        .sort((left, right) => right.totalWeight - left.totalWeight);
    }
  } else {
    const summaryQuery = new URLSearchParams();
    if (campaignId) summaryQuery.set('campaignId', campaignId);
    if (farmId) summaryQuery.set('farmId', farmId);

    summary = await apiCatalog<ProductionSummary>(
      CACHE_TAGS.reports,
      `/reports/production/summary?${summaryQuery.toString()}`,
    );

    if (campaignId) {
      const byPlotQuery = new URLSearchParams({ campaignId });
      if (farmId) byPlotQuery.set('farmId', farmId);
      const rows = await apiCatalog<ProductionByPlot[]>(
        CACHE_TAGS.reports,
        `/reports/production/by-plot?${byPlotQuery.toString()}`,
      );
      byPlot = (rows ?? []).sort((left, right) => right.totalWeight - left.totalWeight);
    }
  }

  return (
    <div>
      <div className="overflow-hidden rounded-[2px] bg-primary text-primary-foreground">
        <div className="p-4 sm:p-6">
          <p className="text-xs opacity-80">Reportes de producción</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {campaignName ?? 'Todas las campañas'}
            {farmName ? ` · ${farmName}` : ''}
          </h1>
          <p className="mt-1 text-sm opacity-80">
            {summary
              ? `${formatWeight(summary.totalWeight)} en ${summary.productionDayCount} jornadas`
              : 'Sin datos o sin conexión con la API.'}
            {isSupervisor ? ' · Solo tus parcelas' : ''}
          </p>
        </div>
      </div>

      <form method="get" className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Select
          name="campaignId"
          defaultValue={campaignId}
          aria-label="Filtrar por campaña"
          className="sm:max-w-xs"
        >
          <option value="">Todas las campañas</option>
          {(campaigns?.campaigns ?? []).map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.name}
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

      {summary && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card className="border-l-4 border-l-tertiary">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex size-8 items-center justify-center rounded-[2px] bg-accent text-accent-foreground">
                <IoScaleOutline aria-hidden size={18} />
              </span>
              Peso total
            </p>
            <p className="mt-2 text-2xl font-semibold">{formatWeight(summary.totalWeight)}</p>
          </Card>
          <Card>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex size-8 items-center justify-center rounded-[2px] bg-surface text-foreground">
                <IoBarChartOutline aria-hidden size={18} />
              </span>
              Pesajes
            </p>
            <p className="mt-2 text-2xl font-semibold">{summary.weighingCount}</p>
          </Card>
          <Card>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex size-8 items-center justify-center rounded-[2px] bg-surface text-foreground">
                <IoCalendarOutline aria-hidden size={18} />
              </span>
              Jornadas
            </p>
            <p className="mt-2 text-2xl font-semibold">{summary.productionDayCount}</p>
          </Card>
        </div>
      )}

      <h2 className="mt-6 flex items-center gap-2 font-medium">
        <IoTrophyOutline aria-hidden size={18} />
        Ranking por parcela
      </h2>
      {!campaignId ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Selecciona una campaña para ver el detalle por parcela.
        </p>
      ) : !byPlot ? (
        <p className="mt-2 text-sm text-muted-foreground">Sin datos.</p>
      ) : byPlot.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">Sin producción en este filtro.</p>
      ) : (
        <ul className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {byPlot.map((row, position) => {
            const pct = row.progress != null ? Math.min(row.progress * 100, 100) : null;
            const done = pct !== null && pct >= 100;
            return (
              <li key={row.plotId}>
                <Card className="p-0">
                  <div className="flex items-center gap-3 p-4 pb-3">
                    <span
                      aria-hidden
                      className="flex size-9 shrink-0 items-center justify-center rounded-[2px] bg-primary text-sm font-semibold text-primary-foreground"
                    >
                      {position + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{row.plotName}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.targetWeight != null
                          ? `Meta ${formatWeight(row.targetWeight)}`
                          : 'Sin meta'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{formatWeight(row.totalWeight)}</p>
                      {pct !== null && (
                        <p className="text-xs text-muted-foreground">{pct.toFixed(0)}%</p>
                      )}
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    {pct == null ? (
                      <p className="rounded-[2px] bg-surface px-2 py-1 text-xs text-muted-foreground">
                        Sin meta definida para esta parcela
                      </p>
                    ) : (
                      <div
                        role="progressbar"
                        aria-valuenow={Math.round(pct)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Avance de ${row.plotName}`}
                        className="h-2.5 overflow-hidden rounded-full bg-muted"
                      >
                        <div
                          className={done ? 'h-full bg-tertiary' : 'h-full bg-primary'}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                    {done && (
                      <p className="mt-1 inline-block rounded-[2px] bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                        Meta cumplida
                      </p>
                    )}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

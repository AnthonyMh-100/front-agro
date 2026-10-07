import Link from 'next/link';
import {
  IoAddOutline,
  IoArrowForwardOutline,
  IoBarChartOutline,
  IoCalendarOutline,
  IoFlowerOutline,
  IoLeafOutline,
  IoLinkOutline,
  IoMapOutline,
  IoScaleOutline,
} from 'react-icons/io5';
import { apiCatalog, apiServer, requireUser } from '@/lib/auth-server';
import { CACHE_TAGS } from '@/lib/constants';
import type {
  AssignmentsResponse,
  CampaignsResponse,
  PlotsResponse,
  ProductionByPlot,
  ProductionSummary,
  WeighingsResponse,
} from '@/lib/types';
import { formatWeight } from '@/lib/utils';
import { coversToday, todayISO } from '@/lib/dates';
import { Card } from '@/components/card/card';

const QUICK_ACCESS = [
  { href: '/production/new', label: 'Registrar día', icon: IoAddOutline },
  { href: '/production', label: 'Producción', icon: IoScaleOutline },
  { href: '/farms', label: 'Fincas', icon: IoLeafOutline },
  { href: '/plots', label: 'Parcelas', icon: IoMapOutline },
  { href: '/assignments', label: 'Asignaciones', icon: IoLinkOutline },
  { href: '/reports', label: 'Reportes', icon: IoBarChartOutline },
];

interface TargetRow {
  plotId: number | null;
  targetWeight: number | string;
}

export default async function DashboardPage() {
  const user = await requireUser('/dashboard');
  const isSupervisor = user.role === 'SUPERVISOR';

  const [assignments, campaigns] = await Promise.all([
    isSupervisor
      ? apiServer<AssignmentsResponse>(`/assignments?userId=${user.id}`)
      : Promise.resolve(null),
    apiCatalog<CampaignsResponse>(CACHE_TAGS.campaigns, '/campaigns?page=1&limit=50'),
  ]);
  const myPlotIds = (assignments?.assignments ?? [])
    .filter((assignment) => assignment.unassignedAt === null)
    .map((assignment) => assignment.plotId);
  const activeCampaigns = (campaigns?.campaigns ?? []).filter((campaign) => campaign.isActive);
  const covering = activeCampaigns.filter((campaign) =>
    coversToday(campaign.startDate, campaign.endDate, campaign.isActive),
  );
  const focusCampaign = covering.length === 1 ? covering[0] : undefined;

  let summary: ProductionSummary | null = null;
  let byPlot: ProductionByPlot[] = [];
  if (isSupervisor) {
    const pool = await apiServer<{ productionDays?: { id: number; plotId: number }[] }>(
      '/production-days?page=1&limit=50',
    );
    const mine = (pool?.productionDays ?? []).filter((day) => myPlotIds.includes(day.plotId));
    const totals = await Promise.all(
      mine.map(async (day) => {
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
    summary = {
      totalWeight: totals.reduce((sum, entry) => sum + entry.total, 0),
      weighingCount: totals.reduce((sum, entry) => sum + entry.count, 0),
      productionDayCount: mine.length,
    };
    if (focusCampaign) {
      const allPlots = await apiCatalog<PlotsResponse>(CACHE_TAGS.plots, '/plots?page=1&limit=50');
      const plotById = new Map((allPlots?.plots ?? []).map((plot) => [plot.id, plot]));
      const inCampaign = await apiServer<{ productionDays?: { id: number; plotId: number }[] }>(
        `/production-days?campaignId=${focusCampaign.id}&page=1&limit=50`,
      );
      const ownDays = (inCampaign?.productionDays ?? []).filter((day) =>
        myPlotIds.includes(day.plotId),
      );
      const dayTotals = await Promise.all(
        ownDays.map(async (day) => {
          const weighings = await apiServer<WeighingsResponse>(
            `/weighings?productionDayId=${day.id}&page=1&limit=50`,
          );
          const entries = weighings?.weighings ?? [];
          return {
            plotId: day.plotId,
            total: entries.reduce((sum, weighing) => sum + Number(weighing.weight), 0),
          };
        }),
      );
      const totalByPlotId = new Map<number, number>();
      dayTotals.forEach((entry) => {
        totalByPlotId.set(entry.plotId, (totalByPlotId.get(entry.plotId) ?? 0) + entry.total);
      });
      const targets = await apiCatalog<{ productionTargets?: TargetRow[] }>(
        CACHE_TAGS.targets,
        `/production-targets?campaignId=${focusCampaign.id}&page=1&limit=50`,
      );
      const targetByPlotId = new Map(
        (targets?.productionTargets ?? [])
          .filter((target) => target.plotId !== null)
          .map((target) => [target.plotId as number, Number(target.targetWeight)]),
      );
      byPlot = myPlotIds
        .map((plotId) => {
          const plot = plotById.get(plotId);
          if (!plot) return null;
          const total = totalByPlotId.get(plotId) ?? 0;
          const target = targetByPlotId.get(plotId) ?? null;
          return {
            plotId: plot.id,
            plotName: plot.name,
            totalWeight: total,
            targetWeight: target,
            progress: target ? total / target : null,
          };
        })
        .filter((row): row is ProductionByPlot => row !== null)
        .sort((left, right) => right.totalWeight - left.totalWeight)
        .slice(0, 5);
    }
  } else {
    summary = await apiCatalog<ProductionSummary>(CACHE_TAGS.reports, '/reports/production/summary');
    if (focusCampaign) {
      byPlot = (
        (await apiCatalog<ProductionByPlot[]>(
          CACHE_TAGS.reports,
          `/reports/production/by-plot?campaignId=${focusCampaign.id}`,
        )) ?? []
      )
        .sort((left, right) => right.totalWeight - left.totalWeight)
        .slice(0, 5);
    }
  }

  return (
    <div>
      <div className="overflow-hidden rounded-[2px] bg-primary text-primary-foreground">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6">
          <div>
            <p className="text-xs opacity-80">Hoy {todayISO()}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Panel de producción</h1>
            <p className="mt-1 text-sm opacity-80">
              {focusCampaign ? `Campaña ${focusCampaign.name}` : 'Sin campaña activa hoy'}
              {isSupervisor ? ' · Solo tus parcelas' : ''}
            </p>
          </div>
          <Link
            href="/production/new"
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-[2px] bg-primary-foreground px-4 py-2 text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <IoAddOutline aria-hidden size={18} />
            Registrar día
          </Link>
        </div>
      </div>

      {!summary ? (
        <p className="mt-4 text-sm text-muted-foreground">Sin datos o sin conexión con la API.</p>
      ) : (
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

      {focusCampaign && byPlot.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-medium">
              <IoFlowerOutline aria-hidden size={18} />
              Avance por parcela
            </h2>
            <Link
              href={`/reports?campaignId=${focusCampaign.id}`}
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 text-sm font-medium text-primary"
            >
              Ver todo
              <IoArrowForwardOutline aria-hidden size={16} />
            </Link>
          </div>
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
        </div>
      )}

      <h2 className="mt-6 font-medium">Accesos directos</h2>
      <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {QUICK_ACCESS.map((item, index) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex min-h-[56px] cursor-pointer items-center gap-3 rounded-[2px] border border-border bg-surface p-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground"
              >
                <span
                  className={
                    index === 0
                      ? 'flex size-9 shrink-0 items-center justify-center rounded-[2px] bg-primary text-primary-foreground'
                      : 'flex size-9 shrink-0 items-center justify-center rounded-[2px] bg-background text-foreground'
                  }
                >
                  <Icon aria-hidden size={18} />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

import Link from 'next/link';
import { IoAddOutline, IoArrowBackOutline } from 'react-icons/io5';
import { apiServer, requireUser } from '@/lib/auth-server';
import type { AssignmentsResponse, CampaignsResponse, PlotsResponse } from '@/lib/types';
import { Card } from '@/components/card/card';
import { CreateProductionDayForm } from '@/components/create-production-day-form/create-production-day-form';
import { coversToday } from '@/lib/dates';

function campaignCoversToday(campaign: { startDate: string; endDate: string; isActive: boolean }): boolean {
  return coversToday(campaign.startDate, campaign.endDate, campaign.isActive);
}

export default async function NewProductionDayPage({
  searchParams,
}: {
  searchParams: Promise<{ plotId?: string; date?: string; campaignId?: string }>;
}) {
  const user = await requireUser('/production/new');
  const sp = await searchParams;
  const isSupervisor = user.role === 'SUPERVISOR';
  const [assignments, allPlots, campaigns] = await Promise.all([
    isSupervisor ? apiServer<AssignmentsResponse>(`/assignments?userId=${user.id}`) : Promise.resolve(null),
    apiServer<PlotsResponse>('/plots?page=1&limit=50', { cache: 'force-cache' }),
    apiServer<CampaignsResponse>('/campaigns?page=1&limit=50', { cache: 'force-cache' }),
  ]);
  const myPlotIds = (assignments?.assignments ?? [])
    .filter((assignment) => assignment.unassignedAt === null)
    .map((assignment) => assignment.plotId);
  const plots = isSupervisor
    ? (allPlots?.plots ?? []).filter((plot) => myPlotIds.includes(plot.id))
    : (allPlots?.plots ?? []);
  const activeCampaigns = (campaigns?.campaigns ?? []).filter((campaign) => campaign.isActive);
  const covering = activeCampaigns.filter(campaignCoversToday);
  const requestedCampaignId = sp.campaignId ? Number(sp.campaignId) : undefined;
  const defaultCampaignId =
    requestedCampaignId && activeCampaigns.some((campaign) => campaign.id === requestedCampaignId)
      ? requestedCampaignId
      : covering.length === 1
        ? covering[0].id
        : undefined;

  return (
    <div className="w-full">
      <Link
        href="/production"
        className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <IoArrowBackOutline aria-hidden size={16} />
        Volver a producción
      </Link>
      <div className="mt-2 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-[2px] bg-primary text-primary-foreground">
          <IoAddOutline aria-hidden size={18} />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Nuevo día de producción</h1>
          <p className="max-w-[65ch] text-sm text-muted-foreground">
            Abre el registro diario de una parcela y luego suma sus pesajes en kg.
          </p>
        </div>
      </div>
      <div className="mt-4">
        {plots.length > 0 && activeCampaigns.length > 0 ? (
          <CreateProductionDayForm
            plots={plots}
            campaigns={activeCampaigns}
            defaultCampaignId={defaultCampaignId}
            defaultPlotId={sp.plotId ? Number(sp.plotId) : undefined}
            defaultDate={sp.date}
          />
        ) : (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              {plots.length === 0
                ? 'No tienes parcelas asignadas para registrar producción.'
                : 'No hay campañas activas. Pide al administrador que cree una.'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

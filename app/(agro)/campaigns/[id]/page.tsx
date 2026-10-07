import Link from 'next/link';
import {
  IoAddOutline,
  IoAlertCircleOutline,
  IoArrowBackOutline,
  IoCalendarOutline,
  IoTrophyOutline,
} from 'react-icons/io5';
import { apiCatalog, requireUser } from '@/lib/auth-server';
import { CACHE_TAGS } from '@/lib/constants';
import type { Campaign, PlotsResponse, ProductionTargetsResponse } from '@/lib/types';
import { formatWeight } from '@/lib/utils';
import { Card } from '@/components/card/card';
import { formatCampaignRange } from '@/components/campaign-card/campaign-card';
import { CampaignEditForm } from '@/components/campaign-edit-form/campaign-edit-form';
import { CampaignActions } from '@/components/campaign-actions/campaign-actions';
import { CreateTargetForm } from '@/components/create-target-form/create-target-form';
import { TargetActions } from '@/components/target-actions/target-actions';
import { TargetEditForm } from '@/components/target-edit-form/target-edit-form';

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const viewer = await requireUser('/campaigns');
  const { id } = await params;
  const [campaign, targetsData, plotsData] = await Promise.all([
    apiCatalog<Campaign>(CACHE_TAGS.campaigns, `/campaigns/${encodeURIComponent(id)}`),
    apiCatalog<ProductionTargetsResponse>(CACHE_TAGS.targets, `/production-targets?campaignId=${encodeURIComponent(id)}&page=1&limit=50`),
    apiCatalog<PlotsResponse>(CACHE_TAGS.plots, '/plots?page=1&limit=50'),
  ]);
  const isAdmin = viewer.role === 'ADMINISTRATION';
  const targets = targetsData?.productionTargets ?? [];
  const plots = plotsData?.plots ?? [];
  const plotNameById = new Map(plots.map((plot) => [plot.id, plot.name]));

  if (!campaign) {
    return (
      <div>
        <Link
          href="/campaigns"
          className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 text-sm font-medium text-primary"
        >
          <IoArrowBackOutline aria-hidden size={16} />
          Volver a campañas
        </Link>
        <Card className="mt-4">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <IoAlertCircleOutline aria-hidden size={18} />
            Campaña no encontrada o sin conexión.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/campaigns"
        className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 text-sm font-medium text-primary"
      >
        <IoArrowBackOutline aria-hidden size={16} />
        Volver a campañas
      </Link>
      <Card className="mt-2 p-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-[2px] bg-primary text-primary-foreground">
            <IoCalendarOutline aria-hidden size={18} />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{campaign.name}</h1>
            <p className="text-sm text-muted-foreground">{formatCampaignRange(campaign)}</p>
          </div>
          <span
            className={
              campaign.isActive
                ? 'ml-auto shrink-0 rounded-[2px] bg-accent px-2 py-0.5 text-xs text-accent-foreground'
                : 'ml-auto shrink-0 rounded-[2px] bg-surface px-2 py-0.5 text-xs text-muted-foreground'
            }
          >
            {campaign.isActive ? 'Activa' : 'Inactiva'}
          </span>
        </div>
        {isAdmin && (
          <div className="mt-4 flex flex-wrap items-start gap-2">
            <CampaignEditForm campaign={campaign} />
            <CampaignActions campaignId={campaign.id} isActive={campaign.isActive} />
          </div>
        )}
        {campaign.isActive && (
          <div className="mt-4">
            <Link
              href={`/production/new?campaignId=${campaign.id}`}
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-[2px] bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <IoAddOutline aria-hidden size={18} />
              Registrar día de esta campaña
            </Link>
          </div>
        )}
      </Card>

      <h2 className="mt-6 flex items-center gap-2 font-medium">
        <IoTrophyOutline aria-hidden size={18} />
        Metas por parcela
      </h2>
      {targets.length === 0 ? (
        <Card className="mt-2">
          <p className="text-sm text-muted-foreground">
            Sin metas definidas. {isAdmin ? 'Fija la primera abajo.' : ''}
          </p>
        </Card>
      ) : (
        <ul className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {targets.map((target) => (
            <li key={target.id}>
              <Card>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">
                    {plotNameById.get(target.plotId ?? 0) ?? `Parcela ${target.plotId}`}
                  </p>
                  <p className="shrink-0 text-sm font-semibold">
                    {formatWeight(target.targetWeight)}
                  </p>
                </div>
                {isAdmin && (
                  <div className="mt-2 flex items-end justify-between gap-2">
                    <div className="flex-1">
                      <TargetEditForm
                        targetId={target.id}
                        campaignId={campaign.id}
                        targetWeight={target.targetWeight}
                      />
                    </div>
                    <TargetActions targetId={target.id} campaignId={campaign.id} />
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
      {isAdmin && (
        <div className="mt-4">
          <CreateTargetForm campaignId={campaign.id} plots={plots} />
        </div>
      )}
    </div>
  );
}

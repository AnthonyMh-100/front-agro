import Link from 'next/link';
import { IoCalendarOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { Card } from '@/components/card/card';
import { formatDateRange } from '@/lib/dates';
import type { Campaign } from '@/lib/types';

export function formatCampaignRange(campaign: Pick<Campaign, 'startDate' | 'endDate'>): string {
  return formatDateRange(campaign.startDate, campaign.endDate);
}

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <Card className="group overflow-hidden p-0 transition-shadow hover:shadow-md hover:ring-1 hover:ring-ring">
      <div
        className={
          campaign.isActive
            ? 'flex items-center gap-3 bg-primary p-4 text-primary-foreground'
            : 'flex items-center gap-3 bg-surface p-4'
        }
      >
        <span
          className={
            campaign.isActive
              ? 'flex size-10 shrink-0 items-center justify-center rounded-[2px] bg-primary-foreground text-primary'
              : 'flex size-10 shrink-0 items-center justify-center rounded-[2px] bg-background text-muted-foreground'
          }
        >
          <IoCalendarOutline aria-hidden size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold tracking-tight">{campaign.name}</p>
          <p className="text-xs opacity-80">{formatCampaignRange(campaign)}</p>
        </div>
        <span
          className={
            campaign.isActive
              ? 'shrink-0 rounded-[2px] bg-primary-foreground px-2 py-0.5 text-xs font-medium text-primary'
              : 'shrink-0 rounded-[2px] bg-background px-2 py-0.5 text-xs text-muted-foreground'
          }
        >
          {campaign.isActive ? 'Activa' : 'Inactiva'}
        </span>
      </div>
      <div className="p-4 pt-3">
        <Link
          href={`/campaigns/${campaign.id}`}
          aria-label={`Ver detalle de ${campaign.name}`}
          className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-[2px] bg-surface px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:bg-primary group-hover:text-primary-foreground"
        >
          Ver detalle
          <IoChevronForwardOutline aria-hidden size={16} />
        </Link>
      </div>
    </Card>
  );
}

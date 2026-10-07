import Link from 'next/link';
import { IoCalendarOutline, IoChevronForwardOutline, IoMapOutline, IoScaleOutline } from 'react-icons/io5';
import { Card } from '@/components/card/card';
import { formatWeight } from '@/lib/utils';
import { formatDayShort } from '@/lib/dates';
import type { ProductionDay } from '@/lib/types';

export function ProductionDayCard({ day, total = 0 }: { day: ProductionDay; total?: number }) {
  const date = formatDayShort(day.date);

  return (
    <Card className="group p-0 transition-shadow hover:shadow-md hover:ring-1 hover:ring-ring">
      <div className="flex items-center gap-3 bg-accent p-4 text-accent-foreground">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[2px] bg-background text-foreground">
          <IoMapOutline aria-hidden size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold tracking-tight">
            {day.dayPlot?.name ?? `Parcela ${day.plotId}`}
          </p>
          <p className="flex items-center gap-1 text-xs opacity-80">
            <IoCalendarOutline aria-hidden size={14} className="shrink-0" />
            {date}
          </p>
        </div>
        <div className="text-right">
          <p className="flex items-center gap-1 text-lg font-semibold">
            <IoScaleOutline aria-hidden size={16} />
            {formatWeight(total)}
          </p>
        </div>
      </div>
      <div className="p-4 pt-3">
        <Link
          href={`/production/${day.id}`}
          aria-label={`Registrar pesajes de ${day.dayPlot?.name ?? day.plotId} del ${date}`}
          className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-[2px] bg-surface px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:bg-primary group-hover:text-primary-foreground"
        >
          Registrar pesajes
          <IoChevronForwardOutline aria-hidden size={16} />
        </Link>
      </div>
    </Card>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import {
  IoCalendarOutline,
  IoChevronForwardOutline,
  IoImageOutline,
  IoLeafOutline,
} from 'react-icons/io5';
import { Card } from '@/components/card/card';
import { formatDayShort } from '@/lib/dates';
import type { Farm } from '@/lib/types';

export function FarmCard({
  farm,
  plotCount,
  createdAt,
}: {
  farm: Farm;
  plotCount?: number;
  createdAt?: string;
}) {
  const cover = farm.imageUrls?.[0];
  return (
    <Card className="group overflow-hidden p-0 transition-shadow hover:shadow-md hover:ring-1 hover:ring-ring">
      <div className="relative">
        {cover ? (
          <Image
            src={cover}
            alt={farm.name}
            width={600}
            height={144}
            className="h-36 w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-36 w-full flex-col items-center justify-center gap-1 bg-muted">
            <IoImageOutline aria-hidden size={28} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Sin portada</p>
          </div>
        )}
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-[2px] bg-background px-2 py-1 text-xs font-medium shadow-sm">
          <IoLeafOutline aria-hidden size={14} className="text-primary" />
          {plotCount ?? 0} {(plotCount ?? 0) === 1 ? 'parcela' : 'parcelas'}
        </span>
      </div>
      <div className="p-4">
        <p className="truncate text-base font-semibold tracking-tight">{farm.name}</p>
        {farm.description ? (
          <p className="mt-1 line-clamp-2 max-w-[65ch] text-sm text-muted-foreground">
            {farm.description}
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">Sin descripción.</p>
        )}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
          <p className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            <IoCalendarOutline aria-hidden size={14} className="shrink-0" />
            <span className="truncate">
              {createdAt ? `Desde ${formatDayShort(createdAt)}` : 'Fundo agrícola'}
            </span>
          </p>
          <Link
            href={`/farms/${farm.id}`}
            aria-label={`Ver detalle de ${farm.name}`}
            className="inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-1 rounded-[2px] bg-surface px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:bg-primary group-hover:text-primary-foreground"
          >
            Detalle
            <IoChevronForwardOutline aria-hidden size={16} />
          </Link>
        </div>
      </div>
    </Card>
  );
}

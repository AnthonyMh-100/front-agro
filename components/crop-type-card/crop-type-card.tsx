import Link from 'next/link';
import { IoChevronForwardOutline, IoFlowerOutline } from 'react-icons/io5';
import { Card } from '@/components/card/card';
import type { CropType } from '@/lib/types';

export function CropTypeCard({ cropType }: { cropType: CropType }) {
  return (
    <Card className="group p-0 transition-shadow hover:shadow-md hover:ring-1 hover:ring-ring">
      <div className="flex items-center gap-3 bg-accent p-4 text-accent-foreground">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[2px] bg-background text-foreground">
          <IoFlowerOutline aria-hidden size={22} />
        </span>
        <p className="truncate text-base font-semibold tracking-tight">{cropType.name}</p>
      </div>
      <div className="p-4">
        {cropType.description ? (
          <p className="line-clamp-2 max-w-[65ch] text-sm text-muted-foreground">
            {cropType.description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Sin descripción.</p>
        )}
        <div className="mt-3 border-t border-border pt-3">
          <Link
            href={`/crop-types/${cropType.id}`}
            aria-label={`Ver detalle de ${cropType.name}`}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-[2px] bg-surface px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:bg-primary group-hover:text-primary-foreground"
          >
            Detalle
            <IoChevronForwardOutline aria-hidden size={16} />
          </Link>
        </div>
      </div>
    </Card>
  );
}

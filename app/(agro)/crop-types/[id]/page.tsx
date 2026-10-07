import Link from 'next/link';
import {
  IoAlertCircleOutline,
  IoArrowBackOutline,
  IoFlowerOutline,
} from 'react-icons/io5';
import { apiCatalog, requireUser } from '@/lib/auth-server';
import { CACHE_TAGS } from '@/lib/constants';
import type { CropTypeDetail } from '@/lib/types';
import { Card } from '@/components/card/card';
import { CropTypeEditForm } from '@/components/crop-type-edit-form/crop-type-edit-form';
import { CropTypeActions } from '@/components/crop-type-actions/crop-type-actions';

export default async function CropTypeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const viewer = await requireUser('/crop-types');
  const { id } = await params;
  const cropType = await apiCatalog<CropTypeDetail>(CACHE_TAGS.cropTypes, `/crop-types/${encodeURIComponent(id)}`);
  const isAdmin = viewer.role === 'ADMINISTRATION';

  if (!cropType) {
    return (
      <div>
        <Link
          href="/crop-types"
          className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 text-sm font-medium text-primary"
        >
          <IoArrowBackOutline aria-hidden size={16} />
          Volver a cultivos
        </Link>
        <Card className="mt-4">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <IoAlertCircleOutline aria-hidden size={18} />
            Cultivo no encontrado o sin conexión.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/crop-types"
        className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 text-sm font-medium text-primary"
      >
        <IoArrowBackOutline aria-hidden size={16} />
        Volver a cultivos
      </Link>
      <Card className="mt-2 p-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-[2px] bg-accent text-accent-foreground">
            <IoFlowerOutline aria-hidden size={18} />
          </span>
          <h1 className="text-xl font-semibold tracking-tight">{cropType.name}</h1>
        </div>
        <p className="mt-1 max-w-[65ch] text-sm text-muted-foreground">
          {cropType.description ?? 'Sin descripción.'}
        </p>
        {isAdmin && (
          <div className="mt-4 flex flex-wrap items-start gap-2">
            <CropTypeEditForm cropType={cropType} />
            <CropTypeActions cropTypeId={cropType.id} isActive={cropType.isActive} />
          </div>
        )}
      </Card>
    </div>
  );
}

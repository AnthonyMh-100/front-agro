import Link from 'next/link';
import {
  IoAlertCircleOutline,
  IoArrowBackOutline,
  IoFlowerOutline,
  IoLeafOutline,
  IoMapOutline,
} from 'react-icons/io5';
import { apiServer, requireUser } from '@/lib/auth-server';
import type { CropTypesResponse, FarmsResponse, PlotDetail } from '@/lib/types';
import { Card } from '@/components/card/card';
import { PlotEditForm } from '@/components/plot-edit-form/plot-edit-form';
import { PlotActions } from '@/components/plot-actions/plot-actions';
import { ImageGallery } from '@/components/image-gallery/image-gallery';

export default async function PlotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const viewer = await requireUser('/plots');
  const { id } = await params;
  const [plot, farms, cropTypes] = await Promise.all([
    apiServer<PlotDetail>(`/plots/${encodeURIComponent(id)}`, { cache: 'force-cache' }),
    apiServer<FarmsResponse>('/farms?page=1&limit=50', { cache: 'force-cache' }),
    apiServer<CropTypesResponse>('/crop-types?page=1&limit=50', { cache: 'force-cache' }),
  ]);
  const isAdmin = viewer.role === 'ADMINISTRATION';

  if (!plot) {
    return (
      <div>
        <Link
          href="/plots"
          className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 text-sm font-medium text-primary"
        >
          <IoArrowBackOutline aria-hidden size={16} />
          Volver a parcelas
        </Link>
        <Card className="mt-4">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <IoAlertCircleOutline aria-hidden size={18} />
            Parcela no encontrada o sin conexión.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/plots"
        className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 text-sm font-medium text-primary"
      >
        <IoArrowBackOutline aria-hidden size={16} />
        Volver a parcelas
      </Link>
      <Card className="mt-2 p-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-[2px] bg-primary text-primary-foreground">
            <IoMapOutline aria-hidden size={18} />
          </span>
          <h1 className="text-xl font-semibold tracking-tight">{plot.name}</h1>
        </div>
        <p className="mt-1 max-w-[65ch] text-sm text-muted-foreground">
          {plot.description ?? 'Sin descripción.'}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <span className="flex items-center gap-1 rounded-[2px] bg-surface px-2 py-1">
            <IoLeafOutline aria-hidden size={14} />
            {plot.farm?.name ?? `Fundo ${plot.farmId}`}
          </span>
          {plot.plotCropType && (
            <span className="flex items-center gap-1 rounded-[2px] bg-accent px-2 py-1 text-accent-foreground">
              <IoFlowerOutline aria-hidden size={14} />
              {plot.plotCropType.name}
            </span>
          )}
        </div>
        {isAdmin && (
          <div className="mt-4 flex flex-wrap items-start gap-2">
            <PlotEditForm
              plot={plot}
              farms={farms?.farms ?? []}
              cropTypes={cropTypes?.cropTypes ?? []}
            />
            <PlotActions plotId={plot.id} isActive={plot.isActive} />
          </div>
        )}
      </Card>
      <ImageGallery
        kind="plots"
        entityId={plot.id}
        images={plot.imageUrls ?? []}
        canManage={isAdmin}
      />
    </div>
  );
}

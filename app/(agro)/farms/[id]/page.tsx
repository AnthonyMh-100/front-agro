import Image from 'next/image';
import Link from 'next/link';
import {
  IoAlertCircleOutline,
  IoArrowBackOutline,
  IoGridOutline,
  IoImageOutline,
} from 'react-icons/io5';
import { apiServer, requireUser } from '@/lib/auth-server';
import type { FarmDetail } from '@/lib/types';
import { Card } from '@/components/card/card';
import { FarmEditForm } from '@/components/farm-edit-form/farm-edit-form';
import { FarmActions } from '@/components/farm-actions/farm-actions';
import { ImageGallery } from '@/components/image-gallery/image-gallery';

export default async function FarmDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const viewer = await requireUser('/farms');
  const { id } = await params;
  const farm = await apiServer<FarmDetail>(`/farms/${encodeURIComponent(id)}`, { cache: 'force-cache' });
  const isAdmin = viewer.role === 'ADMINISTRATION';

  if (!farm) {
    return (
      <div>
        <Link
          href="/farms"
          className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 text-sm font-medium text-primary"
        >
          <IoArrowBackOutline aria-hidden size={16} />
          Volver a fincas
        </Link>
        <Card className="mt-4">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <IoAlertCircleOutline aria-hidden size={18} />
            Fundo no encontrado o sin conexión.
          </p>
        </Card>
      </div>
    );
  }

  const cover = farm.imageUrls?.[0];
  return (
    <div>
      <Link
        href="/farms"
        className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 text-sm font-medium text-primary"
      >
        <IoArrowBackOutline aria-hidden size={16} />
        Volver a fincas
      </Link>
      <Card className="mt-2 overflow-hidden p-0">
        {cover ? (
          <Image
            src={cover}
            alt={farm.name}
            width={1200}
            height={160}
            className="h-40 w-full object-cover"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-muted">
            <IoImageOutline aria-hidden size={32} className="text-muted-foreground" />
          </div>
        )}
        <div className="p-4">
          <h1 className="text-xl font-semibold tracking-tight">{farm.name}</h1>
          <p className="mt-1 max-w-[65ch] text-sm text-muted-foreground">
            {farm.description ?? 'Sin descripción.'}
          </p>
          <ImageGallery
            kind="farms"
            entityId={farm.id}
            images={farm.imageUrls ?? []}
            canManage={isAdmin}
          />
          {isAdmin && (
            <div className="mt-4 flex flex-wrap items-start gap-2">
              <FarmEditForm farm={farm} />
              <FarmActions farmId={farm.id} isActive={farm.isActive} />
            </div>
          )}
        </div>
      </Card>

      <h2 className="mt-6 flex items-center gap-2 font-medium">
        <IoGridOutline aria-hidden size={18} />
        Parcelas ({farm.plots?.length ?? 0})
      </h2>
      {!farm.plots || farm.plots.length === 0 ? (
        <Card className="mt-2">
          <p className="text-sm text-muted-foreground">Esta finca aún no tiene parcelas.</p>
        </Card>
      ) : (
        <ul className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {farm.plots.map((plot) => (
            <li key={plot.id}>
              <Card>
                <p className="text-sm font-semibold">{plot.name}</p>
                {plot.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {plot.description}
                  </p>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

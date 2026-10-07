import Link from 'next/link';
import { IoAddOutline, IoArrowBackOutline } from 'react-icons/io5';
import { apiCatalog, requireRole } from '@/lib/auth-server';
import { CACHE_TAGS } from '@/lib/constants';
import type { CropTypesResponse, FarmsResponse } from '@/lib/types';
import { Card } from '@/components/card/card';
import { CreatePlotForm } from '@/components/create-plot-form/create-plot-form';

export default async function NewPlotPage() {
  await requireRole(['ADMINISTRATION'], '/plots/new');
  const [farms, cropTypes] = await Promise.all([
    apiCatalog<FarmsResponse>(CACHE_TAGS.farms, '/farms?page=1&limit=50'),
    apiCatalog<CropTypesResponse>(CACHE_TAGS.cropTypes, '/crop-types?page=1&limit=50'),
  ]);

  return (
    <div className="w-full">
      <Link
        href="/plots"
        className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <IoArrowBackOutline aria-hidden size={16} />
        Volver a parcelas
      </Link>
      <div className="mt-2 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-[2px] bg-primary text-primary-foreground">
          <IoAddOutline aria-hidden size={18} />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Nueva parcela</h1>
          <p className="max-w-[65ch] text-sm text-muted-foreground">
            Registra la parcela dentro de un fundo con su cultivo.
          </p>
        </div>
      </div>
      <div className="mt-4">
        {farms && farms.farms.length > 0 ? (
          <CreatePlotForm farms={farms.farms} cropTypes={cropTypes?.cropTypes ?? []} />
        ) : (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              Primero debes crear un fundo antes de registrar parcelas.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

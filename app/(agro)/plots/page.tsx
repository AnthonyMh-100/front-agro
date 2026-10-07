import Link from 'next/link';
import {
  IoAddOutline,
  IoAlertCircleOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoMapOutline,
  IoSearchOutline,
} from 'react-icons/io5';
import { apiCatalog, requireUser } from '@/lib/auth-server';
import { CACHE_TAGS, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import type { CropTypesResponse, FarmsResponse, PlotsResponse } from '@/lib/types';
import { Button } from '@/components/button/button';
import { Card } from '@/components/card/card';
import { Input } from '@/components/input/input';
import { Select } from '@/components/select/select';
import { PlotCard } from '@/components/plot-card/plot-card';

export default async function PlotsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; farmId?: string }>;
}) {
  const user = await requireUser('/plots');
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const search = sp.search ?? '';
  const farmId = sp.farmId ?? '';

  const params = new URLSearchParams({ page: String(page), limit: String(DEFAULT_PAGE_SIZE) });
  if (search) params.set('search', search);
  if (farmId) params.set('farmId', farmId);
  const [data, farms, cropTypes] = await Promise.all([
    apiCatalog<PlotsResponse>(CACHE_TAGS.plots, `/plots?${params.toString()}`),
    apiCatalog<FarmsResponse>(CACHE_TAGS.farms, '/farms?page=1&limit=50'),
    apiCatalog<CropTypesResponse>(CACHE_TAGS.cropTypes, '/crop-types?page=1&limit=50'),
  ]);
  const farmNameById = new Map((farms?.farms ?? []).map((farm) => [farm.id, farm.name]));
  const cropNameById = new Map((cropTypes?.cropTypes ?? []).map((cropType) => [cropType.id, cropType.name]));

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-[2px] bg-primary text-primary-foreground">
            <IoMapOutline aria-hidden size={18} />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Parcelas</h1>
            <p className="text-xs text-muted-foreground">
              {data ? `${data.totalItems} registros` : 'Fundo → parcela → producción'}
            </p>
          </div>
        </div>
        {user.role === 'ADMINISTRATION' && (
          <Link
            href="/plots/new"
            className="inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-1 rounded-[2px] bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <IoAddOutline aria-hidden size={18} />
            Nueva parcela
          </Link>
        )}
      </div>

      <form method="get" className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Select
          name="farmId"
          defaultValue={farmId}
          aria-label="Filtrar por fundo"
          className="sm:max-w-xs"
        >
          <option value="">Todos los fundos</option>
          {(farms?.farms ?? []).map((farm) => (
            <option key={farm.id} value={farm.id}>
              {farm.name}
            </option>
          ))}
        </Select>
        <div className="relative flex-1">
          <IoSearchOutline
            aria-hidden
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            name="search"
            defaultValue={search}
            placeholder="Buscar por nombre…"
            aria-label="Buscar parcelas"
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      {!data ? (
        <Card className="mt-4">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <IoAlertCircleOutline aria-hidden size={18} />
            Sin conexión con la API.
          </p>
        </Card>
      ) : data.plots.length === 0 ? (
        <Card className="mt-4">
          <p className="text-sm text-muted-foreground">Sin parcelas.</p>
        </Card>
      ) : (
        <>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.plots.map((plot) => (
              <li key={plot.id}>
                <PlotCard
                  plot={plot}
                  farmName={farmNameById.get(plot.farmId)}
                  cropName={plot.cropTypeId ? cropNameById.get(plot.cropTypeId) : undefined}
                />
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              Página {data.currentPage} de {data.totalPages} ({data.totalItems})
            </span>
            {data.currentPage > 1 && (
              <Link
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-[2px] border border-border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={`/plots?page=${data.currentPage - 1}${search ? `&search=${search}` : ''}${farmId ? `&farmId=${farmId}` : ''}`}
              >
                <IoChevronBackOutline aria-hidden size={16} />
                Anterior
              </Link>
            )}
            {data.currentPage < data.totalPages && (
              <Link
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-[2px] border border-border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={`/plots?page=${data.currentPage + 1}${search ? `&search=${search}` : ''}${farmId ? `&farmId=${farmId}` : ''}`}
              >
                Siguiente
                <IoChevronForwardOutline aria-hidden size={16} />
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}

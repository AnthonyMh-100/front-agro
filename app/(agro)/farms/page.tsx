import Link from 'next/link';
import {
  IoAddOutline,
  IoAlertCircleOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoLeafOutline,
  IoSearchOutline,
} from 'react-icons/io5';
import { apiServer, requireUser } from '@/lib/auth-server';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import type { FarmsResponse, PlotsResponse } from '@/lib/types';
import { Button } from '@/components/button/button';
import { Card } from '@/components/card/card';
import { Input } from '@/components/input/input';
import { FarmCard } from '@/components/farm-card/farm-card';

export default async function FarmsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const user = await requireUser('/farms');
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const search = sp.search ?? '';

  const params = new URLSearchParams({ page: String(page), limit: String(DEFAULT_PAGE_SIZE) });
  if (search) params.set('search', search);
  const data = await apiServer<FarmsResponse>(`/farms?${params.toString()}`, { cache: 'force-cache' });
  const plotCounts = data
    ? await Promise.all(
        data.farms.map(async (farm) => {
          const plots = await apiServer<PlotsResponse>(`/plots?farmId=${farm.id}&page=1&limit=1`, {
            cache: 'force-cache',
          });
          return { farmId: farm.id, count: plots?.totalItems ?? 0 };
        }),
      )
    : [];
  const countByFarmId = new Map(plotCounts.map((entry) => [entry.farmId, entry.count]));

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-[2px] bg-primary text-primary-foreground">
            <IoLeafOutline aria-hidden size={18} />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Fincas</h1>
            <p className="text-xs text-muted-foreground">
              {data ? `${data.totalItems} registros` : 'Fundo → parcelas → producción'}
            </p>
          </div>
        </div>
        {user.role === 'ADMINISTRATION' && (
          <Link
            href="/farms/new"
            className="inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-1 rounded-[2px] bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <IoAddOutline aria-hidden size={18} />
            Nueva finca
          </Link>
        )}
      </div>

      <form method="get" className="mt-4 flex gap-2">
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
            aria-label="Buscar fincas"
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">
          Buscar
        </Button>
      </form>

      {!data ? (
        <Card className="mt-4">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <IoAlertCircleOutline aria-hidden size={18} />
            Sin conexión con la API.
          </p>
        </Card>
      ) : data.farms.length === 0 ? (
        <Card className="mt-4">
          <p className="text-sm text-muted-foreground">
            Sin fincas{search ? ` para “${search}”` : ''}.
          </p>
        </Card>
      ) : (
        <>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.farms.map((farm) => (
              <li key={farm.id}>
                <FarmCard
                  farm={farm}
                  plotCount={countByFarmId.get(farm.id) ?? 0}
                  createdAt={farm.createdAt}
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
                href={`/farms?page=${data.currentPage - 1}${search ? `&search=${search}` : ''}`}
              >
                <IoChevronBackOutline aria-hidden size={16} />
                Anterior
              </Link>
            )}
            {data.currentPage < data.totalPages && (
              <Link
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-[2px] border border-border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={`/farms?page=${data.currentPage + 1}${search ? `&search=${search}` : ''}`}
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

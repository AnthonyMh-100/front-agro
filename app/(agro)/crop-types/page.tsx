import Link from 'next/link';
import {
  IoAddOutline,
  IoAlertCircleOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoFlowerOutline,
  IoSearchOutline,
} from 'react-icons/io5';
import { apiServer, requireUser } from '@/lib/auth-server';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import type { CropTypesResponse } from '@/lib/types';
import { Button } from '@/components/button/button';
import { Card } from '@/components/card/card';
import { Input } from '@/components/input/input';
import { CropTypeCard } from '@/components/crop-type-card/crop-type-card';

export default async function CropTypesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const user = await requireUser('/crop-types');
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const search = sp.search ?? '';

  const params = new URLSearchParams({ page: String(page), limit: String(DEFAULT_PAGE_SIZE) });
  if (search) params.set('search', search);
  const data = await apiServer<CropTypesResponse>(`/crop-types?${params.toString()}`, { cache: 'force-cache' });

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-[2px] bg-primary text-primary-foreground">
            <IoFlowerOutline aria-hidden size={18} />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Cultivos</h1>
            <p className="text-xs text-muted-foreground">
              {data ? `${data.totalItems} registros` : 'Catálogo para parcelas'}
            </p>
          </div>
        </div>
        {user.role === 'ADMINISTRATION' && (
          <Link
            href="/crop-types/new"
            className="inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-1 rounded-[2px] bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <IoAddOutline aria-hidden size={18} />
            Nuevo cultivo
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
            aria-label="Buscar cultivos"
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
      ) : data.cropTypes.length === 0 ? (
        <Card className="mt-4">
          <p className="text-sm text-muted-foreground">Sin cultivos.</p>
        </Card>
      ) : (
        <>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.cropTypes.map((cropType) => (
              <li key={cropType.id}>
                <CropTypeCard cropType={cropType} />
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
                href={`/crop-types?page=${data.currentPage - 1}${search ? `&search=${search}` : ''}`}
              >
                <IoChevronBackOutline aria-hidden size={16} />
                Anterior
              </Link>
            )}
            {data.currentPage < data.totalPages && (
              <Link
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-[2px] border border-border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={`/crop-types?page=${data.currentPage + 1}${search ? `&search=${search}` : ''}`}
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

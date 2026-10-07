import Link from 'next/link';
import {
  IoAddOutline,
  IoAlertCircleOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoPeopleOutline,
  IoSearchOutline,
} from 'react-icons/io5';
import { apiCatalog, requireRole } from '@/lib/auth-server';
import { CACHE_TAGS, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import type { UsersResponse } from '@/lib/types';
import { Button } from '@/components/button/button';
import { Card } from '@/components/card/card';
import { Input } from '@/components/input/input';
import { UserActions } from '@/components/user-actions/user-actions';
import { UserRoleForm } from '@/components/user-role-form/user-role-form';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  await requireRole(['ADMINISTRATION'], '/admin');
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const search = sp.search ?? '';

  const params = new URLSearchParams({ page: String(page), limit: String(DEFAULT_PAGE_SIZE) });
  if (search) params.set('search', search);
  const data = await apiCatalog<UsersResponse>(CACHE_TAGS.users, `/users?${params.toString()}`);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-[2px] bg-primary text-primary-foreground">
            <IoPeopleOutline aria-hidden size={18} />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Usuarios</h1>
            <p className="text-xs text-muted-foreground">
              {data ? `${data.totalItems} registros` : 'Supervisores y administradores'}
            </p>
          </div>
        </div>
        <Link
          href="/admin/new"
          className="inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-1 rounded-[2px] bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <IoAddOutline aria-hidden size={18} />
          Nuevo supervisor
        </Link>
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
            placeholder="Buscar por usuario, nombre o correo…"
            aria-label="Buscar usuarios"
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
      ) : data.users.length === 0 ? (
        <Card className="mt-4">
          <p className="text-sm text-muted-foreground">Sin usuarios.</p>
        </Card>
      ) : (
        <>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.users.map((listedUser) => {
              const initials = (listedUser.name ?? listedUser.username).slice(0, 2).toUpperCase();
              return (
                <li key={listedUser.id}>
                  <Card className="p-0">
                    <div className="flex items-center gap-3 p-4">
                      <span
                        aria-hidden
                        className="flex size-10 shrink-0 items-center justify-center rounded-[2px] bg-primary text-sm font-semibold text-primary-foreground"
                      >
                        {initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {listedUser.name ?? listedUser.username}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          @{listedUser.username}
                          {listedUser.email ? ` · ${listedUser.email}` : ''}
                        </p>
                      </div>
                      <span
                        className={
                          listedUser.isActive
                            ? 'shrink-0 rounded-[2px] bg-accent px-2 py-0.5 text-xs text-accent-foreground'
                            : 'shrink-0 rounded-[2px] bg-surface px-2 py-0.5 text-xs text-muted-foreground'
                        }
                      >
                        {listedUser.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 border-t border-border p-4">
                      <div className="min-w-40 flex-1">
                        <UserRoleForm userId={listedUser.id} role={listedUser.role} />
                      </div>
                      <UserActions userId={listedUser.id} isActive={listedUser.isActive} />
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              Página {data.currentPage} de {data.totalPages} ({data.totalItems})
            </span>
            {data.currentPage > 1 && (
              <Link
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-[2px] border border-border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={`/admin?page=${data.currentPage - 1}${search ? `&search=${search}` : ''}`}
              >
                <IoChevronBackOutline aria-hidden size={16} />
                Anterior
              </Link>
            )}
            {data.currentPage < data.totalPages && (
              <Link
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-[2px] border border-border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={`/admin?page=${data.currentPage + 1}${search ? `&search=${search}` : ''}`}
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

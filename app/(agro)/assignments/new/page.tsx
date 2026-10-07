import Link from 'next/link';
import { IoAddOutline, IoArrowBackOutline } from 'react-icons/io5';
import { apiCatalog, requireRole } from '@/lib/auth-server';
import { CACHE_TAGS } from '@/lib/constants';
import type { PlotsResponse, UsersResponse } from '@/lib/types';
import { Card } from '@/components/card/card';
import { CreateAssignmentForm } from '@/components/create-assignment-form/create-assignment-form';

export default async function NewAssignmentPage() {
  await requireRole(['ADMINISTRATION'], '/assignments/new');
  const [users, plots] = await Promise.all([
    apiCatalog<UsersResponse>(CACHE_TAGS.users, '/users?page=1&limit=50'),
    apiCatalog<PlotsResponse>(CACHE_TAGS.plots, '/plots?page=1&limit=50'),
  ]);
  const supervisors = (users?.users ?? []).filter(
    (candidate) => candidate.role === 'SUPERVISOR' && candidate.isActive,
  );

  return (
    <div className="w-full">
      <Link
        href="/assignments"
        className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <IoArrowBackOutline aria-hidden size={16} />
        Volver a asignaciones
      </Link>
      <div className="mt-2 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-[2px] bg-primary text-primary-foreground">
          <IoAddOutline aria-hidden size={18} />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Nueva asignación</h1>
          <p className="max-w-[65ch] text-sm text-muted-foreground">
            Vincula un supervisor con una parcela de un fundo.
          </p>
        </div>
      </div>
      <div className="mt-4">
        {supervisors.length > 0 && (plots?.plots ?? []).length > 0 ? (
          <CreateAssignmentForm supervisors={supervisors} plots={plots?.plots ?? []} />
        ) : (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              Necesitas al menos un supervisor activo y una parcela para crear asignaciones.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

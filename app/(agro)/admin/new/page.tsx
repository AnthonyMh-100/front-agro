import Link from 'next/link';
import { IoAddOutline, IoArrowBackOutline } from 'react-icons/io5';
import { requireRole } from '@/lib/auth-server';
import { CreateUserForm } from '@/components/create-user-form/create-user-form';

export default async function NewUserPage() {
  await requireRole(['ADMINISTRATION'], '/admin/new');

  return (
    <div className="w-full">
      <Link
        href="/admin"
        className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <IoArrowBackOutline aria-hidden size={16} />
        Volver a usuarios
      </Link>
      <div className="mt-2 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-[2px] bg-primary text-primary-foreground">
          <IoAddOutline aria-hidden size={18} />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Nuevo supervisor</h1>
          <p className="max-w-[65ch] text-sm text-muted-foreground">
            Todo registrado nace SUPERVISOR. Luego podrás cambiar su rol.
          </p>
        </div>
      </div>
      <div className="mt-4">
        <CreateUserForm />
      </div>
    </div>
  );
}

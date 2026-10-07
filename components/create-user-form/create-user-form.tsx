'use client';

import { useActionState, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
import { IoAddOutline, IoLockClosedOutline, IoMailOutline, IoCallOutline, IoPersonOutline } from 'react-icons/io5';
import { createUserAction } from '@/actions/users/users';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/button/button';
import { Card } from '@/components/card/card';
import { Input } from '@/components/input/input';

export function CreateUserForm() {
  const router = useRouter();
  const usernameId = useId();
  const passwordId = useId();
  const nameId = useId();
  const lastNameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const errorId = useId();
  const [state, action, pending] = useActionState(createUserAction, {
    ok: false,
    message: null,
  });

  useEffect(() => {
    if (state.ok) router.push(ROUTES.admin);
  }, [state.ok, router]);

  return (
    <Card className="p-6">
      <form action={action} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={usernameId} className="block text-sm font-medium">
              Usuario *
            </label>
            <div className="relative mt-1">
              <IoPersonOutline
                aria-hidden
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id={usernameId}
                name="username"
                required
                minLength={4}
                autoComplete="off"
                placeholder="Mín. 4 caracteres"
                aria-invalid={Boolean(state.message)}
                aria-describedby={state.message ? errorId : undefined}
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <label htmlFor={passwordId} className="block text-sm font-medium">
              Contraseña *
            </label>
            <div className="relative mt-1">
              <IoLockClosedOutline
                aria-hidden
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id={passwordId}
                name="password"
                type="password"
                required
                minLength={5}
                autoComplete="new-password"
                placeholder="Mín. 5 caracteres"
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <label htmlFor={nameId} className="block text-sm font-medium">
              Nombre
            </label>
            <Input id={nameId} name="name" autoComplete="off" className="mt-1" />
          </div>
          <div>
            <label htmlFor={lastNameId} className="block text-sm font-medium">
              Apellido
            </label>
            <Input id={lastNameId} name="lastName" autoComplete="off" className="mt-1" />
          </div>
          <div>
            <label htmlFor={emailId} className="block text-sm font-medium">
              Correo
            </label>
            <div className="relative mt-1">
              <IoMailOutline
                aria-hidden
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id={emailId}
                name="email"
                type="email"
                autoComplete="off"
                placeholder="usuario@correo.com"
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <label htmlFor={phoneId} className="block text-sm font-medium">
              Teléfono
            </label>
            <div className="relative mt-1">
              <IoCallOutline
                aria-hidden
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id={phoneId}
                name="phone"
                autoComplete="off"
                placeholder="9 dígitos, inicia con 9"
                className="pl-9"
              />
            </div>
          </div>
        </div>
        {state.message && (
          <p
            id={errorId}
            role="alert"
            className="rounded-[2px] border border-border bg-background px-2 py-2 text-sm text-red-700"
          >
            {state.message}
          </p>
        )}
        <div>
          <Button type="submit" disabled={pending} aria-busy={pending} size="lg">
            <IoAddOutline aria-hidden size={18} />
            {pending ? 'Guardando…' : 'Crear supervisor'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

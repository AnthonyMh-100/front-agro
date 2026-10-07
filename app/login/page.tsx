'use client';

import { Suspense, useActionState, useId } from 'react';
import {
  IoAlertCircleOutline,
  IoLeaf,
  IoLockClosedOutline,
  IoLogInOutline,
  IoPersonOutline,
} from 'react-icons/io5';
import { loginAction } from '@/actions/auth/auth';
import { Button } from '@/components/button/button';
import { Card } from '@/components/card/card';
import { Input } from '@/components/input/input';

function LoginForm() {
  const usernameId = useId();
  const passwordId = useId();
  const errorId = useId();
  const [state, action, pending] = useActionState(loginAction, {
    ok: false,
    message: null,
  });

  return (
    <div className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-surface p-4">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 size-72 rounded-full bg-accent opacity-60 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 size-80 rounded-full bg-tertiary opacity-20 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 size-64 -translate-x-1/2 rounded-full bg-primary opacity-10 blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="mb-4 flex items-center justify-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-[2px] bg-primary text-primary-foreground shadow-sm">
            <IoLeaf aria-hidden size={22} />
          </span>
          <div className="text-left">
            <p className="text-base font-semibold tracking-tight">Agro</p>
            <p className="text-xs text-muted-foreground">Gestión agrícola</p>
          </div>
        </div>
        <Card className="p-6 shadow-md">
          <form action={action}>
            <h1 className="text-xl font-semibold tracking-tight">Iniciar sesión</h1>
            <p className="mt-1 max-w-[65ch] text-sm text-muted-foreground">
              Accede con tu usuario del sistema.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <label htmlFor={usernameId} className="block text-sm font-medium">
                  Usuario
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
                    autoComplete="username"
                    required
                    minLength={4}
                    aria-invalid={Boolean(state.message)}
                    aria-describedby={state.message ? errorId : undefined}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <label htmlFor={passwordId} className="block text-sm font-medium">
                  Contraseña
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
                    autoComplete="current-password"
                    required
                    minLength={5}
                    aria-invalid={Boolean(state.message)}
                    aria-describedby={state.message ? errorId : undefined}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            {state.message && (
              <p
                id={errorId}
                role="alert"
                className="mt-3 flex items-center gap-2 rounded-[2px] border border-border bg-background px-2 py-2 text-sm text-red-700"
              >
                <IoAlertCircleOutline aria-hidden size={16} className="shrink-0" />
                {state.message}
              </p>
            )}
            <Button type="submit" disabled={pending} aria-busy={pending} className="mt-4 w-full" size="lg">
              <IoLogInOutline aria-hidden size={18} />
              {pending ? 'Ingresando…' : 'Ingresar'}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Accede con el usuario y la contraseña asignados por tu administrador.
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

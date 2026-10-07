'use client';

import { useActionState, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
import { IoAddOutline } from 'react-icons/io5';
import { createCampaignAction } from '@/actions/campaigns/campaigns';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/button/button';
import { Card } from '@/components/card/card';
import { Input } from '@/components/input/input';

export function CreateCampaignForm() {
  const router = useRouter();
  const nameId = useId();
  const startId = useId();
  const endId = useId();
  const errorId = useId();
  const [state, action, pending] = useActionState(createCampaignAction, {
    ok: false,
    message: null,
  });

  useEffect(() => {
    if (state.ok) router.push(ROUTES.campaigns);
  }, [state.ok, router]);

  return (
    <Card className="p-6">
      <form action={action} className="flex flex-col gap-4">
        <div>
          <label htmlFor={nameId} className="block text-sm font-medium">
            Nombre *
          </label>
          <Input
            id={nameId}
            name="name"
            placeholder="Nombre (mín. 3)"
            required
            minLength={3}
            aria-invalid={Boolean(state.message)}
            aria-describedby={state.message ? errorId : undefined}
            className="mt-1"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={startId} className="block text-sm font-medium">
              Fecha de inicio *
            </label>
            <Input id={startId} name="startDate" type="date" required className="mt-1" />
          </div>
          <div>
            <label htmlFor={endId} className="block text-sm font-medium">
              Fecha de fin *
            </label>
            <Input id={endId} name="endDate" type="date" required className="mt-1" />
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
            {pending ? 'Guardando…' : 'Crear campaña'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

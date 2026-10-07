'use client';

import { useActionState, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
import { IoAddOutline } from 'react-icons/io5';
import { createAssignmentAction } from '@/actions/assignments/assignments';
import { ROUTES } from '@/lib/constants';
import type { Plot, User } from '@/lib/types';
import { Button } from '@/components/button/button';
import { Card } from '@/components/card/card';
import { Select } from '@/components/select/select';

export function CreateAssignmentForm({ supervisors, plots }: { supervisors: User[]; plots: Plot[] }) {
  const router = useRouter();
  const userId = useId();
  const plotId = useId();
  const errorId = useId();
  const [state, action, pending] = useActionState(createAssignmentAction, {
    ok: false,
    message: null,
  });

  useEffect(() => {
    if (state.ok) router.push(ROUTES.assignments);
  }, [state.ok, router]);

  return (
    <Card className="p-6">
      <form action={action} className="flex flex-col gap-4">
        <div>
          <label htmlFor={userId} className="block text-sm font-medium">
            Supervisor
          </label>
          <Select id={userId} name="userId" required defaultValue="" className="mt-1">
            <option value="" disabled>
              Selecciona un supervisor
            </option>
            {supervisors.map((supervisor) => (
              <option key={supervisor.id} value={supervisor.id}>
                {supervisor.name ?? supervisor.username} ({supervisor.username})
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor={plotId} className="block text-sm font-medium">
            Parcela
          </label>
          <Select id={plotId} name="plotId" required defaultValue="" className="mt-1">
            <option value="" disabled>
              Selecciona una parcela
            </option>
            {plots.map((plot) => (
              <option key={plot.id} value={plot.id}>
                {plot.name}
              </option>
            ))}
          </Select>
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
            {pending ? 'Guardando…' : 'Crear asignación'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

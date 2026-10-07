'use client';

import { useActionState, useId } from 'react';
import { IoAddOutline, IoTrophyOutline } from 'react-icons/io5';
import { createTargetAction } from '@/actions/production-targets/production-targets';
import type { Plot } from '@/lib/types';
import { Button } from '@/components/button/button';
import { Card } from '@/components/card/card';
import { Input } from '@/components/input/input';
import { Select } from '@/components/select/select';

export function CreateTargetForm({ campaignId, plots }: { campaignId: number; plots: Plot[] }) {
  const plotId = useId();
  const weightId = useId();
  const errorId = useId();
  const [state, action, pending] = useActionState(createTargetAction, {
    ok: false,
    message: null,
  });

  return (
    <Card>
      <h2 className="flex items-center gap-2 font-medium">
        <IoTrophyOutline aria-hidden size={18} />
        Nueva meta
      </h2>
      <form action={action} className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
        <input type="hidden" name="campaignId" value={campaignId} />
        <div className="flex-1">
          <label htmlFor={plotId} className="block text-sm font-medium">
            Parcela *
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
        <div className="flex-1">
          <label htmlFor={weightId} className="block text-sm font-medium">
            Meta (kg) *
          </label>
          <Input
            id={weightId}
            name="targetWeight"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            aria-invalid={Boolean(state.message)}
            aria-describedby={state.message ? errorId : undefined}
            className="mt-1"
          />
        </div>
        <Button type="submit" disabled={pending} aria-busy={pending}>
          <IoAddOutline aria-hidden size={18} />
          {pending ? 'Guardando…' : 'Fijar meta'}
        </Button>
      </form>
      {state.message && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-red-700">
          {state.message}
        </p>
      )}
    </Card>
  );
}

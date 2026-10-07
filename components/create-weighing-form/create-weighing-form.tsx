'use client';

import { useActionState, useId } from 'react';
import { IoAddOutline, IoScaleOutline } from 'react-icons/io5';
import { createWeighingAction } from '@/actions/production/production';
import { Button } from '@/components/button/button';
import { Card } from '@/components/card/card';
import { Input } from '@/components/input/input';

export function CreateWeighingForm({ productionDayId }: { productionDayId: number }) {
  const weightId = useId();
  const errorId = useId();
  const [state, action, pending] = useActionState(createWeighingAction, {
    ok: false,
    message: null,
  });

  return (
    <Card>
      <h2 className="flex items-center gap-2 font-medium">
        <IoScaleOutline aria-hidden size={18} />
        Registrar pesaje
      </h2>
      <form action={action} className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
        <input type="hidden" name="productionDayId" value={productionDayId} />
        <div className="flex-1">
          <label htmlFor={weightId} className="block text-sm font-medium">
            Peso (kg) *
          </label>
          <Input
            id={weightId}
            name="weight"
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
          {pending ? 'Guardando…' : 'Agregar'}
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

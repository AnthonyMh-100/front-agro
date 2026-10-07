'use client';

import { useActionState, useId, useState } from 'react';
import { IoPencilOutline } from 'react-icons/io5';
import { createCorrectionAction } from '@/actions/weighing-corrections/weighing-corrections';
import { Button } from '@/components/button/button';
import { Input } from '@/components/input/input';
import { Textarea } from '@/components/textarea/textarea';

export function WeighingCorrectionForm({
  weighingId,
  productionDayId,
  currentWeight,
}: {
  weighingId: number;
  productionDayId: number;
  currentWeight: number | string;
}) {
  const [open, setOpen] = useState(false);
  const valueId = useId();
  const reasonId = useId();
  const errorId = useId();
  const [state, action, pending] = useActionState(createCorrectionAction, {
    ok: false,
    message: null,
  });

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <IoPencilOutline aria-hidden size={16} />
        Corregir
      </Button>
    );
  }

  return (
    <form action={action} className="mt-2 flex flex-col gap-2 border-t border-border pt-2">
      <input type="hidden" name="weighingId" value={weighingId} />
      <input type="hidden" name="productionDayId" value={productionDayId} />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor={valueId} className="block text-xs font-medium">
            Valor corregido (kg) *
          </label>
          <Input
            id={valueId}
            name="correctedValue"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={Number(currentWeight)}
            aria-invalid={Boolean(state.message)}
            aria-describedby={state.message ? errorId : undefined}
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor={reasonId} className="block text-xs font-medium">
            Motivo
          </label>
          <Textarea
            id={reasonId}
            name="reason"
            rows={1}
            placeholder="Máx. 500"
            maxLength={500}
            aria-label="Motivo de la corrección"
            className="mt-1"
          />
        </div>
      </div>
      {state.message && (
        <p id={errorId} role="alert" className="text-sm text-red-700">
          {state.message}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending} aria-busy={pending}>
          {pending ? 'Guardando…' : 'Guardar corrección'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

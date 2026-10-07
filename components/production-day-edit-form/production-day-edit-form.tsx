'use client';

import { useActionState, useState } from 'react';
import { IoPencilOutline } from 'react-icons/io5';
import { updateProductionDayAction } from '@/actions/production/production';
import { Button } from '@/components/button/button';
import { Card } from '@/components/card/card';
import { Input } from '@/components/input/input';
import { Textarea } from '@/components/textarea/textarea';
import type { ProductionDay } from '@/lib/types';

export function ProductionDayEditForm({ day }: { day: ProductionDay }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updateProductionDayAction, {
    ok: false,
    message: null,
  });

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <IoPencilOutline aria-hidden size={16} />
        Editar día
      </Button>
    );
  }

  return (
    <Card className="mt-4">
      <form action={action} className="flex flex-col gap-2">
        <input type="hidden" name="productionDayId" value={day.id} />
        <Input
          name="date"
          type="date"
          defaultValue={String(day.date).slice(0, 10)}
          aria-label="Fecha del día de producción"
          required
        />
        <Textarea
          name="notes"
          defaultValue={day.notes ?? ''}
          rows={2}
          placeholder="Notas (máx. 500)"
          maxLength={500}
          aria-label="Notas del día de producción"
        />
        {state.message && (
          <p role="alert" className="text-sm text-red-700">
            {state.message}
          </p>
        )}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={pending} aria-busy={pending}>
            {pending ? 'Guardando…' : 'Guardar'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}

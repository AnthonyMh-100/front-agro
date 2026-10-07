'use client';

import { useActionState, useState } from 'react';
import { IoPencilOutline } from 'react-icons/io5';
import { updateFarmAction } from '@/actions/farms/farms';
import { Button } from '@/components/button/button';
import { Card } from '@/components/card/card';
import { Input } from '@/components/input/input';
import { ImagePicker } from '@/components/image-picker/image-picker';
import type { Farm } from '@/lib/types';

export function FarmEditForm({ farm }: { farm: Farm }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updateFarmAction, {
    ok: false,
    message: null,
  });

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <IoPencilOutline aria-hidden size={16} />
        Editar
      </Button>
    );
  }

  return (
    <Card className="mt-4">
      <form action={action} className="flex flex-col gap-2">
        <input type="hidden" name="farmId" value={farm.id} />
        <Input
          name="name"
          defaultValue={farm.name}
          aria-label="Nombre de la finca"
          required
          minLength={3}
        />
        <Input
          name="description"
          defaultValue={farm.description ?? ''}
          aria-label="Descripción de la finca"
          placeholder="Descripción (máx. 500)"
          maxLength={500}
        />
        <ImagePicker />
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

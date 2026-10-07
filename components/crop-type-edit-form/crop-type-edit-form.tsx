'use client';

import { useActionState, useState } from 'react';
import { IoPencilOutline } from 'react-icons/io5';
import { updateCropTypeAction } from '@/actions/crop-types/crop-types';
import type { CropType } from '@/lib/types';
import { Button } from '@/components/button/button';
import { Card } from '@/components/card/card';
import { Input } from '@/components/input/input';

export function CropTypeEditForm({ cropType }: { cropType: CropType }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updateCropTypeAction, {
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
        <input type="hidden" name="cropTypeId" value={cropType.id} />
        <Input
          name="name"
          defaultValue={cropType.name}
          aria-label="Nombre del cultivo"
          required
          minLength={3}
        />
        <Input
          name="description"
          defaultValue={cropType.description ?? ''}
          aria-label="Descripción del cultivo"
          placeholder="Descripción (máx. 500)"
          maxLength={500}
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

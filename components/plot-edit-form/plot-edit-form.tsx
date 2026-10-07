'use client';

import { useActionState, useState } from 'react';
import { IoPencilOutline } from 'react-icons/io5';
import { updatePlotAction } from '@/actions/plots/plots';
import type { CropType, Farm, Plot } from '@/lib/types';
import { Button } from '@/components/button/button';
import { Card } from '@/components/card/card';
import { Input } from '@/components/input/input';
import { Select } from '@/components/select/select';
import { ImagePicker } from '@/components/image-picker/image-picker';

export function PlotEditForm({
  plot,
  farms,
  cropTypes,
}: {
  plot: Plot;
  farms: Farm[];
  cropTypes: CropType[];
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updatePlotAction, {
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
        <input type="hidden" name="plotId" value={plot.id} />
        <Input
          name="name"
          defaultValue={plot.name}
          aria-label="Nombre de la parcela"
          required
          minLength={3}
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Select name="farmId" defaultValue={plot.farmId} aria-label="Fundo de la parcela">
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name}
              </option>
            ))}
          </Select>
          <Select
            name="cropTypeId"
            defaultValue={plot.cropTypeId ?? ''}
            aria-label="Cultivo de la parcela"
          >
            <option value="">Sin cultivo</option>
            {cropTypes.map((cropType) => (
              <option key={cropType.id} value={cropType.id}>
                {cropType.name}
              </option>
            ))}
          </Select>
        </div>
        <Input
          name="description"
          defaultValue={plot.description ?? ''}
          aria-label="Descripción de la parcela"
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

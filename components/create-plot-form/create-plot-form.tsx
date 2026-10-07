'use client';

import { useActionState, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
import { IoAddOutline } from 'react-icons/io5';
import { createPlotAction } from '@/actions/plots/plots';
import { ROUTES } from '@/lib/constants';
import type { CropType, Farm } from '@/lib/types';
import { Button } from '@/components/button/button';
import { Card } from '@/components/card/card';
import { Input } from '@/components/input/input';
import { Select } from '@/components/select/select';
import { Textarea } from '@/components/textarea/textarea';
import { ImagePicker } from '@/components/image-picker/image-picker';

export function CreatePlotForm({ farms, cropTypes }: { farms: Farm[]; cropTypes: CropType[] }) {
  const router = useRouter();
  const nameId = useId();
  const farmId = useId();
  const cropTypeId = useId();
  const descriptionId = useId();
  const errorId = useId();
  const [state, action, pending] = useActionState(createPlotAction, {
    ok: false,
    message: null,
  });

  useEffect(() => {
    if (state.ok) router.push(ROUTES.plots);
  }, [state.ok, router]);

  return (
    <Card className="p-6">
      <form action={action} className="flex flex-col gap-4">
        <div>
          <label htmlFor={nameId} className="block text-sm font-medium">
            Nombre
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
            <label htmlFor={farmId} className="block text-sm font-medium">
              Fundo
            </label>
            <Select id={farmId} name="farmId" required defaultValue="" className="mt-1">
              <option value="" disabled>
                Selecciona un fundo
              </option>
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor={cropTypeId} className="block text-sm font-medium">
              Cultivo (opcional)
            </label>
            <Select id={cropTypeId} name="cropTypeId" defaultValue="" className="mt-1">
              <option value="">Sin cultivo</option>
              {cropTypes.map((cropType) => (
                <option key={cropType.id} value={cropType.id}>
                  {cropType.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <label htmlFor={descriptionId} className="block text-sm font-medium">
            Descripción
          </label>
          <Textarea
            id={descriptionId}
            name="description"
            rows={3}
            placeholder="Descripción (máx. 500)"
            maxLength={500}
            aria-label="Descripción de la parcela"
            className="mt-1"
          />
        </div>
        <ImagePicker />
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
            {pending ? 'Guardando…' : 'Crear parcela'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

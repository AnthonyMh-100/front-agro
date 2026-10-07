'use client';

import { useActionState, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
import { IoAddOutline } from 'react-icons/io5';
import { createFarmAction } from '@/actions/farms/farms';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/button/button';
import { Card } from '@/components/card/card';
import { Input } from '@/components/input/input';
import { Textarea } from '@/components/textarea/textarea';
import { ImagePicker } from '@/components/image-picker/image-picker';

export function CreateFarmForm() {
  const router = useRouter();
  const nameId = useId();
  const descriptionId = useId();
  const errorId = useId();
  const [state, action, pending] = useActionState(createFarmAction, {
    ok: false,
    message: null,
  });

  useEffect(() => {
    if (state.ok) router.push(ROUTES.farms);
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
            aria-label="Descripción de la finca"
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
            {pending ? 'Guardando…' : 'Crear finca'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

'use client';

import { useActionState, useState } from 'react';
import { IoPencilOutline } from 'react-icons/io5';
import { updateTargetAction } from '@/actions/production-targets/production-targets';
import { Button } from '@/components/button/button';
import { Input } from '@/components/input/input';

export function TargetEditForm({ targetId, campaignId, targetWeight }: { targetId: number; campaignId: number; targetWeight: number | string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updateTargetAction, {
    ok: false,
    message: null,
  });

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} aria-label="Editar meta">
        <IoPencilOutline aria-hidden size={16} />
      </Button>
    );
  }

  return (
    <form action={action} className="mt-2 flex items-end gap-1">
      <input type="hidden" name="targetId" value={targetId} />
      <input type="hidden" name="campaignId" value={campaignId} />
      <Input
        name="targetWeight"
        type="number"
        step="0.01"
        min="0.01"
        required
        defaultValue={Number(targetWeight)}
        aria-label="Meta en kg"
        className="h-9 min-h-0"
      />
      <Button type="submit" size="sm" disabled={pending} aria-busy={pending}>
        {pending ? '…' : 'Guardar'}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
        Cancelar
      </Button>
      {state.message && (
        <p role="alert" className="text-sm text-red-700">
          {state.message}
        </p>
      )}
    </form>
  );
}

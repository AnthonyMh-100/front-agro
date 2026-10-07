'use client';

import { useActionState } from 'react';
import { IoTrashOutline } from 'react-icons/io5';
import { deleteTargetAction } from '@/actions/production-targets/production-targets';
import { Button } from '@/components/button/button';

export function TargetActions({ targetId, campaignId }: { targetId: number; campaignId: number }) {
  const [state, action, pending] = useActionState(deleteTargetAction, {
    ok: false,
    message: null,
  });

  return (
    <div>
      <form
        action={action}
        onSubmit={(e) => {
          if (!confirm('¿Eliminar esta meta?')) e.preventDefault();
        }}
      >
        <input type="hidden" name="targetId" value={targetId} />
        <input type="hidden" name="campaignId" value={campaignId} />
        <Button variant="ghost" size="sm" type="submit" disabled={pending} aria-label="Eliminar meta">
          <IoTrashOutline aria-hidden size={16} />
        </Button>
      </form>
      {state.message && (
        <p role="alert" className="mt-1 text-sm text-red-700">
          {state.message}
        </p>
      )}
    </div>
  );
}

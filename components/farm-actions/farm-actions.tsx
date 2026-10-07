'use client';

import { useActionState } from 'react';
import { IoArchiveOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';
import { activateFarmAction, deactivateFarmAction } from '@/actions/farms/farms';
import { Button } from '@/components/button/button';

export function FarmActions({ farmId, isActive }: { farmId: number; isActive: boolean }) {
  const [deactivateState, deactivateDispatch, deactivating] = useActionState(
    deactivateFarmAction,
    { ok: false, message: null },
  );
  const [activateState, activateDispatch, activating] = useActionState(activateFarmAction, {
    ok: false,
    message: null,
  });
  const message = deactivateState.message ?? activateState.message;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {isActive ? (
          <form
            action={deactivateDispatch}
            onSubmit={(e) => {
              if (!confirm('¿Desactivar esta finca?')) e.preventDefault();
            }}
          >
            <input type="hidden" name="farmId" value={farmId} />
            <Button variant="outline" size="sm" type="submit" disabled={deactivating}>
              <IoArchiveOutline aria-hidden size={16} />
              {deactivating ? '…' : 'Desactivar'}
            </Button>
          </form>
        ) : (
          <form action={activateDispatch}>
            <input type="hidden" name="farmId" value={farmId} />
            <Button variant="accent" size="sm" type="submit" disabled={activating}>
              <IoCheckmarkCircleOutline aria-hidden size={16} />
              {activating ? '…' : 'Activar'}
            </Button>
          </form>
        )}
      </div>
      {message && (
        <p role="alert" className="text-sm text-red-700">
          {message}
        </p>
      )}
    </div>
  );
}

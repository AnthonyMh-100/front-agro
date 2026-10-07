'use client';

import { useActionState } from 'react';
import { IoArchiveOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';
import { activateUserAction, deactivateUserAction } from '@/actions/users/users';
import { Button } from '@/components/button/button';

export function UserActions({ userId, isActive }: { userId: number; isActive: boolean }) {
  const [activateState, activateDispatch, activating] = useActionState(activateUserAction, {
    ok: false,
    message: null,
  });
  const [deactivateState, deactivateDispatch, deactivating] = useActionState(
    deactivateUserAction,
    { ok: false, message: null },
  );
  const message = activateState.message ?? deactivateState.message;

  return (
    <div className="flex flex-col gap-1">
      {isActive ? (
        <form
          action={deactivateDispatch}
          onSubmit={(e) => {
            if (!confirm('¿Desactivar este usuario?')) e.preventDefault();
          }}
        >
          <input type="hidden" name="userId" value={userId} />
          <Button variant="outline" size="sm" type="submit" disabled={deactivating}>
            <IoArchiveOutline aria-hidden size={16} />
            {deactivating ? '…' : 'Desactivar'}
          </Button>
        </form>
      ) : (
        <form action={activateDispatch}>
          <input type="hidden" name="userId" value={userId} />
          <Button variant="accent" size="sm" type="submit" disabled={activating}>
            <IoCheckmarkCircleOutline aria-hidden size={16} />
            {activating ? '…' : 'Activar'}
          </Button>
        </form>
      )}
      {message && (
        <p role="alert" className="text-sm text-red-700">
          {message}
        </p>
      )}
    </div>
  );
}

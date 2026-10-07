'use client';

import { useActionState } from 'react';
import { IoArchiveOutline } from 'react-icons/io5';
import { closeAssignmentAction } from '@/actions/assignments/assignments';
import { Button } from '@/components/button/button';

export function AssignmentClose({ assignmentId }: { assignmentId: number }) {
  const [state, action, pending] = useActionState(closeAssignmentAction, {
    ok: false,
    message: null,
  });

  return (
    <div>
      <form
        action={action}
        onSubmit={(e) => {
          if (!confirm('¿Cerrar esta asignación?')) e.preventDefault();
        }}
      >
        <input type="hidden" name="assignmentId" value={assignmentId} />
        <Button variant="outline" size="sm" type="submit" disabled={pending}>
          <IoArchiveOutline aria-hidden size={16} />
          {pending ? '…' : 'Cerrar'}
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

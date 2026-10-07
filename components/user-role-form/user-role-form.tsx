'use client';

import { useActionState } from 'react';
import { IoCheckmarkOutline } from 'react-icons/io5';
import { changeUserRoleAction } from '@/actions/users/users';
import type { UserRole } from '@/lib/types';
import { Button } from '@/components/button/button';
import { Select } from '@/components/select/select';

const ROLES: UserRole[] = ['SUPERVISOR', 'ADMINISTRATION', 'MANAGEMENT'];

export function UserRoleForm({ userId, role }: { userId: number; role: UserRole }) {
  const [state, action, pending] = useActionState(changeUserRoleAction, {
    ok: false,
    message: null,
  });

  return (
    <div>
      <form action={action} className="flex items-center gap-1">
        <input type="hidden" name="userId" value={userId} />
        <Select key={role} name="role" defaultValue={role} aria-label="Rol del usuario" className="h-9 min-h-0 flex-1 text-xs">
          {ROLES.map((candidate) => (
            <option key={candidate} value={candidate}>
              {candidate}
            </option>
          ))}
        </Select>
        <Button variant="outline" size="sm" type="submit" disabled={pending} aria-label="Guardar rol" title="Guardar rol">
          <IoCheckmarkOutline aria-hidden size={16} />
          Guardar
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

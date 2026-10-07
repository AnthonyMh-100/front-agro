import { IoCalendarOutline, IoLeafOutline, IoMapOutline } from 'react-icons/io5';
import { Card } from '@/components/card/card';
import { formatDayShort } from '@/lib/dates';
import type { Assignment } from '@/lib/types';
import { AssignmentClose } from '@/components/assignment-close/assignment-close';

export function AssignmentCard({ assignment, canClose }: { assignment: Assignment; canClose: boolean }) {
  const open = assignment.unassignedAt === null;
  const supervisor =
    assignment.assignedUser?.name ?? assignment.assignedUser?.username ?? `Usuario ${assignment.userId}`;
  const initials = supervisor.slice(0, 2).toUpperCase();

  return (
    <Card className="group p-0 transition-shadow hover:shadow-md hover:ring-1 hover:ring-ring">
      <div className="flex items-center gap-3 p-4 pb-3">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-[2px] bg-primary text-sm font-semibold text-primary-foreground"
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold tracking-tight">{supervisor}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <IoCalendarOutline aria-hidden size={14} className="shrink-0" />
            Desde {formatDayShort(assignment.assignedAt)}
          </p>
        </div>
        <span
          className={
            open
              ? 'shrink-0 rounded-[2px] bg-accent px-2 py-0.5 text-xs text-accent-foreground'
              : 'shrink-0 rounded-[2px] bg-surface px-2 py-0.5 text-xs text-muted-foreground'
          }
        >
          {open ? 'Abierta' : 'Cerrada'}
        </span>
      </div>
      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="flex items-center gap-1 rounded-[2px] bg-surface px-2 py-1">
            <IoMapOutline aria-hidden size={14} />
            {assignment.assignedPlot?.name ?? `Parcela ${assignment.plotId}`}
          </span>
          {assignment.assignedPlot?.farm?.name && (
            <span className="flex items-center gap-1 rounded-[2px] bg-surface px-2 py-1 text-muted-foreground">
              <IoLeafOutline aria-hidden size={14} />
              {assignment.assignedPlot.farm.name}
            </span>
          )}
        </div>
        {canClose && open && (
          <div className="mt-3 border-t border-border pt-3">
            <AssignmentClose assignmentId={assignment.id} />
          </div>
        )}
      </div>
    </Card>
  );
}

import Link from 'next/link';
import {
  IoAlertCircleOutline,
  IoArrowBackOutline,
  IoCalendarOutline,
  IoLeafOutline,
  IoMapOutline,
  IoScaleOutline,
} from 'react-icons/io5';
import { redirect } from 'next/navigation';
import { apiServer, requireUser } from '@/lib/auth-server';
import type {
  AssignmentsResponse,
  PlotsResponse,
  ProductionDay,
  WeighingCorrectionsResponse,
  WeighingsResponse,
} from '@/lib/types';
import { formatWeight } from '@/lib/utils';
import { formatDayLong, formatTime } from '@/lib/dates';
import { Card } from '@/components/card/card';
import { CreateWeighingForm } from '@/components/create-weighing-form/create-weighing-form';
import { ProductionDayEditForm } from '@/components/production-day-edit-form/production-day-edit-form';
import { WeighingCorrectionForm } from '@/components/weighing-correction-form/weighing-correction-form';

export default async function ProductionDayDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser('/production');
  const { id } = await params;
  const [day, plots, assignments] = await Promise.all([
    apiServer<ProductionDay>(`/production-days/${encodeURIComponent(id)}`),
    apiServer<PlotsResponse>('/plots?page=1&limit=50', { cache: 'force-cache' }),
    user.role === 'SUPERVISOR'
      ? apiServer<AssignmentsResponse>(`/assignments?userId=${user.id}`)
      : Promise.resolve(null),
  ]);
  const canWeigh = user.role === 'ADMINISTRATION' || user.role === 'SUPERVISOR';
  if (day && user.role === 'SUPERVISOR') {
    const mine = (assignments?.assignments ?? []).some(
      (assignment) => assignment.plotId === day.plotId && assignment.unassignedAt === null,
    );
    if (!mine) redirect('/production');
  }

  if (!day) {
    return (
      <div>
        <Link
          href="/production"
          className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 text-sm font-medium text-primary"
        >
          <IoArrowBackOutline aria-hidden size={16} />
          Volver a producción
        </Link>
        <Card className="mt-4">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <IoAlertCircleOutline aria-hidden size={18} />
            Día no encontrado o sin conexión.
          </p>
        </Card>
      </div>
    );
  }

  const plotName = plots?.plots.find((plot) => plot.id === day.plotId)?.name ?? `Parcela ${day.plotId}`;
  const weighings = await apiServer<WeighingsResponse>(
    `/weighings?productionDayId=${day.id}&page=1&limit=50`,
  );
  const entries = weighings?.weighings ?? [];
  const total = entries.reduce((sum, weighing) => sum + Number(weighing.weight), 0);
  const date = formatDayLong(day.date);
  const isAdmin = user.role === 'ADMINISTRATION';
  const correctionsByWeighingId = new Map<number, { originalValue: number | string; correctedValue: number | string; reason?: string | null }[]>();
  await Promise.all(
    entries.map(async (weighing) => {
      const corrections = await apiServer<WeighingCorrectionsResponse>(
        `/weighing-corrections?weighingId=${weighing.id}&page=1&limit=50`,
      );
      correctionsByWeighingId.set(weighing.id, corrections?.weighingCorrections ?? []);
    }),
  );

  return (
    <div>
      <Link
        href="/production"
        className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 text-sm font-medium text-primary"
      >
        <IoArrowBackOutline aria-hidden size={16} />
        Volver a producción
      </Link>
      <div className="mt-2 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-[2px] bg-primary text-primary-foreground">
              <IoMapOutline aria-hidden size={18} />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{plotName}</h1>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <IoCalendarOutline aria-hidden size={14} />
                {date}
              </p>
            </div>
          </div>
          {day.notes && <p className="mt-2 max-w-[65ch] text-sm text-muted-foreground">{day.notes}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 rounded-[2px] bg-accent px-2 py-1 text-sm text-accent-foreground">
              <IoScaleOutline aria-hidden size={16} />
              Total del día: {formatWeight(total)}
            </span>
            <span className="text-xs text-muted-foreground">{entries.length} pesajes</span>
            {canWeigh && <ProductionDayEditForm day={day} />}
          </div>
        </Card>
        <div>{canWeigh && <CreateWeighingForm productionDayId={day.id} />}</div>
      </div>

      <h2 className="mt-6 flex items-center gap-2 font-medium">
        <IoLeafOutline aria-hidden size={18} />
        Pesajes del día
      </h2>
      {entries.length === 0 ? (
        <Card className="mt-2">
          <p className="text-sm text-muted-foreground">Aún no hay pesajes registrados hoy.</p>
        </Card>
      ) : (
        <ul className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((weighing, index) => (
            <li key={weighing.id}>
              <Card>
                <p className="text-xs text-muted-foreground">Pesaje {index + 1}</p>
                <p className="text-xl font-semibold">{formatWeight(weighing.weight)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatTime(weighing.createdAt)}
                </p>
                {(correctionsByWeighingId.get(weighing.id) ?? []).map((correction, position) => (
                  <p key={position} className="mt-1 rounded-[2px] bg-surface px-2 py-1 text-xs text-muted-foreground">
                    Corregido de {formatWeight(correction.originalValue)} a{' '}
                    {formatWeight(correction.correctedValue)}
                    {correction.reason ? ` · ${correction.reason}` : ''}
                  </p>
                ))}
                {isAdmin && (
                  <WeighingCorrectionForm
                    weighingId={weighing.id}
                    productionDayId={day.id}
                    currentWeight={weighing.weight}
                  />
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

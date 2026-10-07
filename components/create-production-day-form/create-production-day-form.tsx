'use client';

import { useActionState, useId } from 'react';
import { IoAddOutline } from 'react-icons/io5';
import { createProductionDayAction } from '@/actions/production/production';
import type { Campaign, Plot } from '@/lib/types';
import { Button } from '@/components/button/button';
import { Card } from '@/components/card/card';
import { Input } from '@/components/input/input';
import { Select } from '@/components/select/select';
import { Textarea } from '@/components/textarea/textarea';
import { todayISO } from '@/lib/dates';

export function CreateProductionDayForm({
  plots,
  campaigns,
  defaultCampaignId,
  defaultPlotId,
  defaultDate,
}: {
  plots: Plot[];
  campaigns: Campaign[];
  defaultCampaignId?: number;
  defaultPlotId?: number;
  defaultDate?: string;
}) {
  const plotId = useId();
  const campaignId = useId();
  const dateId = useId();
  const notesId = useId();
  const errorId = useId();
  const [state, action, pending] = useActionState(createProductionDayAction, {
    ok: false,
    message: null,
  });

  return (
    <Card className="p-6">
      <form action={action} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={plotId} className="block text-sm font-medium">
              Parcela *
            </label>
            <Select id={plotId} name="plotId" required defaultValue={defaultPlotId ? String(defaultPlotId) : ''} className="mt-1">
              <option value="" disabled>
                Selecciona tu parcela
              </option>
              {plots.map((plot) => (
                <option key={plot.id} value={plot.id}>
                  {plot.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor={dateId} className="block text-sm font-medium">
              Fecha *
            </label>
            <Input id={dateId} name="date" type="date" required defaultValue={defaultDate ?? todayISO()} className="mt-1" />
          </div>
        </div>
        <div>
          <label htmlFor={campaignId} className="block text-sm font-medium">
            Campaña *
          </label>
          <Select
            id={campaignId}
            name="campaignId"
            required
            defaultValue={defaultCampaignId ? String(defaultCampaignId) : ''}
            className="mt-1"
          >
            <option value="" disabled>
              Selecciona la campaña
            </option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor={notesId} className="block text-sm font-medium">
            Notas
          </label>
          <Textarea
            id={notesId}
            name="notes"
            rows={2}
            placeholder="Notas del día (máx. 500)"
            maxLength={500}
            aria-label="Notas del día de producción"
            className="mt-1"
          />
        </div>
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
            {pending ? 'Guardando…' : 'Abrir día'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

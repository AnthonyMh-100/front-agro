'use client';

import { useActionState, useState } from 'react';
import { IoPencilOutline } from 'react-icons/io5';
import { updateCampaignAction } from '@/actions/campaigns/campaigns';
import type { Campaign } from '@/lib/types';
import { Button } from '@/components/button/button';
import { Card } from '@/components/card/card';
import { Input } from '@/components/input/input';

export function CampaignEditForm({ campaign }: { campaign: Campaign }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updateCampaignAction, {
    ok: false,
    message: null,
  });

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <IoPencilOutline aria-hidden size={16} />
        Editar
      </Button>
    );
  }

  return (
    <Card className="mt-4">
      <form action={action} className="flex flex-col gap-2">
        <input type="hidden" name="campaignId" value={campaign.id} />
        <Input
          name="name"
          defaultValue={campaign.name}
          aria-label="Nombre de la campaña"
          required
          minLength={3}
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Input
            name="startDate"
            type="date"
            defaultValue={campaign.startDate.slice(0, 10)}
            aria-label="Fecha de inicio"
            required
          />
          <Input
            name="endDate"
            type="date"
            defaultValue={campaign.endDate.slice(0, 10)}
            aria-label="Fecha de fin"
            required
          />
        </div>
        {state.message && (
          <p role="alert" className="text-sm text-red-700">
            {state.message}
          </p>
        )}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={pending} aria-busy={pending}>
            {pending ? 'Guardando…' : 'Guardar'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}

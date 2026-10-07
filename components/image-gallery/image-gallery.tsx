'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import { IoAddOutline, IoImageOutline, IoTrashOutline } from 'react-icons/io5';
import { deleteFarmImageAction, uploadFarmImagesAction } from '@/actions/farms/farms';
import { deletePlotImageAction, uploadPlotImagesAction } from '@/actions/plots/plots';
import { Button } from '@/components/button/button';
import { ImagePicker } from '@/components/image-picker/image-picker';

function DeleteImageButton({
  kind,
  entityId,
  imageUrl,
}: {
  kind: 'farms' | 'plots';
  entityId: number;
  imageUrl: string;
}) {
  const [state, action, pending] = useActionState(
    kind === 'farms' ? deleteFarmImageAction : deletePlotImageAction,
    { ok: false, message: null },
  );

  return (
    <div>
      <form
        action={action}
        onSubmit={(e) => {
          if (!confirm('¿Eliminar esta imagen?')) e.preventDefault();
        }}
      >
        <input type="hidden" name={kind === 'farms' ? 'farmId' : 'plotId'} value={entityId} />
        <input type="hidden" name="imageUrl" value={imageUrl} />
        <button
          type="submit"
          disabled={pending}
          aria-label={`Eliminar imagen ${imageUrl}`}
          className="absolute right-1 top-1 flex size-7 cursor-pointer items-center justify-center rounded-[2px] bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          <IoTrashOutline aria-hidden size={16} />
        </button>
      </form>
      {state.message && (
        <p role="alert" className="mt-1 text-xs text-red-700">
          {state.message}
        </p>
      )}
    </div>
  );
}

export function ImageGallery({
  kind,
  entityId,
  images,
  canManage,
}: {
  kind: 'farms' | 'plots';
  entityId: number;
  images: string[];
  canManage: boolean;
}) {
  const [state, action, pending] = useActionState(
    kind === 'farms' ? uploadFarmImagesAction : uploadPlotImagesAction,
    { ok: false, message: null },
  );

  return (
    <div className="mt-4">
      <h2 className="flex items-center gap-2 font-medium">
        <IoImageOutline aria-hidden size={18} />
        Imágenes ({images.length})
      </h2>
      {images.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">Sin imágenes registradas.</p>
      ) : (
        <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {images.map((url) => (
            <li key={url} className="relative overflow-hidden rounded-[2px] border border-border">
              <Image
                src={url}
                alt="Imagen del registro"
                width={300}
                height={96}
                className="h-24 w-full object-cover"
              />
              {canManage && <DeleteImageButton kind={kind} entityId={entityId} imageUrl={url} />}
            </li>
          ))}
        </ul>
      )}
      {canManage && (
        <form action={action} className="mt-3 rounded-[2px] border border-border p-3">
          <input type="hidden" name={kind === 'farms' ? 'farmId' : 'plotId'} value={entityId} />
          <ImagePicker />
          {state.message && (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {state.message}
            </p>
          )}
          <Button type="submit" size="sm" disabled={pending} aria-busy={pending} className="mt-2">
            <IoAddOutline aria-hidden size={16} />
            {pending ? 'Subiendo…' : 'Subir imágenes'}
          </Button>
        </form>
      )}
    </div>
  );
}

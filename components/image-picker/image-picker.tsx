'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { IoCloseOutline, IoCloudUploadOutline, IoImageOutline } from 'react-icons/io5';
import { ACCEPTED_IMAGE_EXTENSIONS, ACCEPTED_IMAGE_TYPES, MAX_IMAGE_FILES } from '@/lib/constants';

interface Preview {
  url: string;
  name: string;
}

export function ImagePicker({ name = 'images' }: { name?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<File[]>([]);
  const helpId = useId();
  const errorId = useId();
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const current = previews;
    return () => {
      current.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  function syncInput(files: File[]) {
    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(file));
    if (inputRef.current) inputRef.current.files = transfer.files;
  }

  function addFiles(selected: File[]) {
    setError(null);
    const valid = selected.filter((file) =>
      (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type),
    );
    if (valid.length !== selected.length) {
      setError('Solo se permiten imágenes PNG, JPG o WEBP.');
    }
    const merged = [...filesRef.current, ...valid].slice(0, MAX_IMAGE_FILES);
    filesRef.current = merged;
    syncInput(merged);
    setPreviews((current) => {
      current.forEach((preview) => URL.revokeObjectURL(preview.url));
      return merged.map((file) => ({ url: URL.createObjectURL(file), name: file.name }));
    });
    if (filesRef.current.length >= MAX_IMAGE_FILES && valid.length > 0) {
      setError(`Máximo ${MAX_IMAGE_FILES} imágenes.`);
    }
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(event.target.files ?? []));
  }

  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    addFiles(Array.from(event.dataTransfer.files ?? []));
  }

  function removeAt(index: number) {
    const next = filesRef.current.filter((_, position) => position !== index);
    filesRef.current = next;
    syncInput(next);
    setPreviews((current) => {
      const target = current[index];
      if (target) URL.revokeObjectURL(target.url);
      return current.filter((_, position) => position !== index);
    });
  }

  return (
    <div>
      <span className="flex items-center gap-1 text-sm font-medium">
        <IoImageOutline aria-hidden size={16} />
        Imágenes
        {previews.length > 0 && (
          <span className="rounded-[2px] bg-accent px-2 py-0.5 text-xs text-accent-foreground">
            {previews.length}/{MAX_IMAGE_FILES}
          </span>
        )}
      </span>
      <input
        ref={inputRef}
        id={`${helpId}-file`}
        type="file"
        name={name}
        multiple
        accept={ACCEPTED_IMAGE_EXTENSIONS}
        onChange={onChange}
        aria-label="Archivos de imagen de la finca"
        aria-describedby={`${helpId} ${error ? errorId : ''}`.trim()}
        className="sr-only"
      />
      <label
        htmlFor={`${helpId}-file`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        className="mt-1 flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-1 rounded-[2px] border border-dashed border-border bg-surface px-3 py-4 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground"
      >
        <IoCloudUploadOutline aria-hidden size={28} className="text-muted-foreground" />
        <span className="text-sm font-medium">Haz clic para seleccionar imágenes</span>
        <span className="text-xs text-muted-foreground">o arrastra los archivos aquí</span>
      </label>
      <p id={helpId} className="mt-1 text-xs text-muted-foreground">
        PNG, JPG o WEBP. Máximo {MAX_IMAGE_FILES} imágenes. La subida se habilitará con Cloudinary.
      </p>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
      {previews.length > 0 && (
        <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {previews.map((preview, index) => (
            <li
              key={`${preview.name}-${index}`}
              className="relative overflow-hidden rounded-[2px] border border-border"
            >
              <Image
                src={preview.url}
                alt={preview.name}
                width={160}
                height={96}
                unoptimized
                className="h-24 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`Quitar ${preview.name}`}
                className="absolute right-1 top-1 flex size-7 cursor-pointer items-center justify-center rounded-[2px] bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <IoCloseOutline aria-hidden size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

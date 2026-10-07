import { Card } from '@/components/card/card';

export default function LoadingAgro() {
  return (
    <div aria-busy="true" aria-label="Cargando contenido">
      <div className="h-7 w-48 animate-pulse rounded-[2px] bg-muted" />
      <p className="mt-1 h-4 w-64 animate-pulse rounded-[2px] bg-muted" />
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((position) => (
          <Card key={position}>
            <div className="h-4 w-3/4 animate-pulse rounded-[2px] bg-muted" />
            <div className="mt-2 h-4 w-1/2 animate-pulse rounded-[2px] bg-muted" />
            <div className="mt-3 h-10 w-28 animate-pulse rounded-[2px] bg-muted" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-xs bg-surface-muted" />
      <div className="mt-4 h-4 w-3/4 rounded bg-surface-muted" />
      <div className="mt-2 h-3 w-1/2 rounded bg-surface-muted" />
    </div>
  );
}

export function RowSkeleton() {
  return <div className="h-14 w-full animate-pulse rounded-xs bg-surface-muted" />;
}

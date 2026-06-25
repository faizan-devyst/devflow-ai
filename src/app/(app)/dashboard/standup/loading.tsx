import { Skeleton } from "@/components/ui/skeleton";

// Painted instantly on route entry (RSC transition) so navigation never lands on
// an empty frame before the client feed mounts.
export default function StandupLoading() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-4 py-2">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="flex gap-2 py-4">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="flex-1 space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

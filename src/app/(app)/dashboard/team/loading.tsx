import { Skeleton } from "@/components/ui/skeleton";

// Painted instantly on route entry so navigation never lands on an empty frame.
export default function TeamLoading() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-4 py-2">
        <div className="space-y-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="space-y-3 pt-6">
        <Skeleton className="h-4 w-20" />
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

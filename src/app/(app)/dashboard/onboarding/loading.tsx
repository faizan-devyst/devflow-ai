import { Skeleton } from "@/components/ui/skeleton";

// Painted instantly on route entry (RSC transition) so navigation never lands on
// an empty frame before the client repository list mounts.
export default function OnboardingLoading() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-4 py-2">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="flex-1 space-y-4 pt-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loading component for pipeline section
 * Matches the layout of PipelineSection
 */
export function PipelineSectionSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="space-y-4 pt-2">
        {/* Stage distribution bar skeleton */}
        <div>
          <Skeleton className="h-3 w-32 mb-2" />
          <Skeleton className="h-8 w-full rounded-md" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        {/* Two-column grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


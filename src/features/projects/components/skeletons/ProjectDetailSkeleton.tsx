import { Skeleton } from '@/components/ui/skeleton';

export function ProjectDetailSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="border-b bg-white px-6 py-4">
        <Skeleton className="h-32" />
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <Skeleton className="h-24" />
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  );
}


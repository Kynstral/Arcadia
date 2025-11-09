import { Skeleton } from "@/components/ui/skeleton";

export function CatalogGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} className="group">
          {/* Book Cover */}
          <div className="relative mb-3">
            <div className="aspect-2/3 relative overflow-hidden rounded-lg bg-muted">
              <Skeleton className="w-full h-full" />
            </div>
          </div>
          {/* Book Info */}
          <div className="space-y-1">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <div className="flex items-center justify-between pt-1">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CatalogListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} className="bg-card border rounded-lg p-4">
          <div className="flex gap-4">
            {/* Book Cover */}
            <div className="relative shrink-0">
              <div className="w-28 sm:w-36 aspect-2/3 relative overflow-hidden rounded-md bg-muted">
                <Skeleton className="w-full h-full" />
              </div>
            </div>
            {/* Book Info */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header with badges */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
              {/* Title and Author */}
              <div className="mb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              {/* Description */}
              <div className="flex-1 mb-3">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              {/* Price and Action */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-baseline gap-2">
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CatalogPageSkeleton({ viewMode = "grid" }: { viewMode?: "grid" | "list" }) {
  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 md:hidden" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 order-1">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="hidden md:flex gap-2 order-2">
          <Skeleton className="h-10 w-[160px]" />
          <Skeleton className="h-10 w-[160px]" />
          <Skeleton className="h-10 w-[160px]" />
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Grid/List Content */}
      {viewMode === "grid" ? <CatalogGridSkeleton /> : <CatalogListSkeleton />}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-8">
        <Skeleton className="h-9 w-20" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

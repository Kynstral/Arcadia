import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function BooksGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
      {Array.from({ length: 10 }).map((_, i) => (
        <Card key={i} className="h-[300px] relative overflow-hidden">
          <Skeleton className="h-full w-full" />
        </Card>
      ))}
    </div>
  );
}

export function BooksListSkeleton() {
  return (
    <div className="border rounded-lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-3 text-left">
                <Skeleton className="h-4 w-4" />
              </th>
              <th className="p-3 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
              <th className="p-3 text-left">
                <Skeleton className="h-4 w-24" />
              </th>
              <th className="p-3 text-left">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="p-3 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
              <th className="p-3 text-left">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="p-3 text-left">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="p-3 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} className="border-b">
                <td className="p-3">
                  <Skeleton className="h-4 w-4" />
                </td>
                <td className="p-3">
                  <Skeleton className="h-10 w-8 rounded" />
                </td>
                <td className="p-3">
                  <Skeleton className="h-4 w-full max-w-xs" />
                </td>
                <td className="p-3">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="p-3">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="p-3">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="p-3">
                  <Skeleton className="h-4 w-12" />
                </td>
                <td className="p-3 flex gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function BooksStatsSkeleton() {
  return (
    <div className="flex items-center justify-between text-sm">
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-10 w-[130px]" />
    </div>
  );
}

export function BooksPageSkeleton({ viewMode = "grid" }: { viewMode?: "grid" | "list" }) {
  return (
    <div className="container mx-auto p-2 sm:p-4 space-y-4">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <Skeleton className="h-8 w-48" />
        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="relative w-full">
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Stats Skeleton */}
      <BooksStatsSkeleton />

      {/* Filters Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>

      {/* View Mode Toggle Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Books List/Grid Skeleton */}
      {viewMode === "grid" ? <BooksGridSkeleton /> : <BooksListSkeleton />}

      {/* Pagination Skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-1">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}

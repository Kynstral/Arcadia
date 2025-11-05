import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookStatsProps {
  totalBooks: number;
  filteredCount: number;
  startIndex: number;
  endIndex: number;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
}

export function BookStats({
  totalBooks,
  filteredCount,
  startIndex,
  endIndex,
  itemsPerPage,
  onItemsPerPageChange,
}: BookStatsProps) {
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <div>
        {totalBooks === 0 ? (
          <span>No books in your library</span>
        ) : (
          <span>
            Showing {startIndex + 1}-{Math.min(endIndex, filteredCount)} of{" "}
            {filteredCount} {filteredCount === 1 ? "book" : "books"}
            {filteredCount !== totalBooks && (
              <span className="text-primary">
                {" "}
                (filtered from {totalBooks} total)
              </span>
            )}
          </span>
        )}
      </div>
      {filteredCount > 0 && (
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => onItemsPerPageChange(Number(value))}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="25">25 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
            <SelectItem value="100">100 per page</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

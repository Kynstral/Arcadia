import { Button } from "@/components/ui/button";
import { BookOpen, PlusCircle } from "lucide-react";

interface BookEmptyStateProps {
  hasBooks: boolean;
  onAddBook: () => void;
  onClearFilters: () => void;
}

export function BookEmptyState({
  hasBooks,
  onAddBook,
  onClearFilters,
}: BookEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-muted-foreground py-10">
      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
      {!hasBooks ? (
        <>
          <p className="mt-2 font-medium">No books in your library yet</p>
          <p className="text-sm mt-1">Get started by adding your first book</p>
          <Button onClick={onAddBook} className="mt-4" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Your First Book
          </Button>
        </>
      ) : (
        <>
          <p className="mt-2">No books match your filters</p>
          <Button variant="link" onClick={onClearFilters}>
            Clear all filters
          </Button>
        </>
      )}
    </div>
  );
}

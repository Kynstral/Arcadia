import { AlertCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader } from "@/components/ui/loader";

interface DuplicateBook {
  isbn: string;
  title: string;
  author: string;
  coverImage?: string;
}

interface DuplicateDetectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duplicates: DuplicateBook[];
  totalBooks: number;
  isChecking: boolean;
  onContinue: () => void;
  onSkip: () => void;
  onCancel: () => void;
}

export function DuplicateDetectionDialog({
  open,
  onOpenChange,
  duplicates,
  totalBooks,
  isChecking,
  onContinue,
  onSkip,
  onCancel,
}: DuplicateDetectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Duplicate Books Detected
          </DialogTitle>
          <DialogDescription>
            Found {duplicates.length} book{duplicates.length > 1 ? "s" : ""} with ISBN
            {duplicates.length > 1 ? "s" : ""} that already exist in your library.
          </DialogDescription>
        </DialogHeader>

        {isChecking ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <Loader size={48} variant="accent" className="mb-4" />
            <p className="text-sm text-muted-foreground">Checking for duplicates...</p>
          </div>
        ) : (
          <>
            <div className="py-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">Duplicate Books:</h4>
                <span className="text-xs text-muted-foreground">
                  {duplicates.length} of {totalBooks} books
                </span>
              </div>

              <ScrollArea className="h-[300px] rounded-md border p-4">
                <div className="space-y-3">
                  {duplicates.map((book, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      {/* Book Cover */}
                      <div className="shrink-0 w-12 h-16 rounded overflow-hidden bg-muted">
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Book Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{book.title}</p>
                        <p className="text-xs text-muted-foreground truncate">by {book.author}</p>
                        <p className="text-xs text-muted-foreground mt-1">ISBN: {book.isbn}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>What would you like to do?</strong>
                </p>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1 ml-4">
                  <li>
                    • <strong>Skip Duplicates:</strong> Import only new books
                  </li>
                  <li>
                    • <strong>Import All:</strong> Import everything (creates duplicates)
                  </li>
                  <li>
                    • <strong>Cancel:</strong> Stop the import process
                  </li>
                </ul>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
                Cancel Import
              </Button>
              <Button variant="secondary" onClick={onSkip} className="w-full sm:w-auto">
                Skip Duplicates ({duplicates.length})
              </Button>
              <Button onClick={onContinue} className="w-full sm:w-auto">
                Import All ({totalBooks})
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

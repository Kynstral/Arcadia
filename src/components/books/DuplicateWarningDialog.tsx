import { Book } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface DuplicateWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exactISBN: Book[];
  similarTitle: Book[];
  titleAndAuthor: Book[];
  onProceed: () => void;
}

export function DuplicateWarningDialog({
  open,
  onOpenChange,
  exactISBN,
  similarTitle,
  titleAndAuthor,
  onProceed,
}: DuplicateWarningDialogProps) {
  const navigate = useNavigate();

  const handleViewBook = (bookId: string) => {
    onOpenChange(false);
    navigate(`/book/${bookId}`);
  };

  const handleProceed = () => {
    onProceed();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Potential Duplicate Books Found</DialogTitle>
          <DialogDescription>
            We found books that might be duplicates. Please review them before
            proceeding.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Exact ISBN Matches */}
          {exactISBN.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="destructive">Exact ISBN Match</Badge>
                <span className="text-sm text-muted-foreground">
                  {exactISBN.length} book(s)
                </span>
              </div>
              <div className="space-y-2">
                {exactISBN.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-start gap-3 p-3 border rounded-lg bg-destructive/5"
                  >
                    {book.coverImage && (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {book.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {book.author}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ISBN: {book.isbn}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewBook(book.id)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar Title Matches */}
          {similarTitle.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Similar Title</Badge>
                <span className="text-sm text-muted-foreground">
                  {similarTitle.length} book(s)
                </span>
              </div>
              <div className="space-y-2">
                {similarTitle.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    {book.coverImage && (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {book.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {book.author}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ISBN: {book.isbn}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewBook(book.id)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Title + Author Matches */}
          {titleAndAuthor.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Title & Author Match</Badge>
                <span className="text-sm text-muted-foreground">
                  {titleAndAuthor.length} book(s)
                </span>
              </div>
              <div className="space-y-2">
                {titleAndAuthor.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    {book.coverImage && (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {book.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {book.author}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ISBN: {book.isbn}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewBook(book.id)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleProceed}>
            Add Anyway (Not a Duplicate)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

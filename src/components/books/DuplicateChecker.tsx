import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DuplicateBook {
  id: string;
  isbn: string;
  title: string;
  author: string;
  coverImage?: string;
  count: number;
  bookIds: string[];
}

interface DuplicateCheckerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DuplicateChecker({ open, onOpenChange }: DuplicateCheckerProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duplicates, setDuplicates] = useState<DuplicateBook[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedDuplicate, setSelectedDuplicate] = useState<DuplicateBook | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [bookDetails, setBookDetails] = useState<any[]>([]);
  const [confirmBulkDialogOpen, setConfirmBulkDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Auto-check when dialog opens
  useEffect(() => {
    if (open && !showResults && !isChecking) {
      checkForDuplicates();
    }
  }, [open]);

  const checkForDuplicates = async () => {
    if (!user) return;

    try {
      setIsChecking(true);
      setProgress(0);
      setShowResults(false);

      // Fetch all books for the user
      const { data: books, error } = await supabase
        .from("books")
        .select("id, isbn, title, author, cover_image")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("isbn");

      if (error) throw error;

      if (!books || books.length === 0) {
        toast({
          title: "No books found",
          description: "Your library is empty",
        });
        setIsChecking(false);
        return;
      }

      // Group by ISBN
      const isbnMap = new Map<string, Array<typeof books[0]>>();

      books.forEach((book, index) => {
        if (book.isbn) {
          const isbn = book.isbn.trim();
          if (!isbnMap.has(isbn)) {
            isbnMap.set(isbn, []);
          }
          isbnMap.get(isbn)!.push(book);
        }
        setProgress(Math.round(((index + 1) / books.length) * 100));
      });

      // Find duplicates (ISBNs with more than one book)
      const duplicateList: DuplicateBook[] = [];

      isbnMap.forEach((bookList, isbn) => {
        if (bookList.length > 1) {
          duplicateList.push({
            id: isbn,
            isbn,
            title: bookList[0].title,
            author: bookList[0].author,
            coverImage: bookList[0].cover_image || undefined,
            count: bookList.length,
            bookIds: bookList.map(b => b.id),
          });
        }
      });

      setDuplicates(duplicateList);
      setShowResults(true);

      toast({
        title: "Duplicate check complete",
        description: `Found ${duplicateList.length} duplicate ISBN(s) with ${duplicateList.reduce((sum, d) => sum + d.count, 0)} total books`,
      });
    } catch (error) {
      console.error("Error checking duplicates:", error);
      toast({
        variant: "destructive",
        title: "Error checking duplicates",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleViewDetails = async (duplicate: DuplicateBook) => {
    setSelectedDuplicate(duplicate);

    // Fetch full details for all copies
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .in("id", duplicate.bookIds)
      .is("deleted_at", null);

    if (!error && data) {
      setBookDetails(data);
    }

    setDetailDialogOpen(true);
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
      const { error } = await supabase
        .from("books")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", bookId);

      if (error) throw error;

      toast({
        description: "Book moved to trash",
      });

      // Invalidate queries to refresh the Books page
      queryClient.invalidateQueries({ queryKey: ["books"] });

      // Refresh the check
      await checkForDuplicates();
      setDetailDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting book",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const handleBulkRemoveDuplicates = async () => {
    if (!user || duplicates.length === 0) return;

    try {
      setIsBulkProcessing(true);
      setProgress(0);
      setConfirmBulkDialogOpen(false);

      let processedCount = 0;
      let removedCount = 0;
      const totalDuplicates = duplicates.length;

      // For each duplicate ISBN, keep the first book and remove the rest
      for (const duplicate of duplicates) {
        // Keep the first book ID, remove all others
        const booksToRemove = duplicate.bookIds.slice(1);

        if (booksToRemove.length > 0) {
          const { error } = await supabase
            .from("books")
            .update({ deleted_at: new Date().toISOString() })
            .in("id", booksToRemove);

          if (error) {
            console.error(`Error removing duplicates for ISBN ${duplicate.isbn}:`, error);
          } else {
            removedCount += booksToRemove.length;
          }
        }

        processedCount++;
        setProgress(Math.round((processedCount / totalDuplicates) * 100));
      }

      toast({
        title: "Bulk operation complete",
        description: `Removed ${removedCount} duplicate books. Kept one copy of each.`,
      });

      // Invalidate queries to refresh the Books page
      queryClient.invalidateQueries({ queryKey: ["books"] });

      // Refresh the check
      await checkForDuplicates();
    } catch (error) {
      console.error("Error in bulk remove:", error);
      toast({
        variant: "destructive",
        title: "Error removing duplicates",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsBulkProcessing(false);
      setProgress(0);
    }
  };

  return (
    <>
      {/* Main Duplicate Checker Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Duplicate Book Checker</DialogTitle>
            <DialogDescription>
              Scan your library for duplicate books based on ISBN
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 px-1">
            {!showResults && !isChecking && (
              <div className="flex items-center justify-center p-12 border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h4 className="text-lg font-medium mb-2">Scan Your Library</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Check for books with duplicate ISBNs
                  </p>
                  <Button onClick={checkForDuplicates} size="lg">
                    <Search className="h-4 w-4 mr-2" />
                    Start Duplicate Check
                  </Button>
                </div>
              </div>
            )}

            {isChecking && (
              <div className="space-y-3 p-6">
                <div className="flex items-center justify-center mb-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <p className="text-sm font-medium text-center">Scanning library...</p>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">{progress}% complete</p>
              </div>
            )}

            {showResults && (
              <div className="space-y-4">
                {duplicates.length === 0 ? (
                  <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <p className="text-base font-medium text-green-900 dark:text-green-100">
                      No duplicates found!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Your library is clean.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-5 w-5 text-amber-600" />
                          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                            Found {duplicates.length} duplicate ISBN(s) with{" "}
                            {duplicates.reduce((sum, d) => sum + d.count, 0)} total books
                          </p>
                        </div>
                        <Button
                          onClick={() => setConfirmBulkDialogOpen(true)}
                          variant="destructive"
                          size="sm"
                          disabled={isBulkProcessing}
                        >
                          {isBulkProcessing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Keep First Copy Only
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {isBulkProcessing && (
                      <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium">Removing duplicates...</p>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">{progress}% complete</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      {duplicates.map((duplicate) => (
                        <div
                          key={duplicate.id}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          {duplicate.coverImage && (
                            <img
                              src={duplicate.coverImage}
                              alt={duplicate.title}
                              className="h-20 w-14 object-cover rounded shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{duplicate.title}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              by {duplicate.author}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              ISBN: {duplicate.isbn}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                {duplicate.count}
                              </span>
                              <p className="text-xs text-muted-foreground">copies</p>
                            </div>
                            <Button
                              onClick={() => handleViewDetails(duplicate)}
                              variant="outline"
                              size="sm"
                            >
                              Manage
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            {showResults && duplicates.length > 0 && (
              <Button onClick={checkForDuplicates} variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Re-scan
              </Button>
            )}
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog for Managing Copies */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Duplicate Copies</DialogTitle>
            <DialogDescription>
              {selectedDuplicate?.count} copies found. Review and remove unwanted duplicates.
            </DialogDescription>
          </DialogHeader>

          {selectedDuplicate && (
            <div className="flex-1 overflow-y-auto space-y-4 px-1">
              <div className="p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-3">
                  {selectedDuplicate.coverImage && (
                    <img
                      src={selectedDuplicate.coverImage}
                      alt={selectedDuplicate.title}
                      className="h-20 w-14 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-lg">{selectedDuplicate.title}</p>
                    <p className="text-sm text-muted-foreground">by {selectedDuplicate.author}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ISBN: {selectedDuplicate.isbn}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-3">
                  Select copies to remove (keep at least one):
                </p>
                <div className="space-y-2">
                  {bookDetails.map((book, index) => (
                    <div
                      key={book.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">Copy #{index + 1}</span>
                          {book.status && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                              {book.status}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          {book.publisher && <p>Publisher: {book.publisher}</p>}
                          {book.publication_year && <p>Year: {book.publication_year}</p>}
                          {book.stock !== undefined && <p>Stock: {book.stock}</p>}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeleteBook(book.id)}
                        variant="destructive"
                        size="sm"
                        disabled={bookDetails.length === 1}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setDetailDialogOpen(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Confirmation Dialog */}
      <Dialog open={confirmBulkDialogOpen} onOpenChange={setConfirmBulkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Bulk Remove</DialogTitle>
            <DialogDescription>
              This will keep only the first copy of each duplicate book and remove all others.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                Action Summary:
              </p>
              <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                <li>• {duplicates.length} unique books will be kept</li>
                <li>
                  • {duplicates.reduce((sum, d) => sum + d.count - 1, 0)} duplicate copies will be
                  removed
                </li>
                <li>• Removed books will be moved to trash</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone easily. Make sure you want to proceed.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={() => setConfirmBulkDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleBulkRemoveDuplicates} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Duplicates
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import {
  getDeletedBooks,
  restoreBook,
  permanentlyDeleteBook,
  emptyTrash,
} from "@/lib/data-service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";

export default function TrashPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);
  const [showEmptyTrashDialog, setShowEmptyTrashDialog] = useState(false);
  const [showRestoreAllDialog, setShowRestoreAllDialog] = useState(false);
  const [restoringBookId, setRestoringBookId] = useState<string | null>(null);

  // Fetch deleted books
  const { data: deletedBooks = [], isLoading } = useQuery({
    queryKey: ["deletedBooks", user?.id],
    queryFn: () => getDeletedBooks(user?.id),
    enabled: !!user,
  });

  // Restore book mutation
  const restoreMutation = useMutation({
    mutationFn: (bookId: string) => restoreBook(bookId, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deletedBooks"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast({
        title: "Success",
        description: "Book restored successfully",
      });
      setRestoringBookId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to restore book: ${error.message}`,
        variant: "destructive",
      });
      setRestoringBookId(null);
    },
  });

  // Permanent delete mutation
  const deleteMutation = useMutation({
    mutationFn: (bookId: string) => permanentlyDeleteBook(bookId, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deletedBooks"] });
      toast({
        title: "Success",
        description: "Book permanently deleted",
      });
      setBookToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete book: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Empty trash mutation
  const emptyTrashMutation = useMutation({
    mutationFn: () => emptyTrash(user?.id),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["deletedBooks"] });
      toast({
        title: "Success",
        description: `${count} book(s) permanently deleted`,
      });
      setShowEmptyTrashDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to empty trash: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Restore all mutation
  const restoreAllMutation = useMutation({
    mutationFn: async () => {
      let successCount = 0;
      let failCount = 0;

      for (const book of deletedBooks) {
        try {
          await restoreBook(book.id, user?.id);
          successCount++;
        } catch (error) {
          failCount++;
          console.error(`Failed to restore book ${book.id}:`, error);
        }
      }

      return { successCount, failCount };
    },
    onSuccess: ({ successCount, failCount }) => {
      queryClient.invalidateQueries({ queryKey: ["deletedBooks"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });

      if (failCount > 0) {
        toast({
          title: "Partial Success",
          description: `${successCount} book(s) restored, ${failCount} failed`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `${successCount} book(s) restored successfully`,
        });
      }
      setShowRestoreAllDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to restore books: ${error.message}`,
        variant: "destructive",
      });
      setShowRestoreAllDialog(false);
    },
  });

  const handleRestore = (bookId: string) => {
    setRestoringBookId(bookId);
    restoreMutation.mutate(bookId);
  };

  const handlePermanentDelete = (bookId: string) => {
    setBookToDelete(bookId);
  };

  const confirmPermanentDelete = () => {
    if (bookToDelete) {
      deleteMutation.mutate(bookToDelete);
    }
  };

  const handleEmptyTrash = () => {
    setShowEmptyTrashDialog(true);
  };

  const confirmEmptyTrash = () => {
    emptyTrashMutation.mutate();
  };

  const handleRestoreAll = () => {
    setShowRestoreAllDialog(true);
  };

  const confirmRestoreAll = () => {
    restoreAllMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size={48} variant="accent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">Trash ({deletedBooks.length})</h1>
          <p className="text-secondary-text mt-1">
            Deleted books are kept for 30 days before permanent deletion
          </p>
        </div>
        {deletedBooks.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleRestoreAll}
              disabled={restoreAllMutation.isPending}
            >
              {restoreAllMutation.isPending ? (
                <>
                  <Loader size={16} className="mr-2" />
                  Restoring...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore All
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={handleEmptyTrash}
              disabled={emptyTrashMutation.isPending}
            >
              {emptyTrashMutation.isPending ? (
                <>
                  <Loader size={16} variant="white" className="mr-2" />
                  Emptying...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Empty Trash
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Warning Banner */}
      {deletedBooks.length > 0 && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-primary-text">
              Items are automatically deleted after 30 days
            </p>
            <p className="text-sm text-secondary-text mt-1">
              Restore books before they are permanently removed from the system.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {deletedBooks.length === 0 ? (
        <Card className="p-12 text-center">
          <Trash2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-primary-text mb-2">Trash is empty</h2>
          <p className="text-secondary-text">
            Deleted books will appear here and can be restored within 30 days.
          </p>
        </Card>
      ) : (
        /* Books Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {deletedBooks.map((book) => {
            const deletedDate = book.deleted_at ? new Date(book.deleted_at) : null;
            const daysRemaining = deletedDate
              ? Math.max(
                  0,
                  30 - Math.floor((Date.now() - deletedDate.getTime()) / (1000 * 60 * 60 * 24))
                )
              : 30;

            return (
              <Card
                key={book.id}
                className="h-[280px] relative group overflow-hidden transition-all"
              >
                <div className="h-full w-full relative overflow-hidden rounded-lg">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center">
                      <span className="text-xl font-bold text-muted-foreground">
                        {book.title.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Days remaining badge - top right */}
                  <div className="absolute top-2 right-2 bg-destructive text-white px-2 py-1 rounded text-xs font-semibold shadow-lg z-10">
                    {daysRemaining}d left
                  </div>

                  {/* Overlay with info - bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-card/80 backdrop-blur-sm border-t p-3 transition-all duration-300 ease-in-out group-hover:bg-card/95">
                    <h3 className="font-semibold text-sm line-clamp-1 text-foreground mb-0.5">
                      {book.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{book.author}</p>

                    {deletedDate && (
                      <p className="text-[10px] text-muted-foreground mb-2">
                        {formatDistanceToNow(deletedDate, { addSuffix: true })}
                      </p>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-1.5 mt-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 h-7 text-xs"
                        onClick={() => handleRestore(book.id)}
                        disabled={restoreMutation.isPending && restoringBookId === book.id}
                      >
                        {restoreMutation.isPending && restoringBookId === book.id ? (
                          <>
                            <Loader size={12} className="mr-1" />
                            Restoring...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Restore
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handlePermanentDelete(book.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Permanent Delete Confirmation Dialog */}
      <Dialog open={!!bookToDelete} onOpenChange={(open) => !open && setBookToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently Delete Book?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the book from the database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBookToDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmPermanentDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader size={16} variant="white" className="mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Forever"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Empty Trash Confirmation Dialog */}
      <Dialog open={showEmptyTrashDialog} onOpenChange={setShowEmptyTrashDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Empty Trash?</DialogTitle>
            <DialogDescription>
              This will permanently delete all {deletedBooks.length} book(s) in the trash. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEmptyTrashDialog(false)}
              disabled={emptyTrashMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmEmptyTrash}
              disabled={emptyTrashMutation.isPending}
            >
              {emptyTrashMutation.isPending ? (
                <>
                  <Loader size={16} variant="white" className="mr-2" />
                  Emptying...
                </>
              ) : (
                "Empty Trash"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore All Confirmation Dialog */}
      <Dialog open={showRestoreAllDialog} onOpenChange={setShowRestoreAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore All Books?</DialogTitle>
            <DialogDescription>
              This will restore all {deletedBooks.length} book(s) from the trash back to your
              library.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRestoreAllDialog(false)}
              disabled={restoreAllMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={confirmRestoreAll} disabled={restoreAllMutation.isPending}>
              {restoreAllMutation.isPending ? (
                <>
                  <Loader size={16} variant="white" className="mr-2" />
                  Restoring...
                </>
              ) : (
                "Restore All"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

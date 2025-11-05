import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BookForm from "@/components/BookForm";
import { Book } from "@/lib/types";

interface AddBookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book | null;
  userRole: string | null;
  onSuccess: () => void;
}

export function AddBookModal({
  open,
  onOpenChange,
  book,
  userRole,
  onSuccess,
}: AddBookModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{book ? "Edit Book" : "Add New Book"}</DialogTitle>
        </DialogHeader>
        <BookForm
          book={book}
          onSuccess={onSuccess}
          onCancel={() => onOpenChange(false)}
          userRole={userRole}
        />
      </DialogContent>
    </Dialog>
  );
}

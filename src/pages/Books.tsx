import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Book, BookCategory, BookStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useDebounce } from "@/hooks/use-debounce";
import {
  ChevronDown,
  ChevronUp,
  CircleArrowDown,
  CircleArrowUp,
  Database,
  Eye,
  FileEdit,
  PlusCircle,
  Printer,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Import } from "@/components/books/Import";
import { Export } from "@/components/books/Export";
import { PrintLabels } from "@/components/books/PrintLabels";
import { deleteBook, bulkUpdateBooks } from "@/lib/data-service";
import { BookPagination, BookStats, BookEmptyState, BookFilters } from "@/components/books";
import { BulkEditModal, BulkEditData } from "@/components/books/BulkEditModal";
import { BookCard } from "@/components/books/BookCard";
import { AddBookModal } from "@/components/books/AddBookModal";
import { InlineEditCell } from "@/components/books/InlineEditCell";
import { Loader } from "@/components/ui/loader";

const bookCategories: BookCategory[] = [
  "Action & Adventure",
  "Animals",
  "Anthropology",
  "Art",
  "Biography",
  "Business",
  "Children's Books",
  "Classics",
  "Comics",
  "Contemporary",
  "Cooking",
  "Crafts & Hobbies",
  "Crime",
  "Drama",
  "Dystopian",
  "Economics",
  "Education",
  "Erotica",
  "Essays",
  "Family & Relationships",
  "Fantasy",
  "Fashion",
  "Fiction",
  "Food & Drink",
  "Foreign Languages",
  "Games & Activities",
  "Graphic Novels",
  "Health",
  "Historical Fiction",
  "History",
  "Horror",
  "Humor",
  "Illustrated",
  "Literary Criticism",
  "Literature",
  "Manga",
  "Mathematics",
  "Memoir",
  "Music",
  "Mystery",
  "Mythology",
  "Nature",
  "Non-Fiction",
  "Paranormal",
  "Parenting & Families",
  "Philosophy",
  "Poetry",
  "Politics",
  "Psychology",
  "Religion",
  "Romance",
  "Science",
  "Science Fiction",
  "Self-Help",
  "Short Stories",
  "Social Sciences",
  "Sports & Recreation",
  "Suspense",
  "Technology",
  "Thriller",
  "Travel",
  "True Crime",
  "Young Adult",
];

const bookStatuses: BookStatus[] = [
  "Available",
  "Checked Out",
  "On Hold",
  "Processing",
  "Lost",
  "Out of Stock",
];

export default function BooksPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userId, userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState({ column: "title", direction: "asc" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [importExportDialogOpen, setImportExportDialogOpen] = useState(false);
  const [bookFormDialogOpen, setBookFormDialogOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [publisherFilter, setPublisherFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("book-search")?.focus();
      }
      // N: Add new book
      if (e.key === "n" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          setBookFormDialogOpen(true);
          setBookToEdit(null);
        }
      }
      // Escape: Close dialogs
      if (e.key === "Escape") {
        setBookFormDialogOpen(false);
        setDeleteDialogOpen(false);
        setImportExportDialogOpen(false);
        setBulkEditDialogOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const { data: books = [], isLoading } = useQuery({
    queryKey: ["books", userId, sorting],
    queryFn: async () => {
      if (!userId) {
        return [];
      }

      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order(sorting.column, { ascending: sorting.direction === "asc" });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching books",
          description: error.message,
        });
        throw error;
      }

      return data.map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        publisher: book.publisher,
        publicationYear: book.publication_year,
        description: book.description,
        pageCount: book.page_count,
        category: book.category as BookCategory,
        coverImage: book.cover_image || "",
        language: book.language,
        price: book.price,
        stock: book.stock,
        status: book.status as BookStatus,
        rating: book.rating,
        tags: book.tags,
        location: book.location,
        created_at: book.created_at,
        updated_at: book.updated_at,
        user_id: book.user_id,
      })) as Book[];
    },
    enabled: !!userId,
  });

  const uniquePublishers = useMemo(() => {
    return Array.from(new Set(books.map((book) => book.publisher)));
  }, [books]);

  const uniqueYears = useMemo(() => {
    return Array.from(new Set(books.map((book) => book.publicationYear))).sort((a, b) => b - a);
  }, [books]);

  const deleteMutation = useMutation({
    mutationFn: async (bookId: string) => {
      return await deleteBook(bookId, userId);
    },
    onSuccess: (deletedBookId: string) => {
      queryClient.setQueryData(["books", userId, sorting], (old: Book[] | undefined) =>
        old ? old.filter((book) => book.id !== deletedBookId) : []
      );

      toast({
        title: "Book deleted",
        description: "The book has been successfully deleted",
      });

      setDeleteDialogOpen(false);
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

      toast({
        variant: "destructive",
        title: "Error deleting book",
        description: errorMessage,
      });
    },
  });

  const bulkEditMutation = useMutation({
    mutationFn: async (updates: BulkEditData) => {
      return await bulkUpdateBooks(selectedBooks, updates, userId);
    },
    onSuccess: async (result) => {
      // Invalidate all book-related queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["books"] });

      // Force refetch to ensure stats are updated
      await queryClient.refetchQueries({ queryKey: ["books", userId, sorting] });

      if (result.failed > 0) {
        toast({
          title: "Partial Success",
          description: `${result.success} book(s) updated, ${result.failed} failed`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `${result.success} book(s) updated successfully`,
        });
      }

      setBulkEditDialogOpen(false);
      setSelectedBooks([]);
      setSelectionMode(false);
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

      toast({
        variant: "destructive",
        title: "Error updating books",
        description: errorMessage,
      });
    },
  });

  const handleInlineEdit = async (bookId: string, field: string, value: any) => {
    try {
      const { error } = await supabase
        .from("books")
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq("id", bookId)
        .eq("user_id", userId || "");

      if (error) throw error;

      // Update local cache
      queryClient.setQueryData(["books", userId, sorting], (old: Book[] | undefined) =>
        old ? old.map((book) => (book.id === bookId ? { ...book, [field]: value } : book)) : []
      );

      toast({
        title: "Updated",
        description: "Book updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update book",
      });
      throw error;
    }
  };

  const handleDelete = (book: Book) => {
    setBookToDelete(book);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (bookToDelete) {
      if (bookToDelete.id === "bulk") {
        selectedBooks.forEach((bookId) => {
          deleteMutation.mutate(bookId);
        });
        setSelectedBooks([]);
        setSelectionMode(false);
      } else {
        deleteMutation.mutate(bookToDelete.id);
      }
    }
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedBooks([]);
  };

  const toggleBookSelection = (bookId: string) => {
    setSelectedBooks((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const selectAllBooks = () => {
    if (selectedBooks.length === paginatedBooks.length) {
      setSelectedBooks([]);
    } else {
      setSelectedBooks(paginatedBooks.map((book) => book.id));
    }
  };

  const handleBulkDelete = () => {
    setDeleteDialogOpen(true);
    setBookToDelete({
      id: "bulk",
      title: `${selectedBooks.length} selected books`,
    } as Book);
  };

  const handleBulkExport = () => {
    setImportExportDialogOpen(true);
  };

  const handleSort = (column: string) => {
    setSorting((prev) => ({
      column,
      direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (column: string) => {
    if (sorting.column !== column) return null;
    return sorting.direction === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setPublisherFilter("all");
    setYearFilter("all");
    setStatusFilter("all");
    resetPagination();
  };

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        !debouncedSearchQuery ||
        book.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        book.isbn.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        (book.description &&
          book.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === "all" || book.category === categoryFilter;
      const matchesPublisher = publisherFilter === "all" || book.publisher === publisherFilter;
      const matchesYear = yearFilter === "all" || book.publicationYear.toString() === yearFilter;
      const matchesStatus = statusFilter === "all" || book.status === statusFilter;

      return matchesSearch && matchesCategory && matchesPublisher && matchesYear && matchesStatus;
    });
  }, [books, debouncedSearchQuery, categoryFilter, publisherFilter, yearFilter, statusFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const resetPagination = () => {
    setCurrentPage(1);
  };

  const handleBookFormSuccess = () => {
    setBookFormDialogOpen(false);
    setBookToEdit(null);
    queryClient.invalidateQueries({ queryKey: ["books", userId] });
    toast({
      title: "Success",
      description: "Book has been saved successfully",
    });
  };

  const handleEdit = (book: Book) => {
    setBookToEdit(book);
    setBookFormDialogOpen(true);
  };

  const handleAddNew = () => {
    setBookToEdit(null);
    setBookFormDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size={48} variant="accent" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p>Please sign in to view your books.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 sm:p-4 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <h1 className="text-2xl font-bold">Manage Books</h1>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
          <Button
            variant={selectionMode ? "default" : "outline"}
            onClick={toggleSelectionMode}
            size="sm"
            className="whitespace-nowrap"
          >
            {selectionMode ? "Cancel" : "Select"}
          </Button>

          {selectionMode && (
            <Button
              variant="secondary"
              onClick={selectAllBooks}
              size="sm"
              className="whitespace-nowrap"
            >
              {selectedBooks.length === paginatedBooks.length && paginatedBooks.length > 0
                ? "Deselect All"
                : "Select All"}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => setImportExportDialogOpen(true)}
            size="sm"
            className="whitespace-nowrap"
          >
            <Database className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Import/Export</span>
            <span className="sm:hidden">I/E</span>
          </Button>

          <Button onClick={handleAddNew} size="sm" className="whitespace-nowrap">
            <PlusCircle className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add Book</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="book-search"
          placeholder="Search by title, author, ISBN, or description... (Ctrl+K)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <BookStats
        totalBooks={books.length}
        filteredCount={filteredBooks.length}
        startIndex={startIndex}
        endIndex={endIndex}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(value) => {
          setItemsPerPage(value);
          resetPagination();
        }}
      />

      <BookFilters
        categoryFilter={categoryFilter}
        publisherFilter={publisherFilter}
        yearFilter={yearFilter}
        statusFilter={statusFilter}
        viewMode={viewMode}
        categories={bookCategories}
        publishers={uniquePublishers}
        years={uniqueYears}
        statuses={bookStatuses}
        onCategoryChange={(value) => {
          setCategoryFilter(value);
          resetPagination();
        }}
        onPublisherChange={(value) => {
          setPublisherFilter(value);
          resetPagination();
        }}
        onYearChange={(value) => {
          setYearFilter(value);
          resetPagination();
        }}
        onStatusChange={(value) => {
          setStatusFilter(value);
          resetPagination();
        }}
        onViewModeChange={setViewMode}
        onClearFilters={clearFilters}
        hasActiveFilters={
          searchQuery !== "" ||
          categoryFilter !== "all" ||
          publisherFilter !== "all" ||
          yearFilter !== "all" ||
          statusFilter !== "all"
        }
      />

      {selectionMode && selectedBooks.length > 0 && (
        <div className="flex items-center gap-2 mt-2 p-2 bg-muted rounded-md">
          <span className="text-sm font-medium">{selectedBooks.length} items selected</span>
          <div className="flex-1"></div>
          <Button variant="secondary" size="sm" onClick={() => setBulkEditDialogOpen(true)}>
            <FileEdit className="h-4 w-4 mr-1" /> Bulk Edit
          </Button>
          <button
            onClick={handleBulkExport}
            className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium bg-black text-white s rounded-md shadow-xs hover:bg-black/40 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            <CircleArrowUp className="h-4 w-4 mr-1.5" />
            Export Selected
          </button>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete Selected
          </Button>
        </div>
      )}

      {viewMode === "list" ? (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {selectionMode && (
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        selectedBooks.length === paginatedBooks.length && paginatedBooks.length > 0
                      }
                      onCheckedChange={selectAllBooks}
                    />
                  </TableHead>
                )}
                <TableHead className="w-10">Cover</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("title")}>
                  Title
                </TableHead>
                <TableHead
                  className="cursor-pointer hidden md:table-cell"
                  onClick={() => handleSort("author")}
                >
                  Author {getSortIcon("author")}
                </TableHead>
                <TableHead className="hidden lg:table-cell">ISBN</TableHead>
                <TableHead
                  className="cursor-pointer hidden md:table-cell"
                  onClick={() => handleSort("category")}
                >
                  Category {getSortIcon("category")}
                </TableHead>
                {userRole !== "library" && (
                  <TableHead className="cursor-pointer" onClick={() => handleSort("price")}>
                    Price {getSortIcon("price")}
                  </TableHead>
                )}
                <TableHead className="cursor-pointer" onClick={() => handleSort("stock")}>
                  Stock {getSortIcon("stock")}
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBooks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      selectionMode
                        ? userRole === "library"
                          ? 8
                          : 9
                        : userRole === "library"
                          ? 7
                          : 8
                    }
                    className="text-center py-10"
                  >
                    <BookEmptyState
                      hasBooks={books.length > 0}
                      onAddBook={() => setBookFormDialogOpen(true)}
                      onClearFilters={clearFilters}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBooks.map((book) => (
                  <TableRow key={book.id}>
                    {selectionMode && (
                      <TableCell>
                        <Checkbox
                          checked={selectedBooks.includes(book.id)}
                          onCheckedChange={() => toggleBookSelection(book.id)}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="h-12 w-9 overflow-hidden rounded-sm">
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-500">
                              {book.title.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{book.title}</div>
                      <div className="text-sm text-muted-foreground md:hidden">{book.author}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{book.author}</TableCell>
                    <TableCell className="hidden lg:table-cell">{book.isbn}</TableCell>
                    <TableCell className="hidden md:table-cell">{book.category}</TableCell>
                    {userRole !== "library" && (
                      <TableCell>
                        <InlineEditCell
                          value={book.price}
                          bookId={book.id}
                          field="price"
                          type="number"
                          onSave={handleInlineEdit}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <InlineEditCell
                        value={book.stock}
                        bookId={book.id}
                        field="stock"
                        type="number"
                        onSave={handleInlineEdit}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/book/${book.id}`)}
                          aria-label={`View ${book.title}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(book)}
                          aria-label={`Edit ${book.title}`}
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(book)}
                          className="text-red-500"
                          aria-label={`Delete ${book.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
          {paginatedBooks.length === 0 ? (
            <div className="col-span-full text-center py-10">
              <BookEmptyState
                hasBooks={books.length > 0}
                onAddBook={handleAddNew}
                onClearFilters={clearFilters}
              />
            </div>
          ) : (
            paginatedBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                selectionMode={selectionMode}
                isSelected={selectedBooks.includes(book.id)}
                userRole={userRole}
                onToggleSelection={toggleBookSelection}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}

      {filteredBooks.length > 0 && (
        <BookPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              {bookToDelete?.id === "bulk"
                ? `${selectedBooks.length} selected books`
                : `"${bookToDelete?.title}"`}
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader size={16} variant="white" className="mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importExportDialogOpen} onOpenChange={setImportExportDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Import/Export Books</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="import" className="mt-2">
            <TabsList className="mb-4 grid w-full grid-cols-3">
              <TabsTrigger value="import">
                <CircleArrowDown className="mr-2 h-4 w-4" /> Import
              </TabsTrigger>
              <TabsTrigger value="export">
                <CircleArrowUp className="mr-2 h-4 w-4" /> Export
              </TabsTrigger>
              <TabsTrigger value="print">
                <Printer className="mr-2 h-4 w-4" /> Print Labels
              </TabsTrigger>
            </TabsList>
            <TabsContent value="import">
              <Import />
            </TabsContent>
            <TabsContent value="export">
              <Export selectedBooks={selectionMode ? selectedBooks : undefined} />
            </TabsContent>
            <TabsContent value="print">
              <PrintLabels selectedBooks={selectionMode ? selectedBooks : undefined} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AddBookModal
        open={bookFormDialogOpen}
        onOpenChange={setBookFormDialogOpen}
        book={bookToEdit}
        userRole={userRole}
        onSuccess={handleBookFormSuccess}
      />

      <BulkEditModal
        open={bulkEditDialogOpen}
        onOpenChange={setBulkEditDialogOpen}
        selectedCount={selectedBooks.length}
        onSubmit={(updates) => bulkEditMutation.mutate(updates)}
        isLoading={bulkEditMutation.isPending}
      />
    </div>
  );
}

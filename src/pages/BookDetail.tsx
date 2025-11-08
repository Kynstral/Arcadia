import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  BookText,
  Building,
  Calendar,
  Heart,
  Languages,
  Library,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Tag,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Book, BookCategory, BookStatus, Member, TransactionStatus } from "@/lib/types";
import { useAuth } from "@/components/AuthStatusProvider";
import { useCart } from "@/hooks/use-cart";
import { Loader } from "@/components/ui/loader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssignBookDialog } from "@/components/dialogs/AssignBookDialog";
import { Check } from "lucide-react";

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const { userRole, userId, user } = useAuth();
  const { addToCart, cart } = useCart();
  const queryClient = useQueryClient();

  const isLibraryRole = userRole === "Library";
  const isBookStore = userRole === "Book Store";
  const borrowText = isBookStore ? "Rent" : "Borrow";
  const borrowedText = isBookStore ? "Rented" : "Borrowed";
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch book details
  const {
    data: book,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["book", id],
    queryFn: async () => {
      if (!id) throw new Error("No book ID provided");

      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        author: data.author,
        isbn: data.isbn,
        category: data.category as BookCategory,
        publicationYear: data.publication_year,
        publisher: data.publisher,
        description: data.description || "",
        price: data.price,
        status: data.status as BookStatus,
        coverImage: data.cover_image || "",
        stock: data.stock,
        location: data.location || "",
        rating: data.rating,
        pageCount: data.page_count,
        language: data.language || "English",
        tags: data.tags || [],
        salesCount: data.sales_count || 0,
        user_id: data.user_id,
      } as Book;
    },
    enabled: !!id,
  });

  // Fetch members for assignment
  const { data: members = [] } = useQuery({
    queryKey: ["members", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "Active")
        .order("name");

      if (error) throw error;
      return data as Member[];
    },
    enabled: !!userId && isLibraryRole,
  });

  // Fetch related books
  const { data: relatedBooks = [] } = useQuery({
    queryKey: ["related-books", book?.category, id],
    queryFn: async () => {
      if (!book) return [];

      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("category", book.category)
        .is("deleted_at", null)
        .neq("id", id)
        .limit(4);

      if (error) throw error;

      return data.map((item) => ({
        id: item.id,
        title: item.title,
        author: item.author,
        isbn: item.isbn,
        category: item.category as BookCategory,
        publicationYear: item.publication_year,
        publisher: item.publisher,
        description: item.description || "",
        price: item.price,
        status: item.status as BookStatus,
        coverImage: item.cover_image || "",
        stock: item.stock,
        location: item.location || "",
        rating: item.rating,
        pageCount: item.page_count,
        language: item.language || "English",
        tags: item.tags || [],
        salesCount: item.sales_count || 0,
        user_id: item.user_id,
      })) as Book[];
    },
    enabled: !!book,
  });

  // Mutation for assigning book to member - MUST be before any returns
  const assignBookMutation = useMutation({
    mutationFn: async (params: { memberId: string; type: "borrow" | "purchase"; durationDays?: number }) => {
      if (!book) throw new Error("No book selected");

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (params.durationDays || 14));

      if (params.type === "borrow") {
        // Create borrowing record
        const { error: borrowError } = await supabase.from("borrowings").insert([
          {
            book_id: book.id,
            member_id: params.memberId,
            due_date: dueDate.toISOString(),
            status: "Borrowed",
            checkout_date: new Date().toISOString(),
            user_id: user?.id,
          },
        ]);

        if (borrowError) throw borrowError;

        // Create transaction
        const { data: transactionData, error: checkoutError } = await supabase
          .from("checkout_transactions")
          .insert([
            {
              customer_id: params.memberId,
              status: "Completed" as TransactionStatus,
              payment_method: isBookStore ? "Rent" : "Borrow",
              total_amount: 0,
              date: new Date().toISOString(),
              user_id: user?.id,
            },
          ])
          .select()
          .single();

        if (checkoutError) throw checkoutError;

        // Create checkout item
        const { error: itemError } = await supabase.from("checkout_items").insert([
          {
            transaction_id: transactionData.id,
            book_id: book.id,
            title: book.title,
            quantity: 1,
            price: 0,
          },
        ]);

        if (itemError) throw itemError;
      } else {
        // Create purchase transaction
        const { data: transactionData, error: checkoutError } = await supabase
          .from("checkout_transactions")
          .insert([
            {
              customer_id: params.memberId,
              status: "Completed" as TransactionStatus,
              payment_method: "Cash",
              total_amount: book.price,
              date: new Date().toISOString(),
              user_id: user?.id,
            },
          ])
          .select()
          .single();

        if (checkoutError) throw checkoutError;

        // Create checkout item
        const { error: itemError } = await supabase.from("checkout_items").insert([
          {
            transaction_id: transactionData.id,
            book_id: book.id,
            title: book.title,
            quantity: 1,
            price: book.price,
          },
        ]);

        if (itemError) throw itemError;
      }

      // Update book stock
      const newStock = book.stock - 1;
      const newStatus = newStock > 0 ? "Available" : "Checked Out";

      const { error: updateError } = await supabase
        .from("books")
        .update({
          stock: newStock,
          status: newStatus,
        })
        .eq("id", book.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book", id] });
      queryClient.invalidateQueries({ queryKey: ["members", userId] });

      toast({
        description: (
          <div className="flex items-center font-medium">
            <Check className="mr-2 h-4 w-4 text-green-500" />
            Book assigned successfully
          </div>
        ),
        className: "text-green-600",
      });

      setAssignDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to assign book",
        description: error.message,
      });
    },
  });

  // Loading and error states - AFTER all hooks
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <Loader size={48} variant="accent" className="mb-4" />
        <p className="text-muted-foreground font-medium">Loading book details...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <div className="text-center max-w-md">
          <BookOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Book not found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find the book you're looking for. It may have been removed or the link might
            be incorrect.
          </p>
          <Button onClick={() => navigate("/catalog")} size="lg">
            Browse Catalog
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      bookId: book.id,
      title: book.title,
      price: book.price,
      quantity: quantity,
      coverImage: book.coverImage,
    });

    toast({
      title: "Added to cart",
      description: `${quantity} copies of "${book.title}" have been added to your cart.`,
    });
  };

  const handleBorrowBook = () => {
    setAssignDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <main className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <Button variant="secondary" size="sm" asChild>
            <Link to="/catalog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Catalog
            </Link>
          </Button>

          {!isLibraryRole && cartItemCount > 0 && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/checkout" className="flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                View Cart
                <Badge variant="secondary" className="ml-2 rounded-full h-5 px-2">
                  {cartItemCount}
                </Badge>
              </Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 animate-fade-in">
          <div className="lg:col-span-1">
            <div className="aspect-2/3 rounded-xl overflow-hidden shadow-lg bg-linear-to-b from-muted/30 to-muted border border-border/50">
              <img
                src={book.coverImage || "/placeholder.svg"}
                alt={book.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>

            <div className="mt-6 space-y-4 lg:hidden">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="px-3 py-1">
                  <Tag className="h-3.5 w-3.5 mr-1.5" />
                  {book.category}
                </Badge>
                <Badge
                  variant={book.status === "Available" ? "default" : "secondary"}
                  className="px-3 py-1"
                >
                  {book.status}
                </Badge>
              </div>

              <div className="flex items-start justify-between gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex-1">
                  {book.title}
                </h1>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 rounded-full hover:text-red-500"
                  disabled
                  title="Favorites feature coming soon"
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">by {book.author}</p>
              </div>

              {book.rating && (
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(book.rating || 0)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-muted"
                        }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium">{book.rating}</span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="hidden lg:block">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className="px-3 py-1">
                  <Tag className="h-3.5 w-3.5 mr-1.5" />
                  {book.category}
                </Badge>
                <Badge
                  variant={book.status === "Available" ? "default" : "secondary"}
                  className="px-3 py-1"
                >
                  {book.status}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">{book.title}</h1>
              <div className="flex items-center mb-3">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <p className="text-xl text-muted-foreground">by {book.author}</p>
              </div>

              {book.rating && (
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(book.rating || 0)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-muted"
                        }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium">{book.rating}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/40 p-4 rounded-lg border border-border/50">
                <p className="text-sm text-muted-foreground mb-1">Publication</p>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary/70" />
                  <p className="font-medium">{book.publicationYear}</p>
                </div>
              </div>

              <div className="bg-muted/40 p-4 rounded-lg border border-border/50">
                <p className="text-sm text-muted-foreground mb-1">Language</p>
                <div className="flex items-center">
                  <Languages className="h-4 w-4 mr-2 text-primary/70" />
                  <p className="font-medium">{book.language}</p>
                </div>
              </div>

              <div className="bg-muted/40 p-4 rounded-lg border border-border/50">
                <p className="text-sm text-muted-foreground mb-1">Pages</p>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-primary/70" />
                  <p className="font-medium">{book.pageCount}</p>
                </div>
              </div>

              <div className="bg-muted/40 p-4 rounded-lg border border-border/50">
                <p className="text-sm text-muted-foreground mb-1">Shelf Location</p>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-primary/70" />
                  <p className="font-medium truncate">{book.location || "Not specified"}</p>
                </div>
              </div>
            </div>

            {/* Tabs for Book Info */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About Book</TabsTrigger>
                <TabsTrigger value="author">Author</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-4 mt-4">
                <div className="bg-card rounded-lg p-6 border shadow-xs">
                  <h3 className="font-semibold text-lg mb-3">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{book.description}</p>
                </div>

                {book.tags && book.tags.length > 0 && (
                  <div className="bg-card rounded-lg p-6 border shadow-xs">
                    <h3 className="font-semibold text-lg mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {book.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="author" className="mt-4">
                <div className="bg-card rounded-lg p-6 border shadow-xs">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-muted shrink-0 flex items-center justify-center">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold mb-2">{book.author}</h3>
                      <p className="text-muted-foreground mb-4">
                        {book.author} is the acclaimed author of {book.title}. Their work spans
                        multiple genres and has been recognized for its depth and creativity.
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/catalog?author=${encodeURIComponent(book.author)}`}>
                          View all books by this author
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="mt-4">
                <div className="bg-card rounded-lg p-6 border shadow-xs">
                  <h3 className="font-semibold text-lg mb-4">Publication Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Publisher</p>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-primary/70" />
                        <p className="font-medium">{book.publisher}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">ISBN</p>
                      <div className="flex items-center">
                        <Bookmark className="h-4 w-4 mr-2 text-primary/70" />
                        <p className="font-medium font-mono">{book.isbn}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Publication Year
                      </p>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-primary/70" />
                        <p className="font-medium">{book.publicationYear}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Language</p>
                      <div className="flex items-center">
                        <Languages className="h-4 w-4 mr-2 text-primary/70" />
                        <p className="font-medium">{book.language || "English"}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Pages</p>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-primary/70" />
                        <p className="font-medium">{book.pageCount || "Not available"}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Shelf Location
                      </p>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-primary/70" />
                        <p className="font-medium">{book.location || "Not specified"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="bg-card rounded-lg p-6 border shadow-xs">
              {isLibraryRole ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p
                        className={`text-lg font-medium ${book.status === "Available" ? "text-green-600 dark:text-green-500" : "text-amber-600 dark:text-amber-500"}`}
                      >
                        {book.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Inventory</p>
                      <p className="text-lg font-medium">
                        {book.stock > 0 ? `${book.stock} copies available` : "Out of stock"}
                      </p>
                    </div>
                  </div>

                  {book.stock > 0 && (
                    <Button className="w-full" size="lg" onClick={handleBorrowBook}>
                      <Library className="h-5 w-5 mr-2" />
                      Borrow Book
                    </Button>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-3xl font-bold">${book.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Availability</p>
                      <p
                        className={`text-lg font-medium ${book.stock > 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}
                      >
                        {book.stock > 0 ? `${book.stock} in stock` : "Out of stock"}
                      </p>
                    </div>
                  </div>

                  {book.stock > 0 && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="rounded-r-none h-10"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="w-12 text-center font-medium">{quantity}</div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                          disabled={quantity >= book.stock}
                          className="rounded-l-none h-10"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button className="flex-1" size="lg" onClick={handleAddToCart}>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Add to Cart
                      </Button>

                      {cartItemCount > 0 && (
                        <Button variant="outline" size="lg" asChild>
                          <Link to="/checkout">View Cart</Link>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {relatedBooks.length > 0 && (
          <div className="mt-16 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Related Books</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/catalog?category=${book.category}`}>
                  View All
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {relatedBooks.map((relatedBook) => (
                <div
                  key={relatedBook.id}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/book/${relatedBook.id}`)}
                >
                  {/* Book Cover */}
                  <div className="relative mb-2">
                    <div className="aspect-2/3 relative overflow-hidden rounded-md bg-muted shadow-sm group-hover:shadow-lg transition-shadow duration-300">
                      {relatedBook.coverImage ? (
                        <img
                          src={relatedBook.coverImage}
                          alt={relatedBook.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-linear-to-br from-muted to-muted/50">
                          <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}

                      {/* Stock Badge */}
                      <div className="absolute bottom-1.5 left-1.5">
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1.5 py-0.5 backdrop-blur-sm bg-background/90 ${relatedBook.stock === 0
                            ? "bg-red-100 text-red-800 border-red-200"
                            : "bg-emerald-100 text-emerald-800 border-emerald-200"
                            }`}
                        >
                          {relatedBook.stock === 0 ? "Out of Stock" : "In Stock"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Book Info - More Compact */}
                  <div className="space-y-0.5">
                    <h3 className="font-semibold text-xs line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {relatedBook.title}
                    </h3>

                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                      {relatedBook.author}
                    </p>

                    <div className="pt-0.5">
                      <span className="text-sm font-bold text-primary">
                        ${relatedBook.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Assign Book Dialog */}
      {book && (
        <AssignBookDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          book={book}
          availableMembers={members}
          availableBooks={[]}
          categories={[]}
          isBookStore={isBookStore}
          borrowText={borrowText}
          borrowedText={borrowedText}
          onAssign={({ memberId, type, durationDays }) => {
            if (memberId) {
              assignBookMutation.mutate({ memberId, type, durationDays });
            }
          }}
          isAssigning={assignBookMutation.isPending}
        />
      )}
    </div>
  );
};

export default BookDetail;

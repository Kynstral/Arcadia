// noinspection ExceptionCaughtLocallyJS

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Book, BookCategory, BookStatus, Member, TransactionStatus } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  CheckCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit,
  Library,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCcw,
  Search,
  ShoppingCart,
  TrendingUp,
  User,
  AlertCircle,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/components/AuthStatusProvider";
import MemberForm from "@/components/members/MemberForm";
import { AssignBookDialog } from "@/components/dialogs/AssignBookDialog";

interface CheckoutItem {
  id: string;
  quantity: number;
  title: string;
  price: number;
  return_status?: string;
  book_id?: string;
  book_title?: string;
  book_author?: string;
  book_cover?: string;
}

interface ExtendedCheckoutTransaction {
  id: string;
  customer_id: string;
  status: TransactionStatus;
  payment_method: string;
  total_amount: number;
  date: string;
  checkout_items: CheckoutItem[];
  user_id?: string;
  returned_book?: {
    id: string;
    title: string;
    author: string;
    cover_image: string;
  };
}

interface Borrowing {
  id: string;
  book_id: string;
  member_id: string;
  checkout_date: string;
  due_date: string;
  return_date?: string;
  status: "Borrowed" | "Returned";
  books: {
    id: string;
    title: string;
    author: string;
    cover_image: string;
  };
}

const MemberDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userRole, user } = useAuth();
  const queryClient = useQueryClient();

  const [assignBookOpen, setAssignBookOpen] = useState(false);
  const [isReturning, setIsReturning] = useState<{ [key: string]: boolean }>({});
  const [isEditOpen, setIsEditOpen] = useState(false);

  const isBookStore = userRole === "Book Store";
  const borrowText = isBookStore ? "Rent" : "Borrow";
  const borrowedText = isBookStore ? "Rented" : "Borrowed";

  // Fetch member details
  const {
    data: member,
    isLoading: isMemberLoading,
    error: memberError,
  } = useQuery({
    queryKey: ["member", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Member;
    },
    enabled: !!id,
  });

  // Fetch borrowed books
  const {
    data: borrowedBooks = [],
    isLoading: isBorrowedBooksLoading,
  } = useQuery({
    queryKey: ["borrowedBooks", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("borrowings")
        .select("*, books:book_id(*)")
        .eq("member_id", id)
        .eq("status", "Borrowed");

      if (error) throw error;
      return data as Borrowing[];
    },
    enabled: !!id,
  });

  // Fetch checkout history with book details
  const {
    data: checkoutHistory = [],
    isLoading: isCheckoutHistoryLoading,
  } = useQuery({
    queryKey: ["checkoutHistory", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checkout_transactions")
        .select("*, checkout_items(*)")
        .eq("customer_id", id)
        .order("date", { ascending: false });

      if (error) throw error;

      // Fetch book details for all items
      const transactions = data as ExtendedCheckoutTransaction[];
      const bookIds = new Set<string>();

      transactions.forEach((transaction) => {
        transaction.checkout_items?.forEach((item: any) => {
          if (item.book_id) {
            bookIds.add(item.book_id);
          }
        });
      });

      // For Return transactions, fetch the most recent returned borrowing to get book details
      const returnTransactions = transactions.filter((t) => t.payment_method === "Return");
      if (returnTransactions.length > 0) {
        const { data: borrowingsData, error: borrowingsError } = await supabase
          .from("borrowings")
          .select("id, book_id, return_date, books:book_id(id, title, author, cover_image)")
          .eq("member_id", id)
          .eq("status", "Returned")
          .order("return_date", { ascending: false })
          .limit(20);

        if (!borrowingsError && borrowingsData) {
          // Match return transactions with borrowings by date proximity
          returnTransactions.forEach((transaction: any) => {
            const transactionDate = new Date(transaction.date).getTime();
            // Find borrowing returned within 1 minute of transaction
            const matchingBorrowing = borrowingsData.find((b: any) => {
              if (!b.return_date) return false;
              const returnDate = new Date(b.return_date).getTime();
              return Math.abs(transactionDate - returnDate) < 60000; // Within 1 minute
            });

            if (matchingBorrowing && matchingBorrowing.books) {
              transaction.returned_book = {
                id: matchingBorrowing.books.id,
                title: matchingBorrowing.books.title,
                author: matchingBorrowing.books.author,
                cover_image: matchingBorrowing.books.cover_image,
              };
            }
          });
        }
      }

      if (bookIds.size > 0) {
        const { data: booksData, error: booksError } = await supabase
          .from("books")
          .select("id, title, author, cover_image")
          .in("id", Array.from(bookIds));

        if (!booksError && booksData) {
          const booksMap = new Map(booksData.map((book) => [book.id, book]));

          // Attach book details to items
          transactions.forEach((transaction) => {
            transaction.checkout_items?.forEach((item: any) => {
              if (item.book_id) {
                const book = booksMap.get(item.book_id);
                if (book) {
                  item.book_title = book.title;
                  item.book_author = book.author;
                  item.book_cover = book.cover_image;
                }
              }
            });
          });
        }
      }

      return transactions;
    },
    enabled: !!id,
  });

  // Fetch available books
  const { data: availableBooks = [] } = useQuery({
    queryKey: ["availableBooks", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("status", "Available")
        .gt("stock", 0)
        .eq("user_id", user?.id);

      if (error) throw error;

      return data.map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        category: book.category as BookCategory,
        publicationYear: book.publication_year,
        publisher: book.publisher,
        description: book.description || "",
        price: book.price,
        status: book.status as BookStatus,
        coverImage: book.cover_image || "",
        stock: book.stock,
        location: book.location,
        language: book.language,
        rating: book.rating,
        pageCount: book.page_count,
        tags: book.tags,
        salesCount: book.sales_count || 0,
      })) as Book[];
    },
    enabled: !!user?.id,
  });

  // Calculate stats from queries
  const stats = {
    totalBorrowed: borrowedBooks.length + (checkoutHistory.filter(t => t.payment_method === "Return").length),
    currentlyBorrowed: borrowedBooks.length,
    overdue: borrowedBooks.filter((b) => new Date(b.due_date) < new Date()).length,
    totalSpent: checkoutHistory.reduce((sum, t) => sum + (t.total_amount || 0), 0),
    membershipDays: member
      ? Math.floor((new Date().getTime() - new Date(member.joined_date).getTime()) / (1000 * 60 * 60 * 24))
      : 0,
  };

  // Get unique categories
  const categories = Array.from(new Set(availableBooks.map((book) => book.category)));

  // Helper function to check existing borrowing
  const checkExistingBorrowing = async (bookId: string) => {
    const { data, error } = await supabase
      .from("borrowings")
      .select("id")
      .eq("member_id", id)
      .eq("book_id", bookId)
      .eq("status", "Borrowed")
      .maybeSingle();

    // Ignore "not found" errors
    if (error && error.code !== "PGRST116") {
      console.error("Error checking borrowing:", error);
      return false;
    }

    return !!data;
  };

  // Mutation for assigning books
  const assignBookMutation = useMutation({
    mutationFn: async (params: { bookIds: string[]; type: "borrow" | "purchase"; durationDays?: number }) => {
      const userId = user?.id;

      for (const bookId of params.bookIds) {
        const isAlreadyBorrowed = await checkExistingBorrowing(bookId);
        if (isAlreadyBorrowed) {
          throw new Error(`Book already ${borrowedText.toLowerCase()}`);
        }

        const selectedBook = availableBooks.find((book) => book.id === bookId);
        if (!selectedBook) continue;

        if (params.type === "borrow") {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + (params.durationDays || 14));

          const { error: borrowError } = await supabase.from("borrowings").insert([
            {
              book_id: bookId,
              member_id: id,
              due_date: dueDate.toISOString(),
              status: "Borrowed",
              checkout_date: new Date().toISOString(),
              user_id: userId,
            },
          ]);

          if (borrowError) throw borrowError;

          // Create transaction with checkout items for borrow
          const { data: transactionData, error: checkoutError } = await supabase
            .from("checkout_transactions")
            .insert([
              {
                customer_id: id,
                status: "Completed" as TransactionStatus,
                payment_method: isBookStore ? "Rent" : "Borrow",
                total_amount: 0,
                date: new Date().toISOString(),
                user_id: userId,
              },
            ])
            .select()
            .single();

          if (checkoutError) throw checkoutError;

          // Create checkout item for the borrowed book
          const { error: itemError } = await supabase.from("checkout_items").insert([
            {
              transaction_id: transactionData.id,
              book_id: bookId,
              title: selectedBook.title,
              quantity: 1,
              price: 0, // Borrow is free
            },
          ]);

          if (itemError) throw itemError;
        } else {
          // Create transaction for purchase
          const { data: transactionData, error: checkoutError } = await supabase
            .from("checkout_transactions")
            .insert([
              {
                customer_id: id,
                status: "Completed" as TransactionStatus,
                payment_method: "Cash",
                total_amount: selectedBook.price,
                date: new Date().toISOString(),
                user_id: userId,
              },
            ])
            .select()
            .single();

          if (checkoutError) throw checkoutError;

          // Create checkout item for the purchased book
          const { error: itemError } = await supabase.from("checkout_items").insert([
            {
              transaction_id: transactionData.id,
              book_id: bookId,
              title: selectedBook.title,
              quantity: 1,
              price: selectedBook.price,
            },
          ]);

          if (itemError) throw itemError;
        }

        const newStock = selectedBook.stock - 1;
        const newStatus = newStock > 0 ? "Available" : "Checked Out";

        const { error: updateError } = await supabase
          .from("books")
          .update({
            stock: newStock,
            status: newStatus,
          })
          .eq("id", bookId);

        if (updateError) throw updateError;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["member", id] });
      queryClient.invalidateQueries({ queryKey: ["borrowedBooks", id] });
      queryClient.invalidateQueries({ queryKey: ["checkoutHistory", id] });
      queryClient.invalidateQueries({ queryKey: ["availableBooks", user?.id] });

      toast({
        description: (
          <div className="flex items-center font-medium">
            <Check className="mr-2 h-4 w-4 text-green-500" />
            Books assigned successfully
          </div>
        ),
        className: "text-green-600",
      });

      setAssignBookOpen(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to assign book",
        description: error.message,
      });
    },
  });

  // Mutation for returning books
  const returnBookMutation = useMutation({
    mutationFn: async (params: { borrowingId: string; bookId: string; bookTitle: string }) => {
      const { error: borrowingError } = await supabase
        .from("borrowings")
        .update({
          status: "Returned",
          return_date: new Date().toISOString(),
        })
        .eq("id", params.borrowingId);

      if (borrowingError) throw borrowingError;

      const { data: bookData, error: bookError } = await supabase
        .from("books")
        .select("stock")
        .eq("id", params.bookId)
        .single();

      if (bookError) throw bookError;

      const { error: updateError } = await supabase
        .from("books")
        .update({
          stock: (bookData.stock || 0) + 1,
          status: "Available",
        })
        .eq("id", params.bookId);

      if (updateError) throw updateError;

      // Create a return transaction record
      const { error: transactionError } = await supabase.from("checkout_transactions").insert([
        {
          customer_id: id,
          status: "Completed" as TransactionStatus,
          payment_method: "Return",
          total_amount: 0,
          date: new Date().toISOString(),
          user_id: user?.id,
        },
      ]);

      if (transactionError) throw transactionError;

      // Update the borrowing record with notes
      const { error: notesError } = await supabase
        .from("borrowings")
        .update({
          notes: `Returned: ${params.bookTitle}`,
        })
        .eq("id", params.borrowingId);

      if (notesError) console.error("Failed to update notes:", notesError);

      return params.borrowingId;
    },
    onMutate: async (params) => {
      // Optimistic update - set returning state
      setIsReturning((prev) => ({ ...prev, [params.borrowingId]: true }));
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["member", id] });
      queryClient.invalidateQueries({ queryKey: ["borrowedBooks", id] });
      queryClient.invalidateQueries({ queryKey: ["checkoutHistory", id] });

      toast({
        description: (
          <div className="flex items-center font-medium">
            <Check className="mr-2 h-4 w-4 text-green-500" />
            Book returned successfully
          </div>
        ),
        className: "text-green-600",
      });
    },
    onError: (error: Error, params) => {
      toast({
        variant: "destructive",
        title: "Failed to return book",
        description: error.message,
      });
    },
    onSettled: (data, error, params) => {
      // Clear returning state
      setIsReturning((prev) => ({ ...prev, [params.borrowingId]: false }));
    },
  });

  // Handler functions - removed, now handled by AssignBookDialog

  const handleBookReturn = (borrowingId: string, bookId: string, bookTitle: string) => {
    returnBookMutation.mutate({ borrowingId, bookId, bookTitle });
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "Inactive":
        return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400";
      case "Suspended":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    }
  };

  if (isMemberLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader size={48} variant="accent" className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading member details...</h2>
          <p className="text-sm text-muted-foreground">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Member not found</h2>
          <p className="text-sm text-muted-foreground mb-4">
            The member you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/members")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Members
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate("/members")} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Members
      </Button>

      {/* Hero Section */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="h-32 w-32 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-4 border-background shadow-lg">
                <User className="h-16 w-16 text-primary" />
              </div>
            </div>

            {/* Member Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{member.name}</h1>
                  <Badge className={`${getStatusColor(member.status)} mb-4`}>
                    {member.status}
                  </Badge>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    {member.address && (
                      <div className="flex items-center gap-2 text-muted-foreground md:col-span-2">
                        <MapPin className="h-4 w-4" />
                        <span>{member.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(member.joined_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Total {isBookStore ? "Rented" : "Borrowed"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalBorrowed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Currently {isBookStore ? "Rented" : "Borrowed"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.currentlyBorrowed}</div>
          </CardContent>
        </Card>

        <Card className={stats.overdue > 0 ? "border-red-500" : ""}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Overdue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${stats.overdue > 0 ? "text-red-500" : ""}`}>
              {stats.overdue}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Spent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats.totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Member For
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.membershipDays}</div>
            <p className="text-xs text-muted-foreground mt-1">days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="borrowed" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
          <TabsTrigger value="borrowed">Currently {borrowedText}</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="borrowed" className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{borrowedText} Books</h3>
            <div className="flex gap-2">
              {userRole === "Library" && (
                <Link to="/book-circulation">
                  <Button variant="outline" size="sm">
                    <RefreshCcw className="h-4 w-4 mr-2" /> Book Circulation
                  </Button>
                </Link>
              )}
              <Button onClick={() => setAssignBookOpen(true)} variant="default" size="sm">
                <Plus className="h-4 w-4 mr-2" /> Assign Book
              </Button>
            </div>
          </div>

          {isBorrowedBooksLoading ? (
            <div className="flex justify-center py-12">
              <Loader size={48} variant="accent" />
            </div>
          ) : borrowedBooks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {borrowedBooks.map((borrowing) => {
                const isOverdue = new Date(borrowing.due_date) < new Date();
                const daysUntilDue = Math.ceil(
                  (new Date(borrowing.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                const isDueSoon = daysUntilDue <= 3 && daysUntilDue > 0;

                return (
                  <Card
                    key={borrowing.id}
                    className={`transition-all hover:shadow-md ${isOverdue
                      ? "border-red-500 bg-red-50/50 dark:bg-red-900/10"
                      : isDueSoon
                        ? "border-amber-500 bg-amber-50/50 dark:bg-amber-900/10"
                        : ""
                      }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="relative h-32 w-20 bg-muted flex items-center justify-center shrink-0 rounded-md overflow-hidden shadow-sm">
                          {borrowing.books.cover_image ? (
                            <img
                              src={borrowing.books.cover_image}
                              alt={borrowing.books.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <BookOpen className="h-10 w-10 text-muted-foreground" />
                          )}
                          {isOverdue && (
                            <div className="absolute top-1 right-1">
                              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                                Overdue
                              </Badge>
                            </div>
                          )}
                          {isDueSoon && !isOverdue && (
                            <div className="absolute top-1 right-1">
                              <Badge className="text-xs px-1.5 py-0.5 bg-amber-500">
                                Due Soon
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <h4 className="font-semibold text-base truncate">{borrowing.books.title}</h4>
                          <p className="text-sm text-muted-foreground truncate mb-3">
                            by {borrowing.books.author}
                          </p>

                          <div className="space-y-2 text-xs mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {borrowedText}: {new Date(borrowing.checkout_date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span
                                className={
                                  isOverdue
                                    ? "text-red-600 dark:text-red-400 font-semibold"
                                    : isDueSoon
                                      ? "text-amber-600 dark:text-amber-400 font-semibold"
                                      : "text-muted-foreground"
                                }
                              >
                                Due: {new Date(borrowing.due_date).toLocaleDateString()}
                                {isOverdue && ` (${Math.abs(daysUntilDue)} days overdue)`}
                                {isDueSoon && !isOverdue && ` (${daysUntilDue} days left)`}
                              </span>
                            </div>
                          </div>

                          <Button
                            variant={isOverdue ? "destructive" : "outline"}
                            size="sm"
                            onClick={() =>
                              handleBookReturn(borrowing.id, borrowing.book_id, borrowing.books.title)
                            }
                            disabled={isReturning[borrowing.id]}
                            className="mt-auto w-full"
                          >
                            {isReturning[borrowing.id] ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Returning...
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Return Book
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Library className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Books {borrowedText}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This member hasn't {borrowedText.toLowerCase()} any books yet
                </p>
                <Button onClick={() => setAssignBookOpen(true)} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Assign Book
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          <h3 className="text-lg font-medium">Transaction History</h3>

          {isCheckoutHistoryLoading ? (
            <div className="flex justify-center py-12">
              <Loader size={48} variant="accent" />
            </div>
          ) : checkoutHistory.length > 0 ? (
            <div className="space-y-4">
              {checkoutHistory.map((transaction) => (
                <Card key={transaction.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">
                          Transaction #{transaction.id.substring(0, 8)}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                          <Badge
                            className="ml-1"
                            variant={transaction.status === "Completed" ? "default" : "outline"}
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">${(transaction.total_amount || 0).toFixed(2)}</p>
                        <div className="flex items-center justify-end gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {transaction.payment_method === "Borrow" && isBookStore
                              ? "Rent"
                              : transaction.payment_method}
                          </span>
                          {transaction.payment_method === "Return" && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                            >
                              <Check className="mr-1 h-3 w-3" /> Returned
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {transaction.payment_method === "Return" ? (
                      transaction.returned_book ? (
                        <div className="flex items-start gap-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                          {/* Book Cover */}
                          <div className="h-20 w-14 bg-muted flex items-center justify-center shrink-0 rounded-md overflow-hidden shadow-sm">
                            {transaction.returned_book.cover_image ? (
                              <img
                                src={transaction.returned_book.cover_image}
                                alt={transaction.returned_book.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <BookOpen className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>

                          {/* Book Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-emerald-900 dark:text-emerald-100 truncate">
                                  {transaction.returned_book.title}
                                </p>
                                <p className="text-sm text-emerald-700 dark:text-emerald-400 truncate">
                                  by {transaction.returned_book.author}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                                    <Check className="h-3 w-3 mr-1" />
                                    Returned
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                              <Check className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-emerald-900 dark:text-emerald-100">
                                Book Returned
                              </p>
                              <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                                Book successfully returned to library
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    ) : transaction.payment_method === "Borrow" || transaction.payment_method === "Rent" ? (
                      <div className="space-y-3">
                        {transaction.checkout_items && transaction.checkout_items.length > 0 ? (
                          transaction.checkout_items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start gap-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                            >
                              {/* Book Cover */}
                              <div className="h-20 w-14 bg-muted flex items-center justify-center shrink-0 rounded-md overflow-hidden shadow-sm">
                                {item.book_cover ? (
                                  <img
                                    src={item.book_cover}
                                    alt={item.book_title || item.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                                )}
                              </div>

                              {/* Book Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-blue-900 dark:text-blue-100 truncate">
                                      {item.book_title || item.title}
                                    </p>
                                    {item.book_author && (
                                      <p className="text-sm text-blue-700 dark:text-blue-400 truncate">
                                        by {item.book_author}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Due in 14 days
                                      </Badge>
                                      <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                        {transaction.payment_method === "Rent" ? "Rented" : "Borrowed"}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="font-bold text-base text-blue-900 dark:text-blue-100">
                                      Free
                                    </p>
                                    <p className="text-xs text-blue-700 dark:text-blue-400">
                                      {transaction.payment_method === "Rent" ? "Rental" : "Loan"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                                <BookOpen className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-blue-900 dark:text-blue-100">
                                  {transaction.payment_method === "Rent" ? "Book Rented" : "Book Borrowed"}
                                </p>
                                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                  Due date: 14 days from transaction date
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {transaction.checkout_items && transaction.checkout_items.length > 0 ? (
                          transaction.checkout_items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 border hover:bg-muted/70 transition-colors"
                            >
                              {/* Book Cover */}
                              <div className="h-20 w-14 bg-muted flex items-center justify-center shrink-0 rounded-md overflow-hidden shadow-sm">
                                {item.book_cover ? (
                                  <img
                                    src={item.book_cover}
                                    alt={item.book_title || item.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                                )}
                              </div>

                              {/* Book Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate">
                                      {item.book_title || item.title}
                                    </p>
                                    {item.book_author && (
                                      <p className="text-sm text-muted-foreground truncate">
                                        by {item.book_author}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        Qty: {item.quantity}
                                      </Badge>
                                      {item.return_status === "Returned" && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                                        >
                                          <Check className="mr-1 h-3 w-3" /> Returned
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="font-bold text-base">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      ${item.price.toFixed(2)} each
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No items in this transaction</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Transaction History</h3>
                <p className="text-sm text-muted-foreground">
                  This member hasn't made any transactions yet
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Assign Book Dialog */}
      <AssignBookDialog
        open={assignBookOpen}
        onOpenChange={setAssignBookOpen}
        member={member}
        availableBooks={availableBooks}
        categories={categories}
        isBookStore={isBookStore}
        borrowText={borrowText}
        borrowedText={borrowedText}
        onAssign={({ bookIds, type, durationDays }) => {
          if (bookIds) {
            assignBookMutation.mutate({ bookIds, type, durationDays });
          }
        }}
        isAssigning={assignBookMutation.isPending}
      />

      {/* Edit Member Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>Update member information</DialogDescription>
          </DialogHeader>
          {member && (
            <MemberForm
              member={member}
              onSuccess={() => {
                setIsEditOpen(false);
                queryClient.invalidateQueries({ queryKey: ["member", id] });
                toast({
                  title: "Success",
                  description: "Member updated successfully",
                });
              }}
              onCancel={() => setIsEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberDetail;

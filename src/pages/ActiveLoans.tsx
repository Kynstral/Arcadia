import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthStatusProvider";
import { useNavigate } from "react-router-dom";
import { calculateLateFee, formatLateFee, LibrarySettings } from "@/lib/late-fees";
import { ActiveLoansPageSkeleton } from "@/components/loans/ActiveLoansSkeleton";

interface Borrowing {
  id: string;
  book_id: string;
  member_id: string;
  checkout_date: string;
  due_date: string;
  return_date: string | null;
  status: string;
  renewal_count: number;
  books: {
    id: string;
    title: string;
    author: string;
    cover_image: string;
  };
  members: {
    id: string;
    name: string;
    email: string;
  };
}

const ActiveLoans = () => {
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filterStatus, setFilterStatus] = useState<string>("active");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [returningIds, setReturningIds] = useState<Set<string>>(new Set());
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [selectedBorrowingForRenewal, setSelectedBorrowingForRenewal] = useState<Borrowing | null>(null);
  const [renewalDays, setRenewalDays] = useState<string>("15");
  const [renewalOverride, setRenewalOverride] = useState(false);

  // Return dialog state
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedBorrowingForReturn, setSelectedBorrowingForReturn] = useState<Borrowing | null>(null);
  const [returnCondition, setReturnCondition] = useState<string>("Good");
  const [conditionNotes, setConditionNotes] = useState<string>("");
  const [feePaymentAction, setFeePaymentAction] = useState<"none" | "paid" | "waived">("none");

  // Fetch library settings for late fee calculation
  const { data: librarySettings } = useQuery({
    queryKey: ["librarySettings", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("library_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      // Return default settings if none exist
      return data || {
        daily_late_fee_rate: 0.5,
        grace_period_days: 0,
        max_late_fee_cap: 50.0,
      };
    },
    enabled: !!user?.id && userRole === "Library",
  });

  // Hide page for bookstore users
  if (userRole === "Book Store") {
    return (
      <div className="page-transition space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Not Available for Bookstores</h3>
              <p className="text-muted-foreground mb-4">
                This feature is only available for library management.
              </p>
              <Button onClick={() => navigate("/")}>Go to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch all active borrowings
  const { data: borrowingsData, isLoading } = useQuery({
    queryKey: ["borrowings", user?.id, filterStatus, searchQuery],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("borrowings")
        .select(`
          *,
          books:book_id(id, title, author, cover_image),
          members:member_id(id, name, email)
        `)
        .eq("user_id", user.id)
        .order("due_date", { ascending: true });

      // Filter by status
      if (filterStatus === "active") {
        query = query.eq("status", "Borrowed");
      } else if (filterStatus === "overdue") {
        query = query.eq("status", "Borrowed").lt("due_date", new Date().toISOString());
      } else if (filterStatus === "due-soon") {
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        query = query
          .eq("status", "Borrowed")
          .gte("due_date", new Date().toISOString())
          .lte("due_date", threeDaysFromNow.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by search query
      if (searchQuery) {
        return data?.filter(
          (b) =>
            b.books?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.books?.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.members?.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  // Return book mutation
  const returnBookMutation = useMutation({
    mutationFn: async ({
      borrowingId,
      bookId,
      condition,
      conditionNotes,
      feePayment,
    }: {
      borrowingId: string;
      bookId: string;
      condition?: string;
      conditionNotes?: string;
      feePayment?: "none" | "paid" | "waived";
    }) => {
      // Get borrowing to calculate late fee
      const { data: borrowingData, error: fetchError } = await supabase
        .from("borrowings")
        .select("due_date")
        .eq("id", borrowingId)
        .single();

      if (fetchError) throw fetchError;

      // Calculate late fee
      const lateFee = librarySettings
        ? calculateLateFee(borrowingData.due_date, new Date(), librarySettings as LibrarySettings)
        : 0;

      // Check if condition is Poor or Damaged to flag for review
      const flagForReview = condition === "Poor" || condition === "Damaged";

      // Determine fee payment status
      const feePaid = feePayment === "paid";
      const feeWaived = feePayment === "waived";

      // Update borrowing status with condition and late fee
      const { error: borrowingError } = await supabase
        .from("borrowings")
        .update({
          status: "Returned",
          return_date: new Date().toISOString(),
          return_condition: condition || "Good",
          condition_notes: conditionNotes || null,
          flagged_for_review: flagForReview,
          late_fee_amount: lateFee,
          fee_paid: feePaid,
          fee_waived: feeWaived,
        })
        .eq("id", borrowingId);

      if (borrowingError) throw borrowingError;

      // Get current book stock
      const { data: bookData, error: bookFetchError } = await supabase
        .from("books")
        .select("stock")
        .eq("id", bookId)
        .single();

      if (bookFetchError) throw bookFetchError;

      // Update book stock and status
      const bookStatus = condition === "Damaged" ? "Needs Repair" : "Available";
      const { error: bookUpdateError } = await supabase
        .from("books")
        .update({
          stock: (bookData.stock || 0) + 1,
          status: bookStatus,
        })
        .eq("id", bookId);

      if (bookUpdateError) throw bookUpdateError;

      // Create return transaction
      const { error: transactionError } = await supabase.from("checkout_transactions").insert({
        customer_id: borrowingsData?.find((b) => b.id === borrowingId)?.member_id,
        status: "Completed",
        payment_method: "Return",
        total_amount: 0,
        date: new Date().toISOString(),
        user_id: user?.id,
      });

      if (transactionError) throw transactionError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrowings"] });
      toast({
        description: "Book returned successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Return Failed",
        description: error.message || "Failed to return book",
      });
    },
  });

  // Renew book mutation
  const renewBookMutation = useMutation({
    mutationFn: async ({ borrowingId, days, override }: { borrowingId: string; days: number; override?: boolean }) => {
      const borrowing = borrowingsData?.find((b) => b.id === borrowingId);
      if (!borrowing) throw new Error("Borrowing not found");

      // Check renewal limit (unless override is enabled)
      const maxRenewals = librarySettings?.max_renewals_per_loan || 2;
      if (!override && borrowing.renewal_count >= maxRenewals) {
        throw new Error(`Maximum renewals reached (${maxRenewals})`);
      }

      const newDueDate = new Date(borrowing.due_date);
      newDueDate.setDate(newDueDate.getDate() + days);

      const { error } = await supabase
        .from("borrowings")
        .update({
          due_date: newDueDate.toISOString(),
          renewal_count: borrowing.renewal_count + 1,
        })
        .eq("id", borrowingId);

      if (error) throw error;

      return days;
    },
    onSuccess: (days) => {
      queryClient.invalidateQueries({ queryKey: ["borrowings"] });
      setRenewDialogOpen(false);
      setSelectedBorrowingForRenewal(null);
      setRenewalDays("15");
      setRenewalOverride(false);
      toast({
        description: `Due date extended by ${days} days`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Renewal Failed",
        description: error.message || "Failed to renew book",
      });
    },
  });

  const handleReturnClick = (borrowing: Borrowing) => {
    setSelectedBorrowingForReturn(borrowing);
    setReturnCondition("Good");
    setConditionNotes("");
    setFeePaymentAction("none");
    setReturnDialogOpen(true);
  };

  const handleReturnConfirm = async () => {
    if (!selectedBorrowingForReturn) return;

    // Check if there's a late fee and no payment action selected
    const hasLateFee = librarySettings && getDaysUntilDue(selectedBorrowingForReturn.due_date) < 0;
    if (hasLateFee && feePaymentAction === "none") {
      toast({
        variant: "destructive",
        title: "Fee Payment Required",
        description: "Please select how to handle the late fee before returning",
      });
      return;
    }

    setReturningIds((prev) => new Set(prev).add(selectedBorrowingForReturn.id));
    try {
      await returnBookMutation.mutateAsync({
        borrowingId: selectedBorrowingForReturn.id,
        bookId: selectedBorrowingForReturn.book_id,
        condition: returnCondition,
        conditionNotes: conditionNotes,
        feePayment: feePaymentAction,
      });
      setReturnDialogOpen(false);
      setSelectedBorrowingForReturn(null);
      setFeePaymentAction("none");
    } finally {
      setReturningIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedBorrowingForReturn.id);
        return newSet;
      });
    }
  };

  const handleRenewClick = (borrowing: Borrowing) => {
    setSelectedBorrowingForRenewal(borrowing);
    setRenewDialogOpen(true);
  };

  const handleRenewConfirm = () => {
    if (!selectedBorrowingForRenewal) return;
    const days = parseInt(renewalDays);
    if (isNaN(days) || days <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Duration",
        description: "Please enter a valid number of days",
      });
      return;
    }
    renewBookMutation.mutate({
      borrowingId: selectedBorrowingForRenewal.id,
      days,
      override: renewalOverride
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateBadge = (dueDate: string, status: string) => {
    if (status !== "Borrowed") return null;

    const daysUntilDue = getDaysUntilDue(dueDate);

    if (daysUntilDue < 0 && librarySettings) {
      // Calculate late fee
      const lateFee = calculateLateFee(dueDate, new Date(), librarySettings as LibrarySettings);

      return (
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            {Math.abs(daysUntilDue)} days overdue
          </Badge>
          {lateFee > 0 && (
            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-xs">
              Fee: {formatLateFee(lateFee)}
            </Badge>
          )}
        </div>
      );
    } else if (daysUntilDue <= 3) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
          <Clock className="h-3 w-3 mr-1" />
          Due in {daysUntilDue} {daysUntilDue === 1 ? "day" : "days"}
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
          <Calendar className="h-3 w-3 mr-1" />
          Due in {daysUntilDue} days
        </Badge>
      );
    }
  };

  if (isLoading) {
    return <ActiveLoansPageSkeleton />;
  }

  const borrowings = borrowingsData || [];
  const activeBorrowings = borrowings.filter((b) => b.status === "Borrowed");
  const overdueBorrowings = activeBorrowings.filter((b) => getDaysUntilDue(b.due_date) < 0);
  const dueSoonBorrowings = activeBorrowings.filter(
    (b) => getDaysUntilDue(b.due_date) >= 0 && getDaysUntilDue(b.due_date) <= 3
  );

  return (
    <div className="page-transition space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Loans</h1>
          <p className="text-muted-foreground">
            Manage currently borrowed books and track due dates
          </p>
        </div>
        <Button onClick={() => navigate("/catalog")}>
          <BookOpen className="mr-2 h-4 w-4" />
          Browse Catalog
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Loans</p>
                <p className="text-2xl font-bold">{activeBorrowings.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Due Soon</p>
                <p className="text-2xl font-bold">{dueSoonBorrowings.length}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{overdueBorrowings.length}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Borrowed Books</CardTitle>
              <CardDescription>View and manage all active book loans</CardDescription>
            </div>
            {borrowings.length > 0 && (
              <Badge variant="outline" className="w-fit">
                {borrowings.length} {borrowings.length === 1 ? "loan" : "loans"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="space-y-4 mb-6 p-4 bg-muted/30 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Filter by Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="due-soon">Due Soon (3 days)</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by book, author, or member..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterStatus("active");
                  setSearchQuery("");
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading active loans...</p>
            </div>
          ) : borrowings.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Book</TableHead>
                    <TableHead className="w-[200px]">Member</TableHead>
                    <TableHead className="w-[120px]">Checkout Date</TableHead>
                    <TableHead className="w-[120px]">Due Date</TableHead>
                    <TableHead className="w-[150px]">Status</TableHead>
                    <TableHead className="text-right w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {borrowings.map((borrowing) => (
                    <TableRow key={borrowing.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-9 bg-muted rounded overflow-hidden shrink-0">
                            {borrowing.books?.cover_image ? (
                              <img
                                src={borrowing.books.cover_image}
                                alt={borrowing.books?.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{borrowing.books?.title}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              by {borrowing.books?.author}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <User className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <span className="font-medium truncate">{borrowing.members?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {new Date(borrowing.checkout_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {new Date(borrowing.due_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{getDueDateBadge(borrowing.due_date, borrowing.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {borrowing.status === "Borrowed" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 hover:bg-primary/10 hover:text-primary"
                                onClick={() => handleRenewClick(borrowing)}
                                disabled={renewBookMutation.isPending}
                              >
                                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                Renew
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 hover:bg-green-50 hover:text-green-600"
                                onClick={() => handleReturnClick(borrowing)}
                                disabled={returningIds.has(borrowing.id)}
                              >
                                {returningIds.has(borrowing.id) ? (
                                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                )}
                                Return
                              </Button>
                            </>
                          )}
                          {borrowing.status === "Returned" && (
                            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                              Returned
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-16 border rounded-md bg-muted/10">
              <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No active loans</h3>
              <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                {searchQuery || filterStatus !== "active"
                  ? "No loans match your current filters. Try adjusting your search."
                  : "There are no books currently on loan. Browse the catalog to lend books to members."}
              </p>
              <div className="flex gap-2 justify-center">
                {(searchQuery || filterStatus !== "active") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilterStatus("active");
                      setSearchQuery("");
                    }}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
                <Button onClick={() => navigate("/catalog")}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Catalog
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Renewal Dialog */}
      <Dialog open={renewDialogOpen} onOpenChange={setRenewDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <RotateCcw className="h-4 w-4 text-primary" />
              </div>
              Renew Book Loan
            </DialogTitle>
            <DialogDescription>
              Extend the due date for this borrowed book
            </DialogDescription>
          </DialogHeader>

          {selectedBorrowingForRenewal && (
            <div className="space-y-4 overflow-y-auto flex-1 px-1">
              {/* Book Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                <div className="h-16 w-12 bg-muted rounded overflow-hidden shrink-0">
                  {selectedBorrowingForRenewal.books?.cover_image ? (
                    <img
                      src={selectedBorrowingForRenewal.books.cover_image}
                      alt={selectedBorrowingForRenewal.books?.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{selectedBorrowingForRenewal.books?.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    by {selectedBorrowingForRenewal.books?.author}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Borrowed by: {selectedBorrowingForRenewal.members?.name}
                  </p>
                </div>
              </div>

              {/* Current Due Date */}
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <span className="text-sm font-medium">Current Due Date</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">
                    {new Date(selectedBorrowingForRenewal.due_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Renewal Count */}
              {librarySettings && (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">Renewals Used</span>
                  <span className="font-semibold text-blue-600">
                    {selectedBorrowingForRenewal.renewal_count || 0} of{" "}
                    {librarySettings.max_renewals_per_loan || 2}
                  </span>
                </div>
              )}

              {/* Warning if at limit */}
              {librarySettings &&
                selectedBorrowingForRenewal.renewal_count >=
                (librarySettings.max_renewals_per_loan || 2) && !renewalOverride && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-red-800">Maximum renewals reached</p>
                      <p className="text-xs text-red-700 mt-1">This book cannot be renewed further</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRenewalOverride(true)}
                      className="shrink-0 bg-background hover:bg-accent"
                    >
                      Override (Staff)
                    </Button>
                  </div>
                )}

              {/* Override Active Notice */}
              {renewalOverride && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-amber-800">Staff override active</p>
                    <p className="text-xs text-amber-700 mt-1">Renewal limit will be bypassed</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRenewalOverride(false)}
                    className="shrink-0 h-7 text-xs"
                  >
                    Cancel Override
                  </Button>
                </div>
              )}

              {/* Duration Selection */}
              <div className="space-y-3">
                <Label htmlFor="renewal-days">Extension Duration</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={renewalDays === "7" ? "default" : "outline"}
                    onClick={() => setRenewalDays("7")}
                    className="w-full"
                  >
                    7 Days
                  </Button>
                  <Button
                    type="button"
                    variant={renewalDays === "15" ? "default" : "outline"}
                    onClick={() => setRenewalDays("15")}
                    className="w-full"
                  >
                    15 Days
                  </Button>
                  <Button
                    type="button"
                    variant={renewalDays === "30" ? "default" : "outline"}
                    onClick={() => setRenewalDays("30")}
                    className="w-full"
                  >
                    30 Days
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="renewal-days"
                    type="number"
                    min="1"
                    max="90"
                    value={renewalDays}
                    onChange={(e) => setRenewalDays(e.target.value)}
                    placeholder="Custom days"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">days</span>
                </div>
              </div>

              {/* New Due Date Preview */}
              {renewalDays && !isNaN(parseInt(renewalDays)) && parseInt(renewalDays) > 0 && (
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">New Due Date</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-primary">
                      {new Date(
                        new Date(selectedBorrowingForRenewal.due_date).getTime() +
                        parseInt(renewalDays) * 24 * 60 * 60 * 1000
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRenewDialogOpen(false);
                setSelectedBorrowingForRenewal(null);
                setRenewalDays("15");
                setRenewalOverride(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRenewConfirm}
              disabled={
                renewBookMutation.isPending ||
                (librarySettings &&
                  selectedBorrowingForRenewal &&
                  selectedBorrowingForRenewal.renewal_count >=
                  (librarySettings.max_renewals_per_loan || 2) &&
                  !renewalOverride)
              }
            >
              {renewBookMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Renewing...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Confirm Renewal
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Dialog with Condition Assessment */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              Return Book
            </DialogTitle>
            <DialogDescription>Assess the book condition and complete the return</DialogDescription>
          </DialogHeader>

          {selectedBorrowingForReturn && (
            <div className="space-y-4 overflow-y-auto flex-1 px-1">
              {/* Book Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                <div className="h-16 w-12 bg-muted rounded overflow-hidden shrink-0">
                  {selectedBorrowingForReturn.books?.cover_image ? (
                    <img
                      src={selectedBorrowingForReturn.books.cover_image}
                      alt={selectedBorrowingForReturn.books?.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{selectedBorrowingForReturn.books?.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    by {selectedBorrowingForReturn.books?.author}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Borrowed by: {selectedBorrowingForReturn.members?.name}
                  </p>
                </div>
              </div>

              {/* Condition Assessment */}
              <div className="space-y-3">
                <Label htmlFor="condition">Book Condition</Label>
                <Select value={returnCondition} onValueChange={setReturnCondition}>
                  <SelectTrigger id="condition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                    <SelectItem value="Damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>

                <div className="space-y-2">
                  <Label htmlFor="condition-notes">Notes (optional)</Label>
                  <textarea
                    id="condition-notes"
                    value={conditionNotes}
                    onChange={(e) => setConditionNotes(e.target.value)}
                    placeholder="Any damage or issues to note..."
                    className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                  />
                </div>

                {(returnCondition === "Poor" || returnCondition === "Damaged") && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">Book will be flagged for review</p>
                      {returnCondition === "Damaged" && (
                        <p className="text-xs mt-1">Status will be set to "Needs Repair"</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Late Fee Display and Payment Options */}
              {librarySettings && getDaysUntilDue(selectedBorrowingForReturn.due_date) < 0 && (
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-900">Late Fee</span>
                      <span className="text-lg font-bold text-red-600">
                        {formatLateFee(
                          calculateLateFee(
                            selectedBorrowingForReturn.due_date,
                            new Date(),
                            librarySettings as LibrarySettings
                          )
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-red-700 mt-1">
                      {Math.abs(getDaysUntilDue(selectedBorrowingForReturn.due_date))} days overdue
                    </p>
                  </div>

                  {/* Fee Payment Options */}
                  <div className="space-y-2">
                    <Label>Fee Payment</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={feePaymentAction === "paid" ? "default" : "outline"}
                        onClick={() => setFeePaymentAction("paid")}
                        className="w-full"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Paid
                      </Button>
                      <Button
                        type="button"
                        variant={feePaymentAction === "waived" ? "default" : "outline"}
                        onClick={() => setFeePaymentAction("waived")}
                        className="w-full"
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Waive Fee
                      </Button>
                    </div>
                    {feePaymentAction === "none" && (
                      <p className="text-xs text-red-600">Please select a payment option</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setReturnDialogOpen(false);
                setSelectedBorrowingForReturn(null);
                setReturnCondition("Good");
                setConditionNotes("");
                setFeePaymentAction("none");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleReturnConfirm}
              disabled={returningIds.has(selectedBorrowingForReturn?.id || "")}
            >
              {returningIds.has(selectedBorrowingForReturn?.id || "") ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Returning...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Return
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActiveLoans;

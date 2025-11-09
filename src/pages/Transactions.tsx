/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen,
  CalendarDays,
  CalendarRange,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthStatusProvider";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { TransactionsPageSkeleton } from "@/components/transactions/TransactionsSkeleton";

interface CheckoutItem {
  id: string;
  transaction_id: string;
  title: string;
  quantity: number;
  price: number;
  book_id: string;
  return_status?: string;
  coverImage?: string;
}

interface CheckoutTransaction {
  id: string;
  customer_id: string;
  status: string;
  payment_method: string;
  total_amount: number;
  date: string;
  user_id?: string;
  memberName?: string;
  memberEmail?: string;
  items?: CheckoutItem[];
}

interface Member {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

const TRANSACTIONS_PER_PAGE = 10;

const formatPaymentMethod = (method: string) => {
  if (method === "bank_transfer") return "Bank Transfer";
  if (method === "cash") return "Cash";
  if (method === "card") return "Card";
  if (method === "Borrow") return "Borrow";
  if (method === "Rent") return "Rent";
  return method.charAt(0).toUpperCase() + method.slice(1);
};

const Transactions = () => {
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [page, setPage] = useState(0);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("all");
  const [showCustomDateInputs, setShowCustomDateInputs] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [memberSearchResults, setMemberSearchResults] = useState<Member[]>([]);
  const [isSearchingMembers, setIsSearchingMembers] = useState(false);
  const [memberSearchOpen, setMemberSearchOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedTransaction, setSelectedTransaction] = useState<CheckoutTransaction | null>(null);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);

  const isBookStore = userRole === "Book Store";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Transaction ID copied to clipboard.",
    });
  };

  const toggleRowExpansion = (transactionId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId);
      } else {
        newSet.add(transactionId);
      }
      return newSet;
    });
  };

  // Fetch transactions with React Query
  const {
    data: transactionsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["transactions", user?.id, page, startDate, endDate, selectedMember?.id],
    queryFn: async () => {
      if (!user?.id) return { transactions: [], hasMore: false };

      let query = supabase
        .from("checkout_transactions")
        .select("id, customer_id, status, payment_method, total_amount, date, user_id")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .range(page * TRANSACTIONS_PER_PAGE, (page + 1) * TRANSACTIONS_PER_PAGE - 1);

      if (startDate) {
        query = query.gte("date", startDate + "T00:00:00");
      }
      if (endDate) {
        query = query.lte("date", endDate + "T23:59:59");
      }
      if (selectedMember) {
        query = query.eq("customer_id", selectedMember.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch member data
      const customerIds = [...new Set(data?.map((t) => t.customer_id))].filter((id) => id);
      let memberMap: Record<string, any> = {};

      if (customerIds.length > 0) {
        const { data: members } = await supabase
          .from("members")
          .select("id, name, email")
          .in("id", customerIds);

        members?.forEach((member) => {
          memberMap[member.id] = member;
        });
      }

      const enhancedData = data?.map((transaction) => {
        const member = transaction.customer_id ? memberMap[transaction.customer_id] : null;
        return {
          ...transaction,
          memberName: member?.name || "Unknown",
          memberEmail: member?.email || undefined,
        };
      });

      return {
        transactions: enhancedData || [],
        hasMore: (data?.length || 0) === TRANSACTIONS_PER_PAGE,
      };
    },
    enabled: !!user?.id,
  });

  // Fetch items for a specific transaction
  const fetchTransactionItems = async (transactionId: string): Promise<CheckoutItem[]> => {
    const { data: itemsData, error } = await supabase
      .from("checkout_items")
      .select("*")
      .eq("transaction_id", transactionId);

    if (error) throw error;

    // Fetch book covers
    const bookIds = itemsData?.map((item) => item.book_id).filter((id) => id) || [];
    if (bookIds.length === 0) return itemsData || [];

    const { data: books } = await supabase
      .from("books")
      .select("id, cover_image")
      .in("id", bookIds);

    const coverMap: Record<string, string> = {};
    books?.forEach((book) => {
      coverMap[book.id] = book.cover_image;
    });

    return (
      itemsData?.map((item) => ({
        ...item,
        coverImage: item.book_id ? coverMap[item.book_id] : undefined,
      })) || []
    );
  };

  useEffect(() => {
    if (memberSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [memberSearchOpen]);

  const handleDateRangeChange = (range: string) => {
    setSelectedDateRange(range);
    setPage(0);

    if (range === "custom") {
      setShowCustomDateInputs(true);
      return;
    }

    setShowCustomDateInputs(false);
    const today = new Date();
    const start = new Date();

    if (range === "30days") {
      start.setDate(today.getDate() - 30);
    } else if (range === "60days") {
      start.setDate(today.getDate() - 60);
    } else if (range === "90days") {
      start.setDate(today.getDate() - 90);
    } else {
      setStartDate("");
      setEndDate("");
      return;
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedDateRange("all");
    setShowCustomDateInputs(false);
    setSelectedMember(null);
    setMemberSearchQuery("");
    setPage(0);
  };

  const applyFilters = () => {
    setPage(0);
    refetch();
  };

  const handleMemberSearch = async (query: string) => {
    if (!query || query.trim() === "") {
      setMemberSearchResults([]);
      return;
    }

    setIsSearchingMembers(true);
    try {
      const { data, error } = await supabase
        .from("members")
        .select("id, name, email, phone")
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .order("name");

      if (error) throw error;
      setMemberSearchResults(data || []);
    } catch (error) {
      console.error("Error searching members:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search members.",
      });
      setMemberSearchResults([]);
    } finally {
      setIsSearchingMembers(false);
    }
  };

  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member);
    setMemberSearchOpen(false);
    setMemberSearchQuery(member.name);
    setPage(0);
  };

  const clearMemberFilter = () => {
    setSelectedMember(null);
    setMemberSearchQuery("");
    setPage(0);
  };

  const getPaymentMethodDisplay = (method: string) => {
    const formattedMethod = formatPaymentMethod(method);

    if (method === "Borrow" || method === "Rent") {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
          {formattedMethod}
        </Badge>
      );
    }

    let bgColor = "bg-gray-100";
    let textColor = "text-gray-800";

    if (method === "cash") {
      bgColor = "bg-green-50";
      textColor = "text-green-700";
    } else if (method === "card") {
      bgColor = "bg-purple-50";
      textColor = "text-purple-700";
    } else if (method === "bank_transfer") {
      bgColor = "bg-blue-50";
      textColor = "text-blue-700";
    }

    return (
      <Badge variant="outline" className={`${bgColor} ${textColor} border-transparent font-medium`}>
        {formattedMethod}
      </Badge>
    );
  };

  if (isLoading) {
    return <TransactionsPageSkeleton />;
  }

  const transactions = transactionsData?.transactions || [];
  const hasMore = transactionsData?.hasMore || false;
  const totalAmount = transactions.reduce((sum, t) => sum + t.total_amount, 0);
  const completedCount = transactions.filter((t) => t.status === "Completed").length;

  return (
    <div className="space-y-6 page-transition">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">View and manage all sales and rental transactions</p>
        </div>

        <Button onClick={() => navigate("/checkout")}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          New Sale
        </Button>
      </div>

      {/* Quick Stats */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold">{transactions.length}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{completedCount}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">$</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transactions Table with Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                View and filter all sales, rentals, and borrowing transactions
              </CardDescription>
            </div>
            {transactions.length > 0 && (
              <Badge variant="outline" className="w-fit">
                {transactions.length} {transactions.length === 1 ? "transaction" : "transactions"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters Section */}
          <div className="space-y-4 mb-6 p-4 bg-muted/30 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label>Date Range</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    variant={selectedDateRange === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDateRangeChange("all")}
                  >
                    All Time
                  </Button>
                  <Button
                    variant={selectedDateRange === "30days" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDateRangeChange("30days")}
                  >
                    Last 30 Days
                  </Button>
                  <Button
                    variant={selectedDateRange === "60days" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDateRangeChange("60days")}
                  >
                    Last 60 Days
                  </Button>
                  <Button
                    variant={selectedDateRange === "90days" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDateRangeChange("90days")}
                  >
                    Last 90 Days
                  </Button>
                  <Button
                    variant={selectedDateRange === "custom" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDateRangeChange("custom")}
                  >
                    <CalendarRange className="h-4 w-4 mr-2" />
                    Custom Range
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="member-search">Search by Member</Label>
                <div className="relative mt-2">
                  <Popover open={memberSearchOpen} onOpenChange={setMemberSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={memberSearchOpen}
                        className="w-full justify-between"
                      >
                        {selectedMember ? selectedMember.name : "Search for a member..."}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <div className="overflow-hidden rounded-md border border-slate-100 bg-white text-slate-950 shadow-md animate-in fade-in-0 zoom-in-95 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50">
                        <div className="flex flex-col">
                          <div className="flex items-center border-b px-3 dark:border-slate-800">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <Input
                              ref={searchInputRef}
                              value={memberSearchQuery}
                              onChange={(e) => {
                                const value = e.target.value;
                                setMemberSearchQuery(value);
                                handleMemberSearch(value);
                              }}
                              placeholder="Search members..."
                              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                              autoComplete="off"
                            />
                          </div>
                          {isSearchingMembers ? (
                            <div className="py-6 text-center">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                              <p className="text-sm text-muted-foreground mt-2">
                                Searching members...
                              </p>
                            </div>
                          ) : (
                            <div className="max-h-[300px] overflow-y-auto">
                              {memberSearchResults.length === 0 ? (
                                <p className="p-4 text-sm text-center text-slate-500">
                                  No members found.
                                </p>
                              ) : (
                                <div className="p-1">
                                  {memberSearchResults.map((member) => (
                                    <div
                                      key={member.id}
                                      onClick={() => handleMemberSelect(member)}
                                      className="relative flex cursor-default select-none items-center rounded-sm p-2 text-sm outline-hidden hover:bg-slate-100 data-disabled:pointer-events-none data-disabled:opacity-50 dark:hover:bg-slate-800"
                                    >
                                      <div className="flex items-center gap-2 w-full">
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                          <User className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium truncate">{member.name}</p>
                                          <p className="text-sm text-muted-foreground truncate">
                                            {member.email} {member.phone && `• ${member.phone}`}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {selectedMember && (
                    <Button
                      variant="ghost"
                      className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                      onClick={clearMemberFilter}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {showCustomDateInputs && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={resetFilters} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Reset Filters
              </Button>
              {selectedDateRange === "custom" && (
                <Button onClick={applyFilters}>Apply Filters</Button>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Transactions Table */}
          {isLoading ? (
            <div className="text-center py-6">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              <p className="text-muted-foreground mt-2">Loading transactions...</p>
            </div>
          ) : (
            <>
              {transactions.length > 0 ? (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]"></TableHead>
                          <TableHead className="w-[140px]">Date</TableHead>
                          <TableHead className="w-[120px]">ID</TableHead>
                          <TableHead className="min-w-[180px]">Member</TableHead>
                          <TableHead className="w-[120px]">Type</TableHead>
                          <TableHead className="w-[100px]">Amount</TableHead>
                          <TableHead className="w-[100px]">Status</TableHead>
                          <TableHead className="text-right w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <React.Fragment key={transaction.id}>
                            <TableRow className="cursor-pointer hover:bg-muted/50">
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                                  onClick={() => toggleRowExpansion(transaction.id)}
                                >
                                  {expandedRows.has(transaction.id) ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                                  {new Date(transaction.date).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <span className="font-mono text-xs">
                                    {transaction.id.substring(0, 8)}...
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(transaction.id);
                                    }}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                                    <User className="h-3 w-3 text-muted-foreground" />
                                  </div>
                                  <span className="font-medium truncate max-w-[150px]">
                                    {transaction.memberName || "Unknown"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {getPaymentMethodDisplay(transaction.payment_method)}
                              </TableCell>
                              <TableCell className="font-semibold">
                                ${transaction.total_amount.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    transaction.status === "Completed"
                                      ? "bg-green-50 text-green-600 border-green-200"
                                      : "bg-amber-50 text-amber-600 border-amber-200"
                                  }
                                >
                                  {transaction.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 hover:bg-primary/10 hover:text-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTransaction(transaction);
                                    setTransactionDialogOpen(true);
                                  }}
                                >
                                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                  Details
                                </Button>
                              </TableCell>
                            </TableRow>

                            {/* Expanded Row - Items */}
                            {expandedRows.has(transaction.id) && (
                              <TableRow>
                                <TableCell colSpan={8} className="bg-muted/20 p-0">
                                  <ExpandedTransactionItems transactionId={transaction.id} />
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Page {page + 1} • Showing {transactions.length} transactions
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!hasMore}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 border rounded-md bg-muted/10">
                  <div className="h-16 w-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">No transactions found</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                    {selectedMember || startDate || endDate
                      ? "No transactions match your current filters. Try adjusting your search criteria."
                      : isBookStore
                        ? "No sales or rental transactions have been recorded yet. Start by creating your first sale."
                        : "No borrowing transactions have been recorded yet. Start by creating your first borrowing."}
                  </p>
                  <div className="flex gap-2 justify-center mt-6">
                    {(selectedMember || startDate || endDate) && (
                      <Button variant="outline" onClick={resetFilters}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Clear Filters
                      </Button>
                    )}
                    <Button onClick={() => navigate("/checkout")}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {isBookStore ? "Create New Sale" : "Create New Borrowing"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-primary" />
              </div>
              Transaction Details
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 flex-wrap">
              <span>Transaction ID:</span>
              <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                {selectedTransaction?.id.substring(0, 16)}...
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary"
                onClick={() => copyToClipboard(selectedTransaction?.id || "")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-6">
              {/* Transaction Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Method</span>
                      {getPaymentMethodDisplay(selectedTransaction.payment_method)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge
                        variant="outline"
                        className={
                          selectedTransaction.status === "Completed"
                            ? "bg-green-50 text-green-600 border-green-200"
                            : "bg-amber-50 text-amber-600 border-amber-200"
                        }
                      >
                        {selectedTransaction.status}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Amount</span>
                      <span className="text-lg font-bold">
                        ${selectedTransaction.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {selectedTransaction.memberName || "Unknown"}
                        </p>
                        {selectedTransaction.memberEmail && (
                          <p className="text-xs text-muted-foreground truncate">
                            {selectedTransaction.memberEmail}
                          </p>
                        )}
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(selectedTransaction.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Transaction Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Items Purchased</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedTransaction.id && (
                    <ExpandedTransactionItems transactionId={selectedTransaction.id} />
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button type="button" onClick={() => setTransactionDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Component for expanded transaction items
const ExpandedTransactionItems: React.FC<{ transactionId: string }> = ({ transactionId }) => {
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const { data: itemsData, error } = await supabase
          .from("checkout_items")
          .select("*")
          .eq("transaction_id", transactionId);

        if (error) throw error;

        // Fetch book covers
        const bookIds = itemsData?.map((item) => item.book_id).filter((id) => id) || [];
        if (bookIds.length > 0) {
          const { data: books } = await supabase
            .from("books")
            .select("id, cover_image")
            .in("id", bookIds);

          const coverMap: Record<string, string> = {};
          books?.forEach((book) => {
            coverMap[book.id] = book.cover_image;
          });

          setItems(
            itemsData?.map((item) => ({
              ...item,
              coverImage: item.book_id ? coverMap[item.book_id] : undefined,
            })) || []
          );
        } else {
          setItems(itemsData || []);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [transactionId]);

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground mt-2">Loading items...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-muted-foreground">No items found</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <h4 className="text-sm font-semibold text-muted-foreground mb-3">Purchased Items</h4>
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-3 p-3 bg-background rounded-lg border"
        >
          <div className="h-16 w-12 bg-muted rounded overflow-hidden shrink-0">
            {item.coverImage ? (
              <img
                src={item.coverImage}
                alt={item.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="font-medium text-sm mb-1 line-clamp-2">{item.title}</h5>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>${item.price.toFixed(2)}</span>
              <span>×</span>
              <span>Qty: {item.quantity}</span>
              <span className="text-foreground font-semibold">
                = ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
            {item.return_status && (
              <div className="mt-2">
                <Badge
                  variant="outline"
                  className={
                    item.return_status === "Returned"
                      ? "bg-green-50 text-green-600 border-green-200"
                      : "bg-blue-50 text-blue-600 border-blue-200"
                  }
                >
                  {item.return_status}
                </Badge>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Transactions;

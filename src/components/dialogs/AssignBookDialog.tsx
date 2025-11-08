// Shared dialog for assigning books to members
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpen,
  Check,
  CheckCircle2,
  Loader2,
  Search,
  ShoppingCart,
  User,
  X,
  AlertCircle,
} from "lucide-react";
import { Book, Member } from "@/lib/types";
import { canMemberBorrow, checkUnpaidLateFees } from "@/lib/borrowing-limits";
import { useAuth } from "@/components/AuthStatusProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AssignBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: Member;
  book?: Book;
  availableBooks: Book[];
  availableMembers?: Member[];
  categories: string[];
  isBookStore: boolean;
  borrowText: string;
  borrowedText: string;
  onAssign: (params: {
    bookIds?: string[];
    memberId?: string;
    type: "borrow" | "purchase";
    durationDays?: number;
  }) => void;
  isAssigning: boolean;
}

export function AssignBookDialog({
  open,
  onOpenChange,
  member,
  book,
  availableBooks,
  availableMembers = [],
  categories,
  isBookStore,
  borrowText,
  onAssign,
  isAssigning,
}: AssignBookDialogProps) {
  const { user } = useAuth();
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>(book ? [book.id] : []);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(member?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [assignType, setAssignType] = useState<"borrow" | "purchase">("borrow");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [borrowDuration, setBorrowDuration] = useState<string>("14");
  const [customDays, setCustomDays] = useState<string>("");
  const [borrowingLimitError, setBorrowingLimitError] = useState<string | null>(null);
  const [lateFeeError, setLateFeeError] = useState<string | null>(null);
  const [overrideLimit, setOverrideLimit] = useState(false);

  // Fetch library settings for borrowing limit
  const { data: librarySettings } = useQuery({
    queryKey: ["librarySettings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("library_settings")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return data || {
        member_borrowing_limit: 5,
        daily_late_fee_rate: 0.50,
        grace_period_days: 0,
        max_late_fee_cap: 10.00,
      };
    },
    enabled: !!user?.id && open,
  });

  // Check borrowing limits when member or assignment type changes
  useEffect(() => {
    const checkLimits = async () => {
      if (!member || assignType !== "borrow" || !user?.id || !librarySettings || overrideLimit) {
        setBorrowingLimitError(null);
        setLateFeeError(null);
        return;
      }

      // Check borrowing limit
      const limitCheck = await canMemberBorrow(
        member.id,
        user.id,
        librarySettings.member_borrowing_limit || 5
      );

      if (!limitCheck.allowed) {
        setBorrowingLimitError(
          `${limitCheck.reason}. Currently borrowed: ${limitCheck.current}/${limitCheck.limit}`
        );
      } else {
        setBorrowingLimitError(null);
      }

      // Check unpaid late fees
      const feeCheck = await checkUnpaidLateFees(member.id, user.id, 10);
      if (!feeCheck.allowed) {
        setLateFeeError(feeCheck.reason || "Member has unpaid late fees");
      } else {
        setLateFeeError(null);
      }
    };

    checkLimits();
  }, [member, assignType, user?.id, librarySettings, overrideLimit]);

  const getFilteredBooks = () => {
    return availableBooks.filter(
      (b) =>
        (searchQuery === "" ||
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.author.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (categoryFilter === "all" || categoryFilter === "" || b.category === categoryFilter) &&
        b.status !== "Needs Repair" // Exclude books needing repair
    );
  };

  const filteredMembers = useMemo(() => {
    if (!memberSearchQuery) return availableMembers;

    const query = memberSearchQuery.toLowerCase();
    return availableMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        (m.phone && m.phone.toLowerCase().includes(query))
    );
  }, [availableMembers, memberSearchQuery]);

  const handleToggleBookSelection = (bookId: string) => {
    setSelectedBookIds((prev) => {
      if (prev.includes(bookId)) {
        return prev.filter((id) => id !== bookId);
      } else {
        if (prev.length >= 5) {
          return prev;
        }
        return [...prev, bookId];
      }
    });
  };

  const handleAssign = () => {
    const days = borrowDuration === "custom"
      ? parseInt(customDays) || 14
      : parseInt(borrowDuration);

    if (member) {
      // Assigning books to a specific member
      onAssign({
        bookIds: selectedBookIds,
        type: assignType,
        durationDays: assignType === "borrow" ? days : undefined
      });
    } else if (book) {
      // Assigning a specific book to a member
      onAssign({
        memberId: selectedMemberId,
        type: assignType,
        durationDays: assignType === "borrow" ? days : undefined
      });
    }
  };

  const handleClose = () => {
    setSelectedBookIds(book ? [book.id] : []);
    setSelectedMemberId(member?.id || "");
    setSearchQuery("");
    setMemberSearchQuery("");
    setAssignType("borrow");
    setCategoryFilter("");
    setBorrowDuration("14");
    setCustomDays("");
    setBorrowingLimitError(null);
    setLateFeeError(null);
    setOverrideLimit(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl">
            {member ? `Assign Books to ${member.name}` : `Assign "${book?.title}" to Member`}
          </DialogTitle>
          <DialogDescription>
            Choose {member ? "books" : "a member"} to {assignType === "borrow" ? (isBookStore ? "rent" : "borrow") : "sell"}.
            {member && " You can select up to 5 books at once."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 px-6 py-4">
          {/* Borrowing Limit Warnings */}
          {member && assignType === "borrow" && (borrowingLimitError || lateFeeError) && !overrideLimit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                {borrowingLimitError && <p>{borrowingLimitError}</p>}
                {lateFeeError && <p>{lateFeeError}</p>}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOverrideLimit(true)}
                  className="mt-2 bg-background hover:bg-accent"
                >
                  Override Limit (Staff)
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Override Active Notice */}
          {overrideLimit && (
            <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-amber-900 dark:text-amber-100">
                  Staff override active - borrowing limits bypassed
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOverrideLimit(false)}
                  className="h-7 text-xs"
                >
                  Cancel Override
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Assignment Type Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Assignment Type</Label>
            <RadioGroup
              value={assignType}
              onValueChange={(value) => setAssignType(value as "borrow" | "purchase")}
              className="grid grid-cols-2 gap-3"
            >
              <div className="relative group">
                <RadioGroupItem value="borrow" id="borrow" className="peer sr-only" />
                <Label
                  htmlFor="borrow"
                  className="flex items-center gap-3 rounded-lg border-2 border-muted bg-popover px-4 py-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                >
                  <BookOpen className="h-5 w-5 shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{isBookStore ? "Rent" : "Borrow"}</div>
                    <div className="text-xs text-muted-foreground group-hover:text-accent-foreground transition-colors">
                      14 days return period
                    </div>
                  </div>
                  {assignType === "borrow" && (
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  )}
                </Label>
              </div>
              <div className="relative group">
                <RadioGroupItem value="purchase" id="purchase" className="peer sr-only" />
                <Label
                  htmlFor="purchase"
                  className="flex items-center gap-3 rounded-lg border-2 border-muted bg-popover px-4 py-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                >
                  <ShoppingCart className="h-5 w-5 shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Purchase</div>
                    <div className="text-xs text-muted-foreground group-hover:text-accent-foreground transition-colors">
                      One-time sale
                    </div>
                  </div>
                  {assignType === "purchase" && (
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  )}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Borrow Duration Selector - Only show for borrow type */}
          {assignType === "borrow" && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Borrow Duration</Label>
              <div className="grid grid-cols-2 gap-3">
                <Select value={borrowDuration} onValueChange={setBorrowDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days (1 week)</SelectItem>
                    <SelectItem value="14">14 days (2 weeks)</SelectItem>
                    <SelectItem value="21">21 days (3 weeks)</SelectItem>
                    <SelectItem value="30">30 days (1 month)</SelectItem>
                    <SelectItem value="60">60 days (2 months)</SelectItem>
                    <SelectItem value="90">90 days (3 months)</SelectItem>
                    <SelectItem value="custom">Custom days</SelectItem>
                  </SelectContent>
                </Select>

                {borrowDuration === "custom" && (
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    placeholder="Enter days"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    className="w-full"
                  />
                )}
              </div>
              {borrowDuration === "custom" && customDays && (
                <p className="text-xs text-muted-foreground">
                  Due date: {new Date(Date.now() + parseInt(customDays) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              )}
              {borrowDuration !== "custom" && (
                <p className="text-xs text-muted-foreground">
                  Due date: {new Date(Date.now() + parseInt(borrowDuration) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {member ? (
            // Show book selection when assigning to a member
            <>
              {/* Search and Filter */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title or author..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Books Summary */}
              {selectedBookIds.length > 0 && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        {selectedBookIds.length} {selectedBookIds.length === 1 ? "Book" : "Books"} Selected
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedBookIds([])}
                        className="h-7 text-xs"
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedBookIds.map((bookId) => {
                        const b = availableBooks.find((book) => book.id === bookId);
                        return b ? (
                          <Badge
                            key={bookId}
                            variant="secondary"
                            className="pl-2 pr-1 py-1 flex items-center gap-1.5"
                          >
                            <span className="truncate max-w-[150px]">{b.title}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleBookSelection(bookId);
                              }}
                              className="rounded-full hover:bg-muted p-0.5 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Books List */}
              <div className="space-y-2">
                {getFilteredBooks().length > 0 ? (
                  getFilteredBooks().map((b) => {
                    const isSelected = selectedBookIds.includes(b.id);
                    return (
                      <Card
                        key={b.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "hover:border-primary/50"
                          }`}
                        onClick={() => handleToggleBookSelection(b.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {/* Book Cover */}
                            <div className="relative h-24 w-16 shrink-0 rounded-md overflow-hidden bg-muted shadow-sm">
                              {b.coverImage ? (
                                <img
                                  src={b.coverImage}
                                  alt={b.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                              {isSelected && (
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                  <CheckCircle2 className="h-6 w-6 text-primary drop-shadow-lg" />
                                </div>
                              )}
                            </div>

                            {/* Book Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-base truncate mb-1">{b.title}</h4>
                              <p className="text-sm text-muted-foreground truncate mb-2">
                                by {b.author}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="text-xs font-normal">
                                  <BookOpen className="h-3 w-3 mr-1" />
                                  {b.stock} in stock
                                </Badge>
                                <Badge variant="outline" className="text-xs font-normal">
                                  {b.category}
                                </Badge>
                                {assignType === "purchase" && (
                                  <Badge variant="default" className="text-xs font-semibold">
                                    ${b.price.toFixed(2)}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Selection Indicator */}
                            <div className="flex items-center">
                              {isSelected ? (
                                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="h-4 w-4 text-primary-foreground" />
                                </div>
                              ) : (
                                <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Search className="h-12 w-12 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground font-medium">No books found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try adjusting your search or filters
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          ) : (
            // Show member selection when assigning a book
            <>
              {/* Member Search */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Select Member</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="pl-9 w-full"
                  />
                </div>
              </div>

              {/* Selected Member Summary */}
              {selectedMemberId && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">
                            {availableMembers.find((m) => m.id === selectedMemberId)?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {availableMembers.find((m) => m.id === selectedMemberId)?.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMemberId("")}
                        className="h-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Members List */}
              <div className="space-y-1.5">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((m) => {
                    const isSelected = selectedMemberId === m.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "hover:border-primary/50 hover:bg-accent/50"
                          }`}
                        onClick={() => setSelectedMemberId(m.id)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Selection Indicator */}
                          {isSelected ? (
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                              <Check className="h-3.5 w-3.5 text-primary-foreground" />
                            </div>
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                          )}

                          {/* Member Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{m.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <Badge
                          variant={m.status === "Active" ? "default" : "secondary"}
                          className="text-xs shrink-0 ml-2"
                        >
                          {m.status}
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Search className="h-12 w-12 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground font-medium">No members found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try adjusting your search
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-row justify-between items-center gap-3 sm:gap-0 px-6 pb-6">
          <div className="text-sm text-muted-foreground">
            {member && selectedBookIds.length > 0 && (
              <span>
                {selectedBookIds.length} of 5 books selected
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={
                (member && selectedBookIds.length === 0) ||
                (!member && !selectedMemberId) ||
                isAssigning ||
                (assignType === "borrow" && (borrowingLimitError || lateFeeError) && !overrideLimit)
              }
              className="min-w-[120px]"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {assignType === "borrow" ? borrowText : "Purchase"}{" "}
                  {member && selectedBookIds.length > 1 ? `${selectedBookIds.length} Books` : "Book"}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

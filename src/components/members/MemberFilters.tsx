import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MemberStatus } from "@/lib/types";
import { X } from "lucide-react";

interface MemberFiltersProps {
  statusFilter: MemberStatus | null;
  dateFilter: string;
  booksFilter: string;
  overdueFilter: boolean;
  onStatusChange: (status: MemberStatus | null) => void;
  onDateChange: (date: string) => void;
  onBooksChange: (books: string) => void;
  onOverdueChange: (overdue: boolean) => void;
  onClearFilters: () => void;
}

const MemberFilters = ({
  statusFilter,
  dateFilter,
  booksFilter,
  overdueFilter,
  onStatusChange,
  onDateChange,
  onBooksChange,
  onOverdueChange,
  onClearFilters,
}: MemberFiltersProps) => {
  const hasActiveFilters =
    statusFilter !== null ||
    dateFilter !== "all" ||
    booksFilter !== "all" ||
    overdueFilter;

  return (
    <div className="flex flex-wrap gap-2">
      <Select
        value={statusFilter || "all"}
        onValueChange={(value) =>
          onStatusChange(value === "all" ? null : (value as MemberStatus))
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Active">Active</SelectItem>
          <SelectItem value="Inactive">Inactive</SelectItem>
          <SelectItem value="Suspended">Suspended</SelectItem>
          <SelectItem value="Banned">Banned</SelectItem>
        </SelectContent>
      </Select>

      <Select value={dateFilter} onValueChange={onDateChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Joined" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="year">This Year</SelectItem>
        </SelectContent>
      </Select>

      <Select value={booksFilter} onValueChange={onBooksChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Books" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Books</SelectItem>
          <SelectItem value="none">No Books</SelectItem>
          <SelectItem value="some">Has Books</SelectItem>
          <SelectItem value="many">3+ Books</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant={overdueFilter ? "default" : "outline"}
        size="sm"
        onClick={() => onOverdueChange(!overdueFilter)}
      >
        Overdue Only
      </Button>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default MemberFilters;

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, List } from "lucide-react";
import { BookCategory, BookStatus } from "@/lib/types";

interface BookFiltersProps {
  categoryFilter: string;
  publisherFilter: string;
  yearFilter: string;
  statusFilter: string;
  viewMode: "grid" | "list";
  categories: BookCategory[];
  publishers: string[];
  years: number[];
  statuses: BookStatus[];
  onCategoryChange: (value: string) => void;
  onPublisherChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onViewModeChange: (value: "grid" | "list") => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function BookFilters({
  categoryFilter,
  publisherFilter,
  yearFilter,
  statusFilter,
  viewMode,
  categories,
  publishers,
  years,
  statuses,
  onCategoryChange,
  onPublisherChange,
  onYearChange,
  onStatusChange,
  onViewModeChange,
  onClearFilters,
  hasActiveFilters,
}: BookFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
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

        <Select value={publisherFilter} onValueChange={onPublisherChange}>
          <SelectTrigger>
            <SelectValue placeholder="Publisher" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Publishers</SelectItem>
            {publishers.map((publisher) => (
              <SelectItem key={publisher} value={publisher}>
                {publisher}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={yearFilter} onValueChange={onYearChange}>
          <SelectTrigger>
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="flex-1"
            disabled={!hasActiveFilters}
          >
            Clear Filters
          </Button>
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => value && onViewModeChange(value as "list" | "grid")}
          >
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
}

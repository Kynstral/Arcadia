import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { BookStatus, BookCategory } from "@/lib/types";
import { Loader2, AlertCircle } from "lucide-react";

interface BulkEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onSubmit: (updates: BulkEditData) => void;
  isLoading?: boolean;
}

export interface BulkEditData {
  category?: BookCategory;
  status?: BookStatus;
  publisher?: string;
  location?: string;
  stock?: number;
}

const BOOK_CATEGORIES: BookCategory[] = [
  "Fiction",
  "Non-Fiction",
  "Science Fiction",
  "Fantasy",
  "Mystery",
  "Thriller",
  "Romance",
  "Horror",
  "Biography",
  "History",
  "Science",
  "Technology",
  "Business",
  "Self-Help",
  "Children's Books",
  "Young Adult",
  "Poetry",
  "Drama",
  "Comics",
  "Graphic Novels",
];

const BOOK_STATUSES: BookStatus[] = [
  "Available",
  "Checked Out",
  "On Hold",
  "Processing",
  "Lost",
  "Out of Stock",
];

export function BulkEditModal({
  open,
  onOpenChange,
  selectedCount,
  onSubmit,
  isLoading = false,
}: BulkEditModalProps) {
  const [enabledFields, setEnabledFields] = useState({
    category: false,
    status: false,
    publisher: false,
    location: false,
    stock: false,
  });

  const [formData, setFormData] = useState<BulkEditData>({
    category: undefined,
    status: undefined,
    publisher: "",
    location: "",
    stock: 0,
  });

  const handleToggleField = (field: keyof typeof enabledFields) => {
    setEnabledFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = () => {
    const updates: BulkEditData = {};

    if (enabledFields.category && formData.category) {
      updates.category = formData.category;
    }
    if (enabledFields.status && formData.status) {
      updates.status = formData.status;
    }
    if (enabledFields.publisher && formData.publisher) {
      updates.publisher = formData.publisher;
    }
    if (enabledFields.location && formData.location) {
      updates.location = formData.location;
    }
    if (enabledFields.stock && formData.stock !== undefined) {
      updates.stock = formData.stock;
    }

    onSubmit(updates);
  };

  const hasEnabledFields = Object.values(enabledFields).some((v) => v);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Edit ({selectedCount} books selected)</DialogTitle>
          <DialogDescription>
            Select which fields you want to update for all selected books.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Category */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="category-enabled"
              checked={enabledFields.category}
              onCheckedChange={() => handleToggleField("category")}
              className="mt-1"
            />
            <div className="flex-1 space-y-2">
              <Label
                htmlFor="category"
                className={!enabledFields.category ? "text-muted-foreground" : ""}
              >
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value as BookCategory })
                }
                disabled={!enabledFields.category}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {BOOK_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="status-enabled"
              checked={enabledFields.status}
              onCheckedChange={() => handleToggleField("status")}
              className="mt-1"
            />
            <div className="flex-1 space-y-2">
              <Label
                htmlFor="status"
                className={!enabledFields.status ? "text-muted-foreground" : ""}
              >
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as BookStatus })
                }
                disabled={!enabledFields.status}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {BOOK_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stock */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="stock-enabled"
              checked={enabledFields.stock}
              onCheckedChange={() => handleToggleField("stock")}
              className="mt-1"
            />
            <div className="flex-1 space-y-2">
              <Label
                htmlFor="stock"
                className={!enabledFields.stock ? "text-muted-foreground" : ""}
              >
                Stock Quantity
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
                }
                disabled={!enabledFields.stock}
                placeholder="Enter stock quantity"
              />
            </div>
          </div>

          {/* Publisher */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="publisher-enabled"
              checked={enabledFields.publisher}
              onCheckedChange={() => handleToggleField("publisher")}
              className="mt-1"
            />
            <div className="flex-1 space-y-2">
              <Label
                htmlFor="publisher"
                className={!enabledFields.publisher ? "text-muted-foreground" : ""}
              >
                Publisher
              </Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={(e) =>
                  setFormData({ ...formData, publisher: e.target.value })
                }
                disabled={!enabledFields.publisher}
                placeholder="Enter publisher name"
              />
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="location-enabled"
              checked={enabledFields.location}
              onCheckedChange={() => handleToggleField("location")}
              className="mt-1"
            />
            <div className="flex-1 space-y-2">
              <Label
                htmlFor="location"
                className={!enabledFields.location ? "text-muted-foreground" : ""}
              >
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                disabled={!enabledFields.location}
                placeholder="Enter location (e.g., Shelf A-12)"
              />
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-md">
            <AlertCircle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Only checked fields will be updated for all selected books.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!hasEnabledFields || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              `Update ${selectedCount} Book${selectedCount > 1 ? "s" : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

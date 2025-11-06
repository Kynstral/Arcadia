import { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Check, X } from "lucide-react";
import { BookStatus } from "@/lib/types";

interface InlineEditCellProps {
  value: string | number;
  bookId: string;
  field: "stock" | "price" | "status" | "location";
  type?: "text" | "number" | "select";
  onSave: (bookId: string, field: string, value: any) => Promise<void>;
  disabled?: boolean;
}

const BOOK_STATUSES: BookStatus[] = [
  "Available",
  "Checked Out",
  "On Hold",
  "Processing",
  "Lost",
  "Out of Stock",
];

export function InlineEditCell({
  value,
  bookId,
  field,
  type = "text",
  onSave,
  disabled = false,
}: InlineEditCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current && type !== "select") {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing, type]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let processedValue = editValue;

      // Validate and process based on type
      if (type === "number") {
        const num = parseFloat(editValue.toString());
        if (isNaN(num) || num < 0) {
          throw new Error("Please enter a valid positive number");
        }
        processedValue = num;
      }

      await onSave(bookId, field, processedValue);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to save");
      setEditValue(value); // Revert on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (disabled) {
    return <span className="text-muted-foreground">{value}</span>;
  }

  if (!isEditing) {
    return (
      <div
        className="cursor-pointer hover:bg-accent/50 px-2 py-1 rounded transition-colors min-h-[32px] flex items-center"
        onDoubleClick={() => setIsEditing(true)}
        title="Double-click to edit"
      >
        {value || <span className="text-muted-foreground italic">Empty</span>}
      </div>
    );
  }

  if (type === "select" && field === "status") {
    return (
      <div className="flex items-center gap-1">
        <Select
          value={editValue.toString()}
          onValueChange={(val) => {
            setEditValue(val);
            // Auto-save on select change
            onSave(bookId, field, val).then(() => setIsEditing(false));
          }}
          disabled={isSaving}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BOOK_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          onClick={handleCancel}
          className="p-1 hover:bg-accent rounded"
          disabled={isSaving}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={isSaving}
        className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        min={type === "number" ? "0" : undefined}
        step={field === "price" ? "0.01" : "1"}
      />
      {isSaving ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <>
          <button
            onClick={handleSave}
            className="p-1 hover:bg-accent rounded text-green-600"
            disabled={isSaving}
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-accent rounded text-destructive"
            disabled={isSaving}
          >
            <X className="h-4 w-4" />
          </button>
        </>
      )}
      {error && (
        <span className="text-xs text-destructive absolute mt-8">{error}</span>
      )}
    </div>
  );
}

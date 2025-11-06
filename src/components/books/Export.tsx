import { useState } from "react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import * as XLSX from "xlsx";

interface EnhancedExportProps {
  selectedBooks?: string[];
}

const EXPORT_FIELDS = [
  { id: "title", label: "Title", default: true },
  { id: "author", label: "Author", default: true },
  { id: "isbn", label: "ISBN", default: true },
  { id: "category", label: "Category", default: true },
  { id: "publication_year", label: "Publication Year", default: true },
  { id: "publisher", label: "Publisher", default: true },
  { id: "description", label: "Description", default: false },
  { id: "price", label: "Price", default: true },
  { id: "status", label: "Status", default: true },
  { id: "stock", label: "Stock", default: true },
  { id: "language", label: "Language", default: false },
  { id: "page_count", label: "Page Count", default: false },
  { id: "location", label: "Location", default: false },
  { id: "cover_image", label: "Cover Image URL", default: false },
  { id: "tags", label: "Tags", default: false },
  { id: "rating", label: "Rating", default: false },
];

export function Export({ selectedBooks }: EnhancedExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState<"csv" | "json" | "excel">("csv");
  const [selectedFields, setSelectedFields] = useState<string[]>(
    EXPORT_FIELDS.filter((f) => f.default).map((f) => f.id),
  );
  const { toast } = useToast();
  const { user } = useAuth();

  const toggleField = (fieldId: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldId)
        ? prev.filter((id) => id !== fieldId)
        : [...prev, fieldId],
    );
  };

  const exportBooks = async () => {
    try {
      setIsExporting(true);

      let query = supabase
        .from("books")
        .select("*")
        .is("deleted_at", null)
        .order("title");

      if (user) {
        query = query.eq("user_id", user.id);
      }

      if (selectedBooks && selectedBooks.length > 0) {
        query = query.in("id", selectedBooks);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "No books to export",
          description: "There are no books available to export",
        });
        return;
      }

      // Filter data to only include selected fields
      const filteredData = data.map((book) => {
        const filtered: any = {};
        selectedFields.forEach((field) => {
          if (field === "tags" && Array.isArray(book[field])) {
            filtered[field] = book[field].join("; ");
          } else {
            filtered[field] = book[field] || "";
          }
        });
        return filtered;
      });

      const timestamp = new Date().toISOString().slice(0, 10);
      const prefix = selectedBooks?.length
        ? `selected_${selectedBooks.length}_books`
        : "all_books";

      if (format === "csv") {
        exportAsCSV(filteredData, `${prefix}_${timestamp}.csv`);
      } else if (format === "json") {
        exportAsJSON(filteredData, `${prefix}_${timestamp}.json`);
      } else if (format === "excel") {
        exportAsExcel(filteredData, `${prefix}_${timestamp}.xlsx`);
      }

      toast({
        title: "Export successful",
        description: `${data.length} books exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Error exporting books:", error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "An error occurred while exporting books",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsCSV = (data: any[], filename: string) => {
    const headers = selectedFields.join(",");
    const rows = data.map((row) =>
      selectedFields
        .map((field) => {
          const value = String(row[field] || "");
          return `"${value.replace(/"/g, '""')}"`;
        })
        .join(","),
    );

    const csvContent = [headers, ...rows].join("\n");
    downloadFile(csvContent, filename, "text/csv;charset=utf-8;");
  };

  const exportAsJSON = (data: any[], filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, filename, "application/json;charset=utf-8;");
  };

  const exportAsExcel = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Books");

    // Auto-size columns
    const maxWidth = 50;
    const colWidths = selectedFields.map((field) => {
      const maxLength = Math.max(
        field.length,
        ...data.map((row) => String(row[field] || "").length),
      );
      return { wch: Math.min(maxLength + 2, maxWidth) };
    });
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, filename);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Export Books</h3>
          <p className="text-sm text-muted-foreground">
            {selectedBooks && selectedBooks.length > 0
              ? `Export ${selectedBooks.length} selected book(s)`
              : "Export all your books"}
          </p>
        </div>

        <div className="space-y-2">
          <Label>Export Format</Label>
          <Select value={format} onValueChange={(v: any) => setFormat(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
              <SelectItem value="json">JSON (JavaScript Object)</SelectItem>
              <SelectItem value="excel">Excel (XLSX)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Fields to Export</Label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded">
            {EXPORT_FIELDS.map((field) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Checkbox
                  id={field.id}
                  checked={selectedFields.includes(field.id)}
                  onCheckedChange={() => toggleField(field.id)}
                />
                <label
                  htmlFor={field.id}
                  className="text-sm cursor-pointer select-none"
                >
                  {field.label}
                </label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedFields.length} field(s) selected
          </p>
        </div>

        <Button
          onClick={exportBooks}
          disabled={isExporting || selectedFields.length === 0}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : `Export as ${format.toUpperCase()}`}
        </Button>
      </CardContent>
    </Card>
  );
}

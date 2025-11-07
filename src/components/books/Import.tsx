import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, FileText, Info, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import { Book, BookCategory, BookStatus } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { checkDuplicates } from "@/lib/duplicate-detection";
import { DuplicateDetectionDialog } from "./DuplicateDetectionDialog";

type BookRow = {
  title: string;
  author: string;
  isbn: string;
  category: string;
  publication_year: string | number;
  publisher: string;
  description?: string;
  price?: string | number;
  status?: string;
  stock?: string | number;
  language?: string;
  page_count?: string | number;
  location?: string;
  cover_image?: string;
  tags?: string | string[];
  rating?: string | number;
};

export function Import() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ success: number; failed: number }>({
    success: 0,
    failed: 0,
  });
  const [showResults, setShowResults] = useState(false);
  const [detectedFormat, setDetectedFormat] = useState<string>("");
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [duplicateBooks, setDuplicateBooks] = useState<
    Array<{ isbn: string; title: string; author: string; coverImage?: string }>
  >([]);
  const [pendingImport, setPendingImport] = useState<{
    rows: BookRow[];
    duplicateISBNs: Set<string>;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length) {
      processFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length) {
      processFile(files[0]);
    }
  };

  const validateRow = (row: BookRow): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!row.title) errors.push("Title is required");
    if (!row.author) errors.push("Author is required");
    if (!row.isbn) errors.push("ISBN is required");
    if (!row.category) errors.push("Category is required");
    if (!row.publication_year) errors.push("Publication year is required");
    if (!row.publisher) errors.push("Publisher is required");

    if (row.publication_year && isNaN(Number(row.publication_year))) {
      errors.push("Publication year must be a number");
    }

    if (row.price && isNaN(Number(row.price))) {
      errors.push("Price must be a number");
    }

    if (row.stock && isNaN(Number(row.stock))) {
      errors.push("Stock must be a number");
    }

    if (row.page_count && isNaN(Number(row.page_count))) {
      errors.push("Page count must be a number");
    }

    const validCategories = [
      "Fiction",
      "Non-Fiction",
      "Science Fiction",
      "Mystery",
      "Romance",
      "Biography",
      "History",
      "Self-Help",
      "Business",
      "Children",
      "Young Adult",
      "Poetry",
      "Reference",
      "Art",
      "Travel",
      "Religion",
      "Cooking",
      "Science",
      "Technology",
      "Other",
    ];

    if (row.category && !validCategories.includes(row.category)) {
      errors.push(`Category must be one of: ${validCategories.join(", ")}`);
    }

    const validStatuses = [
      "Available",
      "Checked Out",
      "On Hold",
      "Processing",
      "Lost",
      "Out of Stock",
    ];

    if (row.status && !validStatuses.includes(row.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(", ")}`);
    }

    return { valid: errors.length === 0, errors };
  };

  const parseCsvFile = (text: string): BookRow[] => {
    const rows = text.split("\n");
    const headers = rows[0]
      .split(",")
      .map((header) => header.trim().toLowerCase().replace(/"/g, ""));

    const parsedRows: BookRow[] = [];

    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue;

      // Handle CSV with quoted values
      const regex = /("(?:[^"]|"")*"|[^,]+)(?=\s*,|\s*$)/g;
      const values: string[] = [];
      let match: RegExpExecArray | null;
      while ((match = regex.exec(rows[i])) !== null) {
        let value = match[1].trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1).replace(/""/g, '"');
        }
        values.push(value);
      }

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });

      parsedRows.push(row as BookRow);
    }

    return parsedRows;
  };

  const parseJsonFile = (text: string): BookRow[] => {
    try {
      const data = JSON.parse(text);
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      throw new Error("Invalid JSON format");
    }
  };

  const parseExcelFile = async (file: File): Promise<BookRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          resolve(jsonData as BookRow[]);
        } catch (error) {
          reject(new Error("Failed to parse Excel file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  };

  const convertToBook = (
    row: BookRow,
    userId: string
  ): Omit<Book, "id" | "created_at" | "updated_at"> => {
    // Handle tags - could be string or array
    let tags: string[] = [];
    if (typeof row.tags === "string") {
      tags = row.tags
        .split(";")
        .map((tag) => tag.trim())
        .filter(Boolean);
    } else if (Array.isArray(row.tags)) {
      tags = row.tags;
    }

    return {
      title: row.title,
      author: row.author,
      isbn: row.isbn,
      category: row.category as BookCategory,
      publicationYear: parseInt(String(row.publication_year)),
      publisher: row.publisher,
      description: row.description || "",
      price: row.price ? parseFloat(String(row.price)) : 0,
      status: row.status ? (row.status as BookStatus) : "Available",
      stock: row.stock ? parseInt(String(row.stock)) : 0,
      language: row.language || "",
      pageCount: row.page_count ? parseInt(String(row.page_count)) : 0,
      location: row.location || "",
      coverImage: row.cover_image || "",
      tags,
      rating: row.rating ? parseFloat(String(row.rating)) : 0,
      salesCount: 0,
      user_id: userId,
    };
  };

  const detectFileFormat = (fileName: string): "csv" | "json" | "excel" | null => {
    const fileExt = fileName.toLowerCase().split(".").pop();

    if (fileExt === "csv") return "csv";
    if (fileExt === "json") return "json";
    if (fileExt === "xlsx" || fileExt === "xls") return "excel";

    return null;
  };

  const processFile = async (file: File) => {
    const format = detectFileFormat(file.name);

    if (!format) {
      toast({
        variant: "destructive",
        title: "Unsupported file format",
        description: "Please upload a CSV, JSON, or Excel file (.csv, .json, .xlsx, .xls)",
      });
      return;
    }

    setDetectedFormat(format.toUpperCase());

    try {
      setIsProcessing(true);
      setShowResults(false);
      setProgress(0);

      let rows: BookRow[] = [];

      if (format === "csv") {
        const text = await file.text();
        rows = parseCsvFile(text);
      } else if (format === "json") {
        const text = await file.text();
        rows = parseJsonFile(text);
      } else if (format === "excel") {
        rows = await parseExcelFile(file);
      }

      if (rows.length === 0) {
        toast({
          variant: "destructive",
          title: "Empty file",
          description: "The file doesn't contain any data",
        });
        setIsProcessing(false);
        return;
      }

      // Check for duplicates
      setIsCheckingDuplicates(true);
      setDuplicateDialogOpen(true);

      const duplicateISBNs = new Set<string>();
      const duplicateBooksList: Array<{
        isbn: string;
        title: string;
        author: string;
        coverImage?: string;
      }> = [];

      for (const row of rows) {
        if (row.isbn && row.isbn.trim()) {
          const duplicateCheck = await checkDuplicates({
            isbn: row.isbn.trim(),
          });

          if (duplicateCheck.exactISBN.length > 0) {
            duplicateISBNs.add(row.isbn.trim());
            duplicateBooksList.push({
              isbn: row.isbn.trim(),
              title: row.title || "Unknown Title",
              author: row.author || "Unknown Author",
              coverImage: row.cover_image || "",
            });
          }
        }
      }

      setIsCheckingDuplicates(false);

      // If duplicates found, show dialog with details
      if (duplicateBooksList.length > 0) {
        setDuplicateBooks(duplicateBooksList);
        setPendingImport({ rows, duplicateISBNs });
        setIsProcessing(false);
        return;
      }

      // No duplicates, close dialog and proceed
      setDuplicateDialogOpen(false);

      // No duplicates, proceed with import
      await importBooks(rows, new Set());
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        variant: "destructive",
        title: "Error processing file",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const importBooks = async (rows: BookRow[], skipISBNs: Set<string>) => {
    try {
      setIsProcessing(true);
      setDuplicateDialogOpen(false);
      setProgress(0);

      let successCount = 0;
      let failCount = 0;
      let skippedCount = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        // Skip if ISBN is in the skip list
        if (row.isbn && skipISBNs.has(row.isbn.trim())) {
          skippedCount++;
          setProgress(Math.round(((i + 1) / rows.length) * 100));
          continue;
        }

        const { valid, errors } = validateRow(row);

        if (valid && user) {
          const book = convertToBook(row, user.id);

          const { error } = await supabase.from("books").insert([
            {
              title: book.title,
              author: book.author,
              isbn: book.isbn,
              category: book.category,
              publication_year: book.publicationYear,
              publisher: book.publisher,
              description: book.description,
              price: book.price,
              status: book.status,
              stock: book.stock,
              language: book.language,
              page_count: book.pageCount,
              location: book.location,
              cover_image: book.coverImage,
              tags: book.tags,
              rating: book.rating,
              user_id: book.user_id,
            },
          ]);

          if (error) {
            console.error(`Error inserting book ${book.title}:`, error);
            failCount++;
          } else {
            successCount++;
          }
        } else {
          console.error(`Invalid row ${i + 1}:`, errors);
          failCount++;
        }

        setProgress(Math.round(((i + 1) / rows.length) * 100));
      }

      setResults({ success: successCount, failed: failCount });
      setShowResults(true);

      // Refresh the book list
      queryClient.invalidateQueries({ queryKey: ["books"] });

      toast({
        title: "Import completed",
        description: `${successCount} books imported${skippedCount > 0 ? `, ${skippedCount} skipped` : ""}${failCount > 0 ? `, ${failCount} failed` : ""}`,
      });
    } catch (error) {
      console.error("Error importing books:", error);
      toast({
        variant: "destructive",
        title: "Error importing books",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsProcessing(false);
      setPendingImport(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleContinueWithDuplicates = () => {
    if (pendingImport) {
      importBooks(pendingImport.rows, new Set());
    }
  };

  const handleSkipDuplicates = () => {
    if (pendingImport) {
      importBooks(pendingImport.rows, pendingImport.duplicateISBNs);
    }
  };

  const handleCancelImport = () => {
    setDuplicateDialogOpen(false);
    setPendingImport(null);
    setDuplicateBooks([]);
    setIsProcessing(false);
    setIsCheckingDuplicates(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Import Books</h3>
          <p className="text-sm text-muted-foreground">
            Upload CSV, JSON, or Excel files - format will be auto-detected
          </p>
        </div>

        <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
          <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium">Required fields:</p>
            <p>title, author, isbn, category, publication_year, publisher</p>
            <p className="font-medium mt-2">Optional fields:</p>
            <p>
              description, price, status, stock, language, page_count, location, cover_image, tags,
              rating
            </p>
          </div>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted hover:border-muted-foreground/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-base font-medium mb-2">Drag & Drop Your File</h4>
          <p className="text-sm text-muted-foreground mb-1">Supports CSV, JSON, and Excel files</p>
          {detectedFormat && (
            <p className="text-xs text-primary font-medium mb-3">Detected: {detectedFormat}</p>
          )}
          <Button onClick={handleButtonClick} disabled={isProcessing} className="mx-auto mt-3">
            <FileText className="h-4 w-4 mr-2" />
            Select File
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".csv,.json,.xlsx,.xls"
            className="hidden"
            disabled={isProcessing}
          />
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Importing books...</p>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">{progress}% complete</p>
          </div>
        )}

        {showResults && (
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <p className="text-sm font-medium">{results.success} books imported successfully</p>
            </div>
            {results.failed > 0 && (
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-sm font-medium">{results.failed} books failed to import</p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Duplicate Detection Dialog */}
      <DuplicateDetectionDialog
        open={duplicateDialogOpen}
        onOpenChange={setDuplicateDialogOpen}
        duplicates={duplicateBooks}
        totalBooks={pendingImport?.rows.length || 0}
        isChecking={isCheckingDuplicates}
        onContinue={handleContinueWithDuplicates}
        onSkip={handleSkipDuplicates}
        onCancel={handleCancelImport}
      />
    </Card>
  );
}

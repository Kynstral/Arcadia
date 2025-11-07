import { useState, useRef } from "react";
import { Printer, Download } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Barcode from "react-barcode";

interface PrintLabelsProps {
  selectedBooks?: string[];
}

const LABEL_TEMPLATES = {
  "avery-5160": {
    name: 'Avery 5160 (1" x 2-5/8")',
    width: 2.625,
    height: 1,
    columns: 3,
    rows: 10,
    marginTop: 0.5,
    marginLeft: 0.1875,
    gapX: 0.125,
    gapY: 0.125,
  },
  "avery-5163": {
    name: 'Avery 5163 (2" x 4")',
    width: 4,
    height: 2,
    columns: 2,
    rows: 5,
    marginTop: 0.5,
    marginLeft: 0.15625,
    gapX: 0.14,
    gapY: 0.14,
  },
  "avery-5167": {
    name: 'Avery 5167 (1/2" x 1-3/4")',
    width: 1.75,
    height: 0.5,
    columns: 4,
    rows: 20,
    marginTop: 0.5,
    marginLeft: 0.28125,
    gapX: 0.125,
    gapY: 0,
  },
};

export function PrintLabels({ selectedBooks }: PrintLabelsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [template, setTemplate] = useState<keyof typeof LABEL_TEMPLATES>("avery-5160");
  const [books, setBooks] = useState<any[]>([]);
  const [libraryName, setLibraryName] = useState<string>("");
  const { toast } = useToast();
  const { user } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  const loadBooks = async () => {
    try {
      setIsLoading(true);

      // Get library/store name from user metadata or email
      if (user) {
        // Try to get from user metadata first
        const metadata = user.user_metadata;
        if (metadata?.library_name) {
          setLibraryName(metadata.library_name);
        } else if (metadata?.full_name) {
          setLibraryName(metadata.full_name);
        } else {
          // Fallback to email username
          const emailName = user.email?.split("@")[0] || "Library";
          // Capitalize first letter
          setLibraryName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
        }
      }

      let query = supabase.from("books").select("*").is("deleted_at", null).order("title");

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
          title: "No books found",
          description: "There are no books available to print labels for",
        });
        return;
      }

      setBooks(data);
      setShowPreview(true);
    } catch (error) {
      console.error("Error loading books:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load books for printing",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      const jsPDF = (await import("jspdf")).default;
      const JsBarcode = (await import("jsbarcode")).default;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: "letter",
      });

      const config = templateConfig;
      const isLargeLabel = template === "avery-5163";
      const isSmallLabel = template === "avery-5167";

      let currentX = config.marginLeft;
      let currentY = config.marginTop;
      let labelCount = 0;
      const labelsPerPage = config.columns * config.rows;

      for (const book of books) {
        // Add new page if needed
        if (labelCount > 0 && labelCount % labelsPerPage === 0) {
          pdf.addPage();
          currentX = config.marginLeft;
          currentY = config.marginTop;
        }

        let textY = currentY + 0.1;

        // Header for large labels
        if (isLargeLabel) {
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(232, 155, 115); // #E89B73
          pdf.text("Arcadia", currentX + 0.15, textY);

          if (book.price > 0) {
            pdf.setFontSize(12);
            pdf.setTextColor(141, 179, 139); // #8DB38B
            pdf.text(`$${book.price.toFixed(2)}`, currentX + config.width - 0.1, textY, {
              align: "right",
            });
          }

          pdf.setDrawColor(224, 224, 224);
          pdf.line(currentX + 0.1, textY + 0.05, currentX + config.width - 0.1, textY + 0.05);
          textY += 0.15;
        }

        // Title
        pdf.setTextColor(0, 0, 0);
        const titleText =
          book.title.length > (isSmallLabel ? 30 : isLargeLabel ? 50 : 35)
            ? book.title.substring(0, isSmallLabel ? 30 : isLargeLabel ? 50 : 35) + "..."
            : book.title;

        if (isSmallLabel) {
          pdf.setFontSize(6);
          pdf.setFont("helvetica", "bold");
          pdf.text(titleText, currentX + config.width / 2, textY, { align: "center" });
          textY += 0.08;
        } else if (isLargeLabel) {
          // Large label layout
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          const titleLines = pdf.splitTextToSize(titleText, config.width - 1.2);
          pdf.text(titleLines[0], currentX + 0.1, textY);
          textY += 0.15;

          pdf.setFontSize(8);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(51, 51, 51);
          pdf.text(book.author || "", currentX + 0.1, textY);
          textY += 0.12;

          if (libraryName) {
            pdf.setFontSize(7);
            pdf.setTextColor(102, 102, 102);
            pdf.setFont("helvetica", "italic");
            pdf.text(libraryName, currentX + 0.1, textY);
          }

          // Category box
          if (book.category) {
            const catX = currentX + config.width - 1;
            const catY = currentY + 0.35;
            pdf.setDrawColor(0, 0, 0);
            pdf.setLineWidth(0.01);
            pdf.roundedRect(catX, catY, 0.9, 0.15, 0.03, 0.03);
            pdf.setFontSize(7);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(0, 0, 0);
            pdf.text(book.category, catX + 0.45, catY + 0.1, { align: "center" });
          }

          // Year
          if (book.publication_year) {
            const yearX = currentX + config.width - 1;
            const yearY = currentY + 0.55;
            pdf.setFontSize(7);
            pdf.setFont("helvetica", "normal");
            pdf.text(String(book.publication_year), yearX + 0.45, yearY, { align: "center" });
          }
        } else {
          // Medium label (5160) - compact layout
          pdf.setFontSize(7);
          pdf.setFont("helvetica", "bold");
          const titleLines = pdf.splitTextToSize(titleText, config.width - 0.2);
          pdf.text(titleLines[0], currentX + 0.1, textY);
          textY += 0.1;

          pdf.setFontSize(6);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(51, 51, 51);
          const authorText =
            book.author && book.author.length > 30
              ? book.author.substring(0, 30) + "..."
              : book.author || "";
          pdf.text(authorText, currentX + 0.1, textY);
        }

        // Generate barcode
        if (book.isbn) {
          try {
            const canvas = document.createElement("canvas");
            JsBarcode(canvas, book.isbn, {
              format: "CODE128",
              width: isSmallLabel ? 1 : isLargeLabel ? 1.5 : 1,
              height: isSmallLabel ? 20 : isLargeLabel ? 40 : 22,
              displayValue: !isSmallLabel,
              fontSize: isSmallLabel ? 8 : isLargeLabel ? 11 : 8,
              margin: 0,
            });

            const barcodeImg = canvas.toDataURL("image/png");
            const barcodeWidth = isSmallLabel
              ? config.width - 0.15
              : isLargeLabel
                ? config.width - 0.3
                : config.width - 0.2;
            const barcodeHeight = isSmallLabel ? 0.18 : isLargeLabel ? 0.35 : 0.22;
            const barcodeX = currentX + (config.width - barcodeWidth) / 2;
            const barcodeY =
              currentY + config.height - barcodeHeight - (isSmallLabel ? 0.05 : 0.08);

            pdf.addImage(barcodeImg, "PNG", barcodeX, barcodeY, barcodeWidth, barcodeHeight);
          } catch (error) {
            console.error("Error generating barcode:", error);
          }
        }

        // Move to next label position
        labelCount++;
        currentX += config.width + config.gapX;

        // Move to next row if needed
        if (labelCount % config.columns === 0) {
          currentX = config.marginLeft;
          currentY += config.height + config.gapY;
        }
      }

      pdf.save(`book-labels-${template}-${new Date().getTime()}.pdf`);

      toast({
        title: "Downloaded",
        description: "Labels PDF has been downloaded",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download PDF",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const templateConfig = LABEL_TEMPLATES[template];

  return (
    <>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Print Labels</h3>
            <p className="text-sm text-muted-foreground">
              {selectedBooks && selectedBooks.length > 0
                ? `Print labels for ${selectedBooks.length} selected book(s)`
                : "Print labels for all your books"}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Label Template</Label>
            <Select value={template} onValueChange={(v: any) => setTemplate(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LABEL_TEMPLATES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={loadBooks} disabled={isLoading} className="w-full">
            <Printer className="h-4 w-4 mr-2" />
            {isLoading ? "Loading..." : "Preview Labels"}
          </Button>
        </CardContent>
      </Card>

      {/* Print Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Print Labels Preview</DialogTitle>
            <DialogDescription>
              {books.length} label(s) using {templateConfig.name}
            </DialogDescription>
          </DialogHeader>

          <div className="border rounded p-4 bg-white">
            <div
              ref={printRef}
              className="print-labels"
              style={{
                width: "8.5in",
                minHeight: "11in",
                padding: `${templateConfig.marginTop}in ${templateConfig.marginLeft}in`,
                display: "grid",
                gridTemplateColumns: `repeat(${templateConfig.columns}, ${templateConfig.width}in)`,
                gridTemplateRows: `repeat(${templateConfig.rows}, ${templateConfig.height}in)`,
                columnGap: `${templateConfig.gapX}in`,
                rowGap: `${templateConfig.gapY}in`,
              }}
            >
              {books.map((book) => {
                const isLargeLabel = template === "avery-5163"; // 2x4" labels
                const isSmallLabel = template === "avery-5167"; // 1/2" x 1-3/4" labels

                return (
                  <div
                    key={book.id}
                    className="label"
                    style={{
                      width: `${templateConfig.width}in`,
                      height: `${templateConfig.height}in`,
                      border: "1px dashed #ccc",
                      padding: isSmallLabel ? "0.05in" : "0.1in",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      overflow: "hidden",
                      pageBreakInside: "avoid",
                    }}
                  >
                    {/* Logo and Price - Only for 2x4" labels */}
                    {isLargeLabel && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                          paddingBottom: "6px",
                          borderBottom: "1px solid #e0e0e0",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <img
                            src="/logo.svg"
                            alt="Arcadia"
                            style={{
                              width: "18px",
                              height: "18px",
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontSize: "11pt",
                              fontWeight: "bold",
                              color: "#E89B73",
                              lineHeight: "1",
                            }}
                          >
                            Arcadia
                          </span>
                        </div>
                        {book.price > 0 && (
                          <span
                            style={{
                              fontSize: "12pt",
                              fontWeight: "bold",
                              color: "#8DB38B",
                              lineHeight: "1",
                            }}
                          >
                            ${book.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}

                    {isSmallLabel ? (
                      // Small label: Simple single column layout
                      <div
                        style={{
                          fontSize: "5pt",
                          fontWeight: "bold",
                          marginBottom: "1px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          textAlign: "center",
                        }}
                      >
                        {book.title}
                      </div>
                    ) : (
                      // Medium/Large labels: Two column layout
                      <div
                        style={{ display: "flex", gap: "10px", flex: 1, alignItems: "flex-start" }}
                      >
                        {/* Left column - Book info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: isLargeLabel ? "10pt" : "8pt",
                              fontWeight: "bold",
                              marginBottom: "4px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              lineHeight: "1.2",
                            }}
                          >
                            {book.title}
                          </div>
                          <div
                            style={{
                              fontSize: isLargeLabel ? "8pt" : "7pt",
                              marginBottom: "4px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color: "#333",
                              lineHeight: "1.2",
                            }}
                          >
                            {book.author}
                          </div>
                          {/* Library/Store Name - Only for 2x4" labels */}
                          {isLargeLabel && libraryName && (
                            <div
                              style={{
                                fontSize: "7pt",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                color: "#666",
                                fontStyle: "italic",
                                lineHeight: "1.2",
                              }}
                            >
                              {libraryName}
                            </div>
                          )}
                        </div>

                        {/* Right column - Category and Status for large labels */}
                        {isLargeLabel && (
                          <div
                            style={{
                              width: "90px",
                              flexShrink: 0,
                              display: "flex",
                              flexDirection: "column",
                              gap: "6px",
                              alignItems: "stretch",
                            }}
                          >
                            {book.category && (
                              <div
                                style={{
                                  fontSize: "7pt",
                                  padding: "4px 6px",
                                  border: "1px solid #000",
                                  borderRadius: "4px",
                                  textAlign: "center",
                                  fontWeight: "bold",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  lineHeight: "1",
                                }}
                              >
                                {book.category}
                              </div>
                            )}
                            {book.status && book.status !== "Available" && (
                              <div
                                style={{
                                  fontSize: "7pt",
                                  padding: "4px 6px",
                                  border: "1.5px solid #000",
                                  borderRadius: "4px",
                                  textAlign: "center",
                                  fontWeight: "bold",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  lineHeight: "1",
                                }}
                              >
                                {book.status}
                              </div>
                            )}
                            {book.publication_year && (
                              <div
                                style={{
                                  fontSize: "7pt",
                                  textAlign: "center",
                                  fontWeight: "normal",
                                  lineHeight: "1",
                                }}
                              >
                                {book.publication_year}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {book.isbn && (
                      <div
                        style={{
                          marginTop: isSmallLabel ? "1px" : "8px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Barcode
                          value={book.isbn}
                          width={isSmallLabel ? 0.8 : isLargeLabel ? 1.3 : 1}
                          height={isSmallLabel ? 15 : isLargeLabel ? 35 : 20}
                          fontSize={isSmallLabel ? 6 : isLargeLabel ? 11 : 8}
                          margin={0}
                          displayValue={!isSmallLabel}
                        />
                      </div>
                    )}
                    {book.location && (
                      <div
                        style={{
                          fontSize: "6pt",
                          marginTop: "2px",
                          color: "#666",
                        }}
                      >
                        {book.location}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              disabled={isDownloading}
            >
              Cancel
            </Button>
            <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
            <Button onClick={handlePrint} disabled={isDownloading}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: letter;
            margin: 0;
          }
          
          body * {
            visibility: hidden !important;
          }
          
          .print-labels,
          .print-labels * {
            visibility: visible !important;
          }
          
          .print-labels {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 8.5in !important;
            background: white !important;
          }
          
          .label {
            border: none !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          
          /* Ensure barcode SVGs print */
          .print-labels svg {
            visibility: visible !important;
          }
        }
      `}</style>
    </>
  );
}

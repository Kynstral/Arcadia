import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId: string | null;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

const Import = ({ open, onOpenChange, onSuccess, userId }: ImportProps) => {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a CSV file",
      });
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      const requiredHeaders = ["name", "email"];
      const missingHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h),
      );

      if (missingHeaders.length > 0) {
        throw new Error(
          `Missing required columns: ${missingHeaders.join(", ")}`,
        );
      }

      const importResult: ImportResult = {
        success: 0,
        failed: 0,
        errors: [],
      };

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const member: Record<string, string> = {};

        headers.forEach((header, index) => {
          member[header] = values[index] || "";
        });

        if (!member.name || !member.email) {
          importResult.failed++;
          importResult.errors.push(
            `Row ${i + 1}: Missing name or email`,
          );
          continue;
        }

        try {
          const { error } = await supabase.from("members").insert([
            {
              name: member.name,
              email: member.email,
              phone: member.phone || null,
              address: member.address || null,
              status: member.status || "Active",
              user_id: userId,
            },
          ]);

          if (error) throw error;
          importResult.success++;
        } catch (error) {
          importResult.failed++;
          importResult.errors.push(
            `Row ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }

      setResult(importResult);

      if (importResult.success > 0) {
        toast({
          title: "Import completed",
          description: `Successfully imported ${importResult.success} member${importResult.success !== 1 ? "s" : ""}`,
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Import failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const downloadTemplate = () => {
    const template = "name,email,phone,address,status\nJohn Doe,john@example.com,+1234567890,123 Main St,Active";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "member_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Members</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple members at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              CSV file must include: <strong>name</strong> and{" "}
              <strong>email</strong>. Optional: phone, address, status
            </AlertDescription>
          </Alert>

          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Click to upload or drag and drop
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              {importing ? "Importing..." : "Select CSV File"}
            </Button>
          </div>

          {result && (
            <div className="space-y-2">
              {result.success > 0 && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Successfully imported {result.success} member
                    {result.success !== 1 ? "s" : ""}
                  </AlertDescription>
                </Alert>
              )}

              {result.failed > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to import {result.failed} member
                    {result.failed !== 1 ? "s" : ""}
                    {result.errors.length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer">
                          View errors
                        </summary>
                        <ul className="mt-2 text-xs space-y-1">
                          {result.errors.slice(0, 5).map((error, i) => (
                            <li key={i}>{error}</li>
                          ))}
                          {result.errors.length > 5 && (
                            <li>
                              ... and {result.errors.length - 5} more errors
                            </li>
                          )}
                        </ul>
                      </details>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={downloadTemplate}>
            <FileText className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Import;

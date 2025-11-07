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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Member } from "@/lib/types";
import { Download } from "lucide-react";

interface ExportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Member[];
  selectedMembers: string[];
}

const Export = ({ open, onOpenChange, members, selectedMembers }: ExportProps) => {
  const [includeFields, setIncludeFields] = useState({
    name: true,
    email: true,
    phone: true,
    address: true,
    status: true,
    joined_date: true,
    booksCheckedOut: true,
  });
  const { toast } = useToast();

  const toggleField = (field: keyof typeof includeFields) => {
    setIncludeFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleExport = () => {
    const membersToExport =
      selectedMembers.length > 0 ? members.filter((m) => selectedMembers.includes(m.id)) : members;

    if (membersToExport.length === 0) {
      toast({
        variant: "destructive",
        title: "No members to export",
        description: "Please select at least one member",
      });
      return;
    }

    const headers: string[] = [];
    const fields: (keyof typeof includeFields)[] = [];

    Object.entries(includeFields).forEach(([field, include]) => {
      if (include) {
        fields.push(field as keyof typeof includeFields);
        headers.push(
          field === "booksCheckedOut"
            ? "Books Checked Out"
            : field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
        );
      }
    });

    const rows = membersToExport.map((member) => {
      return fields
        .map((field) => {
          let value = member[field as keyof Member];

          if (field === "joined_date" && value) {
            value = new Date(value as string).toLocaleDateString();
          }

          if (value === null || value === undefined) {
            return "";
          }

          const stringValue = String(value);
          if (stringValue.includes(",") || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }

          return stringValue;
        })
        .join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `members_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `Exported ${membersToExport.length} member${membersToExport.length !== 1 ? "s" : ""}`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Members</DialogTitle>
          <DialogDescription>
            {selectedMembers.length > 0
              ? `Export ${selectedMembers.length} selected member${selectedMembers.length !== 1 ? "s" : ""}`
              : `Export all ${members.length} members`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3">Include Fields</h4>
            <div className="space-y-2">
              {Object.entries(includeFields).map(([field, checked]) => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={field}
                    checked={checked}
                    onCheckedChange={() => toggleField(field as keyof typeof includeFields)}
                  />
                  <Label htmlFor={field} className="cursor-pointer">
                    {field === "booksCheckedOut"
                      ? "Books Checked Out"
                      : field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Export;

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, CheckSquare, Download, Upload, X, Trash2 } from "lucide-react";
import { MemberStatus } from "@/lib/types";

interface BulkMemberActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkStatusUpdate: (status: MemberStatus) => void;
  onBulkExport: () => void;
  onBulkImport: () => void;
  onBulkDelete: () => void;
}

const BulkMemberActions = ({
  selectedCount,
  onClearSelection,
  onBulkStatusUpdate,
  onBulkExport,
  onBulkImport,
  onBulkDelete,
}: BulkMemberActionsProps) => {
  return (
    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
      <CheckSquare className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">
        {selectedCount} member{selectedCount !== 1 ? "s" : ""} selected
      </span>

      <div className="flex items-center gap-2 ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Check className="h-4 w-4 mr-2" />
              Update Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className="text-green-600"
              onClick={() => onBulkStatusUpdate("Active")}
            >
              Set as Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkStatusUpdate("Inactive")}>
              Set as Inactive
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-amber-600"
              onClick={() => onBulkStatusUpdate("Suspended")}
            >
              Set as Suspended
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => onBulkStatusUpdate("Banned")}>
              Set as Banned
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" onClick={onBulkExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>

        <Button variant="outline" size="sm" onClick={onBulkImport}>
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onBulkDelete}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>

        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BulkMemberActions;

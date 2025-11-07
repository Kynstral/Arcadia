import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  ArrowUpDown,
  MoreHorizontal,
  AlertCircle,
  Eye,
  Pencil,
  Check,
  X,
  BookOpen,
} from "lucide-react";
import { Member, MemberStatus } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";

interface MemberTableProps {
  members: Member[];
  selectedMembers: string[];
  membersWithOverdue?: Set<string>;
  onSelectMember: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onViewDetails: (member: Member) => void;
  onEdit: (member: Member) => void;
  onStatusChange: (member: Member, action: string) => void;
  onDelete: (member: Member) => void;
  onAssignBook: (member: Member) => void;
  onMemberUpdate?: () => void;
}

type SortField = "name" | "email" | "joined_date" | "booksCheckedOut" | "status";
type SortDirection = "asc" | "desc";

const MemberTable = ({
  members,
  selectedMembers,
  membersWithOverdue = new Set(),
  onSelectMember,
  onSelectAll,
  onViewDetails,
  onEdit,
  onStatusChange,
  onDelete,
  onAssignBook,
  onMemberUpdate,
}: MemberTableProps) => {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const { toast } = useToast();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedMembers = [...members].sort((a, b) => {
    let aValue: string | number = a[sortField];
    let bValue: string | number = b[sortField];

    if (sortField === "joined_date") {
      aValue = new Date(a.joined_date).getTime();
      bValue = new Date(b.joined_date).getTime();
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }

    return sortDirection === "asc"
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const getStatusColor = (status: MemberStatus) => {
    switch (status) {
      case "Active":
        return "bg-emerald-100 text-emerald-800";
      case "Inactive":
        return "bg-zinc-100 text-zinc-800";
      case "Suspended":
        return "bg-amber-100 text-amber-800";
      case "Banned":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const allSelected = members.length > 0 && selectedMembers.length === members.length;
  const someSelected = selectedMembers.length > 0 && !allSelected;

  const handleNameEdit = (member: Member) => {
    setEditingName(member.id);
    setEditValue(member.name);
  };

  const handleStatusEdit = (member: Member) => {
    setEditingStatus(member.id);
  };

  const saveNameEdit = async (memberId: string) => {
    if (!editValue.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid name",
        description: "Name cannot be empty",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("members")
        .update({ name: editValue.trim() })
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Name updated",
        description: "Member name has been updated successfully",
      });

      setEditingName(null);
      onMemberUpdate?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update name",
      });
    }
  };

  const saveStatusEdit = async (memberId: string, newStatus: MemberStatus) => {
    setUpdatingStatus(memberId);
    try {
      const { error } = await supabase
        .from("members")
        .update({ status: newStatus })
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: "Member status has been updated successfully",
      });

      setEditingStatus(null);
      onMemberUpdate?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const cancelEdit = () => {
    setEditingName(null);
    setEditingStatus(null);
    setEditValue("");
  };

  return (
    <div className="border rounded-lg">
      <Table aria-label="Members table">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
                aria-label="Select all"
                className={someSelected ? "opacity-50" : ""}
              />
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("name")}
                className="-ml-3"
              >
                Member
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("email")}
                className="-ml-3"
              >
                Contact
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("joined_date")}
                className="-ml-3"
              >
                Joined
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("booksCheckedOut")}
                className="-ml-3"
              >
                Books
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("status")}
                className="-ml-3"
              >
                Status
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMembers.map((member) => (
            <TableRow
              key={member.id}
              className="hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onViewDetails(member)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedMembers.includes(member.id)}
                  onCheckedChange={() => onSelectMember(member.id)}
                  aria-label={`Select ${member.name}`}
                />
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    {editingName === member.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8 w-40"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveNameEdit(member.id);
                            if (e.key === "Escape") cancelEdit();
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => saveNameEdit(member.id)}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={cancelEdit}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <span className="font-medium">{member.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all hover:bg-[#E89B73] group/edit"
                          onClick={() => handleNameEdit(member)}
                        >
                          <Pencil className="h-3 w-3 text-muted-foreground group-hover/edit:text-white transition-colors" />
                        </Button>
                      </div>
                    )}
                    {membersWithOverdue.has(member.id) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Has overdue books</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{member.email}</div>
                  {member.phone && <div className="text-muted-foreground">{member.phone}</div>}
                </div>
              </TableCell>
              <TableCell>{new Date(member.joined_date).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{member.booksCheckedOut}</span>
                </div>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                {updatingStatus === member.id ? (
                  <div className="flex items-center gap-2">
                    <Loader size={16} variant="accent" />
                    <span className="text-sm text-muted-foreground">Updating...</span>
                  </div>
                ) : editingStatus === member.id ? (
                  <Select
                    value={member.status}
                    onValueChange={(value) => {
                      saveStatusEdit(member.id, value as MemberStatus);
                    }}
                  >
                    <SelectTrigger className="h-8 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="Banned">Banned</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    className={`${getStatusColor(member.status)} cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={() => handleStatusEdit(member)}
                  >
                    {member.status}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(member);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(member);
                          }}
                          className="hover:bg-[#E89B73] group/editbtn"
                        >
                          <Pencil className="h-4 w-4 group-hover/editbtn:text-white" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit member</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(member)}>
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {member.status !== "Active" && (
                        <DropdownMenuItem
                          className="text-green-600"
                          onClick={() => onStatusChange(member, "activate")}
                        >
                          Activate
                        </DropdownMenuItem>
                      )}
                      {member.status === "Active" && (
                        <DropdownMenuItem onClick={() => onStatusChange(member, "deactivate")}>
                          Deactivate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-amber-600"
                        onClick={() => onStatusChange(member, "suspend")}
                      >
                        Suspend
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onStatusChange(member, "ban")}
                      >
                        Ban
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-700" onClick={() => onDelete(member)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MemberTable;

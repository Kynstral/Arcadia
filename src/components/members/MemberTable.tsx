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
import {
  ArrowUpDown,
  ExternalLink,
  MoreHorizontal,
  BookOpen,
} from "lucide-react";
import { Member, MemberStatus } from "@/lib/types";

interface MemberTableProps {
  members: Member[];
  selectedMembers: string[];
  onSelectMember: (id: string) => void;
  onSelectAll: (selected: boolean) => void;
  onViewDetails: (member: Member) => void;
  onEdit: (member: Member) => void;
  onStatusChange: (member: Member, action: string) => void;
  onDelete: (member: Member) => void;
  onAssignBook: (member: Member) => void;
}

type SortField = "name" | "email" | "joined_date" | "booksCheckedOut" | "status";
type SortDirection = "asc" | "desc";

const MemberTable = ({
  members,
  selectedMembers,
  onSelectMember,
  onSelectAll,
  onViewDetails,
  onEdit,
  onStatusChange,
  onDelete,
  onAssignBook,
}: MemberTableProps) => {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
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

  const allSelected =
    members.length > 0 && selectedMembers.length === members.length;
  const someSelected = selectedMembers.length > 0 && !allSelected;

  return (
    <div className="border rounded-lg">
      <Table>
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
            <TableRow key={member.id}>
              <TableCell>
                <Checkbox
                  checked={selectedMembers.includes(member.id)}
                  onCheckedChange={() => onSelectMember(member.id)}
                  aria-label={`Select ${member.name}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{member.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{member.email}</div>
                  {member.phone && (
                    <div className="text-muted-foreground">{member.phone}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {new Date(member.joined_date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{member.booksCheckedOut}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(member.status)}>
                  {member.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(member)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAssignBook(member)}
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
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
                        <DropdownMenuItem
                          onClick={() => onStatusChange(member, "deactivate")}
                        >
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
                      <DropdownMenuItem
                        className="text-red-700"
                        onClick={() => onDelete(member)}
                      >
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

import { useState, useMemo, useEffect } from "react";
import {
  AlertTriangle,
  Ban,
  Check,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Member, MemberStatus } from "@/lib/types";
import {
  MemberForm,
  MemberDetail,
  MemberStats,
  MemberFilters,
  MemberEmptyState,
  MemberPagination,
  BulkMemberActions,
  MemberTable,
  Import,
  Export,
} from "@/components/members";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useNavigate } from "react-router-dom";
import { Loader } from "@/components/ui/loader";

const fetchMembers = async (userId: string | null): Promise<Member[]> => {
  if (!userId) return [];

  // Optimized: Fetch members and borrowing counts in a single query using joins
  const { data, error } = await supabase
    .from("members")
    .select(
      `
      *,
      borrowings!member_id(count)
    `
    )
    .eq("user_id", userId)
    .eq("borrowings.status", "Borrowed")
    .order("name");

  if (error) throw new Error(`Error fetching members: ${error.message}`);
  if (!data || data.length === 0) return [];

  return data.map((member: any) => ({
    ...member,
    status: validateMemberStatus(member.status),
    booksCheckedOut: member.borrowings?.[0]?.count || 0,
    borrowings: undefined, // Remove the join data
  })) as Member[];
};

const fetchOverdueCount = async (userId: string | null): Promise<number> => {
  if (!userId) return 0;

  const { count } = await supabase
    .from("borrowings")
    .select("*, members!inner(user_id)", { count: "exact", head: true })
    .eq("status", "Borrowed")
    .eq("members.user_id", userId)
    .lt("due_date", new Date().toISOString());

  return count || 0;
};

const fetchMembersWithOverdue = async (userId: string | null): Promise<Set<string>> => {
  if (!userId) return new Set();

  const { data } = await supabase
    .from("borrowings")
    .select("member_id, members!inner(user_id)")
    .eq("status", "Borrowed")
    .eq("members.user_id", userId)
    .lt("due_date", new Date().toISOString());

  return new Set(data?.map((b: any) => b.member_id) || []);
};

const validateMemberStatus = (status: string): MemberStatus => {
  const validStatuses: MemberStatus[] = ["Active", "Inactive", "Suspended", "Banned"];
  return validStatuses.includes(status as MemberStatus) ? (status as MemberStatus) : "Active";
};

const updateMemberStatus = async ({
  memberId,
  status,
  userId,
}: {
  memberId: string;
  status: MemberStatus;
  userId: string | null;
}) => {
  if (!userId) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("members")
    .update({ status })
    .eq("id", memberId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(`Error updating member status: ${error.message}`);
  return data;
};

const deleteMember = async (memberId: string, userId: string | null) => {
  if (!userId) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("members")
    .delete()
    .eq("id", memberId)
    .eq("user_id", userId);

  if (error) throw new Error(`Error deleting member: ${error.message}`);
  return memberId;
};

const Members = () => {
  const { toast } = useToast();
  const { userId } = useAuth();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const queryClient = useQueryClient();

  // Keyboard shortcuts - Listen for custom event from KeyboardShortcutsProvider
  useEffect(() => {
    const handleAddMember = () => {
      handleOpenForm();
    };

    window.addEventListener("add-member-shortcut", handleAddMember);
    return () => window.removeEventListener("add-member-shortcut", handleAddMember);
  }, []);

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MemberStatus | null>(null);
  const [dateFilter, setDateFilter] = useState("all");
  const [booksFilter, setBooksFilter] = useState("all");
  const [overdueFilter, setOverdueFilter] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "activate" | "deactivate" | "suspend" | "ban" | "delete" | "bulkDelete" | null
  >(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Queries with optimized caching
  const {
    data: members = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["members", userId],
    queryFn: () => fetchMembers(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  const { data: overdueCount = 0 } = useQuery({
    queryKey: ["overdueCount", userId],
    queryFn: () => fetchOverdueCount(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: membersWithOverdue = new Set() } = useQuery({
    queryKey: ["membersWithOverdue", userId],
    queryFn: () => fetchMembersWithOverdue(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });

  // Filtering logic
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.address?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = !statusFilter || member.status === statusFilter;

      // Date filter
      let matchesDate = true;
      if (dateFilter !== "all") {
        const joinedDate = new Date(member.joined_date);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));

        if (dateFilter === "week") matchesDate = daysDiff <= 7;
        else if (dateFilter === "month") matchesDate = daysDiff <= 30;
        else if (dateFilter === "year") matchesDate = daysDiff <= 365;
      }

      // Books filter
      let matchesBooks = true;
      if (booksFilter === "none") matchesBooks = member.booksCheckedOut === 0;
      else if (booksFilter === "some") matchesBooks = member.booksCheckedOut > 0;
      else if (booksFilter === "many") matchesBooks = member.booksCheckedOut >= 3;

      // Overdue filter (simplified - would need actual overdue data)
      const matchesOverdue = !overdueFilter;

      return matchesSearch && matchesStatus && matchesDate && matchesBooks && matchesOverdue;
    });
  }, [members, searchQuery, statusFilter, dateFilter, booksFilter, overdueFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalBorrowed = members.reduce((sum, m) => sum + (m.booksCheckedOut || 0), 0);

  // Mutations with optimistic updates
  const updateStatusMutation = useMutation({
    mutationFn: (params: { memberId: string; status: MemberStatus }) =>
      updateMemberStatus({ ...params, userId }),
    onMutate: async ({ memberId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["members", userId] });

      // Snapshot previous value
      const previousMembers = queryClient.getQueryData<Member[]>(["members", userId]);

      // Optimistically update
      if (previousMembers) {
        queryClient.setQueryData<Member[]>(
          ["members", userId],
          previousMembers.map((m) => (m.id === memberId ? { ...m, status } : m))
        );
      }

      return { previousMembers };
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "Member status has been updated successfully.",
      });
      setConfirmDialogOpen(false);
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousMembers) {
        queryClient.setQueryData(["members", userId], context.previousMembers);
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["members", userId] });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (memberId: string) => deleteMember(memberId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", userId] });
      toast({
        title: "Member deleted",
        description: "Member has been deleted successfully.",
      });
      setConfirmDialogOpen(false);
      setSelectedMember(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (memberIds: string[]) => {
      await Promise.all(memberIds.map((id) => deleteMember(id, userId)));
    },
    onSuccess: (_, memberIds) => {
      queryClient.invalidateQueries({ queryKey: ["members", userId] });
      toast({
        title: "Members deleted",
        description: `Successfully deleted ${memberIds.length} member${memberIds.length !== 1 ? "s" : ""}`,
      });
      setSelectedMembers([]);
      setConfirmDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedMember(null);
    queryClient.invalidateQueries({ queryKey: ["members", userId] });
  };

  const handleOpenForm = (member?: Member) => {
    setSelectedMember(member || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedMember(null);
  };

  const handleViewDetails = (member: Member) => {
    navigate(`/members/${member.id}`);
  };

  const handleSelectMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedMembers(selected ? paginatedMembers.map((m) => m.id) : []);
  };

  const handleStatusChange = (member: Member, action: string) => {
    setSelectedMember(member);
    setConfirmAction(action as typeof confirmAction);
    setConfirmDialogOpen(true);
  };

  const handleDelete = (member: Member) => {
    setSelectedMember(member);
    setConfirmAction("delete");
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;

    // For bulk delete, we don't need selectedMember
    if (confirmAction === "bulkDelete") {
      bulkDeleteMutation.mutate(selectedMembers);
      return;
    }

    // For other actions, we need selectedMember
    if (!selectedMember) return;

    switch (confirmAction) {
      case "activate":
        updateStatusMutation.mutate({
          memberId: selectedMember.id,
          status: "Active",
        });
        break;
      case "deactivate":
        updateStatusMutation.mutate({
          memberId: selectedMember.id,
          status: "Inactive",
        });
        break;
      case "suspend":
        updateStatusMutation.mutate({
          memberId: selectedMember.id,
          status: "Suspended",
        });
        break;
      case "ban":
        updateStatusMutation.mutate({
          memberId: selectedMember.id,
          status: "Banned",
        });
        break;
      case "delete":
        deleteMemberMutation.mutate(selectedMember.id);
        break;
    }
  };

  const handleBulkStatusUpdate = async (status: MemberStatus) => {
    if (selectedMembers.length === 0) return;

    try {
      await Promise.all(
        selectedMembers.map((id) => updateMemberStatus({ memberId: id, status, userId }))
      );

      queryClient.invalidateQueries({ queryKey: ["members", userId] });
      toast({
        title: "Bulk update successful",
        description: `Updated ${selectedMembers.length} member${selectedMembers.length !== 1 ? "s" : ""}`,
      });
      setSelectedMembers([]);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedMembers.length === 0) return;
    setConfirmAction("bulkDelete");
    setConfirmDialogOpen(true);
  };

  const handleClearFilters = () => {
    setStatusFilter(null);
    setDateFilter("all");
    setBooksFilter("all");
    setOverdueFilter(false);
    setSearchQuery("");
  };

  const getActionConfig = () => {
    if (!confirmAction) return { title: "", description: "", confirmLabel: "", icon: null };

    switch (confirmAction) {
      case "activate":
        return {
          title: "Activate Membership",
          description: `Are you sure you want to activate ${selectedMember?.name}'s membership?`,
          confirmLabel: "Activate",
          icon: <Check className="h-6 w-6 text-green-500" />,
        };
      case "deactivate":
        return {
          title: "Deactivate Membership",
          description: `Are you sure you want to deactivate ${selectedMember?.name}'s membership?`,
          confirmLabel: "Deactivate",
          icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
        };
      case "suspend":
        return {
          title: "Suspend Membership",
          description: `Are you sure you want to suspend ${selectedMember?.name}'s membership?`,
          confirmLabel: "Suspend",
          icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
        };
      case "ban":
        return {
          title: "Ban Member",
          description: `Are you sure you want to ban ${selectedMember?.name}?`,
          confirmLabel: "Ban",
          icon: <Ban className="h-6 w-6 text-red-500" />,
        };
      case "delete":
        return {
          title: "Delete Member",
          description: `Are you sure you want to permanently delete ${selectedMember?.name}'s record?`,
          confirmLabel: "Delete",
          icon: <Trash2 className="h-6 w-6 text-red-500" />,
        };
      case "bulkDelete":
        return {
          title: "Delete Members",
          description: `Are you sure you want to permanently delete ${selectedMembers.length} member${selectedMembers.length !== 1 ? "s" : ""}? This action cannot be undone.`,
          confirmLabel: "Delete All",
          icon: <Trash2 className="h-6 w-6 text-red-500" />,
        };
      default:
        return { title: "", description: "", confirmLabel: "", icon: null };
    }
  };

  const actionConfig = getActionConfig();

  if (!userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p>Please sign in to view your members.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size={48} variant="accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-destructive">
          <p>Error loading members. Please try again later.</p>
        </div>
      </div>
    );
  }

  const hasFilters =
    searchQuery || statusFilter || dateFilter !== "all" || booksFilter !== "all" || overdueFilter;

  return (
    <div className="space-y-6 page-transition animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">Members</h2>
          <p className="text-muted-foreground mt-1">
            Manage library members and their borrowing activity
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={() => setIsExportOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => handleOpenForm()}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="animate-in slide-in-from-top-6 duration-500 delay-100">
        <MemberStats members={members} totalBorrowed={totalBorrowed} overdueCount={overdueCount} />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="member-search"
            placeholder="Search members by name, email, phone, or address... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <MemberFilters
          statusFilter={statusFilter}
          dateFilter={dateFilter}
          booksFilter={booksFilter}
          overdueFilter={overdueFilter}
          onStatusChange={setStatusFilter}
          onDateChange={setDateFilter}
          onBooksChange={setBooksFilter}
          onOverdueChange={setOverdueFilter}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Bulk Actions */}
      {selectedMembers.length > 0 && (
        <BulkMemberActions
          selectedCount={selectedMembers.length}
          onClearSelection={() => setSelectedMembers([])}
          onBulkStatusUpdate={handleBulkStatusUpdate}
          onBulkExport={() => setIsExportOpen(true)}
          onBulkImport={() => setIsImportOpen(true)}
          onBulkDelete={handleBulkDelete}
        />
      )}

      {/* Table or Empty State */}
      {filteredMembers.length > 0 ? (
        <>
          <MemberTable
            members={paginatedMembers}
            selectedMembers={selectedMembers}
            membersWithOverdue={membersWithOverdue}
            onSelectMember={handleSelectMember}
            onSelectAll={handleSelectAll}
            onViewDetails={handleViewDetails}
            onEdit={(member) => handleOpenForm(member)}
            onMemberUpdate={() => queryClient.invalidateQueries({ queryKey: ["members", userId] })}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onAssignBook={handleViewDetails}
          />

          {totalPages > 1 && (
            <MemberPagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredMembers.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(items) => {
                setItemsPerPage(items);
                setCurrentPage(1);
              }}
            />
          )}
        </>
      ) : (
        <MemberEmptyState
          hasFilters={!!hasFilters}
          onAddMember={() => handleOpenForm()}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Dialogs */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              {actionConfig.icon}
              <DialogTitle>{actionConfig.title}</DialogTitle>
            </div>
          </DialogHeader>
          <DialogDescription>{actionConfig.description}</DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={
                confirmAction === "delete" ||
                  confirmAction === "ban" ||
                  confirmAction === "bulkDelete"
                  ? "destructive"
                  : "default"
              }
              onClick={handleConfirmAction}
              disabled={
                updateStatusMutation.isPending ||
                deleteMemberMutation.isPending ||
                bulkDeleteMutation.isPending
              }
            >
              {updateStatusMutation.isPending ||
                deleteMemberMutation.isPending ||
                bulkDeleteMutation.isPending ? (
                <>
                  <Loader size={16} variant="white" className="mr-2" />
                  Processing...
                </>
              ) : (
                actionConfig.confirmLabel
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form Dialog/Drawer */}
      {isDesktop ? (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedMember ? "Edit Member" : "Add New Member"}</DialogTitle>
            </DialogHeader>
            <MemberForm
              member={selectedMember}
              onSuccess={handleFormSuccess}
              onCancel={handleCloseForm}
            />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>{selectedMember ? "Edit Member" : "Add New Member"}</DrawerTitle>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={handleCloseForm}
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerHeader>
            <div className="px-4 pb-8">
              <MemberForm
                member={selectedMember}
                onSuccess={handleFormSuccess}
                onCancel={handleCloseForm}
              />
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Detail Dialog/Drawer */}
      {isDesktop ? (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Member Details</DialogTitle>
            </DialogHeader>
            {selectedMemberId && (
              <MemberDetail memberId={selectedMemberId} onClose={() => setIsDetailOpen(false)} />
            )}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader className="text-left">
              <DrawerTitle>Member Details</DrawerTitle>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={() => setIsDetailOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerHeader>
            <div className="px-4 pb-8 overflow-y-auto">
              {selectedMemberId && (
                <MemberDetail memberId={selectedMemberId} onClose={() => setIsDetailOpen(false)} />
              )}
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Import/Export */}
      <Import
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["members", userId] });
        }}
        userId={userId}
      />

      <Export
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        members={members}
        selectedMembers={selectedMembers}
      />
    </div>
  );
};

export default Members;

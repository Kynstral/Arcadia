import { Button } from "@/components/ui/button";
import { Users, UserPlus } from "lucide-react";

interface MemberEmptyStateProps {
  hasFilters: boolean;
  onAddMember: () => void;
  onClearFilters: () => void;
}

const MemberEmptyState = ({
  hasFilters,
  onAddMember,
  onClearFilters,
}: MemberEmptyStateProps) => {
  if (hasFilters) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/10">
        <Users className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No members found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Try adjusting your search or filter criteria
        </p>
        <Button variant="outline" className="mt-4" onClick={onClearFilters}>
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-12 border rounded-lg bg-muted/10">
      <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">No members yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Start building your library community by adding your first member.
        Members can borrow books and track their reading history.
      </p>
      <Button onClick={onAddMember}>
        <UserPlus className="h-4 w-4 mr-2" />
        Add Your First Member
      </Button>
    </div>
  );
};

export default MemberEmptyState;

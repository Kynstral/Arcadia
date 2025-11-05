# Design Document: Member Management

## Overview

The Member Management system handles library patron registration, profile management, status tracking, and borrowing history. It provides comprehensive member lifecycle management from registration through active membership to account suspension or termination.

### Key Objectives

- Streamlined member registration and profile management
- Real-time status tracking and management
- Borrowing history and statistics
- Search and filter capabilities
- Integration with circulation system

## Architecture

### High-Level System Flow

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Members    │      │ MemberDetail │      │  EditMember  │      │  MemberForm  │
│    Page      │─────▶│  Component   │─────▶│     Page     │─────▶│  Component   │
│  (List/      │      │  (View/      │      │  (Edit)      │      │  (Add/Edit)  │
│   Search)    │      │   Manage)    │      │              │      │              │
└──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
      │                     │                      │                      │
      │                     │                      │                      │
   Search &             View Details          Edit Profile           Form Submit
   Filter               Borrowings            Status Change          Validation
      │                     │                      │                      │
      ▼                     ▼                      ▼                      ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                        Supabase Members Table                                  │
│                   (RLS by user_id, React Query Cache)                          │
└────────────────────────────────────────────────────────────────────────────────┘
      │                     │
      │                     │
      ▼                     ▼
┌──────────────┐      ┌──────────────┐
│  Borrowings  │      │ Transactions │
│    Table     │      │    Table     │
└──────────────┘      └──────────────┘
```

### Component Hierarchy

```
App
└── Protected Routes
    │
    ├── Members Page (/members)
    │   ├── Header
    │   │   ├── Title
    │   │   └── Add Member Button
    │   ├── Search & Filter Bar
    │   │   ├── Search Input
    │   │   └── Status Filter Buttons
    │   │       ├── All
    │   │       ├── Active
    │   │       ├── Inactive
    │   │       ├── Suspended
    │   │       └── Banned
    │   ├── Member Cards Grid
    │   │   └── Member Card (multiple)
    │   │       ├── Avatar
    │   │       ├── Name & Email
    │   │       ├── Status Badge
    │   │       ├── Books Checked Out Count
    │   │       ├── View Details Button
    │   │       └── Actions Dropdown
    │   │           ├── Activate
    │   │           ├── Deactivate
    │   │           ├── Suspend
    │   │           ├── Ban
    │   │           └── Delete
    │   ├── Dialogs
    │   │   ├── Add Member Dialog (MemberForm)
    │   │   ├── Member Detail Dialog (MemberDetail)
    │   │   └── Confirmation Dialog
    │   └── Empty State
    │
    ├── MemberDetail Component (Dialog/Drawer)
    │   ├── Header
    │   │   ├── Member Name
    │   │   ├── Status Badge
    │   │   └── Close Button
    │   ├── Tabs
    │   │   ├── Currently Borrowed Tab
    │   │   │   ├── Active Borrowings List
    │   │   │   │   └── Borrowing Card
    │   │   │   │       ├── Book Info
    │   │   │   │       ├── Due Date
    │   │   │   │       ├── Overdue Badge
    │   │   │   │       └── Return Button
    │   │   │   └── Assign Book Button
    │   │   │
    │   │   ├── Checkout History Tab
    │   │   │   └── Transaction List
    │   │   │       └── Transaction Card
    │   │   │           ├── Book Title
    │   │   │           ├── Date
    │   │   │           └── Amount
    │   │   │
    │   │   └── Member Details Tab
    │   │       ├── Personal Information
    │   │       │   ├── Email
    │   │       │   ├── Phone
    │   │       │   └── Address
    │   │       ├── Statistics
    │   │       │   ├── Total Books Borrowed
    │   │       │   ├── Currently Checked Out
    │   │       │   └── Overdue Items
    │   │       └── Edit Button
    │   │
    │   └── Assign Book Dialog
    │       ├── Book Search/Select
    │       └── Assign Button
    │
    ├── EditMember Page (/members/edit/:id)
    │   ├── Breadcrumb Navigation
    │   ├── Page Header
    │   └── MemberForm Component
    │
    └── MemberForm Component (Reusable)
        ├── Name Input
        ├── Email Input
        ├── Phone Input
        ├── Address Textarea
        ├── Status Dropdown (edit mode only)
        ├── Validation
        └── Submit/Cancel Buttons
```

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│              User Action (Search/Filter Members)                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Members Page (State Update)                        │
│  • Update searchQuery state                                     │
│  • Update statusFilter state                                    │
│  • Trigger re-render                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│           React Query (Cached Data Retrieval)                   │
│  • Check cache for members data                                 │
│  • Return cached data if available                              │
│  • Fetch from Supabase if stale/missing                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Client-Side Filtering Logic                        │
│  • Filter by search query (name, email)                        │
│  • Filter by status                                             │
│  • Combine with AND logic                                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Render Filtered Results                            │
│  • Map filtered members to Member Cards                         │
│  • Show "No members found" if empty                             │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│              User Action (Change Member Status)                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Actions Dropdown (Select Action)                   │
│  • User clicks action (Activate, Suspend, Ban, etc.)           │
│  • Store selected action and member in state                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Confirmation Dialog                                │
│  • Show action-specific message                                 │
│  • "Are you sure you want to [action] [member name]?"          │
│  • User confirms or cancels                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│           Supabase Mutation (Update Status)                     │
│  • UPDATE members SET status = ? WHERE id = ?                   │
│  • RLS checks user_id matches authenticated user               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│         React Query Cache Invalidation                          │
│  • Invalidate ["members"] query                                 │
│  • Trigger automatic refetch                                    │
│  • Update UI with new status                                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Success Feedback                                   │
│  • Show success toast notification                              │
│  • Close confirmation dialog                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Members Page (`src/pages/Members.tsx`)

**Purpose**: Main interface for viewing and managing all library members

**Key Features**:
- **Member List**: Grid of member cards with avatars and key information
- **Real-time Search**: Search by name or email with instant results
- **Status Filtering**: Filter by Active, Inactive, Suspended, or Banned status
- **Quick Actions**: Dropdown menu for status changes and deletion
- **Add Member**: Dialog with form for registering new members
- **View Details**: Open detailed member information in dialog/drawer
- **Responsive Layout**: Card grid adapts to screen size

**Component State**:
```typescript
interface MembersPageState {
  searchQuery: string;                    // Search input value
  statusFilter: MemberStatus | null;      // Selected status filter
  selectedMember: Member | null;          // Member for detail view
  confirmDialogOpen: boolean;             // Confirmation dialog state
  confirmAction: ActionType | null;       // Action awaiting confirmation
}

type ActionType = "activate" | "deactivate" | "suspend" | "ban" | "delete";
```

**Data Fetching**:
```typescript
const { data: members, isLoading } = useQuery({
  queryKey: ['members', userId],
  queryFn: () => fetchMembers(userId),
});
```

**Filter Logic**:
```typescript
const filteredMembers = members.filter(member => {
  const matchesSearch = !searchQuery || 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase());
  
  const matchesStatus = !statusFilter || member.status === statusFilter;
  
  return matchesSearch && matchesStatus;
});
```

**Member Card Layout**:
```
┌─────────────────────────────────┐
│  👤 Avatar                      │
│                                 │
│  John Doe                       │
│  john@example.com               │
│                                 │
│  [Active Badge]                 │
│  📚 3 books checked out         │
│                                 │
│  [View Details]  [⋮ Actions]   │
└─────────────────────────────────┘
```

**Actions Dropdown Menu**:
- Activate (if Inactive/Suspended/Banned)
- Deactivate (if Active)
- Suspend (if Active/Inactive)
- Ban (if Active/Inactive/Suspended)
- Delete (with confirmation)

### 2. MemberForm Component (`src/components/MemberForm.tsx`)

**Purpose**: Reusable form for creating and editing member profiles

**Props Interface**:
```typescript
interface MemberFormProps {
  member?: Member;                    // Existing member for edit mode
  onSubmit: (member: Member) => void; // Submit handler
  onCancel: () => void;               // Cancel handler
  isLoading?: boolean;                // Loading state
}
```

**Form Fields**:

**Required**:
- Name (text, max 100 chars)
- Email (email format, unique)

**Optional**:
- Phone (text, phone format)
- Address (textarea, max 500 chars)
- Status (select, edit mode only)

**Validation Rules**:
```typescript
- Name: Required, 2-100 characters
- Email: Required, valid email format, unique
- Phone: Optional, valid phone format
- Address: Optional, max 500 characters
- Status: Required in edit mode, must be valid MemberStatus
```

**Form Submission Flow**:
```
1. User fills/edits form fields
2. User clicks "Save" button
3. Validate all fields client-side
4. If validation fails: Show errors, stop
5. If validation passes:
   a. Get authenticated user ID
   b. Prepare member data object
   c. Call onSubmit prop with data
   d. Parent handles Supabase mutation
   e. Show loading state
6. On success: Show toast, close dialog
7. On error: Show error toast, keep form open
```

**Default Values**:
```typescript
// New member
{
  name: "",
  email: "",
  phone: "",
  address: "",
  status: "Active",
  joined_date: new Date().toISOString(),
}

// Edit member
{
  ...existingMember
}
```

### 3. MemberDetail Component (`src/components/MemberDetail.tsx`)

**Purpose**: Comprehensive view of member information and activity

**Props Interface**:
```typescript
interface MemberDetailProps {
  member: Member;
  open: boolean;
  onClose: () => void;
}
```

**Tab Structure**:

**Tab 1: Currently Borrowed**
- List of active borrowings
- Book title, author, cover image
- Borrowed date and due date
- Overdue badge if past due
- Return button for each book
- Assign Book button at bottom

**Tab 2: Checkout History**
- List of all transactions
- Book title and date
- Amount paid
- Transaction type (purchase)
- Sorted by date descending

**Tab 3: Member Details**
- Personal information (email, phone, address)
- Membership statistics:
  - Total books borrowed (all time)
  - Currently checked out
  - Overdue items count
  - Member since date
- Edit button to navigate to EditMember page

**Borrowing Card Layout**:
```
┌─────────────────────────────────────────┐
│  📖 Book Cover  │  The Great Gatsby     │
│                 │  by F. Scott Fitzgerald│
│                 │                        │
│                 │  Borrowed: Jan 15, 2024│
│                 │  Due: Feb 15, 2024     │
│                 │  [OVERDUE Badge]       │
│                 │                        │
│                 │  [Return Book Button]  │
└─────────────────────────────────────────┘
```

**Assign Book Dialog**:
- Search/select book from catalog
- Check book availability
- Create borrowing record
- Update book stock
- Refresh borrowings list

**Return Book Flow**:
```
1. User clicks "Return Book" button
2. Confirmation dialog appears
3. User confirms return
4. Update borrowing record (set return_date)
5. Increment book stock
6. Update member's checked out count
7. Refresh borrowings list
8. Show success toast
```

### 4. EditMember Page (`src/pages/EditMember.tsx`)

**Purpose**: Dedicated page for editing member information

**Features**:
- Breadcrumb navigation (Home > Members > Edit Member)
- Page header with member name
- MemberForm component integration
- Pre-populated form fields
- Save and cancel actions
- Navigate back to members list on success

**Data Fetching**:
```typescript
const { data: member, isLoading } = useQuery({
  queryKey: ['member', memberId],
  queryFn: () => fetchMember(memberId),
});
```

**Save Handler**:
```typescript
const updateMutation = useMutation({
  mutationFn: (data: Member) => updateMember(memberId, data),
  onSuccess: () => {
    toast({ title: "Member updated successfully" });
    navigate('/members');
  },
});
```

## Data Models

### Member Interface

```typescript
interface Member {
  id: string;                    // UUID
  name: string;                  // Full name
  email: string;                 // Email address (unique)
  phone?: string;                // Phone number
  address?: string;              // Physical address
  status: MemberStatus;          // Current status
  joined_date: string;           // ISO timestamp
  booksCheckedOut?: number;      // Calculated from borrowings
  user_id?: string;              // Library owner ID
  created_at?: string;           // ISO timestamp
  updated_at?: string;           // ISO timestamp
}

type MemberStatus = "Active" | "Inactive" | "Suspended" | "Banned";
```

### Database Schema

```sql
members table:
- id: UUID (PK)
- name: TEXT NOT NULL
- email: TEXT NOT NULL UNIQUE
- phone: TEXT
- address: TEXT
- status: TEXT NOT NULL DEFAULT 'Active'
- joined_date: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- user_id: UUID NOT NULL (FK to auth.users)
- created_at: TIMESTAMPTZ DEFAULT NOW()
- updated_at: TIMESTAMPTZ DEFAULT NOW()

Indexes:
- idx_members_user_id ON members(user_id)
- idx_members_email ON members(email)
- idx_members_status ON members(status)
```

## Status Management

### Status Types and Meanings

**Active**: Member in good standing, can borrow books
**Inactive**: Member account exists but not currently borrowing
**Suspended**: Temporary restriction, cannot borrow (e.g., overdue books)
**Banned**: Permanent restriction, cannot borrow

### Status Color Coding

```typescript
const statusColors = {
  Active: "bg-green-100 text-green-800",
  Inactive: "bg-gray-100 text-gray-800",
  Suspended: "bg-yellow-100 text-yellow-800",
  Banned: "bg-red-100 text-red-800",
};
```

### Status Change Rules

- Active → Inactive: Manual deactivation
- Active → Suspended: Overdue books or policy violation
- Active → Banned: Serious policy violation
- Inactive → Active: Manual reactivation
- Suspended → Active: Issues resolved
- Banned → Active: Admin override only

### Confirmation Messages

```typescript
const confirmMessages = {
  activate: "Are you sure you want to activate this member?",
  deactivate: "Are you sure you want to deactivate this member?",
  suspend: "Are you sure you want to suspend this member? They will not be able to borrow books.",
  ban: "Are you sure you want to ban this member? This is a serious action.",
  delete: "Are you sure you want to delete this member? This action cannot be undone.",
};
```

## Integration Points

### Borrowings Table Integration

**Fetch Active Borrowings**:
```typescript
const { data: borrowings } = useQuery({
  queryKey: ['borrowings', memberId],
  queryFn: () => supabase
    .from('borrowings')
    .select('*, books(*)')
    .eq('member_id', memberId)
    .is('return_date', null),
});
```

**Calculate Books Checked Out**:
```typescript
const booksCheckedOut = borrowings?.length || 0;
```

**Return Book**:
```typescript
const returnBook = async (borrowingId: string, bookId: string) => {
  // Update borrowing record
  await supabase
    .from('borrowings')
    .update({ return_date: new Date().toISOString() })
    .eq('id', borrowingId);
  
  // Increment book stock
  await supabase.rpc('increment_book_stock', { book_id: bookId });
};
```

### Transactions Table Integration

**Fetch Transaction History**:
```typescript
const { data: transactions } = useQuery({
  queryKey: ['transactions', memberId],
  queryFn: () => supabase
    .from('checkout_transactions')
    .select('*, checkout_items(*, books(*))')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false }),
});
```

### Circulation System Integration

**Assign Book to Member**:
```typescript
const assignBook = async (memberId: string, bookId: string) => {
  // Create borrowing record
  await supabase.from('borrowings').insert({
    member_id: memberId,
    book_id: bookId,
    borrow_date: new Date().toISOString(),
    due_date: addDays(new Date(), 14).toISOString(),
    user_id: userId,
  });
  
  // Decrement book stock
  await supabase.rpc('decrement_book_stock', { book_id: bookId });
};
```

## Error Handling

**Validation Errors**: Display inline field errors, prevent submission

**Duplicate Email**: Show error toast "Email already exists"

**Delete with Active Borrows**: Prevent deletion, show error "Cannot delete member with active borrowings"

**Network Errors**: Show error toast with retry option

**Loading States**: Disable forms and show spinners during operations

## Performance Optimizations

**React Query Caching**: Cache members with key `["members", userId]`, automatic refetch on mutations

**Client-Side Filtering**: Filter after fetch for instant results

**Optimistic Updates**: Update UI immediately for status changes, rollback on error

**Lazy Loading**: Load member details and borrowings only when detail view opened

## Responsive Design

**Desktop**: Card grid with 3-4 columns, inline dialogs

**Tablet**: Card grid with 2-3 columns, inline dialogs

**Mobile**: Single column cards, drawer for member details, full-screen dialogs

## Testing Strategy

**Unit Tests**: Filter logic, form validation, status change rules

**Integration Tests**: CRUD operations, status management, borrowing integration

**E2E Tests**: Complete member registration flow, status change workflow, borrowing assignment

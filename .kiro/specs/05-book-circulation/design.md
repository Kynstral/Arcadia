# Design Document: Book Circulation System

## Overview

The Book Circulation System manages library lending operations including book checkout, returns, due date tracking, overdue management, and renewal functionality. It serves as the core operational interface for library staff to manage the lending lifecycle.

### Key Objectives

- Streamlined checkout and return processes
- Real-time due date and overdue tracking
- Stock and status synchronization
- Member borrowing history
- Renewal management
- Transaction recording

## Architecture

### High-Level System Flow

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Checkout   │      │   Check-In   │      │  Due Dates   │      │   Members    │
│     Tab      │      │     Tab      │      │     Tab      │      │     Tab      │
│  (Lend)      │      │  (Return)    │      │  (Track)     │      │  (View)      │
└──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
      │                     │                      │                      │
      │                     │                      │                      │
   Create              Update                  Query                  View
   Borrowing           Borrowing               Borrowings             Members
      │                     │                      │                      │
      ▼                     ▼                      ▼                      ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                        Supabase Borrowings Table                               │
│                   (RLS by user_id, React Query Cache)                          │
└────────────────────────────────────────────────────────────────────────────────┘
      │                     │
      │                     │
      ▼                     ▼
┌──────────────┐      ┌──────────────┐
│    Books     │      │   Members    │
│    Table     │      │    Table     │
│  (Stock &    │      │  (Status &   │
│   Status)    │      │   History)   │
└──────────────┘      └──────────────┘
```

### Component Hierarchy

```
BookCirculation Page (/book-circulation)
│
├── Tabs Component
│   │
│   ├── Checkout Tab
│   │   ├── Book Search Section
│   │   │   ├── Search Input
│   │   │   ├── Category Filter
│   │   │   └── Book Results Popover
│   │   │       └── Book Card (multiple)
│   │   ├── Selected Book Display
│   │   ├── Member Search Section
│   │   │   ├── Search Input
│   │   │   └── Member Results Popover
│   │   │       └── Member Card (multiple)
│   │   ├── Selected Member Display
│   │   ├── Due Date Selector
│   │   │   ├── Preset Buttons (15/20/30 days)
│   │   │   └── Custom Date Picker
│   │   └── Checkout Button
│   │
│   ├── Check-In Tab
│   │   ├── Member Search
│   │   ├── Active Borrowings List
│   │   │   └── Borrowing Card (multiple)
│   │   │       ├── Book Info
│   │   │       ├── Due Date
│   │   │       ├── Overdue Badge
│   │   │       ├── Selection Checkbox
│   │   │       └── Return Button
│   │   ├── Bulk Actions Bar
│   │   │   ├── Select All
│   │   │   └── Return Selected
│   │   └── Condition Assessment Dialog
│   │
│   ├── Due Dates Tab
│   │   ├── Due Soon Section
│   │   │   └── Due Item Card (multiple)
│   │   │       ├── Member Info
│   │   │       ├── Book Info
│   │   │       ├── Due Date (yellow)
│   │   │       └── Quick Return
│   │   └── Overdue Section
│   │       └── Overdue Item Card (multiple)
│   │           ├── Member Info
│   │           ├── Book Info
│   │           ├── Days Overdue (red)
│   │           └── Quick Return
│   │
│   └── Members Tab
│       ├── Member Search
│       └── Member Cards Grid
│           └── Member Card (multiple)
│               ├── Name & Email
│               ├── Active Checkouts Count
│               └── View Details Button
│                   └── MemberDetail Dialog
```

### Data Flow Diagrams

**Checkout Flow**:
```
┌─────────────────────────────────────────────────────────────────┐
│              User Action (Checkout Book)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Select Book & Member                               │
│  • Search and select book from catalog                          │
│  • Search and select member from list                           │
│  • Choose due date (preset or custom)                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Validation Checks                                  │
│  • Book stock > 0?                                              │
│  • Member status = Active?                                      │
│  • No existing active borrowing for this book?                  │
│  • Member has no overdue items?                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Create Borrowing Record                            │
│  • INSERT into borrowings table                                 │
│  • Set checkout_date = now                                      │
│  • Set due_date from selection                                  │
│  • Set status = "Borrowed"                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Update Book Stock & Status                         │
│  • Decrement book.stock by 1                                    │
│  • If stock = 0, set book.status = "Borrowed"                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Invalidate Caches & Show Success                   │
│  • Invalidate ["borrowings"] query                              │
│  • Invalidate ["books"] query                                   │
│  • Show success toast                                           │
│  • Clear selections                                             │
└─────────────────────────────────────────────────────────────────┘
```

**Return Flow**:
```
┌─────────────────────────────────────────────────────────────────┐
│              User Action (Return Book)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Select Member & Borrowings                         │
│  • Search and select member                                     │
│  • Display active borrowings                                    │
│  • Select book(s) to return                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Condition Assessment (Optional)                    │
│  • Dialog appears                                               │
│  • Select condition: Good, Fair, Damaged, Lost                  │
│  • Add notes if needed                                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Update Borrowing Record                            │
│  • UPDATE borrowings table                                      │
│  • Set return_date = now                                        │
│  • Set status = "Returned"                                      │
│  • Set condition_on_return                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Update Book Stock & Status                         │
│  • Increment book.stock by 1                                    │
│  • Set book.status = "Available"                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Invalidate Caches & Show Success                   │
│  • Invalidate ["borrowings"] query                              │
│  • Invalidate ["books"] query                                   │
│  • Show success toast                                           │
│  • Refresh borrowings list                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Checkout Tab

**Purpose**: Lend books to library members

**Workflow Steps**:
1. Search and select book
2. Search and select member
3. Choose due date
4. Confirm checkout

**Book Search Section**:
```typescript
interface BookSearchState {
  searchQuery: string;
  categoryFilter: string;
  searchResults: Book[];
  selectedBook: Book | null;
}
```

**Features**:
- Real-time search by title, author, or ISBN
- Category filter dropdown
- Results displayed in popover
- Show book cover, title, author, stock
- Disable books with stock = 0
- Clear selection button

**Member Search Section**:
```typescript
interface MemberSearchState {
  searchQuery: string;
  searchResults: Member[];
  selectedMember: Member | null;
}
```

**Features**:
- Search by name, email, or phone
- Autocomplete suggestions
- Show member name, email, status
- Disable members with status != "Active"
- Show active checkouts count
- Clear selection button

**Due Date Selector**:
```typescript
interface DueDateState {
  dueDateOption: "15" | "20" | "30" | "custom";
  customDate: Date | null;
  calculatedDueDate: Date;
}
```

**Preset Options**:
- 15 days (default)
- 20 days
- 30 days
- Custom date picker

**Validation Rules**:
```typescript
const validateCheckout = (book: Book, member: Member) => {
  if (book.stock <= 0) {
    return "Book is not available";
  }
  
  if (member.status !== "Active") {
    return "Member account is not active";
  }
  
  if (hasActiveBorrowing(member.id, book.id)) {
    return "Member already has this book checked out";
  }
  
  if (hasOverdueItems(member.id)) {
    return "Member has overdue items";
  }
  
  return null; // Valid
};
```

**Checkout Button**:
- Disabled until book, member, and due date selected
- Shows loading state during operation
- Triggers validation before submission

### 2. Check-In Tab

**Purpose**: Process book returns from members

**Features**:
- Member search with autocomplete
- Display all active borrowings for selected member
- Bulk selection with checkboxes
- Individual return buttons
- Bulk return button
- Condition assessment dialog
- Overdue indicators

**Active Borrowings Display**:
```
┌─────────────────────────────────────────────────────────┐
│  ☐ The Great Gatsby                                     │
│     by F. Scott Fitzgerald                              │
│     Borrowed: Jan 15, 2024                              │
│     Due: Feb 15, 2024                                   │
│     [OVERDUE: 5 days] (if past due)                     │
│     [Return Book Button]                                │
└─────────────────────────────────────────────────────────┘
```

**Bulk Actions**:
- Select All checkbox in header
- Return Selected button (enabled when items selected)
- Confirmation dialog for bulk returns
- Progress indicator for batch operations

**Condition Assessment Dialog**:
```typescript
interface ConditionAssessment {
  condition: "Good" | "Fair" | "Damaged" | "Lost";
  notes?: string;
}
```

**Condition Options**:
- **Good**: Normal wear, no damage
- **Fair**: Minor wear, still usable
- **Damaged**: Significant damage, may need repair
- **Lost**: Book not returned, member charged

**Return Process**:
```typescript
const handleReturn = async (borrowingId: string, bookId: string, condition: string) => {
  // Update borrowing
  await supabase
    .from('borrowings')
    .update({
      return_date: new Date().toISOString(),
      status: 'Returned',
      condition_on_return: condition,
    })
    .eq('id', borrowingId);
  
  // Update book stock
  await supabase.rpc('increment_book_stock', { book_id: bookId });
  
  // Update book status
  await supabase
    .from('books')
    .update({ status: 'Available' })
    .eq('id', bookId);
};
```

### 3. Due Dates Tab

**Purpose**: Track books due soon and overdue items

**Sections**:

**Due Soon** (Books due within 3 days):
- Yellow warning indicators
- Sorted by due date (soonest first)
- Shows days until due
- Quick return action

**Overdue** (Books past due date):
- Red alert indicators
- Sorted by most overdue first
- Shows days overdue
- Quick return action
- Send reminder option (future)

**Query Logic**:
```typescript
// Due Soon
const dueSoon = await supabase
  .from('borrowings')
  .select('*, books(*), members(*)')
  .eq('status', 'Borrowed')
  .gte('due_date', new Date().toISOString())
  .lte('due_date', addDays(new Date(), 3).toISOString())
  .order('due_date', { ascending: true });

// Overdue
const overdue = await supabase
  .from('borrowings')
  .select('*, books(*), members(*)')
  .eq('status', 'Borrowed')
  .lt('due_date', new Date().toISOString())
  .order('due_date', { ascending: true });
```

**Display Card**:
```
┌─────────────────────────────────────────────────────────┐
│  👤 John Doe (john@example.com)                         │
│  📞 555-1234                                             │
│                                                         │
│  📖 The Great Gatsby by F. Scott Fitzgerald             │
│                                                         │
│  📅 Due: Feb 15, 2024                                   │
│  ⚠️  OVERDUE: 5 days                                    │
│                                                         │
│  [Return Book Button]                                   │
└─────────────────────────────────────────────────────────┘
```

**Color Coding**:
- Green: Due in 3+ days
- Yellow: Due within 3 days
- Red: Overdue

**Auto-Refresh**:
- Refresh every 5 minutes
- Manual refresh button
- Real-time updates on return

### 4. Members Tab

**Purpose**: Quick access to member information and borrowing history

**Features**:
- Search members by name or email
- Display member cards with active checkouts count
- View Details button opens MemberDetail dialog
- Shows member status badge
- Quick navigation to member management

**Member Card**:
```
┌─────────────────────────────────┐
│  👤 John Doe                    │
│  john@example.com               │
│                                 │
│  [Active Badge]                 │
│  📚 3 books checked out         │
│                                 │
│  [View Details Button]          │
└─────────────────────────────────┘
```

**Integration with MemberDetail**:
- Opens MemberDetail component in dialog
- Shows Currently Borrowed tab by default
- Allows quick returns from dialog
- Displays full borrowing history

## Data Models

### Borrowing Interface

```typescript
interface Borrowing {
  id: string;                      // UUID
  book_id: string;                 // FK to books
  member_id: string;               // FK to members
  checkout_date: string;           // ISO timestamp
  due_date: string;                // ISO timestamp
  return_date?: string;            // ISO timestamp (null if active)
  status: BorrowingStatus;         // "Borrowed" | "Returned"
  condition_on_return?: string;    // "Good" | "Fair" | "Damaged" | "Lost"
  notes?: string;                  // Additional notes
  reminder_sent: boolean;          // Reminder email sent
  reminder_date?: string;          // When reminder was sent
  renewal_count?: number;          // Number of renewals
  user_id: string;                 // Library owner ID
  created_at?: string;             // ISO timestamp
  updated_at?: string;             // ISO timestamp
}

type BorrowingStatus = "Borrowed" | "Returned";
```

### Database Schema

```sql
borrowings table:
- id: UUID (PK)
- book_id: UUID NOT NULL (FK to books)
- member_id: UUID NOT NULL (FK to members)
- checkout_date: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- due_date: TIMESTAMPTZ NOT NULL
- return_date: TIMESTAMPTZ
- status: TEXT NOT NULL DEFAULT 'Borrowed'
- condition_on_return: TEXT
- notes: TEXT
- reminder_sent: BOOLEAN DEFAULT FALSE
- reminder_date: TIMESTAMPTZ
- renewal_count: INTEGER DEFAULT 0
- user_id: UUID NOT NULL (FK to auth.users)
- created_at: TIMESTAMPTZ DEFAULT NOW()
- updated_at: TIMESTAMPTZ DEFAULT NOW()

Indexes:
- idx_borrowings_user_id ON borrowings(user_id)
- idx_borrowings_book_id ON borrowings(book_id)
- idx_borrowings_member_id ON borrowings(member_id)
- idx_borrowings_status ON borrowings(status)
- idx_borrowings_due_date ON borrowings(due_date)

Foreign Keys:
- book_id → books(id) ON DELETE CASCADE
- member_id → members(id) ON DELETE CASCADE
- user_id → auth.users(id) ON DELETE CASCADE
```

## Business Logic

### Due Date Calculation

```typescript
const getDueDateFromOption = (option: string, customDate?: Date): Date => {
  const today = new Date();
  
  switch (option) {
    case "15":
      return addDays(today, 15);
    case "20":
      return addDays(today, 20);
    case "30":
      return addDays(today, 30);
    case "custom":
      return customDate || addDays(today, 15);
    default:
      return addDays(today, 15);
  }
};
```

### Overdue Detection

```typescript
const calculateDaysOverdue = (dueDate: string): number => {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

const isOverdue = (dueDate: string): boolean => {
  return new Date(dueDate) < new Date();
};
```

### Stock Management

```typescript
// Decrement stock on checkout
const decrementStock = async (bookId: string) => {
  const { data: book } = await supabase
    .from('books')
    .select('stock')
    .eq('id', bookId)
    .single();
  
  const newStock = book.stock - 1;
  
  await supabase
    .from('books')
    .update({
      stock: newStock,
      status: newStock === 0 ? 'Borrowed' : 'Available'
    })
    .eq('id', bookId);
};

// Increment stock on return
const incrementStock = async (bookId: string) => {
  await supabase.rpc('increment_book_stock', { book_id: bookId });
  
  await supabase
    .from('books')
    .update({ status: 'Available' })
    .eq('id', bookId);
};
```

### Renewal Logic

```typescript
const renewBorrowing = async (borrowingId: string, renewalLimit: number = 2) => {
  const { data: borrowing } = await supabase
    .from('borrowings')
    .select('renewal_count, due_date')
    .eq('id', borrowingId)
    .single();
  
  if (borrowing.renewal_count >= renewalLimit) {
    throw new Error('Renewal limit reached');
  }
  
  const newDueDate = addDays(new Date(borrowing.due_date), 15);
  
  await supabase
    .from('borrowings')
    .update({
      due_date: newDueDate.toISOString(),
      renewal_count: borrowing.renewal_count + 1,
    })
    .eq('id', borrowingId);
};
```

## Integration Points

### Books Table Integration

**Stock Updates**:
- Decrement on checkout
- Increment on return
- Validate availability before checkout

**Status Updates**:
- Set to "Borrowed" when stock = 0
- Set to "Available" on return

### Members Table Integration

**Status Checks**:
- Only Active members can borrow
- Suspended/Banned members blocked

**Borrowing Limits**:
- Check active borrowings count
- Enforce maximum checkout limit (e.g., 5 books)

**Overdue Checks**:
- Prevent new checkouts if overdue items exist

### Transactions Table Integration

**Record Checkout**:
```typescript
await supabase.from('transactions').insert({
  type: 'checkout',
  member_id: memberId,
  book_id: bookId,
  amount: 0,
  user_id: userId,
});
```

**Record Return**:
```typescript
await supabase.from('transactions').insert({
  type: 'return',
  member_id: memberId,
  book_id: bookId,
  amount: lateFee || 0,
  user_id: userId,
});
```

## Error Handling

**Validation Errors**: Display inline error messages, prevent submission

**Stock Unavailable**: "This book is currently unavailable"

**Member Inactive**: "Member account is not active. Please contact administrator."

**Duplicate Borrowing**: "Member already has this book checked out"

**Overdue Items**: "Member has overdue items. Please return them before checking out new books."

**Network Errors**: Show error toast with retry option

**Loading States**: Disable forms and show spinners during operations

## Performance Optimizations

**Database Indexes**: Indexed queries on member_id, book_id, status, due_date for fast lookups

**React Query Caching**: Cache borrowings with key `["borrowings", userId]`, automatic refetch on mutations

**Client-Side Filtering**: Filter search results client-side for instant feedback

**Pagination**: Paginate large result sets (e.g., borrowing history)

**Optimistic Updates**: Update UI immediately for returns, rollback on error

## Responsive Design

**Desktop**: Tabbed interface with full-width content, inline dialogs

**Tablet**: Tabbed interface with adjusted spacing, inline dialogs

**Mobile**: Tabbed interface with stacked layouts, drawer for member details, full-screen dialogs

## Testing Strategy

**Unit Tests**: Due date calculation, overdue detection, stock management logic

**Integration Tests**: Complete checkout flow, return process, renewal functionality

**E2E Tests**: End-to-end checkout and return workflow, overdue tracking, member borrowing history

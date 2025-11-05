# Design Document: Book Catalog Management

## Overview

The Book Catalog Management system provides comprehensive CRUD operations for managing book inventory, including browsing, searching, filtering, bulk operations, and detailed book views.

## Architecture

### High-Level System Flow

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Catalog    │      │    Books     │      │  BookDetail  │      │   EditBook   │
│    Page      │─────▶│    Page      │─────▶│     Page     │─────▶│     Page     │
│  (Browse)    │      │  (Manage)    │      │   (View)     │      │  (Add/Edit)  │
└──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
      │                     │                      │                      │
      │                     │                      │                      │
   Search &             CRUD Ops              View Details           Form Submit
   Filter               Bulk Ops              Add to Cart            Validation
      │                     │                      │                      │
      ▼                     ▼                      ▼                      ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                          Supabase Books Table                                  │
│                     (RLS by user_id, React Query Cache)                        │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App
└── Protected Routes
    │
    ├── Catalog Page (/catalog)
    │   ├── Search Input
    │   ├── Filter Controls
    │   │   ├── Category Filter
    │   │   ├── Publisher Filter
    │   │   ├── Year Filter
    │   │   └── Price Range Filter
    │   ├── View Toggle (Grid/List)
    │   ├── Mobile Filter Drawer
    │   └── Book Grid/List
    │       └── BookCard (multiple)
    │           ├── Cover Image
    │           ├── Metadata
    │           ├── Status Badge
    │           └── Action Buttons
    │
    ├── Books Page (/books) - Admin
    │   ├── Search & Filters
    │   ├── Bulk Actions Bar
    │   │   ├── Select All
    │   │   ├── Delete Selected
    │   │   └── Export Selected
    │   ├── Add Book Button
    │   ├── View Toggle (Table/Grid)
    │   ├── Table View
    │   │   ├── Sortable Columns
    │   │   ├── Selection Checkboxes
    │   │   └── Quick Actions
    │   ├── Grid View
    │   │   └── BookCard (multiple)
    │   └── Dialogs
    │       ├── BookForm (Add/Edit)
    │       ├── Delete Confirmation
    │       └── Bulk Import/Export
    │           ├── BulkBookImport
    │           └── BulkBookExport
    │
    ├── BookDetail Page (/book/:id)
    │   ├── Back Navigation
    │   ├── Hero Section
    │   │   ├── Cover Image
    │   │   ├── Title & Author
    │   │   ├── Rating & Category
    │   │   └── Status Badge
    │   ├── Metadata Grid
    │   │   ├── Publication Info
    │   │   ├── Language & Pages
    │   │   └── Location
    │   ├── Description Section
    │   ├── Tags Section
    │   ├── Action Panel (Role-based)
    │   │   ├── Library: Borrow Button
    │   │   └── Bookstore: Add to Cart + Quantity
    │   ├── Author & Publication Details
    │   └── Related Books Section
    │       └── BookCard (minimal variant)
    │
    └── EditBook Page (/books/edit/:id)
        ├── Breadcrumb Navigation
        ├── Form Header
        └── BookForm Component
            ├── Required Fields
            │   ├── Title, Author, ISBN
            │   ├── Category, Publisher
            │   ├── Year, Price, Stock
            │   └── Status
            ├── Optional Fields
            │   ├── Description
            │   ├── Cover Image URL
            │   ├── Location, Language
            │   └── Page Count
            ├── Cover Preview
            ├── Validation
            └── Submit/Cancel Actions
```

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                  User Action (Search/Filter)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Catalog/Books Page (State Update)                  │
│  • Update searchQuery state                                     │
│  • Update filter states (category, publisher, year, price)     │
│  • Trigger re-render                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│           React Query (Cached Data Retrieval)                   │
│  • Check cache for books data                                   │
│  • Return cached data if available                              │
│  • Fetch from Supabase if stale/missing                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Client-Side Filtering Logic                        │
│  • Filter by search query (title, author, ISBN)                │
│  • Filter by category                                           │
│  • Filter by publisher                                          │
│  • Filter by year                                               │
│  • Filter by price range                                        │
│  • Combine with AND logic                                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Render Filtered Results                            │
│  • Map filtered books to BookCard components                    │
│  • Apply grid or list layout                                    │
│  • Show "No results" if empty                                   │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                  User Action (Add/Edit Book)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              BookForm Component (Form Submission)               │
│  • Validate all required fields                                │
│  • Validate number ranges (price, stock, year)                 │
│  • Get authenticated user ID                                    │
│  • Prepare book data object                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│           Supabase Mutation (Insert/Update)                     │
│  • INSERT: supabase.from('books').insert(bookData)             │
│  • UPDATE: supabase.from('books').update(bookData).eq('id')    │
│  • RLS checks user_id matches authenticated user               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│         React Query Cache Invalidation                          │
│  • Invalidate ["books"] query                                   │
│  • Trigger automatic refetch                                    │
│  • Update UI with new data                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Success Feedback & Navigation                      │
│  • Show success toast notification                              │
│  • Navigate back to books list                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Catalog Page (`src/pages/Catalog.tsx`)

**Purpose**: Public-facing book browsing interface with search and filtering capabilities

**Key Features**:
- **View Modes**: Toggle between grid and list layouts
- **Real-time Search**: Search by title, author, or ISBN with instant results
- **Multi-Filter Support**: Filter by category, publisher, publication year, and price range
- **Mobile-Responsive**: Filter drawer on mobile, inline filters on desktop
- **Stock Indicators**: Visual badges showing availability status
- **Category Color Coding**: Color-coded category badges for quick identification

**Component State**:
```typescript
interface CatalogState {
  searchQuery: string;                    // Search input value
  categoryFilter: BookCategory | string;  // Selected category
  publisherFilter: string;                // Selected publisher
  yearFilter: string;                     // Selected year
  priceRange: {                           // Price range filter
    min: number;
    max: number;
  } | null;
  viewMode: "grid" | "list";              // Current view mode
  isFilterActive: boolean;                // Any filters applied
}
```

**Data Fetching Strategy**:
- React Query with `["books", userId]` cache key
- Fetch all books for user on mount
- Client-side filtering for instant results
- Automatic refetch on mutations

**Filter Logic**:
```typescript
const filteredBooks = books.filter(book => {
  const matchesSearch = !searchQuery || 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.isbn.includes(searchQuery);
  
  const matchesCategory = !categoryFilter || book.category === categoryFilter;
  const matchesPublisher = !publisherFilter || book.publisher === publisherFilter;
  const matchesYear = !yearFilter || book.publicationYear.toString() === yearFilter;
  const matchesPrice = !priceRange || 
    (book.price >= priceRange.min && book.price <= priceRange.max);
  
  return matchesSearch && matchesCategory && matchesPublisher && 
         matchesYear && matchesPrice;
});
```

**Responsive Breakpoints**:
- **Mobile** (< md): Single column grid, filter drawer
- **Tablet** (md-lg): 2-3 column grid, inline filters
- **Desktop** (lg+): 4-6 column grid, full filter panel

### 2. Books Page (`src/pages/Books.tsx`)

**Purpose**: Admin interface for comprehensive book inventory management

**Key Features**:
- **Dual View Modes**: Table view for detailed data, grid view for visual browsing
- **Advanced Filtering**: Category, publisher, year, and status filters
- **Bulk Operations**: Select multiple books for batch actions
- **Bulk Delete**: Delete multiple books with confirmation
- **Bulk Export**: Export selected books to CSV
- **Sortable Columns**: Click column headers to sort (table view)
- **Quick Actions**: View, edit, and delete buttons for each book
- **Add Book**: Dialog with BookForm for adding new books

**Component State**:
```typescript
interface BooksPageState {
  searchQuery: string;
  sorting: {
    column: string;
    direction: "asc" | "desc";
  };
  categoryFilter: string;
  publisherFilter: string;
  yearFilter: string;
  statusFilter: string;
  selectionMode: boolean;        // Bulk selection active
  selectedBooks: string[];       // Array of selected book IDs
  viewMode: "table" | "grid";
}
```

**Bulk Operations Flow**:
```
1. User clicks "Select" button → selectionMode = true
2. Checkboxes appear on all book cards/rows
3. User selects individual books or "Select All"
4. selectedBooks array updated with IDs
5. Bulk action buttons enabled (Delete, Export)
6. User clicks bulk action → Confirmation dialog
7. Action executed on all selected books
8. UI updates, selection cleared
```

**Table View Features**:
- Sortable columns: Title, Author, Category, Year, Price, Stock, Status
- Thumbnail cover images
- Status badges with color coding
- Action buttons in last column
- Responsive: Horizontal scroll on mobile

**Grid View Features**:
- Same BookCard component as Catalog
- Action buttons overlay on hover
- Selection checkboxes in corner
- Responsive grid layout

### 3. BookDetail Page (`src/pages/BookDetail.tsx`)

**Purpose**: Comprehensive single book information display with role-based actions

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────┐
│  Back Button                          Cart Button (BS)  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌─────────────────────────────────┐│
│  │              │  │  Title                          ││
│  │    Cover     │  │  Author                         ││
│  │    Image     │  │  ⭐⭐⭐⭐⭐ 4.5                  ││
│  │              │  │  [Category Badge] [Status]      ││
│  │              │  │                                 ││
│  └──────────────┘  └─────────────────────────────────┘│
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Metadata Grid                                      ││
│  │  📅 Year  🌐 Language  📄 Pages  📍 Location       ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Description                                        ││
│  │  [Full book description text...]                   ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Tags: [Fiction] [Mystery] [Bestseller]            ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Action Panel (Role-based)                         ││
│  │  Library: [Borrow Book Button]                     ││
│  │  Bookstore: [Qty: 1] [Add to Cart Button]         ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Author & Publication Details                      ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Related Books (Same Category)                     ││
│  │  [BookCard] [BookCard] [BookCard] [BookCard]      ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

**Conditional Rendering Logic**:
```typescript
// Action Panel varies by user role
if (userRole === "Library") {
  return (
    <div>
      <p>Status: {book.status}</p>
      <p>Available: {book.stock} copies</p>
      <Button onClick={handleBorrow}>Borrow Book</Button>
    </div>
  );
} else if (userRole === "Book Store") {
  return (
    <div>
      <p>Price: ${book.price}</p>
      <p>In Stock: {book.stock}</p>
      <Input type="number" value={quantity} onChange={setQuantity} />
      <Button onClick={handleAddToCart}>Add to Cart</Button>
    </div>
  );
}
```

**Related Books Logic**:
- Fetch books with same category
- Exclude current book
- Limit to 4-6 books
- Use minimal BookCard variant
- Link to their detail pages

### 4. EditBook Page (`src/pages/EditBook.tsx`)

**Purpose**: Dedicated page for adding new books or editing existing ones

**Form Fields**:

**Required Fields**:
- Title (text)
- Author (text)
- ISBN (text, unique)
- Category (select dropdown)
- Publisher (text)
- Publication Year (number, 1000-current year)
- Price (number, >= 0)
- Stock (number, >= 0)
- Status (select: Available, Borrowed, Reserved, Damaged, Lost)

**Optional Fields**:
- Description (textarea)
- Cover Image URL (text with preview)
- Location (text, e.g., "Shelf A3")
- Language (text, default "English")
- Page Count (number)

**Features**:
- **Breadcrumb Navigation**: Home > Books > Edit Book / Add Book
- **Pre-population**: Fetch and fill form for editing
- **Real-time Preview**: Cover image preview updates as URL changes
- **Validation**: Client-side validation before submission
- **Loading States**: Disable form during save
- **Error Handling**: Display validation errors inline
- **Success Feedback**: Toast notification on successful save

**Validation Rules**:
```typescript
- Title: Required, max 200 chars
- Author: Required, max 100 chars
- ISBN: Required, unique, format validation
- Category: Required, must be valid BookCategory
- Publisher: Required, max 100 chars
- Year: Required, 1000 <= year <= current year
- Price: Required, >= 0
- Stock: Required, >= 0, integer
- Status: Required, must be valid BookStatus
```

### 5. BookForm Component (`src/components/BookForm.tsx`)

**Purpose**: Reusable form component for book creation and editing

**Props Interface**:
```typescript
interface BookFormProps {
  book?: Book;                    // Existing book for edit mode
  onSubmit: (book: Book) => void; // Submit handler
  onCancel: () => void;           // Cancel handler
  isLoading?: boolean;            // Loading state
}
```

**Role-Based Behavior**:
```typescript
const { userRole } = useAuth();

// Library users don't need to set price
if (userRole === "Library") {
  // Disable price field
  // Set price to 0 automatically
  // Hide price-related UI
}
```

**Form Submission Flow**:
```
1. User fills/edits form fields
2. User clicks "Save" button
3. Validate all fields client-side
4. If validation fails: Show errors, stop
5. If validation passes:
   a. Get authenticated user ID
   b. Prepare book data object
   c. Call onSubmit prop with data
   d. Parent handles Supabase mutation
   e. Show loading state
6. On success: Show toast, navigate away
7. On error: Show error toast, keep form open
```

**Cover Image Preview**:
- Input field for image URL
- Preview image below input
- Show placeholder if URL empty
- Show error icon if image fails to load
- Fallback to default book icon

### 6. BookCard Component (`src/components/BookCard.tsx`)

**Purpose**: Reusable card component for displaying book information

**Props Interface**:
```typescript
interface BookCardProps {
  book: Book;
  variant?: "full" | "minimal";
  onSelect?: (id: string) => void;
  isSelected?: boolean;
  showActions?: boolean;
}
```

**Variants**:

**Full Variant** (Default):
```
┌─────────────────────┐
│                     │
│    Cover Image      │
│                     │
├─────────────────────┤
│ Title               │
│ Author              │
│ [Category] [Status] │
│ ⭐⭐⭐⭐⭐ 4.5      │
│ Stock: 12           │
│ [Details Button]    │
└─────────────────────┘
```

**Minimal Variant**:
```
┌──────────────┐
│  Cover Image │
├──────────────┤
│ Title        │
│ Author       │
└──────────────┘
```

**Features**:
- **Lazy Loading**: Images load as they enter viewport
- **Fallback**: Default book icon if image fails
- **Status Badges**: Color-coded status indicators
- **Category Badges**: Color-coded category tags
- **Hover Effects**: Subtle lift and shadow on hover
- **Selection Mode**: Checkbox appears when selectionMode active
- **Quick Actions**: View/Edit/Delete buttons (full variant)

## Data Models

### Book Interface

```typescript
interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: BookCategory;
  publicationYear: number;
  publisher: string;
  description: string;
  price: number;
  status: BookStatus;
  coverImage: string;
  stock: number;
  location?: string;
  rating?: number;
  pageCount?: number;
  language?: string;
  tags?: string[];
  salesCount: number;
  user_id?: string;
}
```

### Database Schema

```sql
books table:
- id: UUID (PK)
- title: TEXT
- author: TEXT
- isbn: TEXT
- publisher: TEXT
- publication_year: INTEGER
- category: TEXT
- description: TEXT
- cover_image: TEXT
- price: NUMERIC
- stock: INTEGER
- status: TEXT
- language: TEXT
- page_count: INTEGER
- location: TEXT
- rating: NUMERIC
- tags: TEXT[]
- sales_count: INTEGER
- user_id: UUID (FK)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## Search and Filter Logic

### Search Implementation

**Search Fields**: Title, Author, ISBN

**Algorithm**:
```typescript
const matchesSearch = (book: Book, query: string): boolean => {
  if (!query) return true; // No search query = show all
  
  const lowerQuery = query.toLowerCase();
  
  return (
    book.title.toLowerCase().includes(lowerQuery) ||
    book.author.toLowerCase().includes(lowerQuery) ||
    book.isbn.toLowerCase().includes(lowerQuery)
  );
};
```

**Performance Optimization**:
- Case-insensitive search using toLowerCase()
- Short-circuit evaluation (returns true immediately if no query)
- Client-side filtering for instant results
- Optional: Debounce input for 300ms to reduce re-renders

### Filter Combination Logic

**All filters use AND logic** - books must match ALL active filters:

```typescript
const filteredBooks = books.filter(book => {
  // Search filter
  const matchesSearch = matchesSearchQuery(book, searchQuery);
  
  // Category filter
  const matchesCategory = !categoryFilter || 
    book.category === categoryFilter;
  
  // Publisher filter
  const matchesPublisher = !publisherFilter || 
    book.publisher === publisherFilter;
  
  // Year filter
  const matchesYear = !yearFilter || 
    book.publicationYear.toString() === yearFilter;
  
  // Price range filter
  const matchesPrice = !priceRange || 
    (book.price >= priceRange.min && book.price <= priceRange.max);
  
  // Status filter (Books page only)
  const matchesStatus = !statusFilter || 
    book.status === statusFilter;
  
  // Combine all filters with AND
  return matchesSearch && matchesCategory && matchesPublisher && 
         matchesYear && matchesPrice && matchesStatus;
});
```

### Dynamic Filter Options

**Categories**: Extracted from existing books in catalog
```typescript
const categories = [...new Set(books.map(book => book.category))];
```

**Publishers**: Unique publishers from all books
```typescript
const publishers = [...new Set(books.map(book => book.publisher))].sort();
```

**Years**: Sorted descending from most recent
```typescript
const years = [...new Set(books.map(book => book.publicationYear))]
  .sort((a, b) => b - a);
```

**Statuses**: Predefined enum values
```typescript
const statuses = ["Available", "Borrowed", "Reserved", "Damaged", "Lost"];
```

### Filter State Management

**Active Filter Indicator**:
```typescript
const isFilterActive = !!(
  searchQuery ||
  categoryFilter ||
  publisherFilter ||
  yearFilter ||
  priceRange ||
  statusFilter
);
```

**Clear All Filters**:
```typescript
const clearAllFilters = () => {
  setSearchQuery("");
  setCategoryFilter("");
  setPublisherFilter("");
  setYearFilter("");
  setPriceRange(null);
  setStatusFilter("");
};
```

## View Modes

**Grid View**: Responsive columns (2-6 based on screen size), card-based layout, cover image prominent, quick view button, stock status badge

**List View**: Table format on desktop, horizontal cards on mobile, more metadata visible, sortable columns, bulk selection checkboxes

## Bulk Operations

### Bulk Import (CSV)

**Component**: `BulkBookImport` (`src/components/BulkBookImport.tsx`)

**Features**:
- CSV file upload via drag-and-drop or file picker
- Automatic field mapping from CSV headers
- Data validation before import
- Progress indicator during import
- Error reporting with line numbers
- Success summary

**CSV Format Expected**:
```csv
title,author,isbn,category,publisher,publication_year,price,stock,status,description,cover_image,location,language,page_count
"Book Title","Author Name","1234567890","Fiction","Publisher","2023","19.99","10","Available","Description","https://...","A1","English","300"
```

**Import Flow**:
```
1. User selects CSV file
2. Parse CSV with Papa Parse library
3. Validate headers match expected fields
4. Validate each row:
   - Required fields present
   - Data types correct
   - Value ranges valid
5. Show preview of first 5 rows
6. User confirms import
7. Batch insert to Supabase (chunks of 100)
8. Show progress bar
9. Display results:
   - Success count
   - Error count with details
   - Skip duplicates (ISBN exists)
```

**Validation Rules**:
- Title, author, ISBN, category, publisher, year, price, stock, status: Required
- ISBN: Must be unique (check existing books)
- Year: 1000 <= year <= current year
- Price: >= 0
- Stock: >= 0, integer
- Status: Must be valid enum value

**Error Handling**:
- Invalid CSV format: Show error message
- Missing required fields: List missing fields
- Validation errors: Show row number and error
- Duplicate ISBN: Skip row, log warning
- Network errors: Retry failed rows

### Bulk Export (CSV)

**Component**: `BulkBookExport` (`src/components/BulkBookExport.tsx`)

**Features**:
- Export all books or selected books only
- All fields included in CSV
- Automatic file download
- Filename with timestamp

**Export Flow**:
```
1. User clicks "Export" button
2. Get books to export (all or selected)
3. Convert to CSV format with Papa Parse
4. Include all fields in order
5. Generate filename: books_export_YYYY-MM-DD_HH-MM-SS.csv
6. Trigger browser download
7. Show success toast
```

**CSV Output Format**:
```csv
id,title,author,isbn,category,publisher,publication_year,price,stock,status,description,cover_image,location,language,page_count,rating,sales_count,created_at,updated_at
"uuid","Title","Author","ISBN","Category","Publisher",2023,19.99,10,"Available","Description","URL","A1","English",300,4.5,25,"2024-01-01","2024-01-01"
```

**Use Cases**:
- Backup book inventory
- Transfer data to another system
- Analyze data in spreadsheet
- Share catalog with partners

### Bulk Delete

**Features**:
- Select multiple books via checkboxes
- "Delete Selected" button appears when books selected
- Confirmation dialog shows count of books to delete
- Batch delete operation
- Optimistic UI update
- Success/error feedback

**Delete Flow**:
```
1. User enters selection mode
2. User selects books (checkboxes)
3. User clicks "Delete Selected"
4. Confirmation dialog appears:
   "Are you sure you want to delete X books? This action cannot be undone."
5. User confirms
6. Batch delete from Supabase
7. Update React Query cache
8. Clear selection
9. Show success toast: "X books deleted successfully"
```

**Safety Measures**:
- Confirmation dialog required
- Show count of books to delete
- Cannot delete books with active borrows (check borrowings table)
- Soft delete option (set status to "Deleted" instead of removing)

## Error Handling

**Loading States**: Skeleton loaders, spinner with book icon, loading messages

**Error States**: No books found message, clear filters option, network error display, retry functionality

**Validation**: Required field checks, ISBN uniqueness, stock >= 0, price >= 0, year range validation

## Performance Optimizations

**React Query Caching**: Query key `["books", userId]`, automatic refetch on mutation, optimistic updates for delete

**Client-Side Filtering**: Filter after fetch for responsiveness, memoized filter results, optional debounced search input

**Image Optimization**: Lazy loading, error fallbacks, placeholder during load

## Responsive Design

**Breakpoints**:
- Mobile (< md): Single column, drawer filters
- Tablet (md-lg): 2-3 columns, inline filters
- Desktop (lg+): 4-6 columns, full filters

**Mobile Optimizations**: Filter drawer instead of inline, simplified table view, touch-friendly buttons, stacked layouts

## Integration Points

### Supabase Integration

**Database Operations**:
```typescript
// Fetch all books for user
const { data: books } = await supabase
  .from('books')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// Insert new book
const { data, error } = await supabase
  .from('books')
  .insert({
    ...bookData,
    user_id: userId,
  });

// Update existing book
const { error } = await supabase
  .from('books')
  .update(bookData)
  .eq('id', bookId)
  .eq('user_id', userId);

// Delete book
const { error } = await supabase
  .from('books')
  .delete()
  .eq('id', bookId)
  .eq('user_id', userId);
```

**Row Level Security (RLS) Policies**:
```sql
-- SELECT: Users can only see their own books
CREATE POLICY "Users can view own books"
  ON books FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can only create books for themselves
CREATE POLICY "Users can insert own books"
  ON books FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own books
CREATE POLICY "Users can update own books"
  ON books FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: Users can only delete their own books
CREATE POLICY "Users can delete own books"
  ON books FOR DELETE
  USING (auth.uid() = user_id);
```

**Real-time Subscriptions** (Optional):
```typescript
// Listen for changes to books table
const subscription = supabase
  .channel('books_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'books',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Invalidate React Query cache
    queryClient.invalidateQueries(['books']);
  })
  .subscribe();
```

### React Query Integration

**Query Configuration**:
```typescript
// Fetch books query
const { data: books, isLoading, error } = useQuery({
  queryKey: ['books', userId],
  queryFn: () => fetchBooks(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

**Mutation Handling**:
```typescript
// Add book mutation
const addBookMutation = useMutation({
  mutationFn: (bookData: Book) => addBook(bookData),
  onSuccess: () => {
    queryClient.invalidateQueries(['books']);
    toast({ title: "Book added successfully" });
  },
  onError: (error) => {
    toast({ 
      title: "Error adding book", 
      description: error.message,
      variant: "destructive" 
    });
  },
});

// Update book mutation
const updateBookMutation = useMutation({
  mutationFn: ({ id, data }: { id: string; data: Book }) => 
    updateBook(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries(['books']);
    toast({ title: "Book updated successfully" });
  },
});

// Delete book mutation
const deleteBookMutation = useMutation({
  mutationFn: (bookId: string) => deleteBook(bookId),
  onMutate: async (bookId) => {
    // Optimistic update
    await queryClient.cancelQueries(['books']);
    const previousBooks = queryClient.getQueryData(['books']);
    
    queryClient.setQueryData(['books'], (old: Book[]) =>
      old.filter(book => book.id !== bookId)
    );
    
    return { previousBooks };
  },
  onError: (err, bookId, context) => {
    // Rollback on error
    queryClient.setQueryData(['books'], context.previousBooks);
  },
  onSettled: () => {
    queryClient.invalidateQueries(['books']);
  },
});
```

**Cache Invalidation Strategy**:
- Invalidate on all mutations (add, update, delete)
- Automatic refetch after invalidation
- Optimistic updates for delete operations
- Background refetch on window focus

### Shopping Cart Integration (Bookstore Mode)

**Add to Cart from BookDetail**:
```typescript
import { useCart } from "@/hooks/use-cart";

const BookDetail = () => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  
  const handleAddToCart = () => {
    addItem({
      id: book.id,
      title: book.title,
      price: book.price,
      quantity: quantity,
      coverImage: book.coverImage,
    });
    
    toast({ title: `Added ${quantity} to cart` });
  };
  
  return (
    <div>
      <Input 
        type="number" 
        value={quantity} 
        onChange={(e) => setQuantity(Number(e.target.value))}
        min={1}
        max={book.stock}
      />
      <Button onClick={handleAddToCart}>Add to Cart</Button>
    </div>
  );
};
```

**Cart Context Methods**:
- `addItem(item)`: Add book to cart with quantity
- `updateQuantity(id, quantity)`: Update item quantity
- `removeItem(id)`: Remove item from cart
- `clearCart()`: Empty cart
- `cartItems`: Array of cart items
- `totalPrice`: Calculated total

### Circulation Integration (Library Mode)

**Borrow Button from BookDetail**:
```typescript
const BookDetail = () => {
  const navigate = useNavigate();
  
  const handleBorrow = () => {
    // Navigate to circulation page with book context
    navigate('/book-circulation', {
      state: {
        selectedBook: book,
        action: 'borrow'
      }
    });
  };
  
  return (
    <div>
      <p>Status: {book.status}</p>
      <p>Available: {book.stock} copies</p>
      <Button 
        onClick={handleBorrow}
        disabled={book.stock === 0 || book.status !== 'Available'}
      >
        Borrow Book
      </Button>
    </div>
  );
};
```

**Circulation Page Integration**:
- Receives book data via location state
- Pre-fills book selection in borrow form
- Creates borrowing record
- Decrements book stock
- Updates book status if needed

## Testing Strategy

### Unit Tests

- Filter logic
- Search functionality
- Form validation
- Bulk selection logic

### Integration Tests

- CRUD operations
- Search and filter combinations
- Bulk import/export
- View mode switching

### E2E Tests

- Complete book addition flow
- Search and filter workflow
- Bulk operations
- Book detail navigation

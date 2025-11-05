# Design Document: Advanced Book Features

## Overview

This document outlines the technical design for advanced book management features including duplicate detection, bulk editing, trash system, quick editing, favorites, accessibility enhancements, and export/print capabilities.

## Architecture

### Database Schema Changes

#### New Tables

```sql
-- Favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_book_id ON favorites(book_id);

-- Keyboard shortcuts preferences
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  keyboard_shortcuts_enabled BOOLEAN DEFAULT true,
  custom_shortcuts JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Modified Tables

```sql
-- Add soft delete to books table
ALTER TABLE books ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE books ADD COLUMN deleted_by UUID REFERENCES auth.users(id);

CREATE INDEX idx_books_deleted_at ON books(deleted_at);

-- Add duplicate detection fields
ALTER TABLE books ADD COLUMN duplicate_checked BOOLEAN DEFAULT false;
ALTER TABLE books ADD COLUMN duplicate_of UUID REFERENCES books(id);
```

### Component Architecture

```
Books Page
├── BookGrid/BookTable
│   ├── BookCard (with favorite button)
│   ├── InlineEditCell (for table view)
│   └── BulkActionBar (when items selected)
│       ├── BulkEditModal
│       ├── BulkDeleteButton
│       ├── PrintLabelsButton
│       └── ExportButton
├── DuplicateWarningDialog
├── KeyboardShortcutsProvider
└── FocusManager

Trash Page
├── TrashGrid/TrashTable
│   └── TrashBookCard
│       ├── RestoreButton
│       └── PermanentDeleteButton
├── EmptyTrashButton
└── AutoDeleteWarning

New Components
├── BulkEditModal
├── DuplicateDetector
├── InlineEditField
├── FavoriteButton
├── ExportDialog
├── PrintLabelsDialog
├── KeyboardShortcutsHelp
└── FocusManager
```

## Feature Designs

### 1. Duplicate Detection

#### Detection Algorithm

```typescript
interface DuplicateCheck {
  exactISBN: Book[];
  similarTitle: Book[];
  titleAndAuthor: Book[];
}

async function checkDuplicates(book: Partial<Book>): Promise<DuplicateCheck> {
  // 1. Exact ISBN match (highest priority)
  const exactISBN = await supabase
    .from('books')
    .select('*')
    .eq('isbn', book.isbn)
    .is('deleted_at', null);

  // 2. Similar title using trigram similarity
  const similarTitle = await supabase
    .rpc('find_similar_titles', { 
      search_title: book.title,
      threshold: 0.6 
    });

  // 3. Title + Author combination
  const titleAndAuthor = await supabase
    .from('books')
    .select('*')
    .ilike('title', `%${book.title}%`)
    .ilike('author', `%${book.author}%`)
    .is('deleted_at', null);

  return { exactISBN, similarTitle, titleAndAuthor };
}
```

#### UI Flow

1. User enters ISBN → debounced check (500ms)
2. If duplicates found → show warning banner
3. User can click "View Similar Books" → opens dialog
4. Dialog shows potential duplicates with details
5. User can mark as "Not a duplicate" and proceed

### 2. Bulk Edit Operations

#### Editable Fields

- Category (dropdown)
- Status (dropdown)
- Publisher (text)
- Location (text)
- Tags (multi-select)
- Price (number, with confirmation)
- Stock (number, with confirmation)

#### UI Design

```
┌─────────────────────────────────────────┐
│  Bulk Edit (5 books selected)      [X] │
├─────────────────────────────────────────┤
│                                         │
│  ☐ Category:     [Select Category ▼]   │
│  ☐ Status:       [Select Status ▼]     │
│  ☐ Publisher:    [Enter publisher...]   │
│  ☐ Location:     [Enter location...]    │
│  ☐ Tags:         [Select tags...]       │
│                                         │
│  ⚠️ Only checked fields will be updated │
│                                         │
│  [Preview Changes]  [Cancel]  [Apply]  │
└─────────────────────────────────────────┘
```

#### Implementation

```typescript
interface BulkEditData {
  category?: string;
  status?: BookStatus;
  publisher?: string;
  location?: string;
  tags?: string[];
}

async function bulkUpdateBooks(
  bookIds: string[],
  updates: BulkEditData
): Promise<{ success: number; failed: number }> {
  const results = await Promise.allSettled(
    bookIds.map(id => 
      supabase
        .from('books')
        .update(updates)
        .eq('id', id)
    )
  );

  return {
    success: results.filter(r => r.status === 'fulfilled').length,
    failed: results.filter(r => r.status === 'rejected').length
  };
}
```

### 3. Trash and Restore System

#### Soft Delete Implementation

```typescript
// Soft delete
async function moveToTrash(bookId: string, userId: string) {
  await supabase
    .from('books')
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: userId
    })
    .eq('id', bookId);
}

// Restore
async function restoreFromTrash(bookId: string) {
  await supabase
    .from('books')
    .update({
      deleted_at: null,
      deleted_by: null
    })
    .eq('id', bookId);
}

// Permanent delete
async function permanentlyDelete(bookId: string) {
  await supabase
    .from('books')
    .delete()
    .eq('id', bookId);
}

// Auto-cleanup (run daily via cron)
async function cleanupOldTrash() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  await supabase
    .from('books')
    .delete()
    .lt('deleted_at', thirtyDaysAgo.toISOString())
    .not('deleted_at', 'is', null);
}
```

#### Trash Page UI

```
┌─────────────────────────────────────────────────────┐
│  Trash (23 items)                    [Empty Trash]  │
├─────────────────────────────────────────────────────┤
│  ⚠️ Items are permanently deleted after 30 days     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ Book Title                                    │  │
│  │ by Author Name                                │  │
│  │ Deleted: 2 days ago                           │  │
│  │                      [Restore] [Delete Forever]│  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 4. Quick Inline Edit

#### Editable Fields in Table View

- Stock (number input)
- Price (number input)
- Status (select dropdown)
- Location (text input)

#### Implementation

```typescript
function InlineEditCell({ 
  value, 
  bookId, 
  field, 
  type = 'text' 
}: InlineEditCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await supabase
        .from('books')
        .update({ [field]: editValue })
        .eq('id', bookId);
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update');
      setEditValue(value); // Revert
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <div 
        onDoubleClick={() => setIsEditing(true)}
        className="cursor-pointer hover:bg-accent/50"
      >
        {value}
      </div>
    );
  }

  return (
    <Input
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') {
          setEditValue(value);
          setIsEditing(false);
        }
      }}
      autoFocus
      disabled={isSaving}
    />
  );
}
```

### 5. Favorites System

#### Implementation

```typescript
function useFavorites(bookId: string) {
  const { user } = useAuth();

  const { data: isFavorite } = useQuery({
    queryKey: ['favorite', bookId, user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user!.id)
        .eq('book_id', bookId)
        .single();
      return !!data;
    },
    enabled: !!user
  });

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user!.id)
          .eq('book_id', bookId);
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user!.id, book_id: bookId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['favorite', bookId]);
    }
  });

  return { isFavorite, toggleFavorite };
}
```

#### UI Component

```typescript
function FavoriteButton({ bookId }: { bookId: string }) {
  const { isFavorite, toggleFavorite } = useFavorites(bookId);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => toggleFavorite.mutate()}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorite ? (
        <Star className="h-4 w-4 fill-primary text-primary" />
      ) : (
        <Star className="h-4 w-4" />
      )}
    </Button>
  );
}
```

### 6. Keyboard Shortcuts

#### Shortcut Map

```typescript
const KEYBOARD_SHORTCUTS = {
  'mod+k': 'Focus search',
  'mod+n': 'Add new book',
  'mod+e': 'Edit selected book',
  'delete': 'Delete selected book(s)',
  'escape': 'Close modal',
  'mod+/': 'Show keyboard shortcuts',
  'mod+f': 'Toggle favorites filter',
  'mod+shift+e': 'Bulk edit',
  'mod+p': 'Print labels',
  'mod+shift+d': 'Export data'
};
```

#### Implementation

```typescript
function KeyboardShortcutsProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const { selectedBooks } = useBookSelection();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }

      if (mod && e.key === 'n') {
        e.preventDefault();
        // Open add book modal
      }

      if (mod && e.key === 'e' && selectedBooks.length === 1) {
        e.preventDefault();
        navigate(`/books/edit/${selectedBooks[0]}`);
      }

      if (e.key === 'Delete' && selectedBooks.length > 0) {
        e.preventDefault();
        // Trigger delete confirmation
      }

      // ... more shortcuts
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedBooks, navigate]);

  return <>{children}</>;
}
```

### 7. Export Formats

#### Export Implementation

```typescript
interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  fields: string[];
  includeDeleted: boolean;
}

async function exportBooks(
  books: Book[],
  options: ExportOptions
) {
  switch (options.format) {
    case 'csv':
      return exportToCSV(books, options.fields);
    case 'json':
      return exportToJSON(books, options.fields);
    case 'xlsx':
      return exportToExcel(books, options.fields);
  }
}

function exportToCSV(books: Book[], fields: string[]) {
  const headers = fields.join(',');
  const rows = books.map(book =>
    fields.map(field => `"${book[field] || ''}"`).join(',')
  );
  const csv = [headers, ...rows].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `books-export-${Date.now()}.csv`;
  a.click();
}
```

### 8. Print Labels

#### Label Template

```typescript
interface LabelTemplate {
  name: string;
  width: number;
  height: number;
  columns: number;
  rows: number;
  marginTop: number;
  marginLeft: number;
  gapX: number;
  gapY: number;
}

const LABEL_TEMPLATES: Record<string, LabelTemplate> = {
  'avery-5160': {
    name: 'Avery 5160',
    width: 2.625,
    height: 1,
    columns: 3,
    rows: 10,
    marginTop: 0.5,
    marginLeft: 0.1875,
    gapX: 0.125,
    gapY: 0
  },
  // ... more templates
};
```

#### Print Component

```typescript
function PrintLabels({ books, template }: PrintLabelsProps) {
  return (
    <div className="print-labels" style={{
      width: '8.5in',
      height: '11in',
      padding: `${template.marginTop}in ${template.marginLeft}in`
    }}>
      {books.map((book, index) => (
        <div
          key={book.id}
          className="label"
          style={{
            width: `${template.width}in`,
            height: `${template.height}in`,
            marginRight: `${template.gapX}in`,
            marginBottom: `${template.gapY}in`
          }}
        >
          <div className="label-content">
            <div className="title">{book.title}</div>
            <div className="author">{book.author}</div>
            <Barcode value={book.isbn} />
            <div className="call-number">{book.location}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Accessibility Implementation

### Focus Management

```typescript
function FocusManager() {
  const [focusHistory, setFocusHistory] = useState<HTMLElement[]>([]);

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTab);
    return () => container.removeEventListener('keydown', handleTab);
  };

  return { trapFocus, focusHistory };
}
```

### ARIA Labels

All interactive elements must have proper labels:

```typescript
<Button
  variant="ghost"
  size="icon"
  onClick={handleEdit}
  aria-label={`Edit ${book.title}`}
>
  <Edit className="h-4 w-4" />
</Button>
```

## Performance Considerations

- Duplicate detection: Debounce API calls (500ms)
- Bulk operations: Process in batches of 50
- Trash page: Implement virtual scrolling for 1000+ items
- Export: Use Web Workers for large datasets
- Inline edit: Optimistic updates with rollback on error

## Error Handling

- Network errors: Retry with exponential backoff
- Validation errors: Show inline error messages
- Bulk operation failures: Show detailed error report
- Export failures: Allow retry or partial export

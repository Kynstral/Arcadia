# Member Page Enhancements - Design

## Architecture

### Component Structure
```
src/pages/
  Members.tsx                    # Main members page with all enhancements

src/components/members/
  MemberTable.tsx                # Enhanced table with inline editing
  MemberStats.tsx                # Statistics cards
  MemberFilters.tsx              # Advanced filtering
  MemberPagination.tsx           # Pagination controls
  MemberEmptyState.tsx           # Empty state component
  BulkMemberActions.tsx          # Bulk operations bar
  MemberForm.tsx                 # Add/Edit member form
  MemberDetail.tsx               # Member details view
  Import.tsx                     # CSV import with progress
  Export.tsx                     # CSV export
  index.ts                       # Barrel exports
```

## Data Flow

### Query Optimization
- Single query with joins for member data and borrowing counts
- Optimistic updates for status changes
- Query caching with 5-minute stale time
- Separate query for overdue tracking

### State Management
- React Query for server state
- Local state for UI (editing, pagination, filters)
- Keyboard shortcuts via KeyboardShortcutsProvider

## Key Features Implemented

### 1. Performance Improvements
- **Optimized Queries**: Single query with joins instead of N+1 queries
- **Query Caching**: 5-minute stale time, 10-minute garbage collection
- **Optimistic Updates**: Immediate UI feedback for status changes
- **Memoized Filtering**: useMemo for expensive filter operations

### 2. Loading States
- Replaced custom loaders with consistent Loader component
- Size 48 with accent variant for page loading
- Size 32 for section loading
- Size 16 with white variant for button loading

### 3. UI/UX Enhancements
- **Animations**: Fade-in and slide-in animations for page elements
- **Keyboard Shortcuts**: 
  - Ctrl/Cmd + K: Focus search
  - N: Add new member
  - Escape: Close dialogs
- **Hover Effects**: Smooth transitions on interactive elements
- **Row Click**: Click anywhere on row to view details

### 4. Inline Editing
- **Name Editing**: Click pencil icon to edit inline with Enter/Escape support
- **Status Editing**: Click status badge to open dropdown selector
- **Auto-save**: Changes saved immediately to database
- **Visual Feedback**: Edit icons appear on hover with orange accent

### 5. Overdue Tracking
- Query to fetch members with overdue books
- Red alert icon displayed next to member name
- Tooltip showing "Has overdue books"
- Real-time updates every 2 minutes

### 6. Bulk Operations
- Select multiple members with checkboxes
- Bulk status updates (Active, Inactive, Suspended, Banned)
- Bulk delete with confirmation
- Bulk export to CSV
- Selection count display

### 7. Enhanced Table
- **Sortable Columns**: Name, Email, Joined Date, Books, Status
- **Inline Actions**: View Details button, Edit icon, More menu
- **Tooltips**: All action buttons have descriptive tooltips
- **Accessibility**: ARIA labels, keyboard navigation

### 8. CSV Import/Export
- **Import**: Progress bar, validation, error reporting
- **Export**: Field selection, filtered data export
- **Template**: Pascal case headers (Name, Email, Phone, Address, Status)

### 9. Modal Editing
- Edit member opens same modal as Add Member
- No separate edit page needed
- Consistent UX across add/edit operations

## Styling

### Color Scheme
- Primary Accent: #E89B73 (terracotta)
- Hover backgrounds: Solid orange for action buttons
- Status badges: Color-coded (green, gray, amber, red)

### Hover States
- Edit pencil: Gray icon → Orange background with white icon
- Action buttons: Subtle background → Orange background
- Table rows: Transparent → Muted background

## Accessibility

- All interactive elements have ARIA labels
- Keyboard navigation fully supported
- Focus indicators visible
- Screen reader compatible
- Tooltips for icon-only buttons

## Performance Metrics

- Page load: < 2 seconds
- Filter application: < 300ms
- Inline edit save: < 500ms
- Bulk operations: < 5 seconds for 100 members

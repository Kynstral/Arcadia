# Implementation Plan: Book Catalog Management

- [x] 1. Set up database schema and types
  - [x] 1.1 Create books table in Supabase
    - Define all columns with proper types
    - Set up primary key and foreign keys
    - Add indexes for performance
    - _Requirements: 1.1, 3.1_

  - [x] 1.2 Configure Row Level Security policies
    - Enable RLS on books table
    - Create policies for SELECT, INSERT, UPDATE, DELETE
    - Restrict by user_id
    - _Requirements: 3.1, 5.5_

  - [x] 1.3 Define TypeScript interfaces
    - Create Book interface in types.ts
    - Define BookCategory and BookStatus types
    - Export all types
    - _Requirements: 1.1, 9.1_

- [x] 2. Implement Catalog page (public browsing)
  - [x] 2.1 Create Catalog page component
    - Set up page structure and layout
    - Add header with title and view toggle
    - _Requirements: 1.1, 1.4_

  - [x] 2.2 Implement data fetching with React Query
    - Create fetchBooks function
    - Set up useQuery hook
    - Handle loading and error states
    - _Requirements: 1.1, 1.2_

  - [x] 2.3 Build search functionality
    - Add search input with icon
    - Implement real-time filtering
    - Search by title, author, ISBN
    - Add clear search button
    - _Requirements: 2.1, 2.2, 2.5_

  - [x] 2.4 Create filter system
    - Add category filter dropdown
    - Add publisher filter dropdown
    - Add year filter dropdown
    - Implement filter combination logic
    - _Requirements: 2.2, 2.3, 2.4_

  - [x] 2.5 Build mobile filter drawer
    - Create drawer component for mobile
    - Add all filter options
    - Implement apply and clear actions
    - _Requirements: 2.2, 2.4_

  - [x] 2.6 Implement grid view
    - Create responsive grid layout
    - Display book cards with cover images
    - Show stock status badges
    - Add category color coding
    - _Requirements: 1.2, 1.3, 1.4_

  - [x] 2.7 Implement list view
    - Create list layout with horizontal cards
    - Show more metadata in list view
    - Make responsive for mobile
    - _Requirements: 1.2, 1.3_

  - [x] 2.8 Add view mode toggle
    - Create grid/list toggle buttons
    - Persist view mode in state
    - Apply appropriate layout
    - _Requirements: 1.4_

  - [x] 2.9 Handle empty states
    - Display "No books found" message
    - Show clear filters option
    - Add helpful messaging
    - _Requirements: 2.5_

- [x] 3. Implement Books page (admin management)
  - [x] 3.1 Create Books page component
    - Set up page structure
    - Add header with actions
    - _Requirements: 3.1, 3.2_

  - [x] 3.2 Implement search and filters
    - Add search input
    - Add category, publisher, year, status filters
    - Implement filter combination
    - Add clear filters button
    - _Requirements: 2.1, 2.2_

  - [x] 3.3 Build table view
    - Create sortable table
    - Add columns for all key fields
    - Implement column sorting
    - Show cover thumbnails
    - _Requirements: 3.1, 3.2_

  - [x] 3.4 Build grid view
    - Create card-based grid
    - Show cover images prominently
    - Add action buttons overlay
    - _Requirements: 3.1, 3.2_

  - [x] 3.5 Implement quick actions
    - Add view button (navigate to detail)
    - Add edit button (navigate to edit)
    - Add delete button with confirmation
    - _Requirements: 3.2, 4.1, 5.1_

  - [x] 3.6 Add bulk selection mode
    - Create selection mode toggle
    - Add checkboxes to each book
    - Implement select all functionality
    - Track selected books in state
    - _Requirements: 7.1, 7.2_

  - [x] 3.7 Implement bulk delete
    - Add delete selected button
    - Show confirmation dialog
    - Delete multiple books
    - Update UI after deletion
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 7.1_

  - [x] 3.8 Add bulk export functionality
    - Add export selected button
    - Integrate with BulkBookExport component
    - _Requirements: 8.1, 8.2, 8.5_

  - [x] 3.9 Implement add book action
    - Add "Add Book" button
    - Open BookForm dialog
    - Handle form submission
    - Refresh list after add
    - _Requirements: 3.1, 3.2, 3.4_

- [x] 4. Create BookDetail page
  - [x] 4.1 Set up page structure
    - Create two-column layout
    - Add back navigation
    - Add cart button (bookstore mode)
    - _Requirements: 6.1, 6.2_

  - [x] 4.2 Implement book data fetching
    - Fetch book by ID from Supabase
    - Handle loading state
    - Handle not found error
    - _Requirements: 6.1, 6.2_

  - [x] 4.3 Display cover image and basic info
    - Show large cover image
    - Display title, author, rating
    - Show category and status badges
    - _Requirements: 6.2, 6.3_

  - [x] 4.4 Create metadata grid
    - Display publication year, language, pages, location
    - Use icon + text format
    - Make responsive
    - _Requirements: 6.2, 6.5_

  - [x] 4.5 Add description section
    - Display full book description
    - Style as card
    - _Requirements: 6.2_

  - [x] 4.6 Display tags
    - Show book tags as badges
    - Handle empty tags
    - _Requirements: 6.2_

  - [x] 4.7 Implement action panel (library mode)
    - Show status and inventory
    - Add "Borrow Book" button
    - Navigate to circulation page
    - _Requirements: 6.4, 6.5_

  - [x] 4.8 Implement action panel (bookstore mode)
    - Show price and availability
    - Add quantity selector
    - Add "Add to Cart" button
    - Integrate with cart context
    - _Requirements: 6.4, 6.5_

  - [x] 4.9 Add author and publication details section
    - Display author information
    - Show publication details grid
    - _Requirements: 6.2, 6.5_

  - [x] 4.10 Implement related books section
    - Fetch books in same category
    - Display as grid of BookCards
    - Add "View All" link
    - _Requirements: 6.5_

- [x] 5. Create EditBook page
  - [x] 5.1 Set up page structure
    - Create form layout
    - Add breadcrumb navigation
    - Add header with back button
    - _Requirements: 4.1, 4.2_

  - [x] 5.2 Implement book data fetching (edit mode)
    - Fetch existing book data
    - Pre-populate form fields
    - Handle loading state
    - _Requirements: 4.1, 4.2_

  - [x] 5.3 Build form with all fields
    - Add all required fields
    - Add all optional fields
    - Implement proper input types
    - _Requirements: 3.2, 3.3, 4.2_

  - [x] 5.4 Add category and status dropdowns
    - Create Select components
    - Populate with all options
    - Handle selection changes
    - _Requirements: 3.2, 4.2, 9.1_

  - [x] 5.5 Implement cover image preview
    - Show preview when URL provided
    - Handle image load errors
    - Display placeholder
    - _Requirements: 3.3, 4.2_

  - [x] 5.6 Add form validation
    - Validate required fields
    - Validate number ranges
    - Validate year range
    - Show validation errors
    - _Requirements: 3.4, 4.3, 5.5_

  - [x] 5.7 Implement save functionality
    - Handle form submission
    - Call Supabase update/insert
    - Show success toast
    - Navigate back to books list
    - _Requirements: 3.4, 4.3, 4.4_

  - [x] 5.8 Add cancel functionality
    - Add cancel button
    - Navigate back without saving
    - _Requirements: 4.2_

- [x] 6. Create BookForm component
  - [x] 6.1 Build reusable form component
    - Accept book prop for editing
    - Support create and update modes
    - Add all form fields
    - _Requirements: 3.2, 4.2_

  - [x] 6.2 Implement role-based field handling
    - Disable price field for library role
    - Show appropriate labels
    - Set price to 0 for library
    - _Requirements: 3.2, 4.2_

  - [x] 6.3 Add form validation
    - Validate all required fields
    - Check number formats
    - Validate year range
    - _Requirements: 3.4, 4.3_

  - [x] 6.4 Implement submit handler
    - Get authenticated user
    - Prepare book data
    - Call Supabase insert/update
    - Handle success and errors
    - _Requirements: 3.4, 4.3_

  - [x] 6.5 Add cover image preview
    - Show preview when URL provided
    - Handle errors with fallback
    - _Requirements: 3.3_

- [x] 7. Create BookCard component
  - [x] 7.1 Build card layout
    - Create cover image section
    - Add metadata section
    - Make responsive
    - _Requirements: 1.2, 1.3_

  - [x] 7.2 Implement image handling
    - Lazy load images
    - Show placeholder during load
    - Handle load errors
    - _Requirements: 1.2_

  - [x] 7.3 Add status and category badges
    - Display status badge
    - Display category badge
    - Apply appropriate colors
    - _Requirements: 1.3, 9.1_

  - [x] 7.4 Implement action buttons
    - Add Details button
    - Add View/Select button
    - Handle click events
    - _Requirements: 1.5, 6.4_

  - [x] 7.5 Create minimal variant
    - Support minimal prop
    - Reduce size and details
    - Use for related books
    - _Requirements: 6.5_

- [x] 8. Implement bulk import/export
  - [x] 8.1 Create BulkBookImport component
    - Build CSV upload interface
    - Parse CSV file
    - Validate data
    - Import to database
    - Show progress and errors
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 8.2 Create BulkBookExport component
    - Build export interface
    - Generate CSV from books
    - Include all fields
    - Trigger download
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 8.3 Add import/export dialog
    - Create tabbed dialog
    - Add Import and Export tabs
    - Integrate components
    - _Requirements: 7.1, 8.1_

- [x] 9. Implement status and stock management
  - [x] 9.1 Add status indicators
    - Display status badges
    - Use color coding
    - Show in all views
    - _Requirements: 9.1, 9.2, 9.4_

  - [x] 9.2 Implement stock tracking
    - Display stock count
    - Show low stock warnings
    - Update on transactions
    - _Requirements: 10.1, 10.2, 10.5_

  - [x] 9.3 Add status update functionality
    - Allow manual status changes
    - Auto-update based on stock
    - _Requirements: 9.2, 9.3, 10.4_

  - [x] 9.4 Implement stock level warnings
    - Show "Out of Stock" for 0
    - Show "Low Stock" for < 5
    - Use color indicators
    - _Requirements: 10.5_

- [x] 10. Add search and filter optimizations
  - [x] 10.1 Implement client-side filtering
    - Filter after fetch for speed
    - Combine all filter conditions
    - Update results in real-time
    - _Requirements: 2.2, 2.3, 2.4_

  - [x] 10.2 Add filter state management
    - Track all active filters
    - Show filter active indicator
    - Provide clear all option
    - _Requirements: 2.2, 2.4, 2.5_

  - [x] 10.3 Optimize search performance
    - Debounce search input (optional)
    - Use memoization for filtered results
    - _Requirements: 2.2_

- [x] 11. Implement delete functionality
  - [x] 11.1 Add delete confirmation dialog
    - Show book title in confirmation
    - Add cancel and confirm buttons
    - Handle bulk delete confirmation
    - _Requirements: 5.1, 5.2_

  - [x] 11.2 Implement delete mutation
    - Use React Query mutation
    - Call deleteBook function
    - Update cache optimistically
    - _Requirements: 5.3, 5.4_

  - [x] 11.3 Add error handling
    - Show error toast on failure
    - Prevent deletion with active borrows
    - _Requirements: 5.3, 5.5_

- [x] 12. Test and optimize
  - [x] 12.1 Test CRUD operations
    - Verify create book
    - Verify read/view book
    - Verify update book
    - Verify delete book
    - _Requirements: 3.1-3.4, 4.1-4.4, 5.1-5.4_

  - [x] 12.2 Test search and filters
    - Verify search functionality
    - Test each filter independently
    - Test filter combinations
    - Test clear filters
    - _Requirements: 2.1-2.5_

  - [x] 12.3 Test bulk operations
    - Verify bulk selection
    - Test bulk delete
    - Test bulk import
    - Test bulk export
    - _Requirements: 7.1-7.5, 8.1-8.5_

  - [x] 12.4 Test responsive design
    - Verify mobile layout
    - Test tablet layout
    - Test desktop layout
    - Test filter drawer on mobile
    - _Requirements: 1.4, 2.4_

  - [x] 12.5 Verify stock and status management
    - Test stock updates
    - Verify status changes
    - Test low stock warnings
    - _Requirements: 9.1-9.4, 10.1-10.5_


- [ ] 13. Performance and UX enhancements
  - [x] 13.1 Implement debounced search
    - Create useDebounce custom hook
    - Apply to search input
    - Reduce unnecessary re-renders
    - Improve performance with large datasets
    - _Requirements: 2.2, 10.3_

  - [x] 13.2 Add pagination system
    - Add pagination state (currentPage, itemsPerPage)
    - Calculate total pages and page ranges
    - Implement pagination controls (Previous/Next)
    - Add items per page selector (10/25/50/100)
    - Reset pagination when filters change
    - _Requirements: 1.1, 2.5_

  - [x] 13.3 Improve book count display
    - Show "Showing X-Y of Z books" message
    - Display filtered vs total count
    - Add items per page selector
    - Show page number indicator
    - _Requirements: 1.1, 2.5_

  - [x] 13.4 Enhance empty states
    - Create distinct empty state for no books
    - Add "Add Your First Book" CTA
    - Improve "No results" message for filters
    - Add clear filters button in empty state
    - _Requirements: 2.5, 3.1_

  - [x] 13.5 Refactor into reusable components
    - Create components/books/ directory structure
    - Extract BookPagination component
    - Extract BookStats component
    - Extract BookFilters component
    - Extract BookEmptyState component
    - Create index.ts for exports
    - Update Books.tsx to use new components
    - Remove unused imports
    - _Requirements: 1.1, 3.1, 9.1_

  - [ ] 13.6 Add loading states for mutations
    - Show loading state during delete
    - Show loading state during bulk operations
    - Disable actions during loading
    - Add visual feedback
    - _Requirements: 3.4, 5.3, 7.4_

  - [ ] 13.7 Optimize select all functionality
    - Update to work with pagination
    - Select all on current page only
    - Add "Select all X books" option
    - Clear selection on page change
    - _Requirements: 7.2_


- [x] 14. Book card redesign and visual improvements
  - [x] 14.1 Extract BookCard component
    - Create BookCard.tsx in components/books/
    - Move card rendering logic from Books.tsx
    - Add props for book, selection, user role, callbacks
    - Export from index.ts
    - _Requirements: 1.2, 1.3, 3.1_

  - [x] 14.2 Redesign card overlay
    - Lower overlay opacity to 70% for better cover visibility
    - Add smooth transition on hover (increase to 90%)
    - Compact layout by default showing title, author, stock
    - Hide action buttons by default
    - _Requirements: 1.2, 1.3_

  - [x] 14.3 Add smooth expand animation
    - Use max-height and opacity transitions
    - Add ease-in-out timing for smooth motion
    - Expand overlay padding on hover
    - Show action buttons with fade-in effect
    - _Requirements: 1.2_

  - [x] 14.4 Add price badge for bookstore users
    - Show price when userRole is not "Library"
    - Style with primary color and background highlight
    - Position next to stock badge
    - Make font bold and larger for visibility
    - _Requirements: 1.2, 3.2_

  - [x] 14.5 Add status badge display
    - Show status badge when book is not "Available"
    - Use muted colors for status
    - Position below stock/price row
    - _Requirements: 1.3, 9.1_

  - [x] 14.6 Improve selection visual feedback
    - Add ring-2 ring-primary when selected
    - Animate checkbox with zoom-in effect
    - Use primary color for selected checkbox
    - Add hover scale effect on checkbox
    - Improve checkbox styling with backdrop blur
    - _Requirements: 7.1, 7.2_

  - [x] 14.7 Add tooltips to action buttons
    - Add Tooltip wrapper to View, Edit, Delete buttons
    - Set tooltips to appear on top with proper offset
    - Add delay duration to prevent instant appearance
    - Shorten tooltip text for cleaner look
    - _Requirements: 1.5, 6.4_

  - [x] 14.8 Fix tooltip rendering issues
    - Wrap TooltipContent in Portal
    - Remove overflow-hidden from Card component
    - Add overflow-hidden to image container instead
    - Ensure tooltips render at document body level
    - _Requirements: 1.5_

  - [x] 14.9 Apply design system colors
    - Use bg-card for overlay background
    - Use text-foreground and text-muted-foreground
    - Use bg-secondary for in-stock badge
    - Use bg-destructive for out-of-stock
    - Ensure proper light/dark mode support
    - _Requirements: 1.3, 9.1_

- [x] 15. Replace edit page with modal
  - [x] 15.1 Create AddBookModal component
    - Create AddBookModal.tsx in components/books/
    - Accept open, onOpenChange, book, userRole, onSuccess props
    - Render Dialog with BookForm inside
    - Show "Edit Book" or "Add New Book" title based on book prop
    - Add max-height and overflow for long forms
    - _Requirements: 3.1, 4.1_

  - [x] 15.2 Update BookCard to use modal
    - Change onEdit prop to accept callback instead of navigation
    - Call onEdit(book) instead of navigate
    - Remove navigation import if not needed elsewhere
    - _Requirements: 4.1_

  - [x] 15.3 Update Books.tsx for modal workflow
    - Add bookToEdit state
    - Create handleEdit function to set book and open modal
    - Create handleAddNew function to clear book and open modal
    - Pass bookToEdit to AddBookModal
    - Update handleBookFormSuccess to clear bookToEdit
    - _Requirements: 3.1, 4.1_

  - [x] 15.4 Update table view edit button
    - Change onClick to call handleEdit(book)
    - Remove navigation to /books/edit/:id
    - _Requirements: 3.2, 4.1_

  - [x] 15.5 Remove EditBook page and route
    - Delete src/pages/EditBook.tsx file
    - Remove EditBook import from App.tsx
    - Remove /books/edit/:id route from App.tsx
    - _Requirements: 4.1_

  - [x] 15.6 Clean up Books.tsx imports
    - Remove BookForm import (now in AddBookModal)
    - Remove unused Dialog imports
    - Import AddBookModal component
    - _Requirements: 3.1_

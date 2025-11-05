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

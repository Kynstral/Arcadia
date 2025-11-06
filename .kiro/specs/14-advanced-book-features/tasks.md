# Implementation Tasks: Advanced Book Features

## Phase 1: Database and Infrastructure

- [ ] 1. Database schema updates
  - [x] 1.1 Create migration for soft delete columns
    - Add deleted_at timestamp column to books table
    - Add deleted_by UUID column to books table
    - Create index on deleted_at
    - _Requirements: 3.1, 3.2_

  - [x] 1.2 Create favorites table
    - Create favorites table with user_id and book_id
    - Add unique constraint on (user_id, book_id)
    - Create indexes for performance
    - Add RLS policies for user-specific access
    - _Requirements: 5.1, 5.2_

  - [x] 1.3 Create user_preferences table
    - Create table for keyboard shortcuts preferences
    - Add default values for shortcuts
    - Add RLS policies
    - _Requirements: 6.2_

  - [x] 1.4 Add duplicate detection fields
    - Add duplicate_checked boolean column
    - Add duplicate_of UUID reference column
    - _Requirements: 1.1, 1.2_

  - [x] 1.5 Create database functions
    - Create find_similar_titles function using trigram similarity
    - Create cleanup_old_trash function for auto-deletion
    - Test functions with sample data
    - _Requirements: 1.5, 3.10_

## Phase 2: Trash and Restore System

- [x] 2. Implement soft delete functionality
  - [x] 2.1 Update delete mutations
    - Modify deleteBook to set deleted_at instead of hard delete
    - Add deleted_by user tracking
    - Update React Query mutations
    - _Requirements: 3.1, 3.2_

  - [x] 2.2 Update book queries
    - Add .is('deleted_at', null) filter to all book queries
    - Ensure deleted books don't appear in catalog
    - Update search and filter queries
    - _Requirements: 3.3_

  - [x] 2.3 Create Trash page
    - Create src/pages/Trash.tsx
    - Add route in App.tsx
    - Fetch books where deleted_at is not null
    - Display deletion date and deleted by user
    - Added book cover images and visual cards
    - _Requirements: 3.4, 3.5_

  - [x] 2.4 Add restore functionality
    - Create restoreBook mutation
    - Add Restore button to trash items
    - Show success toast on restore
    - Invalidate queries after restore
    - Added loading spinner with white variant
    - _Requirements: 3.6_

  - [x] 2.5 Add permanent delete
    - Create permanentlyDeleteBook mutation
    - Add confirmation dialog with Dialog component
    - Add "Delete Forever" button with loading state
    - _Requirements: 3.7, 3.9_

  - [x] 2.6 Add empty trash feature
    - Create emptyTrash mutation
    - Add "Empty Trash" button with confirmation
    - Show count of items to be deleted
    - Added loading spinner
    - _Requirements: 3.8, 3.9_

  - [x] 2.7 Add auto-deletion warning
    - Display banner about 30-day auto-deletion
    - Show days remaining for each item
    - Added countdown badge on book cards
    - _Requirements: 3.10, 3.11_

  - [x] 2.8 Add trash to sidebar
    - Add Trash link to sidebar navigation
    - Show count badge if trash has items
    - Add trash icon
    - _Requirements: 3.4_

  - [x] 2.9 Add Restore All functionality
    - Create restoreAllMutation
    - Add "Restore All" button next to Empty Trash
    - Show confirmation dialog with book count
    - Track success/failure counts
    - Added loading spinner with white variant
    - _Enhancement_

## Phase 3: Bulk Edit Operations

- [ ] 3. Implement bulk editing
  - [ ] 3.1 Create BulkEditModal component
    - Create src/components/books/BulkEditModal.tsx
    - Add checkboxes for each editable field
    - Add form inputs for category, status, publisher, location, tags
    - Only update checked fields
    - _Requirements: 2.2, 2.3_

  - [ ] 3.2 Add bulk edit button
    - Show button when multiple books selected
    - Display count of selected books
    - Open BulkEditModal on click
    - _Requirements: 2.1_

  - [ ] 3.3 Implement bulk update mutation
    - Create bulkUpdateBooks function
    - Process updates in parallel with Promise.allSettled
    - Track success and failure counts
    - _Requirements: 2.5, 2.7_

  - [ ] 3.4 Add preview functionality
    - Show preview of changes before applying
    - Display which books will be updated
    - Show old vs new values
    - _Requirements: 2.8_

  - [ ] 3.5 Add confirmation and feedback
    - Show confirmation message with counts
    - Display detailed error report for failures
    - Allow retry for failed updates
    - _Requirements: 2.6, 2.7_

  - [ ] 3.6 Add field validation
    - Validate inputs before submission
    - Show inline error messages
    - Prevent submission if validation fails
    - _Requirements: 2.4_

## Phase 4: Duplicate Detection

- [x] 4. Implement duplicate detection
  - [x] 4.1 Create duplicate detection service
    - Create src/lib/duplicate-detection.ts
    - Implement checkDuplicates function
    - Check ISBN, title, and title+author combinations
    - _Requirements: 1.1, 1.4_

  - [x] 4.2 Add ISBN duplicate check
    - Query for exact ISBN matches
    - Show warning dialog if found
    - Integrated with import process
    - _Requirements: 1.1, 1.2_

  - [x] 4.3 Add fuzzy title matching
    - Use trigram similarity for title matching
    - Set threshold at 0.6 for similarity
    - Return potential matches
    - _Requirements: 1.5_

  - [x] 4.4 Create DuplicateDetectionDialog
    - Create src/components/books/DuplicateDetectionDialog.tsx
    - Display list of potential duplicates with book covers
    - Show book details (title, author, ISBN)
    - Added scrollable area for long lists
    - Show loading spinner while checking
    - _Requirements: 1.6, 1.7_

  - [x] 4.5 Add confirmation flow
    - Allow user to proceed despite warning
    - Add "Skip Duplicates" option
    - Add "Import All" option
    - Show counts on buttons
    - _Requirements: 1.3_

  - [x] 4.6 Integrate with Import
    - Add duplicate check during CSV/JSON/Excel import
    - Show warning before importing
    - Track which books are duplicates
    - Allow selective import
    - _Requirements: 1.1, 1.4_

## Phase 5: Quick Inline Edit

- [ ] 5. Implement inline editing
  - [ ] 5.1 Create InlineEditCell component
    - Create src/components/books/InlineEditCell.tsx
    - Support text, number, and select types
    - Toggle edit mode on double-click
    - _Requirements: 4.1, 4.2_

  - [ ] 5.2 Add keyboard controls
    - Save on Enter key
    - Cancel on Escape key
    - Save on blur (click outside)
    - _Requirements: 4.3, 4.4_

  - [ ] 5.3 Add validation
    - Validate input before saving
    - Show error message if invalid
    - Prevent saving invalid data
    - _Requirements: 4.5, 4.6_

  - [ ] 5.4 Add loading state
    - Show spinner while saving
    - Disable input during save
    - _Requirements: 4.7_

  - [ ] 5.5 Add error handling
    - Revert to original value on error
    - Show error toast
    - Allow retry
    - _Requirements: 4.8_

  - [ ] 5.6 Integrate with table view
    - Replace static cells with InlineEditCell
    - Apply to stock, price, status, location fields
    - Add visual indicator for editable cells
    - _Requirements: 4.2_

## Phase 6: Favorites System

- [ ] 6. Implement favorites
  - [ ] 6.1 Create useFavorites hook
    - Create src/hooks/use-favorites.ts
    - Query favorite status for a book
    - Implement toggleFavorite mutation
    - _Requirements: 5.2, 5.3_

  - [ ] 6.2 Create FavoriteButton component
    - Create src/components/books/FavoriteButton.tsx
    - Show filled star when favorited
    - Show outline star when not favorited
    - Add loading state during toggle
    - _Requirements: 5.1, 5.7_

  - [ ] 6.3 Add to BookCard
    - Add FavoriteButton to book cards
    - Position in top-right corner
    - _Requirements: 5.1_

  - [ ] 6.4 Add to BookDetail page
    - Add FavoriteButton to detail page header
    - Show favorite status
    - _Requirements: 5.1_

  - [ ] 6.5 Add favorites filter
    - Add "Favorites" filter option
    - Query only favorited books when active
    - Show count of favorites
    - _Requirements: 5.4, 5.5, 5.6_

  - [ ] 6.6 Add favorites view
    - Create dedicated favorites page or filter
    - Allow removing favorites from this view
    - _Requirements: 5.8_

## Phase 7: Keyboard Shortcuts

- [ ] 7. Implement keyboard shortcuts
  - [ ] 7.1 Create KeyboardShortcutsProvider
    - Create src/components/KeyboardShortcutsProvider.tsx
    - Define shortcut map
    - Add event listeners for shortcuts
    - _Requirements: 6.2_

  - [ ] 7.2 Implement common shortcuts
    - Ctrl/Cmd+K: Focus search
    - Ctrl/Cmd+N: Add new book
    - Ctrl/Cmd+E: Edit selected book
    - Delete: Delete selected books
    - Escape: Close modals
    - _Requirements: 6.2_

  - [ ] 7.3 Create shortcuts help modal
    - Create src/components/KeyboardShortcutsHelp.tsx
    - List all available shortcuts
    - Show keyboard key visuals
    - Open with Ctrl/Cmd+/
    - _Requirements: 6.2_

  - [ ] 7.4 Add focus management
    - Focus first element when modal opens
    - Return focus to trigger on close
    - Trap focus within modals
    - _Requirements: 6.3, 6.4, 6.5_

  - [ ] 7.5 Add skip links
    - Add "Skip to main content" link
    - Add "Skip to navigation" link
    - Style for keyboard-only visibility
    - _Requirements: 6.6_

## Phase 8: Enhanced Accessibility

- [ ] 8. Improve accessibility
  - [ ] 8.1 Audit and add ARIA labels
    - Add aria-label to all icon buttons
    - Add aria-describedby where needed
    - Add role attributes
    - _Requirements: 6.1_

  - [ ] 8.2 Ensure form labels
    - Associate all inputs with labels
    - Add aria-required for required fields
    - Add aria-invalid for error states
    - _Requirements: 6.7_

  - [ ] 8.3 Add live regions
    - Add aria-live for dynamic content
    - Announce toast notifications
    - Announce loading states
    - _Requirements: 6.8_

  - [ ] 8.4 Test with screen reader
    - Test with NVDA/JAWS on Windows
    - Test with VoiceOver on Mac
    - Fix any issues found
    - _Requirements: 6.1-6.8_

  - [ ] 8.5 Test keyboard navigation
    - Ensure all features accessible via keyboard
    - Test tab order
    - Test focus indicators
    - _Requirements: 6.2-6.6_

## Phase 9: Export and Import Formats

- [x] 9. Implement export functionality
  - [x] 9.1 Create Export component
    - Create src/components/books/Export.tsx
    - Add format selection (CSV, JSON, Excel)
    - Add field selection checkboxes with defaults
    - Add export scope options (all/selected)
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 9.2 Implement CSV export
    - Create exportAsCSV function
    - Generate CSV from book data with proper quoting
    - Trigger download
    - _Requirements: 7.1_

  - [x] 9.3 Implement JSON export
    - Create exportAsJSON function
    - Format as pretty JSON
    - Trigger download
    - _Requirements: 7.1_

  - [x] 9.4 Implement Excel export
    - Install xlsx library
    - Create exportAsExcel function
    - Generate .xlsx file with auto-sized columns
    - Trigger download
    - _Requirements: 7.1_

  - [x] 9.5 Add filename with timestamp
    - Generate filename with current date/time
    - Include format in filename
    - Include selection count if applicable
    - _Requirements: 7.5_

  - [x] 9.6 Add progress indicator
    - Show loading state during export
    - Disable button while processing
    - _Requirements: 7.6_

  - [x] 9.7 Add error handling
    - Handle export failures gracefully
    - Show error toast message
    - _Requirements: 7.7_

- [x] 10. Implement import functionality
  - [x] 10.1 Create Import component
    - Create src/components/books/Import.tsx
    - Auto-detect file format (CSV, JSON, Excel)
    - Show detected format
    - Support drag and drop
    - _Enhancement_

  - [x] 10.2 Implement CSV import
    - Parse CSV with proper quote handling
    - Support all book fields
    - Validate required fields
    - _Enhancement_

  - [x] 10.3 Implement JSON import
    - Parse JSON arrays and objects
    - Support all book fields
    - Validate data structure
    - _Enhancement_

  - [x] 10.4 Implement Excel import
    - Parse XLSX/XLS files
    - Read first sheet
    - Convert to JSON format
    - _Enhancement_

  - [x] 10.5 Add validation
    - Validate required fields
    - Validate data types
    - Validate categories and statuses
    - Show detailed error messages
    - _Enhancement_

  - [x] 10.6 Add progress tracking
    - Show progress bar during import
    - Display percentage complete
    - Show success/failure counts
    - _Enhancement_

  - [x] 10.7 Integrate duplicate detection
    - Check for duplicates before import
    - Show DuplicateDetectionDialog
    - Allow skip or import all
    - Track skipped books
    - _Enhancement_

## Phase 10: Print Labels

- [ ] 10. Implement print labels
  - [x] 10.1 Create PrintLabelsDialog component
    - Create src/components/books/PrintLabelsDialog.tsx
    - Add template selection dropdown
    - Show template preview
    - _Requirements: 8.2_

  - [x] 10.2 Define label templates
    - Create label template configurations
    - Support Avery 5160, 5163, etc.
    - Define dimensions and layout
    - _Requirements: 8.2_

  - [x] 10.3 Create PrintLabels component
    - Create src/components/books/PrintLabels.tsx
    - Render labels in grid layout
    - Include title, author, ISBN barcode, call number
    - _Requirements: 8.3_

  - [x] 10.4 Add barcode generation
    - Install barcode generation library (react-barcode)
    - Generate ISBN barcodes
    - Style appropriately for labels
    - _Requirements: 8.3_

  - [x] 10.5 Add print preview
    - Show preview before printing
    - Allow template switching in preview
    - _Requirements: 8.5_

  - [x] 10.6 Add print functionality
    - Trigger browser print dialog
    - Apply print-specific CSS
    - Handle page breaks
    - _Requirements: 8.1_

  - [x] 10.7 Add customization options
    - Allow selecting which fields to include
    - Allow font size adjustment
    - Save preferences
    - _Requirements: 8.7_

  - [x] 10.8 Support batch printing
    - Print labels for multiple selected books
    - Optimize layout for multiple books
    - _Requirements: 8.6_

## Phase 12: UI/UX Enhancements

- [x] 12. Implement UI/UX improvements
  - [x] 12.1 Create unified Loader component
    - Create src/components/ui/loader.tsx
    - Support multiple color variants (primary, accent, secondary, white)
    - Add smooth animations (spin and stretch)
    - Use Tailwind CSS for styling
    - _Enhancement_

  - [x] 12.2 Update loading states across app
    - Replace old spinners with new Loader component
    - Add white variant for colored buttons
    - Update page load states with accent variant
    - Add loaders to all async operations
    - _Enhancement_

  - [x] 12.3 Enhance selection mode UX
    - Make entire book card clickable in selection mode
    - Add cursor-pointer indicator
    - Hide action buttons in selection mode
    - Improve checkbox visual feedback
    - Add hover effects
    - _Enhancement_

  - [x] 12.4 Improve dialog UX
    - Use Dialog component for consistent modals
    - Add loading states to all dialogs
    - Prevent auto-close during processing
    - Add proper button states
    - _Enhancement_

  - [x] 12.5 Enhance duplicate detection dialog
    - Show book cover images
    - Add scrollable list for many duplicates
    - Show loading spinner while checking
    - Display helpful action descriptions
    - Show counts on action buttons
    - _Enhancement_

  - [x] 12.6 Improve trash page visuals
    - Display book covers in card layout
    - Show days remaining badge
    - Add hover effects
    - Improve button layout
    - Add Restore All functionality
    - _Enhancement_
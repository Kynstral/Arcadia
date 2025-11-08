# Implementation Plan: Active Loans Management System

- [x] 1. Set up page structure and routing
  - [x] 1.1 Rename BookCirculation.tsx to ActiveLoans.tsx
    - Update component name and exports
    - _Requirements: 1.5_

  - [x] 1.2 Update App.tsx routing
    - Update import statement
    - Update route component reference
    - Keep route path as /loans
    - _Requirements: 1.5_

  - [x] 1.3 Update Sidebar navigation
    - Rename menu item to "Active Loans"
    - Move to library-specific items
    - Position above "Manage Books"
    - _Requirements: 1.5, 8.5_

  - [x] 1.4 Implement role-based access control
    - Check userRole on page load
    - Show library-only message for bookstore users
    - Provide redirect button to dashboard
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 2. Implement data fetching with React Query
  - [x] 2.1 Set up useQuery for borrowings
    - Query borrowings table with books and members joins
    - Filter by user_id
    - Order by due_date ascending
    - Enable query only when user exists
    - _Requirements: 1.2, 2.6_

  - [x] 2.2 Implement filter logic in query
    - Add status filter (all, active, due-soon, overdue)
    - Calculate due-soon as within 3 days
    - Calculate overdue as past due date
    - _Requirements: 3.1_

  - [x] 2.3 Implement search filtering
    - Filter by book title, author, or member name
    - Apply client-side filtering after query
    - Update in real-time as search changes
    - _Requirements: 3.2, 3.3_

  - [x] 2.4 Set up return mutation
    - Update borrowing status to "Returned"
    - Record return_date
    - Increment book stock
    - Update book status to "Available"
    - Create return transaction
    - Invalidate queries on success
    - _Requirements: 4.2, 4.3, 4.4, 4.7_

  - [x] 2.5 Set up renewal mutation
    - Accept borrowingId and days parameters
    - Calculate new due date
    - Update borrowing record
    - Invalidate queries on success
    - _Requirements: 5.7, 5.9_

- [x] 3. Build quick stats dashboard
  - [x] 3.1 Create stats cards layout
    - Grid layout with 3 cards
    - Responsive design
    - _Requirements: 1.1_

  - [x] 3.2 Implement Active Loans stat
    - Count borrowings with status "Borrowed"
    - Display with BookOpen icon
    - _Requirements: 1.1, 1.4_

  - [x] 3.3 Implement Due Soon stat
    - Count borrowings due within 3 days
    - Display with Clock icon in amber
    - _Requirements: 1.1, 1.4_

  - [x] 3.4 Implement Overdue stat
    - Count borrowings past due date
    - Display with AlertCircle icon in red
    - _Requirements: 1.1, 1.4_

- [x] 4. Build filters section
  - [x] 4.1 Create filter container
    - Subtle bordered section with background
    - Place within main card above table
    - _Requirements: 3.5_

  - [x] 4.2 Implement status filter dropdown
    - Options: All Loans, Active, Due Soon, Overdue
    - Update filterStatus state
    - _Requirements: 3.1_

  - [x] 4.3 Implement search input
    - Search icon on left
    - Placeholder text
    - Update searchQuery state
    - _Requirements: 3.2_

  - [x] 4.4 Add Reset Filters button
    - Clear all filters and search
    - Reset to default state
    - _Requirements: 3.4_

- [x] 5. Build active loans table
  - [x] 5.1 Create table structure
    - Columns: Book, Member, Checkout Date, Due Date, Status, Actions
    - Responsive design
    - _Requirements: 2.1_

  - [x] 5.2 Display book information
    - Show cover thumbnail (12x9)
    - Display title and author
    - Handle missing cover with BookOpen icon
    - _Requirements: 2.2, 7.2_

  - [x] 5.3 Display member information
    - Show avatar icon
    - Display member name
    - _Requirements: 2.3, 7.3_

  - [x] 5.4 Display dates
    - Show checkout date with calendar icon
    - Show due date with calendar icon
    - Format as locale date string
    - _Requirements: 2.1_

  - [x] 5.5 Implement due date badges
    - Blue badge for normal (>3 days)
    - Amber badge for due soon (≤3 days)
    - Red badge for overdue (<0 days)
    - Show days count with appropriate icon
    - _Requirements: 2.4, 2.5, 7.4_

  - [x] 5.6 Add action buttons
    - Renew button with primary hover
    - Return button with green hover
    - Show only for active loans
    - _Requirements: 4.1, 5.1, 7.1_

- [x] 6. Implement return functionality
  - [x] 6.1 Create handleReturn function
    - Track returning state per borrowing
    - Call returnBookMutation
    - _Requirements: 4.1_

  - [x] 6.2 Show loading state on button
    - Display spinner while processing
    - Disable button during operation
    - _Requirements: 4.5_

  - [x] 6.3 Display success notification
    - Toast with checkmark icon
    - Success message
    - _Requirements: 4.6, 7.7_

  - [x] 6.4 Handle errors
    - Show error toast
    - Keep button enabled for retry
    - _Requirements: 4.6_

- [x] 7. Implement renewal dialog
  - [x] 7.1 Create renewal dialog component
    - Modal with header and footer
    - Show on renew button click
    - _Requirements: 5.2_

  - [x] 7.2 Display book and borrower info
    - Show book cover, title, author
    - Show borrower name
    - _Requirements: 5.2_

  - [x] 7.3 Show current due date
    - Display prominently with calendar icon
    - _Requirements: 5.3_

  - [x] 7.4 Add preset duration buttons
    - Buttons for 7, 15, and 30 days
    - Highlight selected option
    - _Requirements: 5.4_

  - [x] 7.5 Add custom duration input
    - Number input for 1-90 days
    - Update renewalDays state
    - _Requirements: 5.5_

  - [x] 7.6 Show new due date preview
    - Calculate and display new date
    - Highlight with primary color
    - Update as duration changes
    - _Requirements: 5.6_

  - [x] 7.7 Implement confirm renewal
    - Validate duration input
    - Call renewBookMutation with days
    - Close dialog on success
    - _Requirements: 5.7_

  - [x] 7.8 Display success notification
    - Toast showing days added
    - Checkmark icon
    - _Requirements: 5.8, 7.7_

  - [x] 7.9 Handle dialog cancellation
    - Reset state on cancel
    - Close dialog
    - _Requirements: 5.2_

- [x] 8. Implement empty states
  - [x] 8.1 Create no loans empty state
    - Book icon in circle
    - Helpful message
    - Browse Catalog button
    - _Requirements: 6.1, 6.5_

  - [x] 8.2 Create no matching filters state
    - Different message for filtered results
    - Clear Filters button
    - Browse Catalog button
    - _Requirements: 6.2, 6.3_

  - [x] 8.3 Style empty states
    - Centered layout
    - Appropriate spacing
    - Muted colors
    - _Requirements: 6.4_

- [x] 9. Add loading states
  - [x] 9.1 Show loading for initial query
    - Spinner with message
    - Center in card
    - _Requirements: 7.6_

  - [x] 9.2 Show loading for return action
    - Spinner in button
    - Disable button
    - _Requirements: 4.5, 7.6_

  - [x] 9.3 Show loading for renewal action
    - Spinner in confirm button
    - Disable button
    - _Requirements: 5.7, 7.6_

- [x] 10. Polish UI and styling
  - [x] 10.1 Apply accent color hovers
    - Primary color for renew button
    - Green color for return button
    - _Requirements: 7.1_

  - [x] 10.2 Style book covers
    - Consistent thumbnail size
    - Rounded corners
    - Fallback icon
    - _Requirements: 7.2_

  - [x] 10.3 Style member avatars
    - Circular background
    - User icon
    - Consistent sizing
    - _Requirements: 7.3_

  - [x] 10.4 Style badges consistently
    - Outline variant
    - Color-coded backgrounds
    - Appropriate borders
    - _Requirements: 7.4_

  - [x] 10.5 Merge filters with card
    - Single card layout
    - Filters at top
    - Table below
    - _Requirements: 7.5_

  - [x] 10.6 Add toast notifications
    - Success toasts for actions
    - Error toasts for failures
    - Consistent styling
    - _Requirements: 7.7_

- [x] 11. Test and verify
  - [x] 11.1 Test role-based access
    - Verify library users see page
    - Verify bookstore users see message
    - Verify sidebar visibility
    - _Requirements: 8.1-8.5_

  - [x] 11.2 Test filtering
    - Test all filter options
    - Test search functionality
    - Test reset filters
    - _Requirements: 3.1-3.4_

  - [x] 11.3 Test return flow
    - Return a book
    - Verify stock updated
    - Verify status updated
    - Verify transaction created
    - _Requirements: 4.1-4.7_

  - [x] 11.4 Test renewal flow
    - Open renewal dialog
    - Test preset durations
    - Test custom duration
    - Verify due date updated
    - _Requirements: 5.1-5.9_

  - [x] 11.5 Test empty states
    - Test with no loans
    - Test with no matching filters
    - Verify buttons work
    - _Requirements: 6.1-6.5_

  - [x] 11.6 Test React Query integration
    - Verify caching works
    - Verify automatic refetch
    - Verify optimistic updates
    - _Requirements: 1.2, 7.8_

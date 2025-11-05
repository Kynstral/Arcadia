# Implementation Plan: Book Circulation System

- [x] 1. Set up database and types
  - [x] 1.1 Create borrowings table in Supabase
  - [x] 1.2 Configure RLS policies
  - [x] 1.3 Add indexes for performance
  - [x] 1.4 Define Borrowing interface
  - _Requirements: 1.1, 3.1, 5.1_

- [x] 2. Implement Checkout tab
  - [x] 2.1 Create tab structure
  - [x] 2.2 Build book search with popover
  - [x] 2.3 Implement category filter
  - [x] 2.4 Add book selection
  - [x] 2.5 Build member search
  - [x] 2.6 Implement member selection
  - [x] 2.7 Create due date selector
  - [x] 2.8 Add preset date options (15/20/30 days)
  - [x] 2.9 Add custom date picker
  - [x] 2.10 Implement checkout logic
  - [x] 2.11 Validate stock availability
  - [x] 2.12 Check for duplicate borrowing
  - [x] 2.13 Update book stock and status
  - [x] 2.14 Create borrowing record
  - [x] 2.15 Create transaction record
  - _Requirements: 1.1-1.5, 2.1-2.5, 3.1-3.4, 10.1-10.3_

- [x] 3. Implement Check-In tab
  - [x] 3.1 Create check-in interface
  - [x] 3.2 Build member search
  - [x] 3.3 Fetch active borrowings for member
  - [x] 3.4 Display borrowed books list
  - [x] 3.5 Add bulk selection checkboxes
  - [x] 3.6 Implement individual return button
  - [x] 3.7 Implement bulk return button
  - [x] 3.8 Add condition assessment
  - [x] 3.9 Update borrowing status
  - [x] 3.10 Update book stock and status
  - [x] 3.11 Create return transaction
  - [x] 3.12 Calculate late fees (optional)
  - _Requirements: 3.1-3.5, 4.1-4.4, 9.1-9.4_

- [x] 4. Implement Due Dates tab
  - [x] 4.1 Create due dates interface
  - [x] 4.2 Fetch due soon books (within 3 days)
  - [x] 4.3 Fetch overdue books
  - [x] 4.4 Display in separate sections
  - [x] 4.5 Show member and book details
  - [x] 4.6 Display due date with color coding
  - [x] 4.7 Calculate days overdue
  - [x] 4.8 Add quick return action
  - [x] 4.9 Implement auto-refresh
  - _Requirements: 5.1-5.5, 6.1-6.5_

- [x] 5. Implement Members tab
  - [x] 5.1 Create members list interface
  - [x] 5.2 Add member search
  - [x] 5.3 Display member cards
  - [x] 5.4 Show active checkouts count
  - [x] 5.5 Add "View Details" button
  - [x] 5.6 Integrate MemberDetail dialog
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 6. Implement due date calculation
  - [x] 6.1 Create getDueDateFromOption function
  - [x] 6.2 Handle preset options (15/20/30 days)
  - [x] 6.3 Handle custom date selection
  - [x] 6.4 Validate date is in future
  - [x] 6.5 Update due date on option change
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 7. Implement overdue tracking
  - [x] 7.1 Query borrowings past due date
  - [x] 7.2 Calculate days overdue
  - [x] 7.3 Display overdue indicator
  - [x] 7.4 Sort by most overdue first
  - [x] 7.5 Add reminder tracking fields
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.1-7.5_

- [x] 8. Implement renewal functionality
  - [x] 8.1 Add renew button to active borrowings
  - [x] 8.2 Extend due date by loan period
  - [x] 8.3 Check renewal limit
  - [x] 8.4 Prevent renewal if holds exist
  - [x] 8.5 Record renewal in borrowing
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 9. Add validation and error handling
  - [x] 9.1 Validate required fields
  - [x] 9.2 Check member status before checkout
  - [x] 9.3 Prevent checkout if overdue items
  - [x] 9.4 Validate stock availability
  - [x] 9.5 Handle duplicate borrowing
  - [x] 9.6 Display clear error messages
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 10. Implement borrowing history
  - [x] 10.1 Query all borrowings for member
  - [x] 10.2 Include returned items
  - [x] 10.3 Display checkout and return dates
  - [x] 10.4 Show condition on return
  - [x] 10.5 Calculate circulation statistics
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 11. Add search and filter optimizations
  - [x] 11.1 Implement debounced search
  - [x] 11.2 Add category filter for books
  - [x] 11.3 Paginate book results
  - [x] 11.4 Cache search results
  - [x] 11.5 Optimize database queries
  - _Requirements: 1.2, 2.2, 3.2_

- [x] 12. Test and optimize
  - [x] 12.1 Test complete checkout flow
  - [x] 12.2 Test return process
  - [x] 12.3 Test due date calculations
  - [x] 12.4 Test overdue detection
  - [x] 12.5 Verify stock updates
  - [x] 12.6 Test validation rules
  - [x] 12.7 Verify transaction records
  - _Requirements: All_

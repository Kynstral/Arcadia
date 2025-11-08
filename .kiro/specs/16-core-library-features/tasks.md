# Implementation Plan: Core Library Features

- [x] 1. Database schema updates
  - [x] 1.1 Add late_fees column to borrowings table
    - Add decimal field for fee amount
    - Add fee_paid boolean field
    - Add fee_waived boolean field
    - Add fee_notes text field
    - _Requirements: 1.5, 6.2_

  - [x] 1.2 Add condition tracking to borrowings table
    - Add return_condition enum field
    - Add condition_notes text field
    - Add flagged_for_review boolean field
    - _Requirements: 2.3, 2.4, 2.5_

  - [x] 1.3 Add renewal_count to borrowings table
    - Add integer field with default 0
    - _Requirements: 3.2_

  - [x] 1.4 Create library_settings table
    - Add daily_late_fee_rate decimal field
    - Add grace_period_days integer field
    - Add max_late_fee_cap decimal field
    - Add max_renewals_per_loan integer field
    - Add member_borrowing_limit integer field
    - Add user_id foreign key
    - _Requirements: 5.2-5.6_

  - [x] 1.5 Add needs_repair status to books
    - Update status enum to include "Needs Repair"
    - _Requirements: 2.7_

- [ ] 2. Create library settings interface
  - [x] 2.1 Add Library Policies section to Settings page
    - Create new card for library-specific settings
    - Show only for library users
    - _Requirements: 5.1_

  - [x] 2.2 Add late fee configuration inputs
    - Daily rate input ($0.00 - $10.00)
    - Grace period input (0-7 days)
    - Maximum fee cap input
    - _Requirements: 5.2, 5.3, 5.4_

  - [x] 2.3 Add renewal limit configuration
    - Max renewals input (0-5)
    - _Requirements: 5.5_

  - [x] 2.4 Add borrowing limit configuration
    - Member limit input (1-20 books)
    - _Requirements: 5.6_

  - [x] 2.5 Implement save settings functionality
    - Create or update library_settings record
    - Show success toast
    - _Requirements: 5.7, 5.8_

  - [x] 2.6 Load settings on page mount
    - Fetch from database
    - Set default values if not exists
    - _Requirements: 5.7_

- [-] 3. Implement late fees calculation
  - [x] 3.1 Create calculateLateFee utility function
    - Accept due date, return date, settings
    - Calculate days overdue minus grace period
    - Multiply by daily rate
    - Apply maximum cap
    - Return fee amount
    - _Requirements: 1.1, 1.2, 1.3, 1.6_

  - [x] 3.2 Display late fees on Active Loans page
    - Show fee amount in overdue badge
    - Add fee icon
    - _Requirements: 1.4_

  - [x] 3.3 Calculate fee on return
    - Call calculateLateFee function
    - Store in borrowing record
    - _Requirements: 1.5_

  - [x] 3.4 Display total outstanding fees on member detail
    - Query all unpaid fees for member
    - Sum and display prominently
    - _Requirements: 1.7, 6.4_

  - [x] 3.5 Implement checkout prevention for high fees
    - Check total unpaid fees before checkout
    - Prevent if above threshold (e.g., $10)
    - Show clear error message
    - _Requirements: 1.8, 8.3_

- [-] 4. Implement book condition assessment
  - [x] 4.1 Create condition assessment dialog
    - Open on return button click
    - Show book information
    - _Requirements: 2.1_

  - [x] 4.2 Add condition selection dropdown
    - Options: Excellent, Good, Fair, Poor, Damaged
    - _Requirements: 2.2_

  - [x] 4.3 Add condition notes textarea
    - Optional notes field
    - _Requirements: 2.4_

  - [x] 4.4 Implement condition save logic
    - Update borrowing record with condition
    - Flag for review if Poor or Damaged
    - Update book status if Damaged
    - _Requirements: 2.3, 2.5, 2.7_

  - [x] 4.5 Display condition history on book detail
    - Query all borrowings for book
    - Show condition timeline
    - _Requirements: 2.6, 7.1, 7.2_

  - [x] 4.6 Prevent checkout of books needing repair
    - Check book status before checkout
    - Show error message
    - _Requirements: 2.8, 8.4_

  - [x] 4.7 Create books needing repair view
    - Filter books by status "Needs Repair"
    - Show in separate section or page
    - Allow marking as repaired
    - _Requirements: 7.3, 7.5, 7.6_

- [-] 5. Implement renewal limits
  - [x] 5.1 Track renewal count in borrowing record
    - Increment on each renewal
    - _Requirements: 3.2_

  - [x] 5.2 Check renewal limit before allowing renewal
    - Compare count to max from settings
    - _Requirements: 3.3_

  - [x] 5.3 Display remaining renewals in dialog
    - Show "X of Y renewals used"
    - _Requirements: 3.5_

  - [x] 5.4 Prevent renewal if limit reached
    - Show error message with limit info
    - _Requirements: 3.4, 8.2_

  - [x] 5.5 Reset renewal count on new checkout
    - Set to 0 when book is checked out again
    - _Requirements: 3.6_

  - [x] 5.6 Add staff override option
    - Show override button
    - Require confirmation
    - _Requirements: 3.7_

- [ ] 6. Implement borrowing limits
  - [x] 6.1 Count active borrowings for member
    - Query borrowings with status "Borrowed"
    - _Requirements: 4.2_

  - [x] 6.2 Check limit before checkout
    - Compare count to limit from settings
    - _Requirements: 4.3_

  - [x] 6.3 Display borrowed count on member detail
    - Show "X of Y books borrowed"
    - _Requirements: 4.5_

  - [x] 6.4 Prevent checkout if at limit
    - Show error message with limit info
    - _Requirements: 4.4, 8.1_

  - [x] 6.5 Add staff override option
    - Show override button
    - Require confirmation
    - _Requirements: 4.7_

- [ ] 7. Implement late fees management interface
  - [x] 7.1 Update return dialog to show late fee
    - Calculate and display fee amount
    - _Requirements: 6.1_

  - [x] 7.2 Add fee payment options
    - Mark as Paid button
    - Waive Fee button
    - _Requirements: 6.2_

  - [x] 7.3 Track fee payment history
    - Record payment date and method
    - _Requirements: 6.3_

  - [x] 7.4 Display fee warning on member detail
    - Show alert if unpaid fees exist
    - _Requirements: 6.5_

  - [x] 7.5 Add manual fee adjustment option
    - Allow adding/editing fees
    - Require notes
    - _Requirements: 6.6_

- [ ] 8. Add policy enforcement notifications
  - [x] 8.1 Create reusable policy error component
    - Display policy name and limit
    - Show current status
    - Provide override option
    - _Requirements: 8.1-8.5_

  - [x] 8.2 Implement borrowing limit error
    - Show when member at limit
    - Display current count and limit
    - _Requirements: 8.1, 8.4_

  - [x] 8.3 Implement renewal limit error
    - Show when renewal limit reached
    - Display renewals used and limit
    - _Requirements: 8.2, 8.4_

  - [x] 8.4 Implement late fee error
    - Show when fees prevent checkout
    - Display total owed
    - _Requirements: 8.3, 8.4_

- [ ] 9. Update Active Loans page
  - [x] 9.1 Display late fees in table
    - Add fee column or show in badge
    - _Requirements: 1.4_

  - [x] 9.2 Update renewal dialog
    - Show renewal count and limit
    - Disable if limit reached
    - _Requirements: 3.3, 3.4, 3.5_

  - [x] 9.3 Update return flow
    - Add condition assessment step
    - Calculate and display late fee
    - Allow fee payment/waiver
    - _Requirements: 2.1-2.4, 6.1, 6.2_

- [ ] 10. Update book detail and catalog pages
  - [x] 10.1 Show condition history on book detail
    - Display timeline of conditions
    - _Requirements: 2.6, 7.1_

  - [x] 10.2 Prevent checkout of books needing repair
    - Disable borrow button
    - Show repair status
    - _Requirements: 2.8_

  - [x] 10.3 Add repair status management
    - Allow marking as needs repair
    - Allow marking as repaired
    - _Requirements: 7.5, 7.6_

- [ ] 11. Update member detail page
  - [x] 11.1 Display borrowing limit status
    - Show current count and limit
    - _Requirements: 4.5, 6.3_

  - [x] 11.2 Display outstanding late fees
    - Show total unpaid fees
    - Show fee warning if applicable
    - _Requirements: 1.7, 6.4, 6.5_

  - [x] 11.3 Add fee payment history section
    - List all fees paid/waived
    - _Requirements: 6.3_
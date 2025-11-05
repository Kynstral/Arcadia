# Requirements Document: Book Circulation System

## Introduction

The Book Circulation System manages the lending and returning of books in a library setting, including checkout, due date tracking, renewals, and overdue management.

## Glossary

- **Circulation System**: The subsystem managing book lending and returns
- **Checkout**: The process of lending a book to a member
- **Return**: The process of receiving a book back from a member
- **Due Date**: The date by which a borrowed book must be returned
- **Overdue**: A book that has not been returned by its due date
- **Renewal**: Extending the due date for a currently borrowed book
- **Borrowing Record**: A database entry tracking a book checkout transaction

## Requirements

### Requirement 1: Checkout Books to Members

**User Story:** As a library staff member, I want to check out books to members, so that patrons can borrow items from the collection.

#### Acceptance Criteria

1. WHEN a user initiates a checkout, THE Circulation System SHALL prompt for member selection
2. THE Circulation System SHALL allow selection of one or multiple books to checkout
3. THE Circulation System SHALL automatically calculate the due date based on library policy
4. WHEN checkout is confirmed, THE Circulation System SHALL create borrowing records in the database
5. THE Circulation System SHALL update book status to "Checked Out" and decrement stock

### Requirement 2: View Active Borrowings

**User Story:** As a library staff member, I want to view all active borrowings, so that I can track which books are currently on loan.

#### Acceptance Criteria

1. WHEN a user navigates to the circulation page, THE Circulation System SHALL display all active borrowings
2. EACH borrowing entry SHALL show member name, book title, checkout date, and due date
3. THE Circulation System SHALL highlight overdue items with visual indicators
4. THE Circulation System SHALL support filtering by member, book, or status
5. THE Circulation System SHALL support sorting by checkout date or due date

### Requirement 3: Process Book Returns

**User Story:** As a library staff member, I want to process book returns, so that I can update records when patrons return items.

#### Acceptance Criteria

1. THE Circulation System SHALL provide a return interface for processing returns
2. WHEN a book is returned, THE Circulation System SHALL prompt for condition assessment
3. THE Circulation System SHALL record the return date in the borrowing record
4. WHEN return is processed, THE Circulation System SHALL update book status to "Available" and increment stock
5. THE Circulation System SHALL calculate and display any late fees if applicable

### Requirement 4: Calculate Due Dates

**User Story:** As a library administrator, I want the system to automatically calculate due dates, so that checkout processing is efficient and consistent.

#### Acceptance Criteria

1. THE Circulation System SHALL use a configurable loan period (default 14 days)
2. WHEN a book is checked out, THE Circulation System SHALL calculate the due date from the checkout date
3. THE Circulation System SHALL account for library closure days when calculating due dates
4. THE Circulation System SHALL display the calculated due date before confirming checkout
5. THE Circulation System SHALL allow manual override of due dates when necessary

### Requirement 5: Track Overdue Items

**User Story:** As a library staff member, I want to identify overdue items, so that I can follow up with members about late returns.

#### Acceptance Criteria

1. THE Circulation System SHALL automatically identify borrowings past their due date
2. THE Circulation System SHALL display overdue items in a dedicated view
3. THE Circulation System SHALL calculate the number of days overdue for each item
4. THE Circulation System SHALL provide filtering and sorting for overdue items
5. THE Circulation System SHALL display member contact information for overdue follow-up

### Requirement 6: Renew Borrowed Books

**User Story:** As a library staff member, I want to renew borrowed books, so that members can extend their borrowing period.

#### Acceptance Criteria

1. THE Circulation System SHALL provide a renewal option for active borrowings
2. WHEN renewal is requested, THE Circulation System SHALL extend the due date by the standard loan period
3. THE Circulation System SHALL prevent renewal if the book has holds from other members
4. THE Circulation System SHALL limit the number of renewals per borrowing (configurable maximum)
5. THE Circulation System SHALL record renewal history in the borrowing record

### Requirement 7: Send Overdue Reminders

**User Story:** As a library administrator, I want to send automated reminders for overdue books, so that members are notified about late returns.

#### Acceptance Criteria

1. THE Circulation System SHALL identify borrowings that are overdue
2. THE Circulation System SHALL generate reminder notifications for overdue items
3. THE Circulation System SHALL track whether a reminder has been sent for each overdue item
4. THE Circulation System SHALL record the reminder date in the borrowing record
5. THE Circulation System SHALL support configurable reminder schedules (e.g., 1 day, 7 days overdue)

### Requirement 8: View Borrowing History

**User Story:** As a library staff member, I want to view complete borrowing history, so that I can analyze circulation patterns and member behavior.

#### Acceptance Criteria

1. THE Circulation System SHALL display all borrowing records including returned items
2. THE Circulation System SHALL support filtering by date range, member, or book
3. THE Circulation System SHALL show checkout date, due date, return date, and condition on return
4. THE Circulation System SHALL calculate circulation statistics (total checkouts, average loan period)
5. THE Circulation System SHALL export borrowing history to CSV format

### Requirement 9: Assess Book Condition on Return

**User Story:** As a library staff member, I want to record book condition when returned, so that I can track damage and wear.

#### Acceptance Criteria

1. WHEN processing a return, THE Circulation System SHALL prompt for condition assessment
2. THE Circulation System SHALL provide condition options (Good, Fair, Poor, Damaged)
3. THE Circulation System SHALL record the condition in the borrowing record
4. IF condition is marked as Damaged, THEN THE Circulation System SHALL flag the book for review
5. THE Circulation System SHALL allow adding notes about condition issues

### Requirement 10: Prevent Checkout Violations

**User Story:** As a library administrator, I want to enforce checkout policies, so that the system prevents policy violations.

#### Acceptance Criteria

1. THE Circulation System SHALL prevent checkout if member status is Suspended or Banned
2. THE Circulation System SHALL prevent checkout if member has overdue items
3. THE Circulation System SHALL enforce maximum checkout limits per member
4. THE Circulation System SHALL prevent checkout if book status is not "Available"
5. THE Circulation System SHALL display clear error messages when checkout is prevented

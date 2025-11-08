# Requirements Document: Core Library Features

## Introduction

This specification covers essential library management features that enforce policies and track important operational data including late fees, book condition assessment, renewal limits, and member borrowing limits.

## Glossary

- **Late Fee**: A monetary charge applied when a book is returned after its due date
- **Book Condition**: The physical state of a book (Excellent, Good, Fair, Poor, Damaged)
- **Renewal Limit**: The maximum number of times a loan can be extended
- **Borrowing Limit**: The maximum number of books a member can have checked out simultaneously
- **Grace Period**: Number of days after due date before late fees start accruing
- **Daily Late Fee**: The amount charged per day for overdue books

## Requirements

### Requirement 1: Late Fees Calculation and Tracking

**User Story:** As a library administrator, I want the system to automatically calculate late fees, so that overdue returns are properly charged.

#### Acceptance Criteria

1. THE System SHALL calculate late fees based on days overdue and daily rate
2. THE System SHALL support configurable daily late fee rate in settings (default $0.50/day)
3. THE System SHALL support configurable grace period in settings (default 0 days)
4. THE System SHALL display calculated late fees on Active Loans page for overdue items
5. THE System SHALL record late fees when books are returned
6. THE System SHALL support configurable maximum late fee cap per book
7. THE System SHALL display total outstanding late fees for each member
8. THE System SHALL prevent new checkouts if member has unpaid late fees above threshold

### Requirement 2: Book Condition Assessment on Return

**User Story:** As a library staff member, I want to record book condition when returned, so that I can track damage and wear over time.

#### Acceptance Criteria

1. WHEN processing a return, THE System SHALL prompt for condition assessment
2. THE System SHALL provide condition options: Excellent, Good, Fair, Poor, Damaged
3. THE System SHALL record the condition in the borrowing record
4. THE System SHALL allow adding optional notes about condition issues
5. IF condition is marked as Poor or Damaged, THEN THE System SHALL flag the book for review
6. THE System SHALL display condition history for each book
7. THE System SHALL update book status to "Needs Repair" if marked as Damaged
8. THE System SHALL prevent checkout of books marked "Needs Repair"

### Requirement 3: Renewal Limits Enforcement

**User Story:** As a library administrator, I want to limit how many times a book can be renewed, so that books circulate fairly among members.

#### Acceptance Criteria

1. THE System SHALL support configurable maximum renewals per loan in settings (default 2)
2. THE System SHALL track renewal count for each borrowing
3. WHEN renewal is requested, THE System SHALL check if limit has been reached
4. IF renewal limit reached, THEN THE System SHALL prevent renewal and display message
5. THE System SHALL display remaining renewals available in the renewal dialog
6. THE System SHALL reset renewal count when book is returned and checked out again
7. THE System SHALL allow staff to override renewal limits with confirmation

### Requirement 4: Member Borrowing Limits

**User Story:** As a library administrator, I want to limit how many books a member can borrow simultaneously, so that resources are shared fairly.

#### Acceptance Criteria

1. THE System SHALL support configurable borrowing limit per member in settings (default 5 books)
2. THE System SHALL count active (non-returned) borrowings for each member
3. WHEN attempting checkout, THE System SHALL check if member is at borrowing limit
4. IF at limit, THEN THE System SHALL prevent checkout and display message
5. THE System SHALL display current borrowed count and limit on member detail page
6. THE System SHALL support different limits for different member types (if applicable)
7. THE System SHALL allow staff to override limits with confirmation

### Requirement 5: Library Settings Configuration

**User Story:** As a library administrator, I want to configure library policies, so that the system matches our operational rules.

#### Acceptance Criteria

1. THE System SHALL provide a Library Policies section in Settings page
2. THE System SHALL allow configuring daily late fee rate ($0.00 - $10.00)
3. THE System SHALL allow configuring grace period (0-7 days)
4. THE System SHALL allow configuring maximum late fee cap per book
5. THE System SHALL allow configuring maximum renewals per loan (0-5)
6. THE System SHALL allow configuring member borrowing limit (1-20 books)
7. THE System SHALL save settings to database per user
8. THE System SHALL apply settings immediately after saving

### Requirement 6: Late Fees Management Interface

**User Story:** As a library staff member, I want to view and manage late fees, so that I can track payments and outstanding balances.

#### Acceptance Criteria

1. THE System SHALL display calculated late fee amount on return dialog
2. THE System SHALL allow marking late fees as paid or waived
3. THE System SHALL track late fee payment history
4. THE System SHALL display total outstanding fees on member detail page
5. THE System SHALL show late fee warning when member has unpaid fees
6. THE System SHALL support adding manual fee adjustments with notes

### Requirement 7: Book Condition Tracking

**User Story:** As a library staff member, I want to view condition history for books, so that I can identify books that need maintenance.

#### Acceptance Criteria

1. THE System SHALL display condition history on book detail page
2. THE System SHALL show condition trend over time
3. THE System SHALL highlight books flagged for review
4. THE System SHALL allow updating book status to "Needs Repair"
5. THE System SHALL provide a list view of all books needing repair
6. THE System SHALL allow marking repairs as complete

### Requirement 8: Policy Enforcement Notifications

**User Story:** As a library staff member, I want clear notifications when policies prevent actions, so that I can explain rules to members.

#### Acceptance Criteria

1. THE System SHALL display clear error messages when borrowing limit reached
2. THE System SHALL display clear error messages when renewal limit reached
3. THE System SHALL display clear error messages when late fees prevent checkout
4. THE System SHALL show policy details in error messages (e.g., "Limit: 5 books")
5. THE System SHALL provide override options for staff with confirmation dialogs

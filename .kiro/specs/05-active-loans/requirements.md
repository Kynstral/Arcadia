# Requirements Document: Active Loans Management System

## Introduction

The Active Loans Management System provides a streamlined interface for library staff to view and manage all currently borrowed books, track due dates, process returns, and handle renewals with flexible duration options. This system is designed exclusively for library operations and is hidden from bookstore users.

## Glossary

- **Active Loans System**: The interface for managing currently borrowed books
- **Active Loan**: A book that is currently checked out to a member
- **Return**: The process of receiving a book back from a member and updating inventory
- **Due Date**: The date by which a borrowed book must be returned
- **Overdue**: A book that has not been returned by its due date
- **Due Soon**: A book with a due date within 3 days
- **Renewal**: Extending the due date for a currently borrowed book by a custom number of days
- **Borrowing Record**: A database entry tracking a book loan transaction

## Requirements

### Requirement 1: View Active Loans Dashboard

**User Story:** As a library staff member, I want to see an overview of all active loans, so that I can quickly assess the current lending status.

#### Acceptance Criteria

1. WHEN a user navigates to Active Loans, THE Active Loans System SHALL display quick stats for active loans, due soon (3 days), and overdue counts
2. THE Active Loans System SHALL use React Query for efficient data fetching with automatic caching and refetching
3. THE Active Loans System SHALL hide the page entirely for bookstore users with a helpful redirect message
4. THE Active Loans System SHALL display stats cards with appropriate icons and color coding
5. THE Active Loans System SHALL show the page in the sidebar navigation above "Manage Books" for library users only

### Requirement 2: Display Active Loans Table

**User Story:** As a library staff member, I want to view all active loans in a table, so that I can see detailed information about each borrowed book.

#### Acceptance Criteria

1. THE Active Loans System SHALL display all borrowings in a table with book, member, checkout date, due date, and status columns
2. EACH borrowing entry SHALL show book cover thumbnail, title, and author
3. EACH borrowing entry SHALL show member name with avatar icon
4. THE Active Loans System SHALL display due date badges with color coding (blue for normal, amber for due soon within 3 days, red for overdue)
5. THE Active Loans System SHALL show days until due or days overdue in the badge with appropriate icons
6. THE Active Loans System SHALL sort borrowings by due date (ascending) by default

### Requirement 3: Filter and Search Loans

**User Story:** As a library staff member, I want to filter and search loans, so that I can quickly find specific borrowings.

#### Acceptance Criteria

1. THE Active Loans System SHALL provide filter options: All Loans, Active, Due Soon (3 days), Overdue
2. THE Active Loans System SHALL provide a search input to filter by book title, author, or member name in real-time
3. THE Active Loans System SHALL update results immediately as filters or search query changes
4. THE Active Loans System SHALL provide a "Reset Filters" button to clear all filters and search
5. THE Active Loans System SHALL display filters in a subtle bordered section with background color within the main card

### Requirement 4: Process Book Returns

**User Story:** As a library staff member, I want to return books with a single click, so that I can quickly process returns.

#### Acceptance Criteria

1. THE Active Loans System SHALL provide a "Return" button with green hover state for each active loan
2. WHEN return is clicked, THE Active Loans System SHALL update the borrowing status to "Returned" and record return date
3. THE Active Loans System SHALL increment book stock by 1 and update status to "Available"
4. THE Active Loans System SHALL create a return transaction record with payment method "Return"
5. THE Active Loans System SHALL show a loading spinner on the button during processing
6. THE Active Loans System SHALL display a success toast notification with checkmark icon after return
7. THE Active Loans System SHALL automatically refresh the loans list after successful return

### Requirement 5: Renew Borrowed Books with Custom Duration

**User Story:** As a library staff member, I want to renew borrowed books with flexible duration options, so that I can accommodate different member needs.

#### Acceptance Criteria

1. THE Active Loans System SHALL provide a "Renew" button with primary accent hover for each active loan
2. WHEN renewal is clicked, THE Active Loans System SHALL open a modal dialog showing book and borrower details
3. THE Active Loans System SHALL display the current due date prominently in the dialog
4. THE Active Loans System SHALL provide quick preset buttons for 7, 15, and 30 days extension
5. THE Active Loans System SHALL provide a custom input field for entering any number of days (1-90)
6. THE Active Loans System SHALL show a preview of the new due date based on selected duration
7. WHEN renewal is confirmed, THE Active Loans System SHALL extend the due date by the specified number of days
8. THE Active Loans System SHALL display a success toast showing how many days were added
9. THE Active Loans System SHALL automatically refresh the loans list after successful renewal

### Requirement 6: Display Empty States

**User Story:** As a library staff member, I want helpful empty states, so that I know what to do when there are no active loans.

#### Acceptance Criteria

1. WHEN no loans exist, THE Active Loans System SHALL display an empty state with book icon and helpful message
2. WHEN no loans match filters, THE Active Loans System SHALL display a different message suggesting to adjust filters
3. THE Active Loans System SHALL provide contextual actions in empty states (Clear Filters, Browse Catalog)
4. THE Active Loans System SHALL use appropriate icons and styling for empty states
5. THE Active Loans System SHALL provide a "Browse Catalog" button to help staff start lending books

### Requirement 7: UI Polish and Consistency

**User Story:** As a library staff member, I want a polished and consistent interface, so that the system is pleasant and efficient to use.

#### Acceptance Criteria

1. THE Active Loans System SHALL use accent colors (primary) for renew button hovers and green for return button hovers
2. THE Active Loans System SHALL display book covers as thumbnails in the table
3. THE Active Loans System SHALL show member avatars with user icons
4. THE Active Loans System SHALL use consistent badge styling with appropriate colors for all statuses
5. THE Active Loans System SHALL merge filters with the main table card for better UX
6. THE Active Loans System SHALL provide loading states with spinners for all async operations
7. THE Active Loans System SHALL display toast notifications for all user actions (return, renew)
8. THE Active Loans System SHALL use React Query mutations for optimistic updates and automatic cache invalidation

### Requirement 8: Role-Based Access Control

**User Story:** As a system administrator, I want the Active Loans page to be library-specific, so that bookstore users don't see irrelevant features.

#### Acceptance Criteria

1. THE Active Loans System SHALL check user role on page load
2. IF user role is "Book Store", THEN THE Active Loans System SHALL display a message that the feature is library-only
3. THE Active Loans System SHALL provide a "Go to Dashboard" button for bookstore users
4. THE Active Loans System SHALL hide the "Active Loans" menu item from bookstore users in the sidebar
5. THE Active Loans System SHALL show the "Active Loans" menu item above "Manage Books" for library users

# Implementation Plan: Member Page Enhancements

- [x] 1. Performance improvements and query optimization
  - [x] 1.1 Replace custom loaders with Loader component
  - [x] 1.2 Optimize member query with joins (eliminate N+1 queries)
  - [x] 1.3 Add query caching with staleTime and gcTime
  - [x] 1.4 Implement optimistic updates for status changes
  - [x] 1.5 Add memoization for expensive filter operations
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2. Loading states enhancement
  - [x] 2.1 Update Members.tsx with Loader component (size 48, accent)
  - [x] 2.2 Update MemberForm.tsx with Loader for initialization and submit
  - [x] 2.3 Update MemberDetail.tsx with Loader for all sections
  - [x] 2.4 Add Loader to delete button with white variant
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3. UI/UX polish and animations
  - [x] 3.1 Add fade-in animation to page container
  - [x] 3.2 Add slide-in animations to header and stats
  - [x] 3.3 Add hover effects to table rows
  - [x] 3.4 Add transition effects to interactive elements
  - [x] 3.5 Update button hover colors to match design system
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4. Keyboard shortcuts integration
  - [x] 4.1 Add keyboard shortcut listener in Members.tsx
  - [x] 4.2 Implement Ctrl/Cmd + K for search focus
  - [x] 4.3 Implement N key for add member (via KeyboardShortcutsProvider)
  - [x] 4.4 Implement Escape for closing dialogs
  - [x] 4.5 Add search input ID for keyboard targeting
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5. Overdue tracking implementation
  - [x] 5.1 Create fetchMembersWithOverdue query function
  - [x] 5.2 Add React Query hook for overdue members
  - [x] 5.3 Pass membersWithOverdue Set to MemberTable
  - [x] 5.4 Display AlertCircle icon for members with overdue books
  - [x] 5.5 Add tooltip with "Has overdue books" message
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6. Inline editing functionality
  - [x] 6.1 Add inline name editing to MemberTable
  - [x] 6.2 Implement save/cancel buttons for name edit
  - [x] 6.3 Add keyboard support (Enter to save, Escape to cancel)
  - [x] 6.4 Add inline status editing with dropdown
  - [x] 6.5 Implement database update functions
  - [x] 6.6 Add toast notifications for success/error
  - [x] 6.7 Add hover pencil icon with orange accent
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 7. Bulk operations enhancement
  - [x] 7.1 Add bulk delete button to BulkMemberActions
  - [x] 7.2 Create bulkDeleteMutation in Members.tsx
  - [x] 7.3 Add bulk delete confirmation dialog
  - [x] 7.4 Update getActionConfig for bulk delete
  - [x] 7.5 Add loading spinner to delete button
  - [x] 7.6 Clear selection after successful bulk delete
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 8. Table enhancements and accessibility
  - [x] 8.1 Replace icon buttons with "View Details" button
  - [x] 8.2 Add Edit icon button with Pencil icon
  - [x] 8.3 Add tooltips to all action buttons
  - [x] 8.4 Make table rows clickable to view details
  - [x] 8.5 Add hover effects with proper color scheme
  - [x] 8.6 Stop event propagation on interactive elements
  - [x] 8.7 Update edit to open modal instead of navigation
  - [x] 8.8 Add ARIA labels to table
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4_

- [x] 9. CSV import enhancements
  - [x] 9.1 Update CSV template to use Pascal case headers
  - [x] 9.2 Update import UI description to show Pascal case
  - [x] 9.3 Add Progress component to Import.tsx
  - [x] 9.4 Implement progress tracking during import
  - [x] 9.5 Display progress bar with percentage
  - [x] 9.6 Update progress after each member import
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 10. Visual polish and consistency
  - [x] 10.1 Update pencil icon hover to orange background with white icon
  - [x] 10.2 Add group-hover for nested hover states
  - [x] 10.3 Ensure consistent hover effects across all buttons
  - [x] 10.4 Match edit button hover with three-dot button
  - [x] 10.5 Add transition effects for smooth interactions
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 11. ESLint and Prettier setup
  - [x] 11.1 Create .prettierrc configuration file
  - [x] 11.2 Create .prettierignore file
  - [x] 11.3 Update eslint.config.js with enhanced rules
  - [x] 11.4 Fix deprecated tseslint.config usage
  - [x] 11.5 Add format and lint:fix scripts to package.json
  - [x] 11.6 Format all project files with Prettier
  - _Requirements: Technical debt_

- [x] 12. Member detail page implementation
  - [x] 12.1 Create MemberDetail.tsx page component
  - [x] 12.2 Add route for /members/:id in App.tsx
  - [x] 12.3 Implement member profile section with stats
  - [x] 12.4 Add borrowed books section with return functionality
  - [x] 12.5 Add transaction history with book details
  - [x] 12.6 Implement book assignment dialog integration
  - [x] 12.7 Add edit member functionality
  - [x] 12.8 Display overdue books with visual indicators
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 13. Shared AssignBookDialog component
  - [x] 13.1 Create reusable AssignBookDialog component
  - [x] 13.2 Support both member-to-books and book-to-member modes
  - [x] 13.3 Add searchable member selector with filtering
  - [x] 13.4 Add searchable book selector with category filter
  - [x] 13.5 Implement assignment type selector (borrow/purchase)
  - [x] 13.6 Add borrow duration selector with presets
  - [x] 13.7 Support custom duration input (1-365 days)
  - [x] 13.8 Display calculated due dates
  - [x] 13.9 Add compact member list with name, email, and status
  - [x] 13.10 Implement proper scrolling for modal content
  - _Requirements: 6.3, 6.4_

- [x] 14. Book detail page enhancements
  - [x] 14.1 Integrate AssignBookDialog for library role
  - [x] 14.2 Update assignBookMutation to support duration
  - [x] 14.3 Pass durationDays parameter to mutation
  - [x] 14.4 Update borrow book handler
  - _Requirements: 6.3_

- [x] 15. Member stats component fixes
  - [x] 15.1 Fix NaN display issue in MemberStats
  - [x] 15.2 Add fallback values for undefined stats
  - [x] 15.3 Fix totalBorrowed calculation in Members.tsx
  - [x] 15.4 Ensure all numeric values have defaults
  - _Requirements: 2.1, 2.2_

- [x] 16. Navigation and routing updates
  - [x] 16.1 Update Members.tsx to navigate to member detail page
  - [x] 16.2 Add member detail route to App.tsx
  - [x] 16.3 Update structure.md with MemberDetail.tsx
  - [x] 16.4 Ensure proper navigation from member table
  - _Requirements: 6.1, 6.2_


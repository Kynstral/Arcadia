# Implementation Plan: Navigation Sidebar

- [x] 1. Set up Sidebar component structure
  - [x] 1.1 Create Sidebar component file
  - [x] 1.2 Define props interface
  - [x] 1.3 Set up component state
  - [x] 1.4 Import required dependencies
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Implement collapse/expand functionality
  - [x] 2.1 Add collapsed state management
  - [x] 2.2 Support external and internal collapsed state
  - [x] 2.3 Create toggleSidebar function
  - [x] 2.4 Add collapse button (expanded state)
  - [x] 2.5 Add expand button (collapsed state)
  - [x] 2.6 Apply width classes based on state
  - [x] 2.7 Add transition animations
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 9.1_

- [x] 3. Build header section
  - [x] 3.1 Add logo image
  - [x] 3.2 Add "Arcadia" text (expanded)
  - [x] 3.3 Add collapse button (expanded)
  - [x] 3.4 Show logo icon only (collapsed)
  - [x] 3.5 Make logo clickable to dashboard
  - [x] 3.6 Add tooltips for collapsed state
  - _Requirements: 1.1, 8.1, 8.2, 8.3, 8.4_

- [x] 4. Implement navigation items
  - [x] 4.1 Create getNavItems function
  - [x] 4.2 Define common navigation items
  - [x] 4.3 Define library-specific items
  - [x] 4.4 Define bookstore-specific items
  - [x] 4.5 Return items based on userRole
  - [x] 4.6 Map items to nav elements
  - _Requirements: 1.1, 1.2, 6.1, 6.2, 6.3, 6.4_

- [x] 5. Implement active route highlighting
  - [x] 5.1 Get current location from useLocation
  - [x] 5.2 Compare location.pathname with item.path
  - [x] 5.3 Apply active styles (bg-primary)
  - [x] 5.4 Apply hover styles for inactive items
  - [x] 5.5 Update highlighting on route change
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6. Build navigation rendering
  - [x] 6.1 Render expanded nav items (icon + label)
  - [x] 6.2 Render collapsed nav items (icon only)
  - [x] 6.3 Add tooltips for collapsed items
  - [x] 6.4 Apply active and hover styles
  - [x] 6.5 Make items clickable with Link
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_

- [x] 7. Implement user profile section
  - [x] 7.1 Fetch user avatar from Supabase
  - [x] 7.2 Create fetchUserAvatar function
  - [x] 7.3 List avatar files with search pattern
  - [x] 7.4 Sort by created_at descending
  - [x] 7.5 Try download first, fallback to public URL
  - [x] 7.6 Set directAvatarUrl state
  - [x] 7.7 Handle avatar errors
  - _Requirements: 4.1, 4.2_

- [x] 8. Implement avatar display
  - [x] 8.1 Show avatar image if available
  - [x] 8.2 Create getInitials function
  - [x] 8.3 Show initials fallback
  - [x] 8.4 Handle image load errors
  - [x] 8.5 Different sizes for expanded/collapsed
  - [x] 8.6 Add tooltips for collapsed state
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 9. Build user info display
  - [x] 9.1 Show full name (expanded)
  - [x] 9.2 Show email (expanded)
  - [x] 9.3 Show role in tooltip (collapsed)
  - [x] 9.4 Truncate long text
  - _Requirements: 4.1, 4.2, 4.5_

- [x] 10. Implement settings link
  - [x] 10.1 Add Settings nav item in footer
  - [x] 10.2 Show icon + label (expanded)
  - [x] 10.3 Show icon only (collapsed)
  - [x] 10.4 Add tooltip (collapsed)
  - [x] 10.5 Apply active highlighting
  - _Requirements: 1.2, 3.1, 3.2_

- [x] 11. Implement logout functionality
  - [x] 11.1 Add logout button in footer
  - [x] 11.2 Create handleSignOut function
  - [x] 11.3 Call signOut from auth context
  - [x] 11.4 Navigate to /auth after logout
  - [x] 11.5 Show icon + label (expanded)
  - [x] 11.6 Show icon only (collapsed)
  - [x] 11.7 Add tooltip (collapsed)
  - _Requirements: 4.3_

- [x] 12. Implement responsive behavior
  - [x] 12.1 Use useMediaQuery hook
  - [x] 12.2 Detect mobile (< 768px)
  - [x] 12.3 Auto-collapse on mobile
  - [x] 12.4 Hide collapse button on mobile
  - [x] 12.5 Adjust spacing for mobile
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 13. Add tooltips
  - [x] 13.1 Wrap component in TooltipProvider
  - [x] 13.2 Add tooltips to collapsed nav items
  - [x] 13.3 Add tooltips to collapsed user section
  - [x] 13.4 Add tooltips to collapse/expand buttons
  - [x] 13.5 Set tooltip delay duration
  - [x] 13.6 Position tooltips to the right
  - _Requirements: 2.1, 2.2, 4.4_

- [x] 14. Implement theme integration
  - [x] 14.1 Use theme-aware background colors
  - [x] 14.2 Use theme-aware text colors
  - [x] 14.3 Use theme-aware hover states
  - [x] 14.4 Use theme-aware active states
  - [x] 14.5 Ensure readability in both themes
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 15. Add transitions and animations
  - [x] 15.1 Add width transition (300ms)
  - [x] 15.2 Add hover transitions
  - [x] 15.3 Use ease-in-out timing
  - [x] 15.4 Apply to sidebar width changes
  - [x] 15.5 Apply to nav item hovers
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 16. Implement blob URL cleanup
  - [x] 16.1 Add useEffect cleanup function
  - [x] 16.2 Revoke directAvatarUrl if blob
  - [x] 16.3 Prevent memory leaks
  - _Requirements: Performance_

- [x] 17. Add dividers
  - [x] 17.1 Add divider after header
  - [x] 17.2 Add divider before footer
  - [x] 17.3 Style with proper margins
  - _Requirements: 1.1_

- [x] 18. Test and optimize
  - [x] 18.1 Test collapse/expand functionality
  - [x] 18.2 Test role-based navigation items
  - [x] 18.3 Test active route highlighting
  - [x] 18.4 Test avatar display and fallback
  - [x] 18.5 Test responsive behavior
  - [x] 18.6 Test logout functionality
  - [x] 18.7 Test tooltips
  - [x] 18.8 Test theme switching
  - [x] 18.9 Verify transitions are smooth
  - [x] 18.10 Test on mobile devices
  - _Requirements: All_

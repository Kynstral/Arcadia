# Implementation Plan: Theme System

- [x] 1. Create ThemeProvider component
  - [x] 1.1 Create theme-provider.tsx file
  - [x] 1.2 Define Theme type ("dark" | "light")
  - [x] 1.3 Define ThemeContextType interface
  - [x] 1.4 Create ThemeContext with createContext
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Implement theme initialization
  - [x] 2.1 Add useState with initializer function
  - [x] 2.2 Check if window is defined (SSR safety)
  - [x] 2.3 Check localStorage for saved theme
  - [x] 2.4 Return saved theme if exists
  - [x] 2.5 Detect system preference with matchMedia
  - [x] 2.6 Return "dark" if system prefers dark
  - [x] 2.7 Return "light" as default
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3_

- [x] 3. Implement theme application
  - [x] 3.1 Add useEffect with theme dependency
  - [x] 3.2 Save theme to localStorage
  - [x] 3.3 Add "dark" class to documentElement if dark
  - [x] 3.4 Remove "dark" class if light
  - [x] 3.5 Trigger on every theme change
  - _Requirements: 2.3, 2.4, 5.3, 5.4_

- [x] 4. Create context provider
  - [x] 4.1 Create provider value object
  - [x] 4.2 Include theme and setTheme
  - [x] 4.3 Wrap children with ThemeContext.Provider
  - [x] 4.4 Pass value prop
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 5. Create useTheme hook
  - [x] 5.1 Create useTheme function
  - [x] 5.2 Call useContext with ThemeContext
  - [x] 5.3 Check if context is undefined
  - [x] 5.4 Throw error if used outside provider
  - [x] 5.5 Return context value
  - [x] 5.6 Export useTheme hook
  - _Requirements: 1.2, 1.3_

- [x] 6. Integrate ThemeProvider in App
  - [x] 6.1 Import ThemeProvider in App.tsx
  - [x] 6.2 Wrap application with ThemeProvider
  - [x] 6.3 Position early in component tree
  - [x] 6.4 Ensure all components are children
  - _Requirements: 1.4, 1.5_

- [x] 7. Configure Tailwind CSS
  - [x] 7.1 Set darkMode to "class" in tailwind.config
  - [x] 7.2 Define CSS variables for light mode
  - [x] 7.3 Define CSS variables for dark mode
  - [x] 7.4 Use semantic variable names
  - [x] 7.5 Apply variables in globals.css
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [x] 8. Implement theme toggle in Settings
  - [x] 8.1 Import useTheme in Settings page
  - [x] 8.2 Get theme and setTheme from hook
  - [x] 8.3 Create Light theme button
  - [x] 8.4 Create Dark theme button
  - [x] 8.5 Create System theme button
  - [x] 8.6 Apply active styling based on theme
  - [x] 8.7 Call setTheme on button click
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 9. Ensure component theme support
  - [x] 9.1 Use Tailwind theme classes in all components
  - [x] 9.2 Use bg-background, text-foreground
  - [x] 9.3 Use bg-primary, text-primary-foreground
  - [x] 9.4 Use bg-muted, text-muted-foreground
  - [x] 9.5 Test all components in both themes
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 10. Handle localStorage edge cases
  - [x] 10.1 Check if localStorage is available
  - [x] 10.2 Handle localStorage errors gracefully
  - [x] 10.3 Fallback to system preference if unavailable
  - _Requirements: 2.5_

- [x] 11. Implement SSR safety
  - [x] 11.1 Check typeof window !== "undefined"
  - [x] 11.2 Return default theme for SSR
  - [x] 11.3 Prevent window access during SSR
  - _Requirements: 1.5, 7.5_

- [x] 12. Test theme system
  - [x] 12.1 Test theme initialization
  - [x] 12.2 Test theme switching
  - [x] 12.3 Test localStorage persistence
  - [x] 12.4 Test system preference detection
  - [x] 12.5 Test SSR safety
  - [x] 12.6 Test cross-tab synchronization
  - [x] 12.7 Test all components in both themes
  - [x] 12.8 Verify no flash of unstyled content
  - [x] 12.9 Test contrast ratios
  - [x] 12.10 Verify smooth transitions
  - _Requirements: All_

- [x] 13. Verify accessibility
  - [x] 13.1 Check WCAG AA contrast ratios
  - [x] 13.2 Test with screen readers
  - [x] 13.3 Verify keyboard navigation
  - [x] 13.4 Test with high contrast mode
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 14. Optimize performance
  - [x] 14.1 Verify minimal re-renders
  - [x] 14.2 Check for memory leaks
  - [x] 14.3 Test with React DevTools
  - [x] 14.4 Ensure fast theme switching
  - _Requirements: All_

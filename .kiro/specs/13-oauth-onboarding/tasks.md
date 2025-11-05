# Implementation Plan: OAuth Onboarding Flow

- [x] 1. Create Onboarding page component
  - [x] 1.1 Set up Onboarding page file
    - Create `src/pages/Onboarding.tsx`
    - Import necessary UI components (Card, Button, Input, Label, Select)
    - Import Supabase client
    - Import useAuth hook
    - Import useNavigate and useToast hooks
    - _Requirements: 1.1_

  - [x] 1.2 Set up component state
    - Add state for role (UserRole: "Library" | "Book Store")
    - Add state for organizationName (string)
    - Add state for loading (boolean)
    - Set default role to "Library"
    - _Requirements: 1.1_

  - [x] 1.3 Build page layout structure
    - Create centered flex container with min-h-screen
    - Add Card component with backdrop blur
    - Add Arcadia logo and title
    - Add welcome message explaining onboarding purpose
    - Style with design system colors
    - _Requirements: 1.1, 3.3_

  - [x] 1.4 Create role selection dropdown
    - Add Label for "Select your role"
    - Create Select component with role state
    - Add SelectItem for "Library"
    - Add SelectItem for "Book Store"
    - Handle value change to update role state
    - Style with muted background
    - _Requirements: 1.1_

  - [x] 1.5 Implement dynamic organization name label
    - Create getOrganizationLabel() helper function
    - Return "Name of Library" when role is "Library"
    - Return "Book Store Name" when role is "Book Store"
    - Apply to Label component
    - _Requirements: 1.1_

  - [x] 1.6 Create organization name input
    - Add Label with dynamic text from getOrganizationLabel()
    - Create Input component bound to organizationName state
    - Add dynamic placeholder based on role
    - Set required attribute
    - Disable when loading
    - Style with muted background
    - _Requirements: 1.1_

  - [x] 1.7 Add submit button
    - Create Button with type="submit"
    - Set text to "Complete Setup" or "Completing..." when loading
    - Disable when loading or organizationName is empty
    - Use primary variant
    - Set size to "lg"
    - _Requirements: 1.1_

  - [x] 1.8 Wrap form elements in form tag
    - Create form element with onSubmit handler
    - Prevent default form submission
    - Add space-y classes for vertical spacing
    - _Requirements: 1.1_

- [x] 2. Implement onboarding submission logic
  - [x] 2.1 Create handleSubmit function
    - Define async function
    - Prevent default form submission
    - Set loading to true
    - Validate organizationName is not empty
    - _Requirements: 4.1_

  - [x] 2.2 Update user metadata
    - Call supabase.auth.updateUser()
    - Pass data object with role and full_name
    - Set full_name to organizationName value
    - Set role to selected role value
    - _Requirements: 4.1_

  - [x] 2.3 Handle update success
    - Show success toast with welcome message
    - Include organization name in toast
    - Navigate to /dashboard
    - _Requirements: 4.1_

  - [x] 2.4 Handle update errors
    - Catch errors from updateUser call
    - Log error to console
    - Show error toast with descriptive message
    - Keep user on onboarding page
    - _Requirements: 4.1_

  - [x] 2.5 Reset loading state
    - Set loading to false in finally block
    - Ensure loading resets even on error
    - _Requirements: 4.1_

- [x] 3. Create profile completion check utility
  - [x] 3.1 Create utility function file
    - Create `src/lib/auth-utils.ts` (or add to existing utils)
    - Export isProfileComplete function
    - _Requirements: 2.1_

  - [x] 3.2 Implement isProfileComplete function
    - Accept user object as parameter (User | null)
    - Return false if user is null
    - Check if user.user_metadata exists
    - Check if user.user_metadata.role exists and is not empty
    - Check if user.user_metadata.full_name exists and is not empty
    - Return true only if both fields exist
    - Return false otherwise
    - _Requirements: 2.1_

  - [x] 3.3 Add TypeScript types
    - Import User type from Supabase
    - Add proper return type (boolean)
    - Add JSDoc comment explaining function purpose
    - _Requirements: 2.1_

- [x] 4. Update AuthCallback to handle onboarding redirect
  - [x] 4.1 Import isProfileComplete utility
    - Import from @/lib/auth-utils
    - _Requirements: 3.1_

  - [x] 4.2 Get user data after OAuth callback
    - After getSession() call, extract user from session
    - Store user in variable
    - _Requirements: 3.1_

  - [x] 4.3 Check if profile is complete
    - Call isProfileComplete(user)
    - Store result in variable
    - _Requirements: 3.1_

  - [x] 4.4 Implement conditional redirect
    - If profile is incomplete, navigate to /onboarding
    - If profile is complete, navigate to /dashboard
    - Use navigate() from useNavigate
    - _Requirements: 3.1_

  - [x] 4.5 Handle edge cases
    - If user is null, redirect to /auth
    - If session is null, redirect to /auth
    - Log any unexpected states
    - _Requirements: 3.1_

- [x] 5. Add onboarding route to App.tsx
  - [x] 5.1 Import Onboarding component
    - Import from @/pages/Onboarding
    - _Requirements: 5.1_

  - [x] 5.2 Create protected onboarding route
    - Add Route for "/onboarding"
    - Wrap Onboarding component with ProtectedRoute
    - Place after /auth/callback route
    - Place before dashboard routes
    - _Requirements: 5.1_

- [x] 6. Implement onboarding bypass prevention
  - [x] 6.1 Add profile check to dashboard route
    - In Index page (dashboard), check if profile is complete
    - Import useAuth hook
    - Import isProfileComplete utility
    - Get user from useAuth()
    - _Requirements: 6.1_

  - [x] 6.2 Redirect incomplete profiles to onboarding
    - Call isProfileComplete(user) in useEffect
    - If false, navigate to /onboarding
    - Use navigate() from useNavigate
    - Add user as dependency to useEffect
    - _Requirements: 6.1_

  - [x] 6.3 Prevent redirect loop
    - Only redirect if not already on /onboarding
    - Check current location before redirecting
    - _Requirements: 6.1_

- [x] 7. Update AuthStatusProvider to handle metadata updates
  - [x] 7.1 Verify USER_UPDATED event handling
    - Check that onAuthStateChange handles USER_UPDATED
    - Ensure user state updates when metadata changes
    - Verify userRole extracts from updated metadata
    - _Requirements: 4.1_

  - [x] 7.2 Test metadata propagation
    - After updateUser call, verify context updates
    - Check that useAuth returns updated user data
    - Confirm role is accessible in components
    - _Requirements: 4.1_

- [x] 8. Add validation and error handling
  - [x] 8.1 Validate organization name input
    - Check minimum length (e.g., 2 characters)
    - Trim whitespace before submission
    - Show inline error for invalid input
    - Disable submit if validation fails
    - _Requirements: 1.1_

  - [x] 8.2 Handle network errors
    - Catch network failures during updateUser
    - Show user-friendly error message
    - Suggest checking internet connection
    - Allow retry
    - _Requirements: 4.1_

  - [x] 8.3 Handle Supabase errors
    - Check for specific Supabase error codes
    - Display appropriate error messages
    - Log errors for debugging
    - _Requirements: 4.1_

- [x] 9. Style and polish onboarding page
  - [x] 9.1 Match Auth page design
    - Use same Card styling with backdrop blur
    - Use same color scheme and spacing
    - Match button and input styles
    - Ensure consistent typography
    - _Requirements: 1.1, 3.3_

  - [x] 9.2 Add welcome copy
    - Write friendly welcome message
    - Explain why information is needed
    - Keep copy concise and clear
    - Use appropriate text colors
    - _Requirements: 3.3_

  - [x] 9.3 Ensure mobile responsiveness
    - Test on mobile viewport
    - Ensure proper padding and spacing
    - Check touch target sizes
    - Verify form usability on small screens
    - _Requirements: 3.3_

  - [x] 9.4 Add loading states
    - Show loading spinner or text during submission
    - Disable all inputs when loading
    - Prevent double submission
    - _Requirements: 1.1_
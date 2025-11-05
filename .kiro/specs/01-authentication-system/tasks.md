# Implementation Plan: Authentication System

- [x] 1. Set up Supabase client and configuration
  - [x] 1.1 Create Supabase client file
    - Create `src/integrations/supabase/client.ts`
    - Import createClient from @supabase/supabase-js
    - _Requirements: 1.1, 2.1_

  - [x] 1.2 Configure environment variables
    - Set up VITE_SUPABASE_URL in .env
    - Set up VITE_SUPABASE_ANON_KEY in .env
    - Add .env.example with placeholders
    - _Requirements: 1.1_

  - [x] 1.3 Initialize Supabase client
    - Call createClient with URL and anon key
    - Export supabase client instance
    - Add TypeScript Database type
    - _Requirements: 1.1, 6.1_

- [x] 2. Implement AuthStatusProvider context
  - [x] 2.1 Create AuthContext with interfaces
    - Define AuthContextType interface with all fields
    - Create AuthContext with createContext
    - Set default context values
    - Export useAuth custom hook
    - _Requirements: 5.1, 5.2_

  - [x] 2.2 Set up state management
    - Add useState for user (User | null)
    - Add useState for session (Session | null)
    - Add useState for loading (boolean)
    - Add useState for userRole (string | null)
    - Add useState for userId (string | null)
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 2.3 Implement session initialization on app load
    - Create getInitialSession async function
    - Call supabase.auth.getSession() on mount
    - Set user, session, userId from response
    - Extract and set userRole from user_metadata
    - Handle errors gracefully
    - Set loading to false after completion
    - _Requirements: 5.5_

  - [x] 2.4 Set up auth state change listener
    - Subscribe to supabase.auth.onAuthStateChange
    - Handle SIGNED_IN event
    - Handle SIGNED_OUT event
    - Handle TOKEN_REFRESHED event
    - Handle USER_UPDATED event
    - Update all state on auth changes
    - Extract role from metadata on changes
    - _Requirements: 5.4_

  - [x] 2.5 Implement cleanup on unmount
    - Store subscription reference
    - Unsubscribe in useEffect cleanup
    - Prevent memory leaks
    - _Requirements: 5.4_

  - [x] 2.6 Implement signOut function
    - Create async signOut function
    - Call supabase.auth.signOut()
    - Let onAuthStateChange handle state clearing
    - _Requirements: 4.1, 4.2_

  - [x] 2.7 Provide context to children
    - Create context value object
    - Wrap children with AuthContext.Provider
    - Pass value prop with all state
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 3. Create Auth page with login and registration
  - [x] 3.1 Set up Auth page component
    - Create `src/pages/Auth.tsx`
    - Import necessary UI components
    - Import Supabase client
    - Import useToast and useNavigate hooks
    - _Requirements: 1.1, 2.1_

  - [x] 3.2 Set up component state
    - Add state for email (string)
    - Add state for password (string)
    - Add state for isSignUp (boolean)
    - Add state for name (string)
    - Add state for role (UserRole)
    - Add state for loading (boolean)
    - Add state for session (Session | null)
    - _Requirements: 1.1, 2.1_

  - [x] 3.3 Build form UI structure
    - Create card container with backdrop blur
    - Add Arcadia logo and title
    - Add conditional subtitle based on mode
    - Create form element with onSubmit
    - _Requirements: 1.1, 2.1_

  - [x] 3.4 Add role selection dropdown
    - Create Select component for role
    - Add "Library" and "Book Store" options
    - Set default value to "Library"
    - Handle role change events
    - _Requirements: 1.1_

  - [x] 3.5 Implement dynamic form label
    - Create getFormLabel() function
    - Return "Name of Library" for Library role
    - Return "Book Store Name" for Book Store role
    - Apply to name input label
    - _Requirements: 1.1_

  - [x] 3.6 Build sign-up form fields
    - Add role selector
    - Add name input with dynamic label
    - Add email input with validation
    - Add password input
    - Add submit button with loading state
    - Add toggle to switch to sign-in
    - _Requirements: 1.1, 1.5_

  - [x] 3.7 Build sign-in form fields
    - Add role selector
    - Add email input
    - Add password input
    - Add "Forgot password?" link
    - Add submit button with loading state
    - Add toggle to switch to sign-up
    - _Requirements: 2.1_

  - [x] 3.8 Implement handleSignUp function
    - Prevent default form submission
    - Set loading to true
    - Validate all required fields present
    - Call supabase.auth.signUp()
    - Pass email, password in credentials
    - Pass full_name and role in options.data
    - Handle "User already registered" error
    - Handle other errors
    - Show success toast on success
    - Navigate to dashboard on success
    - Set loading to false in finally block
    - _Requirements: 1.2, 1.3, 1.4_

  - [x] 3.9 Implement handleSignIn function
    - Prevent default form submission
    - Set loading to true
    - Call supabase.auth.signInWithPassword()
    - Pass email and password
    - Handle authentication errors
    - Show error toast on failure
    - Show success toast on success
    - Navigate to dashboard on success
    - Set loading to false in finally block
    - _Requirements: 2.2, 2.3, 2.4_

  - [x] 3.10 Add form validation
    - Validate email format with HTML5
    - Mark required fields with required attribute
    - Disable submit button when loading
    - Show loading text on button during submission
    - _Requirements: 1.5_

  - [x] 3.11 Implement session check on mount
    - Call supabase.auth.getSession() in useEffect
    - Set session state from response
    - Redirect to dashboard if session exists
    - _Requirements: 2.5_

  - [x] 3.12 Set up auth state change listener
    - Subscribe to onAuthStateChange in useEffect
    - Update session state on changes
    - Redirect to dashboard when signed in
    - Unsubscribe on component unmount
    - _Requirements: 2.5_

  - [x] 3.13 Add conditional redirect for authenticated users
    - Check if session exists
    - Get "from" location from state
    - Use Navigate component to redirect
    - Default to /dashboard if no "from" location
    - _Requirements: 2.5, 3.4_

- [x] 4. Create AuthCallback page for OAuth handling
  - [x] 4.1 Create AuthCallback component
    - Create `src/pages/AuthCallback.tsx`
    - Import useNavigate hook
    - Import Supabase client
    - _Requirements: 6.1, 6.4_

  - [x] 4.2 Set up auth state change listener
    - Subscribe to onAuthStateChange in useEffect
    - Check for SIGNED_IN event
    - Verify session exists
    - Navigate to dashboard on successful sign in
    - _Requirements: 6.1, 6.2_

  - [x] 4.3 Implement OAuth callback processing
    - Create processOAuthCallback async function
    - Call supabase.auth.getSession()
    - Extract session from response
    - Handle errors from getSession
    - _Requirements: 6.1, 6.2_

  - [x] 4.4 Add success redirect logic
    - Navigate to /dashboard on successful callback
    - Use navigate() from useNavigate
    - _Requirements: 6.2_

  - [x] 4.5 Add error redirect logic
    - Log error to console
    - Navigate to /auth on callback error
    - Optionally pass error message in state
    - _Requirements: 6.3_

  - [x] 4.6 Display loading state UI
    - Create centered container
    - Add animated pulse effect
    - Show "Completing authentication..." heading
    - Add descriptive subtext
    - Style with muted colors
    - _Requirements: 6.4_

  - [x] 4.7 Clean up listeners on unmount
    - Ensure no memory leaks
    - Unsubscribe from auth changes
    - _Requirements: 6.1_

- [x] 5. Implement ProtectedRoute component
  - [x] 5.1 Create ProtectedRoute component in App.tsx
    - Define component accepting children prop
    - Import useAuth hook
    - Import useLocation from react-router-dom
    - Import Navigate component
    - _Requirements: 3.1, 3.2_

  - [x] 5.2 Get authentication state
    - Call useAuth() to get user and loading
    - Call useLocation() to get current location
    - Store in component scope
    - _Requirements: 3.1, 3.2_

  - [x] 5.3 Implement loading state check
    - Check if loading is true
    - Return early with loading UI
    - _Requirements: 3.3_

  - [x] 5.4 Build loading state UI
    - Create centered flex container
    - Add animated pulse effect
    - Display "Loading..." heading
    - Add "Please wait while we prepare your dashboard" message
    - Style with appropriate colors
    - _Requirements: 3.3_

  - [x] 5.5 Implement authentication check
    - Check if user is null
    - Return early if not authenticated
    - _Requirements: 3.1_

  - [x] 5.6 Implement redirect for unauthenticated users
    - Use Navigate component
    - Redirect to="/auth"
    - Pass state={{ from: location }}
    - Use replace prop to avoid back button issues
    - _Requirements: 3.1, 3.4_

  - [x] 5.7 Wrap authenticated content in Layout
    - Import Layout component
    - Render Layout with children
    - Layout includes Sidebar and main content area
    - _Requirements: 3.2_

- [x] 6. Set up routing with protected routes
  - [x] 6.1 Configure public routes
    - Add Route for "/" pointing to LandingPage
    - Add Route for "/auth" pointing to Auth
    - Add Route for "/auth/callback" pointing to AuthCallback
    - Add Route for "*" pointing to NotFound (404)
    - _Requirements: 3.1, 6.4_

  - [x] 6.2 Wrap dashboard route with ProtectedRoute
    - Create Route for "/dashboard"
    - Wrap Index component with ProtectedRoute
    - _Requirements: 3.2, 3.5_

  - [x] 6.3 Wrap catalog route with ProtectedRoute
    - Create Route for "/catalog"
    - Wrap Catalog component with ProtectedRoute
    - _Requirements: 3.2, 3.5_

  - [x] 6.4 Wrap books routes with ProtectedRoute
    - Create Route for "/books"
    - Create Route for "/book/:id"
    - Create Route for "/books/edit/:id"
    - Wrap all with ProtectedRoute
    - _Requirements: 3.2, 3.5_

  - [x] 6.5 Wrap member routes with ProtectedRoute
    - Create Route for "/members"
    - Create Route for "/members/edit/:id"
    - Wrap with ProtectedRoute
    - _Requirements: 3.2, 3.5_

  - [x] 6.6 Wrap circulation and checkout routes
    - Create Route for "/book-circulation"
    - Create Route for "/checkout"
    - Create Route for "/transactions"
    - Wrap all with ProtectedRoute
    - _Requirements: 3.2, 3.5_

  - [x] 6.7 Wrap settings route with ProtectedRoute
    - Create Route for "/settings"
    - Wrap Settings component with ProtectedRoute
    - _Requirements: 3.2, 3.5_

- [x] 7. Integrate AuthStatusProvider in App
  - [x] 7.1 Import AuthStatusProvider in App.tsx
    - Import from @/components/AuthStatusProvider
    - Import useAuth hook as well
    - _Requirements: 5.1_

  - [x] 7.2 Wrap application with AuthStatusProvider
    - Place AuthStatusProvider in component tree
    - Position after ThemeProvider and TooltipProvider
    - Position before BrowserRouter
    - Ensure all routes are children
    - _Requirements: 5.1_

  - [x] 7.3 Verify context accessibility
    - Test useAuth hook in child components
    - Verify auth state is accessible
    - Confirm no context errors
    - _Requirements: 5.2, 5.3_

- [x] 8. Implement logout functionality
  - [x] 8.1 Add logout to Sidebar component
    - Import useAuth hook in Sidebar
    - Get signOut function from context
    - Create logout button in sidebar
    - Call signOut on button click
    - _Requirements: 4.1_

  - [x] 8.2 Handle logout state changes
    - AuthStatusProvider clears state automatically
    - onAuthStateChange handles SIGNED_OUT event
    - All components receive updated context
    - _Requirements: 4.2, 4.3_

  - [x] 8.3 Implement post-logout redirect
    - ProtectedRoute detects user is null
    - Automatically redirects to /auth
    - User can navigate to landing page
    - _Requirements: 4.2, 4.4_

  - [x] 8.4 Verify protected routes become inaccessible
    - Test accessing /dashboard after logout
    - Verify redirect to /auth occurs
    - Test all protected routes
    - _Requirements: 4.4_

- [x] 9. Add error handling and user feedback
  - [x] 9.1 Set up toast notification system
    - Import useToast hook in Auth page
    - Configure toast for success messages
    - Configure toast for error messages
    - Use consistent styling
    - _Requirements: 1.3, 2.3_

  - [x] 9.2 Implement success notifications
    - Show toast on successful signup
    - Show toast on successful login
    - Include user-friendly messages
    - Auto-dismiss after delay
    - _Requirements: 1.4, 2.4_

  - [x] 9.3 Handle "User already registered" error
    - Check for specific error message
    - Display custom toast message
    - Suggest signing in instead
    - Use destructive variant
    - _Requirements: 1.3_

  - [x] 9.4 Handle invalid credentials error
    - Display "Incorrect email or password" message
    - Use destructive toast variant
    - _Requirements: 2.3_

  - [x] 9.5 Handle network and unexpected errors
    - Catch all other errors
    - Display generic error message
    - Log to console for debugging
    - Use destructive toast variant
    - _Requirements: 1.3, 2.3_

  - [x] 9.6 Add loading states to forms
    - Disable all inputs when loading
    - Disable submit button when loading
    - Change button text to "Signing in..." or "Creating account..."
    - Prevent form resubmission
    - _Requirements: 1.2, 2.2_

- [x] 10. Test authentication flows
  - [x] 10.1 Test user registration flow
    - Fill out registration form with valid data
    - Submit form
    - Verify account created in Supabase
    - Check user_metadata contains full_name and role
    - Verify redirect to dashboard
    - Verify success toast displayed
    - _Requirements: 1.2, 1.4_

  - [x] 10.2 Test duplicate email registration
    - Attempt to register with existing email
    - Verify error toast displayed
    - Confirm no duplicate account created
    - _Requirements: 1.3_

  - [x] 10.3 Test user login flow
    - Fill out login form with valid credentials
    - Submit form
    - Verify authentication successful
    - Verify redirect to dashboard
    - Verify success toast displayed
    - _Requirements: 2.2, 2.4_

  - [x] 10.4 Test invalid credentials login
    - Attempt login with wrong password
    - Verify error toast displayed
    - Confirm no redirect occurs
    - _Requirements: 2.3_

  - [x] 10.5 Test session persistence
    - Log in successfully
    - Refresh browser page
    - Verify user remains authenticated
    - Verify no redirect to auth page
    - Check AuthStatusProvider restores session
    - _Requirements: 2.5, 5.5_

  - [x] 10.6 Test protected route access (unauthenticated)
    - Navigate to /dashboard without auth
    - Verify redirect to /auth occurs
    - Check location state contains original URL
    - _Requirements: 3.1, 3.4_

  - [x] 10.7 Test protected route access (authenticated)
    - Log in successfully
    - Navigate to /dashboard
    - Verify page renders correctly
    - Verify Layout and Sidebar displayed
    - _Requirements: 3.2_

  - [x] 10.8 Test return URL functionality
    - Attempt to access /books without auth
    - Get redirected to /auth
    - Log in successfully
    - Verify redirect back to /books
    - _Requirements: 3.4_

  - [x] 10.9 Test logout functionality
    - Click logout button in Sidebar
    - Verify signOut called
    - Verify redirect to landing page or auth
    - Attempt to access protected route
    - Verify redirect to /auth occurs
    - _Requirements: 4.1, 4.2, 4.4_

  - [x] 10.10 Test session clearing on logout
    - Log in successfully
    - Log out
    - Check browser storage for auth tokens
    - Verify all session data cleared
    - _Requirements: 4.3_

  - [x] 10.11 Test OAuth callback handling
    - Simulate OAuth callback URL
    - Navigate to /auth/callback
    - Verify loading state displayed
    - Verify redirect to dashboard on success
    - Test error redirect to /auth
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 10.12 Test cross-tab authentication
    - Log in in one browser tab
    - Open another tab
    - Verify auth state synced
    - Log out in one tab
    - Verify other tab updates
    - _Requirements: 5.4, 5.5_

- [x] 11. Add OAuth authentication support
  - [x] 11.1 Implement handleOAuthSignIn function
    - Create async function accepting provider parameter (google | github)
    - Call supabase.auth.signInWithOAuth with provider
    - Set redirectTo to /auth/callback
    - Handle errors with toast notifications
    - Set loading state during OAuth flow
    - _Requirements: 6.1_

  - [x] 11.2 Add OAuth buttons to sign-up form
    - Create grid layout with Google and GitHub buttons
    - Add Google SVG icon with brand colors
    - Add GitHub SVG icon
    - Wire up onClick handlers to handleOAuthSignIn
    - Disable buttons during loading state
    - _Requirements: 6.1_

  - [x] 11.3 Add OAuth buttons to sign-in form
    - Duplicate OAuth button grid for sign-in form
    - Maintain consistent styling with sign-up
    - Add separator with "Or continue with email" text
    - _Requirements: 6.1_

  - [x] 11.4 Import required components
    - Import Link from react-router-dom
    - Import ArrowLeft icon from lucide-react
    - Import Separator component
    - _Requirements: 1.1, 6.1_

- [x] 12. UI/UX improvements to Auth page
  - [x] 12.1 Add "Back to home" button
    - Create secondary button variant with Link component
    - Position at top-8 left-8 for proper spacing
    - Add ArrowLeft icon
    - Link to landing page (/)
    - _Requirements: 1.1_

  - [x] 12.2 Minor UI polish
    - Add cursor-pointer to toggle buttons
    - Add cursor-pointer to "Forgot password?" link
    - Improve button hover states
    - _Requirements: 1.1_

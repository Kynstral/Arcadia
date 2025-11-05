# Design Document: Authentication System

## Overview

The Authentication System provides secure user authentication, session management, and access control for Arcadia. Built on Supabase Auth with email/password authentication and role-based user metadata to differentiate between Library and Book Store users.

### Key Objectives

- Secure credential and session management
- Seamless authentication flow with minimal friction
- Role-based user differentiation (Library vs Book Store)
- Session persistence across browser sessions
- Route-level access control for protected content

## Architecture

### High-Level System Flow

```
┌─────────────┐      ┌──────────────┐      ┌────────────────────┐      ┌─────────────────┐      ┌──────────────────┐
│  Auth Page  │─────▶│ Supabase Auth│─────▶│ AuthStatusProvider │─────▶│ ProtectedRoute  │─────▶│ Protected Pages  │
│  (Login/    │      │  (Backend)   │      │   (React Context)  │      │  (Route Guard)  │      │  (Dashboard,     │
│   Signup)   │      │              │      │                    │      │                 │      │   Books, etc.)   │
└─────────────┘      └──────────────┘      └────────────────────┘      └─────────────────┘      └──────────────────┘
      │                     │                        │                          │
      │                     │                        │                          │
   User Input          JWT Tokens              Global State              Auth Check
   Validation          Session Mgmt            Distribution              Redirect Logic
```

**Key Components:**
- **Auth Page**: Login/signup forms with role selection and validation
- **Supabase Auth**: Email/password authentication, JWT tokens, session management
- **AuthStatusProvider**: React Context for global auth state distribution
- **ProtectedRoute**: Route guard that checks authentication before rendering
- **AuthCallback**: Handles OAuth redirects and email confirmations

### Component Hierarchy

```
App (Root Component)
│
├── QueryClientProvider (React Query)
├── ThemeProvider (Dark/Light Mode)
├── TooltipProvider (UI Tooltips)
│
└── AuthStatusProvider ★ (Authentication Context - Wraps Entire App)
    │
    └── BrowserRouter (React Router)
        │
        └── Routes
            │
            ├── Public Routes (No Auth Required)
            │   ├── / → LandingPage
            │   ├── /auth → Auth (Login/Signup)
            │   ├── /auth/callback → AuthCallback
            │   └── * → NotFound (404)
            │
            └── Protected Routes (Auth Required via ProtectedRoute)
                ├── /dashboard → Index
                ├── /catalog → Catalog
                ├── /books → Books
                ├── /book/:id → BookDetail
                ├── /books/edit/:id → EditBook
                ├── /members → Members
                ├── /members/edit/:id → EditMember
                ├── /book-circulation → BookCirculation
                ├── /checkout → Checkout
                ├── /transactions → Transactions
                └── /settings → Settings
```

### Authentication State Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Action (Login)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Auth.tsx (Form Submission)                         │
│  • Validate email format                                        │
│  • Check required fields                                        │
│  • Set loading state                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│           Supabase Auth API (Backend)                           │
│  • supabase.auth.signInWithPassword()                           │
│  • Verify credentials against database                          │
│  • Generate JWT access token                                    │
│  • Generate refresh token                                       │
│  • Create session object                                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│         onAuthStateChange Event (Supabase Listener)             │
│  • Event: SIGNED_IN                                             │
│  • Payload: session, user                                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│          AuthStatusProvider (Context Update)                    │
│  • setUser(session.user)                                        │
│  • setSession(session)                                          │
│  • setUserId(session.user.id)                                   │
│  • setUserRole(session.user.user_metadata.role)                 │
│  • setLoading(false)                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│        All Subscribed Components Re-render                      │
│  • ProtectedRoute (re-evaluates access)                         │
│  • Sidebar (displays user info)                                 │
│  • Header (updates auth buttons)                                │
│  • Pages (access user data via useAuth)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Navigate to Dashboard                              │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Auth Page (`src/pages/Auth.tsx`)

**Purpose**: Single entry point for user registration and login

**Key Features**:
- **Dual Mode Interface**: Toggle between sign-up and sign-in modes without page reload
- **Role Selection**: Dropdown to choose between "Library" and "Book Store" during registration
- **Dynamic Labels**: Form labels change based on selected role (e.g., "Name of Library" vs "Book Store Name")
- **Form Validation**: Email format validation, required field checks using HTML5 validation
- **Loading States**: Disable form inputs and show loading indicators during API calls
- **Error Handling**: Display user-friendly error messages for various failure scenarios
- **Auto-redirect**: Redirect to dashboard if user is already authenticated
- **Session Monitoring**: Listen for auth state changes and respond accordingly

**Component State**:
```typescript
interface AuthPageState {
  email: string;              // User's email address
  password: string;           // User's password
  name: string;               // Library/bookstore name (signup only)
  role: UserRole;             // "Library" | "Book Store"
  isSignUp: boolean;          // Toggle between signup/signin modes
  loading: boolean;           // API call in progress
  session: Session | null;    // Current Supabase session
}
```

**Key Methods**:
- `handleSignUp()`: Calls supabase.auth.signUp() with user_metadata containing full_name and role
- `handleSignIn()`: Calls supabase.auth.signInWithPassword() with email and password
- `getFormLabel()`: Returns dynamic label based on selected role

**UI Structure**:
```
┌─────────────────────────────────────┐
│          Auth Page                  │
│  ┌───────────────────────────────┐ │
│  │  Logo & Title                 │ │
│  │  "Arcadia"                    │ │
│  │  "Sign in to your account"    │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Form (Conditional)           │ │
│  │                               │ │
│  │  [If Sign Up Mode]            │ │
│  │  • Role Selector              │ │
│  │  • Name Input (dynamic label) │ │
│  │  • Email Input                │ │
│  │  • Password Input             │ │
│  │  • [Sign Up Button]           │ │
│  │  • "Already have account?"    │ │
│  │                               │ │
│  │  [If Sign In Mode]            │ │
│  │  • Role Selector              │ │
│  │  • Email Input                │ │
│  │  • Password Input             │ │
│  │  • "Forgot password?" link    │ │
│  │  • [Log in Button]            │ │
│  │  • "Don't have account?"      │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Error Handling**:
- **Email Already Exists**: "This email address is already in use. Please try signing in instead."
- **Invalid Credentials**: "Incorrect email or password. Please try again."
- **Network Error**: "Connection error. Please check your internet and try again."
- **Validation Error**: "Please fill in all required fields."

### 2. AuthCallback Page (`src/pages/AuthCallback.tsx`)

**Purpose**: Handle OAuth redirects and email confirmation callbacks

**Functionality**:
- Process OAuth callback parameters from URL
- Extract and validate authentication tokens
- Establish user session
- Handle callback errors gracefully
- Redirect user to appropriate destination

**Use Cases**:
1. **OAuth Provider Redirect**: After user authenticates with Google, GitHub, etc.
2. **Email Confirmation**: After user clicks confirmation link in email
3. **Magic Link**: After user clicks passwordless login link
4. **Password Reset**: After user completes password reset flow

**Flow**:
```
External Provider/Email Link
    │
    ▼
/auth/callback?token=xxx&type=signup
    │
    ▼
AuthCallback Component
    │
    ├─► Listen for onAuthStateChange
    │   └─► Wait for SIGNED_IN event
    │
    ├─► Call supabase.auth.getSession()
    │   └─► Validate token and create session
    │
    ▼
Success?
    │
    ├─► YES: Navigate to /dashboard
    │
    └─► NO: Navigate to /auth with error
```

**Loading State UI**:
- Centered container with animated pulse effect
- "Completing authentication..." heading
- "You'll be redirected in a moment" subtext

### 3. AuthStatusProvider (`src/components/AuthStatusProvider.tsx`)

**Purpose**: Centralized authentication state management using React Context API

**Context Interface**:
```typescript
interface AuthContextType {
  user: User | null;           // Supabase User object or null
  session: Session | null;     // Supabase Session object or null
  loading: boolean;            // True while checking auth status
  signOut: () => Promise<void>; // Function to log out user
  userRole: string | null;     // "Library" or "Book Store"
  userId: string | null;       // User's unique ID
}
```

**Responsibilities**:
- **Initialize Session**: Load and validate session on application mount using getSession()
- **State Distribution**: Provide auth state to all child components via React Context
- **Event Monitoring**: Listen for authentication state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED)
- **User Management**: Extract and expose user information from session
- **Role Management**: Parse and provide user role from user_metadata
- **Logout Handling**: Provide signOut function to all components

**State Lifecycle**:
```
App Mount
    │
    ▼
AuthStatusProvider Initialized
    │ (loading = true, user = null, session = null)
    │
    ▼
getInitialSession()
    │
    ├─► Call supabase.auth.getSession()
    │   │
    │   ├─► Session Found
    │   │   ├─► setSession(session)
    │   │   ├─► setUser(user)
    │   │   ├─► setUserId(user.id)
    │   │   ├─► setUserRole(metadata.role)
    │   │   └─► setLoading(false)
    │   │
    │   └─► No Session
    │       ├─► All state remains null
    │       └─► setLoading(false)
    │
    ▼
Set up onAuthStateChange Listener
    │
    ├─► SIGNED_IN event → Update all state with new session
    ├─► SIGNED_OUT event → Clear all state to null
    ├─► TOKEN_REFRESHED event → Update session with new token
    └─► USER_UPDATED event → Update user object
```

**Usage Pattern**:
```typescript
// In any component
import { useAuth } from "@/components/AuthStatusProvider";

const MyComponent = () => {
  const { user, loading, userRole, signOut } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <PleaseSignIn />;

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <p>Role: {userRole}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
};
```

**Benefits**:
- Single source of truth for all auth state
- Automatic component re-renders on auth changes
- Type-safe with TypeScript interfaces
- Simple hook-based API (useAuth)
- Prevents unnecessary re-renders with context optimization

### 4. ProtectedRoute Component (`src/App.tsx`)

**Purpose**: Route guard that restricts access to authenticated users only

**Logic Flow**:
```
1. Get auth state from useAuth hook
2. Get current location from useLocation
3. Check loading state
   └─► If loading: Show loading UI
4. Check user authentication
   └─► If not authenticated: Redirect to /auth with location state
5. If authenticated: Render children wrapped in Layout
```

**Features**:
- **Loading Indicator**: Shows animated loading UI while checking authentication status
- **Automatic Redirect**: Redirects unauthenticated users to /auth page
- **Return URL Preservation**: Stores original URL in location state for post-login redirect
- **Layout Integration**: Wraps authenticated content in Layout component (includes Sidebar)

**Loading State UI**:
```
┌─────────────────────────────────────┐
│     Centered Container              │
│                                     │
│     ⟳ (Animated Pulse)              │
│                                     │
│     Loading...                      │
│                                     │
│     Please wait while we prepare    │
│     your dashboard                  │
│                                     │
└─────────────────────────────────────┘
```

### 5. Supabase Client (`src/integrations/supabase/client.ts`)

**Purpose**: Initialize and export Supabase client instance

**Configuration**:
- **VITE_SUPABASE_URL**: Supabase project URL from environment variables
- **VITE_SUPABASE_ANON_KEY**: Supabase anonymous key from environment variables
- **Database Types**: TypeScript types generated from Supabase schema

**Implementation Pattern**:
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

**Usage**: Singleton instance shared across entire application

## Data Models

### User Metadata

Stored in Supabase Auth `user_metadata` field:
```typescript
{
  full_name: string;  // Library or bookstore name
  role: "Library" | "Book Store";  // User type for role-based features
}
```

**Storage Location**: Supabase Auth users table, user_metadata JSONB column

**Access Pattern**: Available via `session.user.user_metadata` after authentication

**Usage**: 
- Displayed in UI (e.g., "Welcome, [full_name]")
- Used for role-based feature access
- Extracted by AuthStatusProvider and exposed via useAuth hook

### Session Object

Provided by Supabase Auth:
```typescript
interface Session {
  user: User;              // User object with id, email, user_metadata, etc.
  access_token: string;    // JWT token for API authentication
  refresh_token: string;   // Token for refreshing expired access tokens
  expires_at: number;      // Unix timestamp when access token expires
  expires_in: number;      // Seconds until token expiration
  token_type: "bearer";    // OAuth token type
}
```

**Storage**: Automatically stored in browser's localStorage by Supabase client

**Lifecycle**: 
- Created on successful login/signup
- Automatically refreshed before expiration
- Cleared on logout or expiration

### User Object

Provided by Supabase Auth:
```typescript
interface User {
  id: string;                    // Unique user ID (UUID)
  email: string;                 // User's email address
  user_metadata: {               // Custom metadata
    full_name: string;
    role: "Library" | "Book Store";
  };
  created_at: string;            // ISO timestamp of account creation
  updated_at: string;            // ISO timestamp of last update
  aud: string;                   // Audience claim
  role: string;                  // Supabase role (authenticated, anon)
}
```

## Authentication Flow

### Registration Flow

```
1. User fills registration form (email, password, name, role)
2. Form validation
3. Call supabase.auth.signUp() with user_metadata
4. Handle response:
   - Success: Show toast, redirect to dashboard
   - Error: Display error message
5. AuthStatusProvider updates context
6. Protected routes become accessible
```

### Login Flow

```
1. User fills login form (email, password)
2. Form validation
3. Call supabase.auth.signInWithPassword()
4. Handle response:
   - Success: Show toast, redirect to dashboard
   - Error: Display error message
5. AuthStatusProvider updates context
6. Protected routes become accessible
```

### Logout Flow

```
1. User clicks logout button
2. Call supabase.auth.signOut()
3. AuthStatusProvider clears user state
4. Redirect to landing page
5. Protected routes become inaccessible
```

### Session Persistence

```
1. On app load, AuthStatusProvider calls getSession()
2. If valid session exists, restore user state
3. Set up auth state change listener
4. Update context on any auth changes
5. Session stored in browser storage by Supabase
```

## Error Handling

### Authentication Errors

- **Invalid credentials**: Display "Incorrect email or password"
- **Email already exists**: Display "Email already in use"
- **Network errors**: Display "Connection error, please try again"
- **Validation errors**: Inline field validation

### Error Display

- Toast notifications for auth errors
- Inline form validation errors
- Loading states prevent duplicate submissions
- Error messages cleared on successful retry

## Security Considerations

### Password Security

- Passwords hashed by Supabase (bcrypt)
- Never stored or logged in plaintext
- Minimum length enforced by Supabase

### Session Security

- JWT tokens with expiration
- Refresh tokens for session renewal
- Secure HTTP-only cookies (Supabase default)
- Automatic token refresh

### Protected Routes

- Server-side session validation
- Client-side route guards
- Redirect to login for unauthorized access
- Original URL preserved for post-login redirect

## Integration Points

### Supabase Auth Integration

**Authentication Methods**:
- `supabase.auth.signUp()`: Create new user account with email/password
- `supabase.auth.signInWithPassword()`: Authenticate existing user
- `supabase.auth.signOut()`: End user session
- `supabase.auth.getSession()`: Retrieve current session
- `supabase.auth.onAuthStateChange()`: Listen for auth events

**Features Used**:
- Email/password authentication
- JWT token generation and validation
- Session management with automatic refresh
- User metadata storage (full_name, role)
- OAuth callback handling (future extensibility)

**Configuration**:
- Project URL and anonymous key from environment variables
- Automatic session persistence in localStorage
- Token refresh before expiration

### React Router Integration

**Route Protection**:
- `ProtectedRoute` component wraps authenticated routes
- Uses `useLocation()` to capture original URL
- Uses `Navigate` component for redirects
- Passes location state for post-login redirect

**Navigation Flow**:
```
User tries to access /books (protected)
    │
    ▼
ProtectedRoute checks auth
    │
    ├─► Authenticated: Render /books
    │
    └─► Not Authenticated:
        └─► Navigate to /auth with state={{ from: "/books" }}
            └─► After login: Navigate back to /books
```

**Public Routes**: /, /auth, /auth/callback, 404
**Protected Routes**: All other routes (dashboard, books, members, etc.)

### Toast Notification Integration

**Library**: Sonner (via useToast hook)

**Usage Patterns**:
- **Success Messages**: Green toast with checkmark icon
  - "Account created successfully!"
  - "Welcome back!"
- **Error Messages**: Red toast with error icon
  - "Email already in use"
  - "Incorrect email or password"
  - "Connection error, please try again"

**Implementation**:
```typescript
import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();

// Success
toast({
  title: "Success",
  description: "Account created successfully!",
});

// Error
toast({
  title: "Error",
  description: "Email already in use",
  variant: "destructive",
});
```

### React Context Integration

**Provider Hierarchy**:
```
App
├── QueryClientProvider (React Query - for data fetching)
├── ThemeProvider (next-themes - for dark/light mode)
├── TooltipProvider (Radix UI - for tooltips)
└── AuthStatusProvider ★ (Auth state - wraps routing)
    └── BrowserRouter (React Router)
```

**Why This Order**:
- Theme and tooltips are UI concerns, initialized first
- Auth wraps routing so all routes have access to auth context
- Auth state is independent of data fetching (React Query)

## Testing Strategy

### Unit Tests

- AuthStatusProvider context logic
- Form validation functions
- Error handling paths

### Integration Tests

- Complete login flow
- Complete registration flow
- Protected route access
- Session persistence

### E2E Tests

- User registration journey
- User login journey
- Logout and re-login
- Protected route navigation

## Performance Considerations

- Lazy load auth pages
- Minimize re-renders with context optimization
- Cache session data
- Debounce form submissions

## Accessibility

- Proper form labels and ARIA attributes
- Keyboard navigation support
- Focus management on errors
- Screen reader friendly error messages
- Loading state announcements

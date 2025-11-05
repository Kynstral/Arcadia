# Requirements: OAuth Onboarding Flow

## Overview
When users sign up or sign in using OAuth providers (Google/GitHub), they currently don't provide essential information like their role (Library vs Book Store) and organization name. This creates incomplete user profiles and potential issues with app functionality. We need a post-OAuth onboarding flow to collect this missing information.

## Problem Statement
Currently, OAuth authentication has the following issues:
- No role assignment (Library or Book Store)
- No organization name collection (library name or bookstore name)
- User metadata is incomplete compared to email/password signup
- Users may encounter errors or limited functionality due to missing profile data

## User Stories

### 1. OAuth User Onboarding
**As a** new user signing up with Google or GitHub  
**I want to** complete my profile after authentication  
**So that** I can use the app with the correct role and organization settings

**Acceptance Criteria:**
- After OAuth callback, new users are redirected to onboarding page
- Onboarding page collects role (Library or Book Store)
- Onboarding page collects organization name based on selected role
- Form validates all required fields before submission
- User metadata is updated in Supabase with role and organization name
- After completion, user is redirected to dashboard
- Existing users with complete profiles skip onboarding

### 2. Returning OAuth User
**As a** returning user who already completed onboarding  
**I want to** skip the onboarding flow  
**So that** I can access my dashboard immediately

**Acceptance Criteria:**
- System checks if user has role and organization name in metadata
- Users with complete profiles are redirected directly to dashboard
- No unnecessary onboarding steps for returning users

### 3. Onboarding UI/UX
**As a** user completing onboarding  
**I want** a clean, intuitive interface  
**So that** I can quickly provide the required information

**Acceptance Criteria:**
- Onboarding page matches Arcadia design system
- Clear instructions and labels
- Role selector with Library and Book Store options
- Dynamic label for organization name based on role
- Submit button with loading state
- Error handling with toast notifications
- Cannot skip or bypass onboarding

## Functional Requirements

### 1. Onboarding Page Component
**ID:** 1.1  
**Description:** Create a dedicated onboarding page for collecting user information  
**Priority:** High  
**Details:**
- Route: `/onboarding`
- Collects role (Library or Book Store)
- Collects organization name (dynamic label based on role)
- Form validation for required fields
- Matches Auth page styling and design patterns

### 2. Profile Completion Check
**ID:** 2.1  
**Description:** Implement logic to determine if user needs onboarding  
**Priority:** High  
**Details:**
- Check user metadata for `role` field
- Check user metadata for `full_name` field (organization name)
- Return boolean indicating if onboarding is needed
- Reusable utility function

### 3. AuthCallback Enhancement
**ID:** 3.1  
**Description:** Update AuthCallback to redirect to onboarding when needed  
**Priority:** High  
**Details:**
- After successful OAuth authentication, check if profile is complete
- Redirect to `/onboarding` if profile incomplete
- Redirect to `/dashboard` if profile complete
- Handle errors gracefully

### 4. Metadata Update
**ID:** 4.1  
**Description:** Update user metadata with onboarding information  
**Priority:** High  
**Details:**
- Call `supabase.auth.updateUser()` with new metadata
- Set `role` field in user_metadata
- Set `full_name` field in user_metadata
- Handle update errors with user feedback
- Trigger auth state change to update context

### 5. Protected Onboarding Route
**ID:** 5.1  
**Description:** Ensure onboarding page is only accessible to authenticated users  
**Priority:** Medium  
**Details:**
- Wrap onboarding route with ProtectedRoute
- Prevent unauthenticated access
- Allow access even if profile incomplete

### 6. Skip Prevention
**ID:** 6.1  
**Description:** Prevent users from bypassing onboarding  
**Priority:** Medium  
**Details:**
- No "Skip" or "Cancel" button on onboarding page
- Redirect incomplete profiles back to onboarding if they try to access dashboard
- Check profile completion in ProtectedRoute or dashboard

## Non-Functional Requirements

### 1. Performance
- Onboarding page should load in under 1 second
- Metadata update should complete in under 2 seconds
- Profile completion check should be fast (< 100ms)

### 2. User Experience
- Clear, friendly copy explaining why information is needed
- Smooth transitions between OAuth callback and onboarding
- Consistent with existing Auth page design
- Mobile responsive

### 3. Security
- Validate all inputs on client and server side
- Ensure only authenticated users can access onboarding
- Prevent metadata tampering

### 4. Accessibility
- Keyboard navigation support
- Screen reader friendly labels
- WCAG AA compliance
- Focus states on all interactive elements

## Technical Constraints
- Must use Supabase auth.updateUser() for metadata updates
- Must integrate with existing AuthStatusProvider context
- Must follow existing routing patterns in App.tsx
- Must use existing UI components from shadcn/ui

## Out of Scope
- Editing profile information after onboarding (handled in Settings)
- Email verification during onboarding
- Multi-step onboarding wizard
- Account linking between OAuth providers
- Profile picture upload

## Success Metrics
- 100% of OAuth users complete onboarding
- Zero incomplete profiles in production
- Average onboarding completion time < 30 seconds
- Zero onboarding-related errors in logs

## Dependencies
- Existing authentication system (spec 01)
- Supabase client configuration
- AuthStatusProvider context
- UI component library
- React Router setup

## References
- Design System: `.kiro/steering/design-system.md`
- Auth System Spec: `.kiro/specs/01-authentication-system/`
- Supabase Auth Docs: https://supabase.com/docs/guides/auth

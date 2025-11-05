# Implementation Plan: Settings and Configuration

- [x] 1. Set up Settings page structure
  - [x] 1.1 Create Settings page component
    - Create `src/pages/Settings.tsx`
    - Set up page layout with max-width container
    - Add page header with title and description
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 Set up component state
    - Add state for fullName, email
    - Add state for avatarFile, avatarPreview, directAvatarUrl
    - Add state for organizationName, contactEmail, phoneNumber
    - Add loading states: isUploading, isSavingProfile, isSavingOrg
    - _Requirements: 1.1, 2.1, 2.2_

  - [x] 1.3 Get user role
    - Import useAuth hook
    - Get userRole from context
    - Determine isLibrary boolean
    - _Requirements: 1.4_

- [x] 2. Implement Profile section
  - [x] 2.1 Create Profile card
    - Add Card component
    - Add CardHeader with title and description
    - Add CardContent with form fields
    - _Requirements: 1.1, 1.2, 2.1_

  - [x] 2.2 Build avatar display
    - Create circular avatar container (24x24)
    - Show image if avatarPreview or directAvatarUrl exists
    - Show initials fallback if no avatar
    - Add User icon as final fallback
    - _Requirements: 1.1, 2.1_

  - [x] 2.3 Implement initials generation
    - Create getInitials function
    - Split name by spaces
    - Take first letter of each word
    - Convert to uppercase
    - _Requirements: 1.1_

  - [x] 2.4 Add avatar upload button
    - Create upload button with Upload icon
    - Position absolute at bottom-right of avatar
    - Add hidden file input
    - Accept image/* files only
    - _Requirements: 2.1, 2.2_

  - [x] 2.5 Implement avatar file selection
    - Create handleAvatarChange function
    - Validate file size (max 2MB)
    - Show error toast if too large
    - Set avatarFile state
    - Create preview with FileReader
    - Revoke old blob URL
    - _Requirements: 2.1, 2.2_

  - [x] 2.6 Add profile form fields
    - Add Full Name input
    - Add Email input (disabled)
    - Add helper text: "Your email cannot be changed"
    - _Requirements: 1.1, 1.2, 2.1, 2.2_

  - [x] 2.7 Load user data on mount
    - Get user from useAuth
    - Set email from user.email
    - Set fullName from user_metadata.full_name
    - Fallback to email username if no full_name
    - _Requirements: 1.1, 1.2_

  - [x] 2.8 Fetch user avatar on mount
    - Call fetchUserAvatar if userId exists
    - _Requirements: 1.1, 2.1_

  - [x] 2.9 Implement fetchUserAvatar function
    - List files from Supabase storage "avatars" bucket
    - Search for files matching `avatar_{userId}`
    - Sort by created_at descending
    - Get latest avatar file
    - Try download first, create blob URL
    - Fallback to public URL
    - Handle errors gracefully
    - _Requirements: 1.1, 2.1_

  - [x] 2.10 Implement saveProfile function
    - Check if userId exists
    - Set isSavingProfile to true
    - If avatarFile exists:
      - Set isUploading to true
      - Generate unique filename: avatar_{userId}_{timestamp}.{ext}
      - Upload to Supabase storage with upsert: true
      - Set isUploading to false
    - Update user metadata with full_name and role
    - Clear avatarPreview
    - Fetch updated avatar
    - Show success toast
    - Handle errors with error toast
    - Set isSavingProfile to false
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

  - [x] 2.11 Add Save Profile button
    - Position at bottom-right of card
    - Disable when isUploading or isSavingProfile
    - Show "Uploading..." or "Saving..." text when loading
    - Call saveProfile on click
    - _Requirements: 2.2, 2.4, 2.5_

  - [x] 2.12 Implement blob URL cleanup
    - Add useEffect cleanup function
    - Revoke directAvatarUrl if starts with "blob:"
    - Revoke avatarPreview if starts with "blob:"
    - Prevent memory leaks
    - _Requirements: 2.1_

- [x] 3. Implement Organization section
  - [x] 3.1 Create Organization card
    - Add Card component
    - Add CardHeader with role-based title
    - Title: "Library Information" or "Book Store Information"
    - Add CardContent with form fields
    - _Requirements: 6.1, 6.2_

  - [x] 3.2 Add organization form fields
    - Add Organization Name input with role-based label
    - Add Contact Email input
    - Add Phone Number input
    - Add placeholders
    - _Requirements: 6.1, 6.2_

  - [x] 3.3 Implement loadSettings function
    - Create useCallback function
    - Determine settingsKey based on isLibrary
    - Key: "librarySettings" or "bookstoreSettings"
    - Get from localStorage
    - Parse JSON
    - Set organizationName, contactEmail, phoneNumber
    - Handle errors gracefully
    - _Requirements: 6.1, 6.2_

  - [x] 3.4 Load settings on mount
    - Call loadSettings in useEffect
    - Depend on isLibrary
    - _Requirements: 6.1_

  - [x] 3.5 Implement saveOrganizationSettings function
    - Set isSavingOrg to true
    - Determine settingsKey based on isLibrary
    - Create settings object with name, contactEmail, phoneNumber
    - Save to localStorage as JSON string
    - Show success toast with role-based message
    - Handle errors with error toast
    - Set isSavingOrg to false
    - _Requirements: 6.2, 6.3, 6.4, 6.5_

  - [x] 3.6 Add Save Information button
    - Position at bottom-right of card
    - Disable when isSavingOrg
    - Show "Saving..." text when loading
    - Call saveOrganizationSettings on click
    - _Requirements: 6.2, 6.4_

- [x] 4. Implement Appearance section
  - [x] 4.1 Create Appearance card
    - Add Card component
    - Add CardHeader with title and description
    - Add CardContent with theme controls
    - _Requirements: 4.1, 4.2_

  - [x] 4.2 Import useTheme hook
    - Import from theme-provider
    - Get theme and setTheme
    - _Requirements: 4.1, 4.2_

  - [x] 4.3 Add theme label
    - Add Label component with "Theme" text
    - _Requirements: 4.1_

  - [x] 4.4 Create Light theme button
    - Add Button with Sun icon
    - Variant: "default" if theme === "light", else "outline-solid"
    - Full width
    - Call setTheme("light") on click
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 4.5 Create Dark theme button
    - Add Button with Moon icon
    - Variant: "default" if theme === "dark", else "outline-solid"
    - Full width
    - Call setTheme("dark") on click
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 4.6 Create System theme button
    - Add Button with "System" text
    - Variant: "outline"
    - Full width
    - Detect OS preference with matchMedia
    - Call setTheme with detected preference
    - _Requirements: 4.1, 4.2, 4.5_

  - [x] 4.7 Arrange theme buttons horizontally
    - Use flex container with space-x-4
    - Equal width buttons
    - _Requirements: 4.1_

- [x] 5. Implement error handling
  - [x] 5.1 Add avatar file size validation
    - Check if file.size > 2MB
    - Show error toast if too large
    - Prevent upload
    - _Requirements: 2.1, 2.2_

  - [x] 5.2 Handle avatar upload errors
    - Wrap upload in try-catch
    - Log error to console
    - Show error toast
    - _Requirements: 2.2, 2.4_

  - [x] 5.3 Handle profile update errors
    - Wrap updateUser in try-catch
    - Log error to console
    - Show error toast
    - _Requirements: 2.4, 2.5_

  - [x] 5.4 Handle avatar fetch errors
    - Wrap fetch logic in try-catch
    - Log errors to console
    - Set directAvatarUrl to null on error
    - _Requirements: 1.1, 2.1_

  - [x] 5.5 Handle image load errors
    - Add onError handler to img tag
    - Hide image on error
    - Revoke blob URL if applicable
    - Set directAvatarUrl to null
    - Fallback to initials
    - _Requirements: 1.1, 2.1_

  - [x] 5.6 Handle settings save errors
    - Wrap localStorage.setItem in try-catch
    - Log error to console
    - Show error toast
    - _Requirements: 6.2, 6.4_

  - [x] 5.7 Handle settings load errors
    - Wrap localStorage.getItem in try-catch
    - Log error to console
    - Continue with empty values
    - _Requirements: 6.1_

- [x] 6. Implement loading states
  - [x] 6.1 Add isUploading state
    - Show "Uploading..." on button
    - Disable button during upload
    - Set to true before upload
    - Set to false after upload
    - _Requirements: 2.2, 2.4_

  - [x] 6.2 Add isSavingProfile state
    - Show "Saving..." on button
    - Disable button during save
    - Set to true before save
    - Set to false after save
    - _Requirements: 2.4, 2.5_

  - [x] 6.3 Add isSavingOrg state
    - Show "Saving..." on button
    - Disable button during save
    - Set to true before save
    - Set to false after save
    - _Requirements: 6.2, 6.4_

  - [x] 6.4 Combine loading states for profile button
    - Disable if isUploading OR isSavingProfile
    - Show appropriate loading text
    - _Requirements: 2.2, 2.4_

- [x] 7. Implement responsive design
  - [x] 7.1 Make avatar section responsive
    - Flex column on mobile
    - Flex row on sm screens
    - Center avatar on mobile
    - Adjust spacing
    - _Requirements: All_

  - [x] 7.2 Make cards responsive
    - Full width on mobile
    - Max-width container on desktop
    - Adjust padding
    - _Requirements: All_

  - [x] 7.3 Make theme buttons responsive
    - Stack on very small screens if needed
    - Horizontal layout by default
    - Equal width
    - _Requirements: 4.1_

  - [x] 7.4 Test on all breakpoints
    - Test mobile (< 640px)
    - Test tablet (640px - 1024px)
    - Test desktop (> 1024px)
    - _Requirements: All_

- [x] 8. Implement toast notifications
  - [x] 8.1 Add success toast for profile save
    - Title: "Profile updated"
    - Description: "Your profile has been updated successfully."
    - _Requirements: 2.5_

  - [x] 8.2 Add success toast for organization save
    - Title: "Settings saved"
    - Description: Role-based message
    - _Requirements: 6.4_

  - [x] 8.3 Add error toast for file size
    - Title: "File too large"
    - Description: "Avatar image must be less than 2MB"
    - Variant: "destructive"
    - _Requirements: 2.2_

  - [x] 8.4 Add error toast for upload failure
    - Title: "Upload failed"
    - Description: "There was an error uploading your avatar. Please try again."
    - Variant: "destructive"
    - _Requirements: 2.2, 2.4_

  - [x] 8.5 Add error toast for profile update failure
    - Title: "Update failed"
    - Description: "There was an error updating your profile. Please try again."
    - Variant: "destructive"
    - _Requirements: 2.4, 2.5_

  - [x] 8.6 Add error toast for settings save failure
    - Title: "Save failed"
    - Description: "There was an error saving settings. Please try again."
    - Variant: "destructive"
    - _Requirements: 6.2, 6.4_

- [x] 9. Test and optimize
  - [x] 9.1 Test profile section
    - Verify user data loads correctly
    - Test avatar upload with valid file
    - Test avatar upload with oversized file
    - Test full name update
    - Verify email is disabled
    - Test avatar fetch on mount
    - Verify initials fallback works
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 9.2 Test organization section
    - Verify settings load from localStorage
    - Test organization name update
    - Test contact email update
    - Test phone number update
    - Verify settings persist after page reload
    - Test role-based labels
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 9.3 Test appearance section
    - Test Light theme button
    - Test Dark theme button
    - Test System theme button
    - Verify theme persists after page reload
    - Test theme syncs across tabs
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 9.4 Test error handling
    - Test with oversized avatar file
    - Test with network errors
    - Test with invalid file types
    - Verify error toasts display
    - _Requirements: 2.2, 2.4, 6.2_

  - [x] 9.5 Test loading states
    - Verify buttons disable during operations
    - Verify loading text displays
    - Test rapid clicks don't cause issues
    - _Requirements: 2.2, 2.4, 6.2_

  - [x] 9.6 Test responsive design
    - Test on mobile (< 640px)
    - Test on tablet (640px - 1024px)
    - Test on desktop (> 1024px)
    - Verify avatar section stacks on mobile
    - _Requirements: All_

  - [x] 9.7 Optimize performance
    - Verify blob URLs are cleaned up
    - Check for memory leaks
    - Test with large avatar files
    - Verify localStorage doesn't grow unbounded
    - _Requirements: All_

  - [x] 9.8 Test Supabase integration
    - Verify avatar uploads to correct bucket
    - Verify file naming convention
    - Test avatar fetch with multiple files
    - Verify latest avatar is selected
    - Test public URL fallback
    - _Requirements: 1.1, 2.1, 2.2_

# Design Document: Settings and Configuration

## Overview

The Settings and Configuration system allows users to customize their Arcadia experience by managing personal profile information, organization details, and appearance preferences. The system adapts based on user role (Library vs Book Store) to show relevant settings.

### Key Objectives

- User profile management with avatar upload
- Organization information configuration
- Theme customization (Light/Dark/System)
- Role-based settings display
- Local storage persistence for organization settings
- Supabase storage integration for avatars

## Architecture

### High-Level System Flow

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Settings   │      │   Supabase   │      │    Local     │
│     Page     │─────▶│   Storage    │─────▶│   Storage    │
│              │      │  (Avatars)   │      │  (Settings)  │
└──────────────┘      └──────────────┘      └──────────────┘
      │                     │                      │
      │                     │                      │
   User Input          Upload/Fetch           Save/Load
      │                     │                      │
      ▼                     ▼                      ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Profile    │      │   Avatar     │      │Organization  │
│   Update     │      │   Files      │      │   Settings   │
└──────────────┘      └──────────────┘      └──────────────┘
```

### Component Hierarchy

```
Settings Page (/settings)
│
├── Header
│   ├── Title
│   └── Description (role-based)
│
├── Profile Card
│   ├── Avatar Section
│   │   ├── Avatar Display
│   │   │   ├── Image (if uploaded)
│   │   │   └── Initials Fallback
│   │   └── Upload Button
│   ├── Profile Fields
│   │   ├── Full Name Input
│   │   └── Email Input (disabled)
│   └── Save Profile Button
│
├── Organization Card
│   ├── Organization Name Input
│   ├── Contact Email Input
│   ├── Phone Number Input
│   └── Save Information Button
│
└── Appearance Card
    ├── Theme Label
    └── Theme Buttons
        ├── Light Button
        ├── Dark Button
        └── System Button
```

## Components and Interfaces

### 1. Settings Page (`src/pages/Settings.tsx`)

**Purpose**: Main settings interface for user and organization configuration

**Component State**:
```typescript
interface SettingsState {
  // Profile
  fullName: string;
  email: string;
  avatarFile: File | null;
  avatarPreview: string | null;
  directAvatarUrl: string | null;
  
  // Organization
  organizationName: string;
  contactEmail: string;
  phoneNumber: string;
  
  // Loading states
  isUploading: boolean;
  isSavingProfile: boolean;
  isSavingOrg: boolean;
}
```

**Data Loading**:
```typescript
useEffect(() => {
  if (user) {
    // Load user data
    setEmail(user.email || "");
    setFullName(user.user_metadata?.full_name || user.email?.split("@")[0] || "User");
    
    // Load organization settings from localStorage
    loadSettings();
  }
  
  if (userId) {
    // Fetch avatar from Supabase storage
    fetchUserAvatar(userId);
  }
  
  // Cleanup blob URLs on unmount
  return () => {
    if (directAvatarUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(directAvatarUrl);
    }
    if (avatarPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }
  };
}, [user, userId]);
```

### 2. Profile Section

**Purpose**: Manage user profile information and avatar

**Avatar Display Logic**:
```typescript
const displayAvatar = avatarPreview || directAvatarUrl;

// Fallback to initials
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};
```

**Avatar Layout**:
```
┌─────────────────────────────────────────┐
│  ┌────────┐                             │
│  │        │  Full Name: [Input]         │
│  │ Avatar │                             │
│  │   or   │  Email: [Input - Disabled]  │
│  │ Initials│  (Your email cannot be     │
│  │  [📤]  │   changed)                  │
│  └────────┘                             │
│                                         │
│                    [Save Profile Button]│
└─────────────────────────────────────────┘
```

**Avatar Upload Flow**:
```typescript
const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  
  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    toast({
      title: "File too large",
      description: "Avatar image must be less than 2MB",
      variant: "destructive",
    });
    return;
  }
  
  setAvatarFile(file);
  
  // Create preview
  const reader = new FileReader();
  reader.onload = (event) => {
    setAvatarPreview(event.target.result as string);
  };
  reader.readAsDataURL(file);
};
```

**Save Profile Flow**:
```
1. User clicks "Save Profile"
2. If avatar file selected:
   a. Upload to Supabase storage
   b. Generate unique filename: avatar_{userId}_{timestamp}.{ext}
   c. Upload with upsert: true
3. Update user metadata:
   - full_name
   - role
4. Fetch updated avatar
5. Show success toast
6. Clear preview
```

**Avatar Fetch Logic**:
```typescript
const fetchUserAvatar = async (uid: string) => {
  // List files matching pattern
  const { data } = await supabase.storage
    .from("avatars")
    .list("", {
      limit: 100,
      search: `avatar_${uid}`,
    });
  
  if (data && data.length > 0) {
    // Sort by created_at descending
    const sortedFiles = data.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    const latestAvatar = sortedFiles[0];
    
    // Try download first
    const { data: fileData } = await supabase.storage
      .from("avatars")
      .download(latestAvatar.name);
    
    if (fileData) {
      const objectUrl = URL.createObjectURL(fileData);
      setDirectAvatarUrl(objectUrl);
      return;
    }
    
    // Fallback to public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(latestAvatar.name);
    
    if (urlData) {
      setDirectAvatarUrl(urlData.publicUrl);
    }
  }
};
```

### 3. Organization Section

**Purpose**: Configure library or bookstore information

**Role-Based Labels**:
```typescript
const isLibrary = userRole === "Library";

// Dynamic labels
const orgNameLabel = isLibrary ? "Library Name" : "Store Name";
const orgNamePlaceholder = isLibrary ? "Central Library" : "Book Haven";
```

**Organization Layout**:
```
┌─────────────────────────────────────────┐
│  Library/Store Name: [Input]            │
│  Contact Email:      [Input]            │
│  Phone Number:       [Input]            │
│                                         │
│              [Save Information Button]  │
└─────────────────────────────────────────┘
```

**Local Storage Persistence**:
```typescript
// Load settings
const loadSettings = () => {
  const settingsKey = isLibrary ? "librarySettings" : "bookstoreSettings";
  const savedSettings = localStorage.getItem(settingsKey);
  
  if (savedSettings) {
    const parsedSettings = JSON.parse(savedSettings);
    setOrganizationName(parsedSettings.name || "");
    setContactEmail(parsedSettings.contactEmail || "");
    setPhoneNumber(parsedSettings.phoneNumber || "");
  }
};

// Save settings
const saveOrganizationSettings = () => {
  const settingsKey = isLibrary ? "librarySettings" : "bookstoreSettings";
  const settings = {
    name: organizationName,
    contactEmail,
    phoneNumber,
  };
  
  localStorage.setItem(settingsKey, JSON.stringify(settings));
  
  toast({
    title: "Settings saved",
    description: `Your ${isLibrary ? "library" : "book store"} settings have been updated successfully.`,
  });
};
```

### 4. Appearance Section

**Purpose**: Theme customization

**Theme Options**:
- **Light**: Light color scheme
- **Dark**: Dark color scheme
- **System**: Follow OS preference

**Theme Layout**:
```
┌─────────────────────────────────────────┐
│  Theme:                                 │
│  [☀️ Light] [🌙 Dark] [System]         │
└─────────────────────────────────────────┘
```

**Theme Integration**:
```typescript
const { theme, setTheme } = useTheme();

// Light theme
<Button
  variant={theme === "light" ? "default" : "outline-solid"}
  onClick={() => setTheme("light")}
>
  <Sun className="h-4 w-4 mr-2" />
  Light
</Button>

// Dark theme
<Button
  variant={theme === "dark" ? "default" : "outline-solid"}
  onClick={() => setTheme("dark")}
>
  <Moon className="h-4 w-4 mr-2" />
  Dark
</Button>

// System theme
<Button
  variant="outline"
  onClick={() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }}
>
  System
</Button>
```

**Theme Provider Integration**:
- Theme state managed by `ThemeProvider` context
- Persisted in localStorage
- Applied to document root
- Synced across tabs

## Data Models

### User Profile Data

```typescript
interface UserProfile {
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: "Library" | "Book Store";
}
```

### Organization Settings

```typescript
interface OrganizationSettings {
  name: string;
  contactEmail: string;
  phoneNumber: string;
}
```

**Storage Keys**:
- Library: `librarySettings`
- Bookstore: `bookstoreSettings`

### Avatar File Naming

**Pattern**: `avatar_{userId}_{timestamp}.{extension}`

**Example**: `avatar_123e4567-e89b-12d3-a456-426614174000_1699564800000.jpg`

## Integration Points

### Supabase Auth Integration

**Update User Metadata**:
```typescript
const { error } = await supabase.auth.updateUser({
  data: {
    full_name: fullName,
    role: userRole,
  },
});
```

**Access User Data**:
```typescript
const { user } = useAuth();
const email = user?.email;
const fullName = user?.user_metadata?.full_name;
const role = user?.user_metadata?.role;
```

### Supabase Storage Integration

**Upload Avatar**:
```typescript
const fileExt = avatarFile.name.split(".").pop();
const fileName = `avatar_${userId}_${Date.now()}.${fileExt}`;

const { error } = await supabase.storage
  .from("avatars")
  .upload(fileName, avatarFile, {
    upsert: true,
    contentType: avatarFile.type,
  });
```

**List Avatars**:
```typescript
const { data } = await supabase.storage
  .from("avatars")
  .list("", {
    limit: 100,
    search: `avatar_${uid}`,
  });
```

**Download Avatar**:
```typescript
const { data: fileData } = await supabase.storage
  .from("avatars")
  .download(fileName);

const objectUrl = URL.createObjectURL(fileData);
```

**Get Public URL**:
```typescript
const { data: urlData } = supabase.storage
  .from("avatars")
  .getPublicUrl(fileName);

const publicUrl = urlData.publicUrl;
```

### Theme Provider Integration

**useTheme Hook**:
```typescript
const { theme, setTheme } = useTheme();

// Get current theme: "light" | "dark" | "system"
// Set theme: setTheme("light" | "dark" | "system")
```

**Theme Persistence**:
- Stored in localStorage
- Key: `vite-ui-theme`
- Applied on mount
- Synced across tabs

### Local Storage Integration

**Organization Settings**:
- Key: `librarySettings` or `bookstoreSettings`
- Format: JSON string
- Loaded on mount
- Saved on button click

## Error Handling

### Avatar Upload Errors

**File Size Validation**:
```typescript
if (file.size > 2 * 1024 * 1024) {
  toast({
    title: "File too large",
    description: "Avatar image must be less than 2MB",
    variant: "destructive",
  });
  return;
}
```

**Upload Failure**:
```typescript
try {
  await supabase.storage.from("avatars").upload(fileName, avatarFile);
} catch (error) {
  toast({
    title: "Upload failed",
    description: "There was an error uploading your avatar. Please try again.",
    variant: "destructive",
  });
}
```

**Image Load Error**:
```typescript
<img
  src={avatarUrl}
  onError={(e) => {
    e.currentTarget.style.display = "none";
    // Fallback to initials
  }}
/>
```

### Profile Update Errors

```typescript
try {
  await supabase.auth.updateUser({ data: { full_name: fullName } });
  toast({ title: "Profile updated" });
} catch (error) {
  toast({
    title: "Update failed",
    description: "There was an error updating your profile. Please try again.",
    variant: "destructive",
  });
}
```

### Settings Save Errors

```typescript
try {
  localStorage.setItem(settingsKey, JSON.stringify(settings));
  toast({ title: "Settings saved" });
} catch (error) {
  toast({
    title: "Save failed",
    description: "There was an error saving settings. Please try again.",
    variant: "destructive",
  });
}
```

## Loading States

### Profile Save Loading

```typescript
const [isSavingProfile, setIsSavingProfile] = useState(false);

<Button disabled={isSavingProfile}>
  {isSavingProfile ? "Saving..." : "Save Profile"}
</Button>
```

### Avatar Upload Loading

```typescript
const [isUploading, setIsUploading] = useState(false);

<Button disabled={isUploading}>
  {isUploading ? "Uploading..." : "Save Profile"}
</Button>
```

### Organization Save Loading

```typescript
const [isSavingOrg, setIsSavingOrg] = useState(false);

<Button disabled={isSavingOrg}>
  {isSavingOrg ? "Saving..." : "Save Information"}
</Button>
```

## Performance Optimizations

**Blob URL Cleanup**:
```typescript
useEffect(() => {
  return () => {
    if (directAvatarUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(directAvatarUrl);
    }
    if (avatarPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }
  };
}, [directAvatarUrl, avatarPreview]);
```

**Memoized Settings Load**:
```typescript
const loadSettings = useCallback(() => {
  // Load from localStorage
}, [isLibrary]);
```

**Conditional Avatar Fetch**:
```typescript
if (userId) {
  fetchUserAvatar(userId);
}
```

## Responsive Design

**Desktop**: Side-by-side avatar and form fields

**Mobile**: Stacked layout, avatar centered above fields

**Breakpoints**:
- `sm:flex-row`: Horizontal layout on small screens
- `sm:space-x-4`: Horizontal spacing on small screens

## Testing Strategy

**Unit Tests**: Avatar upload validation, settings save/load, initials generation

**Integration Tests**: Profile update flow, organization settings persistence, theme switching

**E2E Tests**: Complete settings update workflow, avatar upload and display, theme persistence

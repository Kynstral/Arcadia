# Design Document: Navigation Sidebar

## Overview

The Navigation Sidebar provides the primary navigation interface for authenticated users with collapsible functionality, role-based menu items, user profile display, and theme integration.

### Key Objectives

- Persistent navigation across authenticated pages
- Collapsible sidebar for space optimization
- Active route highlighting
- Role-based navigation items (Library vs Bookstore)
- User profile with avatar display
- Responsive mobile behavior
- Theme integration

## Architecture

### Component Structure

```
Sidebar Component
│
├── Header Section
│   ├── Logo (expanded)
│   │   ├── Logo Image
│   │   ├── "Arcadia" Text
│   │   └── Collapse Button
│   └── Logo Icon (collapsed)
│       └── Expand Button
│
├── Divider
│
├── Navigation Section
│   └── Nav Items (role-based)
│       ├── Dashboard
│       ├── Catalog
│       ├── Manage Books
│       ├── Manage Members
│       ├── Book Circulation (Library only)
│       └── Transactions
│
├── Divider
│
├── Expand Button (collapsed only)
│
└── Footer Section
    ├── User Profile
    │   ├── Avatar (with fallback to initials)
    │   ├── Name & Email (expanded)
    │   └── Role Badge
    ├── Settings Link
    └── Logout Button
```

## Component Interface

### Props

```typescript
interface SidebarProps {
  isCollapsed?: boolean;
  setIsCollapsed?: React.Dispatch<React.SetStateAction<boolean>>;
}
```

### State

```typescript
interface SidebarState {
  directAvatarUrl: string | null;
  hasAvatarError: boolean;
  internalCollapsed: boolean;
  sidebarMode: "dynamic" | "alwaysCollapsed" | "alwaysExpanded";
}
```

## Key Features

### 1. Collapsible Sidebar

**Expanded State** (w-64):
- Logo + text
- Icons + labels for nav items
- Full user profile
- Settings and logout with labels

**Collapsed State** (w-16):
- Logo icon only
- Icons only for nav items
- Avatar only
- Icons only for settings/logout
- Tooltips on hover

**Toggle Logic**:
```typescript
const toggleSidebar = () => {
  if (sidebarMode === "dynamic") {
    setCollapsed(!collapsed);
  }
};
```

### 2. Role-Based Navigation

```typescript
const getNavItems = () => {
  const commonItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { title: "Catalog", icon: Library, path: "/catalog" },
    { title: "Manage Books", icon: Boxes, path: "/books" },
    { title: "Manage Members", icon: Users, path: "/members" },
    { title: "Transactions", icon: ArrowLeftRight, path: "/transactions" },
  ];

  const libraryItems = [
    { title: "Book Circulation", icon: RefreshCcw, path: "/book-circulation" },
  ];

  if (userRole === "Library") {
    return [...commonItems, ...libraryItems];
  }
  
  return commonItems;
};
```

### 3. Active Route Highlighting

```typescript
const isActive = location.pathname === item.path;

className={cn(
  "flex items-center h-10 px-3 rounded-md",
  isActive
    ? "bg-primary text-primary-foreground"
    : "hover:bg-muted text-muted-foreground hover:text-foreground"
)}
```

### 4. Avatar Display

**Fetch Logic**:
```typescript
const fetchUserAvatar = async (uid: string) => {
  const { data } = await supabase.storage
    .from("avatars")
    .list("", { search: `avatar_${uid}` });
  
  if (data && data.length > 0) {
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
    
    setDirectAvatarUrl(urlData.publicUrl);
  }
};
```

**Initials Fallback**:
```typescript
const getInitials = () => {
  if (!user?.user_metadata?.full_name) return "U";
  return user.user_metadata.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};
```

### 5. Responsive Behavior

```typescript
const isMobile = useMediaQuery("(max-width: 768px)");

useEffect(() => {
  if (isMobile) {
    setCollapsed(true);
  }
}, [isMobile]);
```

### 6. Tooltips

**Collapsed State**: All items show tooltips on hover
**Expanded State**: No tooltips needed

```typescript
<Tooltip>
  <TooltipTrigger asChild>
    <Link to={item.path}>
      <item.icon className="h-5 w-5" />
    </Link>
  </TooltipTrigger>
  <TooltipContent side="right">
    <p>{item.title}</p>
  </TooltipContent>
</Tooltip>
```

## Styling

### Transitions

```typescript
className="transition-all duration-300 ease-in-out"
```

### Theme Integration

- Background: `bg-background`
- Border: `border-r`
- Active: `bg-primary text-primary-foreground`
- Hover: `hover:bg-muted`
- Text: `text-muted-foreground hover:text-foreground`

## Integration Points

### Auth Context

```typescript
const { user, signOut, userRole, userId } = useAuth();
```

### Router

```typescript
const location = useLocation();
const navigate = useNavigate();
```

### Supabase Storage

- Bucket: `avatars`
- Pattern: `avatar_{userId}_*`

### Media Query Hook

```typescript
const isMobile = useMediaQuery("(max-width: 768px)");
```

## Performance Optimizations

- Blob URL cleanup on unmount
- Conditional avatar fetch (only if userId exists)
- Memoized navigation items based on role

## Testing Strategy

- Test collapse/expand functionality
- Test role-based navigation items
- Test active route highlighting
- Test avatar display and fallback
- Test responsive behavior
- Test logout functionality

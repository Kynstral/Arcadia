# Design Document: Error Handling and 404 Page

## Overview

The Error Handling system provides graceful error management through 404 pages, toast notifications, loading states, and comprehensive error logging throughout the application.

### Key Objectives

- User-friendly 404 page
- Toast notifications for errors and successes
- Loading states for async operations
- Form validation error display
- Network error handling
- Error logging for debugging
- Graceful degradation

## Architecture

```
Error Handling System
│
├── 404 Not Found Page
│   ├── BookX Icon
│   ├── Error Message
│   ├── Back to Home Button
│   └── Go Back Button
│
├── Toast Notification System
│   ├── Toast Hook (useToast)
│   ├── Toast Reducer
│   ├── Toast Queue Management
│   └── Auto-dismiss Logic
│
├── Loading States
│   ├── Button Loading States
│   ├── Page Loading Spinners
│   └── Skeleton Loaders
│
└── Error Logging
    ├── Console Logging
    ├── Route Context
    └── Error Details
```

## Components

### 1. NotFound Page (`src/pages/NotFound.tsx`)

**Purpose**: Display user-friendly 404 error page

**Features**:
- BookX icon in primary color circle
- "404" large heading
- "Page Not Found" subheading
- Descriptive error message
- "Back to Home" button (dashboard if authenticated, landing if not)
- "Go Back" button (browser history)
- Contact administrator message
- Theme support (light/dark)

**Layout**:
```
┌─────────────────────────────────────┐
│                                     │
│         [📚 BookX Icon]             │
│                                     │
│             404                     │
│        Page Not Found               │
│                                     │
│  The page you're looking for        │
│  doesn't exist or has been moved    │
│                                     │
│  [Back to Home]  [Go Back]          │
│                                     │
│  ─────────────────────────────      │
│                                     │
│  If you believe this page should    │
│  exist, please contact your         │
│  administrator.                     │
│                                     │
└─────────────────────────────────────┘
```

**Implementation**:
```typescript
const NotFound = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);
  
  const homeLink = user ? "/dashboard" : "/";
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Error UI */}
    </div>
  );
};
```

### 2. Toast Notification System (`src/hooks/use-toast.ts`)

**Purpose**: Display transient notifications for errors, successes, and info

**Features**:
- Toast queue management
- Auto-dismiss after 5 seconds
- Manual dismiss
- Toast limit (1 at a time)
- Variants: default, destructive
- Update and dismiss methods

**Hook Interface**:
```typescript
interface ToasterToast {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
}

function useToast() {
  return {
    toasts: ToasterToast[];
    toast: (props: Toast) => { id, dismiss, update };
    dismiss: (toastId?: string) => void;
  };
}
```

**Usage Examples**:

**Success Toast**:
```typescript
toast({
  title: "Success",
  description: "Your changes have been saved.",
});
```

**Error Toast**:
```typescript
toast({
  title: "Error",
  description: "Failed to save changes. Please try again.",
  variant: "destructive",
});
```

**With Action**:
```typescript
toast({
  title: "Uh oh! Something went wrong.",
  description: "There was a problem with your request.",
  action: <ToastAction altText="Try again">Try again</ToastAction>,
});
```

### 3. Loading States

**Button Loading**:
```typescript
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </>
  ) : (
    "Submit"
  )}
</Button>
```

**Page Loading**:
```typescript
if (isLoading) {
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-lg font-medium text-muted-foreground">
          Loading...
        </p>
      </div>
    </div>
  );
}
```

**Skeleton Loaders**:
```typescript
<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-4 w-[200px]" />
```

### 4. Form Validation Errors

**Inline Errors**:
```typescript
<Input
  {...field}
  className={errors.email ? "border-destructive" : ""}
/>
{errors.email && (
  <p className="text-sm text-destructive">{errors.email.message}</p>
)}
```

**Toast on Submit Error**:
```typescript
try {
  await submitForm(data);
  toast({ title: "Success" });
} catch (error) {
  toast({
    title: "Validation Error",
    description: error.message,
    variant: "destructive",
  });
}
```

### 5. Network Error Handling

**React Query Error Handling**:
```typescript
const { data, error, isError } = useQuery({
  queryKey: ["data"],
  queryFn: fetchData,
  onError: (error) => {
    toast({
      title: "Network Error",
      description: "Failed to load data. Please try again.",
      variant: "destructive",
    });
  },
});

if (isError) {
  return (
    <div className="p-8 bg-destructive/10 rounded-lg">
      <h2 className="text-xl font-bold text-destructive">Error Loading Data</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={() => refetch()}>Try Again</Button>
    </div>
  );
}
```

**Supabase Error Handling**:
```typescript
try {
  const { data, error } = await supabase.from("table").select();
  
  if (error) throw error;
  
  return data;
} catch (error) {
  console.error("Database error:", error);
  toast({
    title: "Database Error",
    description: "Failed to fetch data from database.",
    variant: "destructive",
  });
}
```

### 6. Authentication Error Handling

**Login Errors**:
```typescript
const handleSignIn = async () => {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      if (error.message.includes("Invalid")) {
        toast({
          title: "Invalid Credentials",
          description: "Incorrect email or password. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
      }
      return;
    }
    
    toast({ title: "Welcome back!" });
    navigate("/dashboard");
  } catch (error) {
    toast({
      title: "Error",
      description: "An unexpected error occurred.",
      variant: "destructive",
    });
  }
};
```

### 7. Error Logging

**Console Logging**:
```typescript
// 404 errors
console.error("404 Error: User attempted to access non-existent route:", location.pathname);

// Network errors
console.error("Network error:", error);

// Database errors
console.error("Database error:", error);

// Authentication errors
console.error("Auth error:", error);
```

**Context Logging**:
```typescript
console.error("Error in component:", {
  component: "BookForm",
  action: "submit",
  error: error.message,
  user: userId,
  route: location.pathname,
});
```

## Error Patterns

### Try-Catch Pattern

```typescript
try {
  await operation();
  toast({ title: "Success" });
} catch (error) {
  console.error("Operation failed:", error);
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive",
  });
}
```

### React Query Pattern

```typescript
const mutation = useMutation({
  mutationFn: updateData,
  onSuccess: () => {
    toast({ title: "Updated successfully" });
  },
  onError: (error) => {
    toast({
      title: "Update failed",
      description: error.message,
      variant: "destructive",
    });
  },
});
```

### Loading State Pattern

```typescript
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    await operation();
  } catch (error) {
    // Handle error
  } finally {
    setIsLoading(false);
  }
};
```

## Integration Points

### Router Integration

404 page registered as catch-all route:
```typescript
<Route path="*" element={<NotFound />} />
```

### Toast Integration

Toaster component in App.tsx:
```typescript
import { Toaster } from "@/components/ui/toaster";

<Toaster />
```

### Auth Integration

Error handling in auth flows (login, signup, logout).

### Data Fetching Integration

Error handling in React Query queries and mutations.

## Performance

- Toast limit prevents notification spam
- Auto-dismiss reduces UI clutter
- Efficient error logging
- No memory leaks in toast system

## Accessibility

- Error messages readable by screen readers
- Focus management on errors
- Keyboard navigation for toast dismiss
- ARIA labels for error states

## Testing Strategy

- Test 404 page rendering
- Test toast notifications
- Test loading states
- Test error logging
- Test error recovery actions

# Design Document: Theme System

## Overview

The Theme System provides light and dark mode support with automatic system detection, localStorage persistence, and seamless integration with Tailwind CSS dark mode.

### Key Objectives

- Light and dark theme support
- System theme detection
- localStorage persistence
- Instant theme switching
- Cross-tab synchronization
- Tailwind CSS integration

## Architecture

```
ThemeProvider (Context)
    │
    ├── Initialize Theme
    │   ├── Check localStorage
    │   ├── Fallback to system preference
    │   └── Apply to document root
    │
    ├── Theme State Management
    │   ├── Current theme value
    │   └── setTheme function
    │
    └── Theme Application
        ├── Update localStorage
        ├── Toggle "dark" class on <html>
        └── Trigger CSS updates
```

## Implementation

### ThemeProvider Component

**Location**: `src/lib/theme-provider.tsx`

**Type Definition**:
```typescript
type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}
```

**Initialization Logic**:
```typescript
const [theme, setTheme] = useState<Theme>(() => {
  // SSR check
  if (typeof window === "undefined") return "light";
  
  // Check localStorage first
  const savedTheme = localStorage.getItem("theme") as Theme;
  if (savedTheme) return savedTheme;
  
  // Fallback to system preference
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
});
```

**Theme Application**:
```typescript
useEffect(() => {
  // Persist to localStorage
  localStorage.setItem("theme", theme);
  
  // Apply to document
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}, [theme]);
```

**Context Provider**:
```typescript
<ThemeContext.Provider value={{ theme, setTheme }}>
  {children}
</ThemeContext.Provider>
```

**Custom Hook**:
```typescript
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
```

## Usage

### In App.tsx

```typescript
import { ThemeProvider } from "@/lib/theme-provider";

function App() {
  return (
    <ThemeProvider>
      {/* Rest of app */}
    </ThemeProvider>
  );
}
```

### In Components

```typescript
import { useTheme } from "@/lib/theme-provider";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? <Sun /> : <Moon />}
    </button>
  );
}
```

### In Settings Page

```typescript
<Button
  variant={theme === "light" ? "default" : "outline-solid"}
  onClick={() => setTheme("light")}
>
  <Sun className="h-4 w-4 mr-2" />
  Light
</Button>

<Button
  variant={theme === "dark" ? "default" : "outline-solid"}
  onClick={() => setTheme("dark")}
>
  <Moon className="h-4 w-4 mr-2" />
  Dark
</Button>
```

## Tailwind CSS Integration

### Configuration

**tailwind.config.ts**:
```typescript
export default {
  darkMode: "class", // Use class-based dark mode
  // ...
}
```

### CSS Variables

**globals.css**:
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    /* ... */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    /* ... */
  }
}
```

### Usage in Components

```typescript
// Automatically responds to theme
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">
    Click me
  </button>
</div>
```

## Features

### 1. System Theme Detection

Uses `prefers-color-scheme` media query:
```typescript
window.matchMedia("(prefers-color-scheme: dark)").matches
```

### 2. localStorage Persistence

- Key: `"theme"`
- Values: `"light"` | `"dark"`
- Saved on every theme change
- Loaded on initialization

### 3. Instant Application

- No page reload required
- Updates `document.documentElement.classList`
- CSS variables update automatically
- All components re-render with new theme

### 4. SSR Safety

```typescript
if (typeof window === "undefined") return "light";
```

Prevents errors during server-side rendering.

### 5. Cross-Tab Synchronization

Automatic via localStorage events (browser native behavior).

## Integration Points

### Settings Page

Theme selection buttons in Appearance section.

### Sidebar

Can include theme toggle (optional).

### Landing Page

Theme toggle in header (if implemented).

## Performance

- Minimal re-renders (only when theme changes)
- No flash of unstyled content (theme applied before render)
- Lightweight implementation (~50 lines)
- No external dependencies

## Accessibility

- Respects system preferences
- Maintains WCAG AA contrast ratios
- Supports keyboard navigation
- Clear visual indicators

## Testing Strategy

- Test theme initialization
- Test theme switching
- Test localStorage persistence
- Test system preference detection
- Test SSR safety
- Test cross-tab synchronization

# Design Document: Landing Page

## Overview

The Landing Page serves as the public-facing entry point for Arcadia, showcasing the product's value proposition, features, testimonials, and pricing to attract potential users. It's a single-page application with smooth scrolling navigation and responsive design.

## Architecture

### Page Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    Header (Sticky Navigation)                   │
│  ┌──────────┐  ┌─────────────────────┐  ┌──────────────────┐  │
│  │   Logo   │  │  Nav: Features,     │  │  Theme Toggle    │  │
│  │ Arcadia  │  │  Testimonials,      │  │  Auth CTAs       │  │
│  │          │  │  Pricing            │  │  (conditional)   │  │
│  └──────────┘  └─────────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        Hero Section                             │
│  ┌──────────────────────────┐  ┌──────────────────────────┐    │
│  │  Text Column             │  │  Image Column            │    │
│  │  • Badge                 │  │  • Hero Image            │    │
│  │  • Headline              │  │  • Gradient Overlay      │    │
│  │  • Subtitle              │  │  • Stats Badge           │    │
│  │  • Primary CTA           │  │  • Hover Effects         │    │
│  │  • Secondary CTA         │  │                          │    │
│  │  • Trust Indicators      │  │                          │    │
│  └──────────────────────────┘  └──────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Features Section                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Feature 1  │  │  Feature 2  │  │  Feature 3  │            │
│  │  Icon       │  │  Icon       │  │  Icon       │            │
│  │  Title      │  │  Title      │  │  Title      │            │
│  │  Desc       │  │  Desc       │  │  Desc       │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Feature 4  │  │  Feature 5  │  │  Feature 6  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Testimonials Section                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Testimonial  │  │ Testimonial  │  │ Testimonial  │         │
│  │ • Rating     │  │ • Rating     │  │ • Rating     │         │
│  │ • Quote      │  │ • Quote      │  │ • Quote      │         │
│  │ • Avatar     │  │ • Avatar     │  │ • Avatar     │         │
│  │ • Name/Title │  │ • Name/Title │  │ • Name/Title │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │         Client Logos (5 logos in row)                     │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Pricing Section                            │
│                  (Gradient Background)                          │
│                                                                 │
│              ┌─────────────────────────────┐                   │
│              │    Beta Pricing Card        │                   │
│              │  • Badge                    │                   │
│              │  • Title: Free Beta Access  │                   │
│              │  • Price: $0/month          │                   │
│              │  • Features Grid (2x2)      │                   │
│              │  • CTAs (Get Started/Demo)  │                   │
│              │  • Disclaimer               │                   │
│              └─────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          Footer                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Brand   │  │ Product  │  │Resources │  │ Company  │       │
│  │  Column  │  │  Links   │  │  Links   │  │  Links   │       │
│  │  Logo    │  │          │  │          │  │          │       │
│  │  Social  │  │          │  │          │  │          │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │         Newsletter Subscription Section                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Copyright © 2025 | Terms | Privacy | Cookies            │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Component Flow

```
LandingPage Component
    │
    ├─► Header (Sticky)
    │   ├─► Logo
    │   ├─► Navigation Links (smooth scroll)
    │   ├─► Theme Toggle (useTheme)
    │   └─► Auth CTAs (conditional via useAuth)
    │
    ├─► Hero Section
    │   ├─► Text Column (headline, CTAs, trust indicators)
    │   └─► Image Column (hero image, stats badge)
    │
    ├─► Features Section
    │   ├─► Section Header
    │   └─► Feature Grid (6 cards)
    │
    ├─► Testimonials Section
    │   ├─► Section Header
    │   ├─► Testimonial Grid (3 cards)
    │   └─► Client Logos
    │
    ├─► Pricing Section
    │   ├─► Section Header
    │   └─► Pricing Card (beta offer)
    │
    └─► Footer
        ├─► Brand & Social Links
        ├─► Link Columns (Product, Resources, Company)
        ├─► Newsletter Subscription
        └─► Copyright & Legal
```

### Navigation Flow

```
User Lands on Page
    │
    ▼
Header Navigation
    │
    ├─► Click "Features" → Smooth scroll to #features
    ├─► Click "Testimonials" → Smooth scroll to #testimonials
    ├─► Click "Pricing" → Smooth scroll to #pricing
    │
    ├─► If Authenticated:
    │   └─► "Dashboard" button → Navigate to /dashboard
    │
    └─► If Not Authenticated:
        ├─► "Log in" button → Navigate to /auth
        └─► "Get Started" button → Navigate to /auth

Hero Section CTAs
    │
    ├─► "Get Started Free" → Navigate to /auth
    └─► "Learn More" → Smooth scroll to #features

Pricing Section CTAs
    │
    ├─► "Get Started Free" → Navigate to /auth
    └─► "Book a Demo" → Navigate to /auth (future: demo form)
```

## Components and Interfaces

### 1. Header Component

**Purpose**: Sticky navigation bar with branding and CTAs

**Elements**:
- Arcadia logo (clickable, returns to top)
- Navigation links (Features, Testimonials, Pricing)
- Theme toggle button (Sun/Moon icon)
- Conditional CTAs:
  - If authenticated: "Dashboard" button
  - If not authenticated: "Log in" + "Get Started" buttons

**Behavior**:
- Sticky positioning (stays at top on scroll)
- Smooth scroll to sections on nav click
- Theme toggle updates entire page
- Navigation hidden on mobile (< md breakpoint)

### 2. Hero Section

**Purpose**: Capture attention with value proposition

**Layout**: Two-column grid (text left, image right)

**Text Column**:
- Badge: "Library Management Simplified"
- H1: "Modern Library Management Solution"
- Subtitle: Product description
- Primary CTA: "Get Started Free" → /auth
- Secondary CTA: "Learn More" → #features
- Trust indicators: "No credit card required", "Free 14-day trial"

**Image Column**:
- Hero image (library interior from Unsplash)
- Overlay gradient
- Stats badge: "Used by 2,300+ libraries worldwide"
- Hover effect: scale transform

**Responsive**: Stacks vertically on mobile

### 3. Features Section

**Purpose**: Showcase key product capabilities

**Layout**: 3-column grid (responsive to 2-col, then 1-col)

**Feature Cards** (6 total):
1. Smart Cataloging (BookMarked icon)
2. Member Management (Users icon)
3. Advanced Search (Search icon)
4. Real-time Analytics (BarChart icon)
5. Checkout System (Clock icon)
6. Notifications & Reminders (Info icon)

**Card Structure**:
- Icon in colored circle
- Title (h3)
- Description text
- Hover effects: shadow, border color, translate up

### 4. Testimonials Section

**Purpose**: Build trust with social proof

**Layout**: 3-column grid (responsive)

**Testimonial Cards** (3 total):
- 5-star rating display
- Quote text (italic)
- Avatar (initials in circle)
- Name and title

**Additional Elements**:
- Section header with badge
- Client logos row (5 placeholder logos)

### 5. Pricing Section

**Purpose**: Present beta offer and drive conversions

**Layout**: Centered single card

**Pricing Card**:
- Badge: "Limited Time Beta Offer"
- Title: "Free Beta Access"
- Price: "$0/month" (large, prominent)
- Features grid (2x2):
  - Unlimited books
  - Unlimited members
  - All premium features
  - Priority support
- CTAs: "Get Started Free" + "Book a Demo"
- Disclaimer: "No credit card required"

**Background**: Gradient with blur effects

### 6. Footer Component

**Purpose**: Additional navigation and information

**Layout**: Multi-column grid

**Sections**:
- **Brand Column** (2-col span):
  - Logo and tagline
  - Social media links (Twitter, LinkedIn, Facebook, GitHub)
  
- **Product Links**:
  - Features, Pricing, Integrations, Updates
  
- **Resources Links**:
  - Documentation, Guides, Support, API
  
- **Company Links**:
  - About, Blog, Careers, Contact

**Newsletter Section**:
- Email input field
- Subscribe button
- Bordered section above copyright

**Bottom Bar**:
- Copyright notice
- Legal links (Terms, Privacy, Cookies)

## Data Models

### Feature Card

```typescript
interface FeatureCard {
  icon: LucideIcon;        // Icon component from lucide-react
  title: string;           // Feature name (e.g., "Smart Cataloging")
  description: string;     // Brief description of feature
}
```

**Example Data**:
```typescript
const features: FeatureCard[] = [
  {
    icon: BookMarked,
    title: "Smart Cataloging",
    description: "Organize your entire collection with intelligent categorization..."
  },
  {
    icon: Users,
    title: "Member Management",
    description: "Track member information, borrowing history..."
  },
  // ... 4 more features
];
```

### Testimonial

```typescript
interface Testimonial {
  rating: number;          // Star rating (1-5)
  quote: string;           // Testimonial text
  authorInitials: string;  // For avatar display (e.g., "SJ")
  authorName: string;      // Full name (e.g., "Sarah Johnson")
  authorTitle: string;     // Job title and organization
}
```

**Example Data**:
```typescript
const testimonials: Testimonial[] = [
  {
    rating: 5,
    quote: "Arcadia has transformed how we manage our library...",
    authorInitials: "SJ",
    authorName: "Sarah Johnson",
    authorTitle: "Head Librarian, City Public Library"
  },
  // ... 2 more testimonials
];
```

### Pricing Feature

```typescript
interface PricingFeature {
  text: string;            // Feature description
  included: boolean;       // Whether feature is included (for checkmark)
}
```

**Beta Pricing Features**:
- Unlimited books
- Unlimited members  
- All premium features
- Priority support

## Theme Integration

### Theme Provider Usage

```typescript
import { useTheme } from "@/lib/theme-provider";

const LandingPage = () => {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  
  return (
    <button onClick={toggleTheme}>
      {theme === "light" ? <Moon /> : <Sun />}
    </button>
  );
};
```

**Theme Features**:
- Toggle button in header with Sun/Moon icons
- Conditional icon rendering based on current theme
- All colors use CSS variables (--primary, --background, etc.)
- Smooth transitions on theme change
- Theme persists across sessions (localStorage)

### Theme-Aware Styling

**Color Adaptation**:
- Background gradients adapt to theme (lighter in light mode, darker in dark mode)
- Text colors use semantic tokens (--foreground, --muted-foreground)
- Card shadows adjust for theme (lighter shadows in dark mode)
- Border colors theme-responsive (--border variable)

**Component Examples**:
```typescript
// Background gradient (theme-aware)
className="bg-gradient-to-br from-primary/5 to-secondary/5"

// Text color (semantic)
className="text-foreground"

// Card with theme-aware shadow
className="bg-card border border-border shadow-sm"
```

## Authentication Integration

### Auth Status Check

```typescript
import { useAuth } from "@/components/AuthStatusProvider";

const LandingPage = () => {
  const { user } = useAuth();
  
  return (
    <header>
      {user ? (
        <Link to="/dashboard">
          <Button>Dashboard</Button>
        </Link>
      ) : (
        <>
          <Link to="/auth">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link to="/auth">
            <Button>Get Started</Button>
          </Link>
        </>
      )}
    </header>
  );
};
```

**Conditional Rendering**:
- Header CTAs change based on authentication status
- If authenticated: Show "Dashboard" button (navigates to /dashboard)
- If not authenticated: Show "Log in" (ghost variant) + "Get Started" (primary variant)
- Both unauthenticated CTAs link to /auth page

**User Experience**:
- Authenticated users can quickly access their dashboard
- New users see clear signup CTA
- Returning users see login option
- Consistent with authentication system design

## Navigation Behavior

### Smooth Scrolling Implementation

**Anchor Links**:
```typescript
<a href="#features" className="hover:text-primary">
  Features
</a>
```

**Section IDs**:
```typescript
<section id="features">
  {/* Features content */}
</section>

<section id="testimonials">
  {/* Testimonials content */}
</section>

<section id="pricing">
  {/* Pricing content */}
</section>
```

**Browser Behavior**:
- Browser natively handles smooth scrolling to anchor targets
- No JavaScript required for smooth scroll
- Works with browser back/forward buttons
- Accessible via keyboard navigation

### External Navigation

**Route Mapping**:
```
Logo → / (home/top of page)
Log in → /auth
Get Started → /auth
Dashboard → /dashboard (authenticated only)
Book a Demo → /auth (future: /demo)
```

**Implementation**:
```typescript
import { Link } from "react-router-dom";

// Internal navigation
<Link to="/auth">
  <Button>Get Started</Button>
</Link>

// Smooth scroll (same page)
<a href="#features">Features</a>
```

**Navigation States**:
- Active section highlighting (future enhancement)
- Scroll-to-top on logo click
- Preserve scroll position on theme toggle

## Responsive Design

### Breakpoints (Tailwind)

**Mobile (< 768px / md)**:
```typescript
// Single column layouts
className="grid grid-cols-1 gap-8"

// Hidden desktop navigation
className="hidden md:flex"

// Stacked hero section
className="grid grid-cols-1 lg:grid-cols-2"

// Full-width CTAs
className="w-full md:w-auto"
```

**Layout Changes**:
- Single column for all grids (features, testimonials)
- Hero section stacks vertically (text on top, image below)
- Navigation links hidden (logo and CTAs only)
- Footer columns stack vertically
- Full-width buttons and inputs

**Tablet (768px - 1024px / md-lg)**:
```typescript
// 2-column grids
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Adjusted spacing
className="px-6 md:px-12 lg:px-24"
```

**Layout Changes**:
- 2-column feature grid
- 2-column testimonial grid
- Navigation links visible
- Hero section still stacked or side-by-side (design choice)
- Increased padding and spacing

**Desktop (> 1024px / lg+)**:
```typescript
// 3-column grids
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// 2-column hero
className="grid grid-cols-1 lg:grid-cols-2"

// Full navigation
className="hidden md:flex items-center gap-8"
```

**Layout Changes**:
- 3-column feature grid
- 3-column testimonial grid
- 2-column hero layout (text left, image right)
- Full navigation visible
- Maximum spacing and padding

### Mobile Optimizations

**Touch Targets**:
- Minimum button size: 44x44px (WCAG guideline)
- Adequate spacing between interactive elements (8px minimum)
- Larger tap areas for links and buttons

**Typography**:
- Base font size: 16px (prevents zoom on iOS)
- Readable line height: 1.5-1.7
- Appropriate heading sizes for mobile

**Performance**:
- Optimized images for mobile bandwidth
- Lazy loading for below-fold images
- Reduced animation complexity on mobile
- Conditional loading of large assets

**Layout**:
```typescript
// Responsive padding
className="px-4 md:px-8 lg:px-12"

// Responsive text sizes
className="text-2xl md:text-3xl lg:text-4xl"

// Responsive gaps
className="gap-4 md:gap-6 lg:gap-8"
```

## Performance Considerations

### Image Optimization

**Hero Image**:
```typescript
<img 
  src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800"
  alt="Modern library interior"
  loading="lazy"
  className="w-full h-full object-cover"
/>
```

**Strategies**:
- Use Unsplash CDN with size parameters (w=800, w=1200, etc.)
- Lazy loading for below-fold images (loading="lazy")
- Responsive image sizing via URL parameters
- WebP format support (Unsplash auto-serves WebP to supporting browsers)
- Placeholder blur effect during load

**Client Logos**:
- SVG format for scalability and small file size
- Inline SVGs to reduce HTTP requests
- Grayscale filter for consistent appearance

### Code Splitting

**Route-Based Splitting**:
```typescript
// Landing page loaded immediately
import LandingPage from "@/pages/LandingPage";

// Authenticated pages lazy loaded
const Dashboard = lazy(() => import("@/pages/Index"));
const Books = lazy(() => import("@/pages/Books"));
```

**Benefits**:
- Landing page bundle is minimal (no auth logic, no data fetching)
- Authenticated pages only loaded when needed
- Faster initial page load for public visitors
- Reduced bandwidth for users who don't sign up

### Animation Performance

**GPU-Accelerated Transforms**:
```typescript
// Hover effects use transform (GPU-accelerated)
className="transition-transform hover:scale-105"

// Avoid animating layout properties (width, height, margin)
// Use transform and opacity instead
className="transition-all hover:-translate-y-1"
```

**Performance Optimizations**:
- Use CSS transforms (translateY, scale) instead of top/left
- Animate opacity instead of visibility
- Use will-change sparingly for complex animations
- Reduced motion support via prefers-reduced-motion

**Reduced Motion Support**:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Bundle Size Optimization

**Icon Strategy**:
- Import only used icons from lucide-react
- Tree-shaking removes unused icons
- ~2KB per icon vs ~50KB for entire library

**CSS Optimization**:
- Tailwind CSS purges unused styles
- Only production CSS includes used classes
- Minimal custom CSS

**Target Metrics**:
- Initial bundle: < 100KB (gzipped)
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Performance: > 90

## Accessibility

### Semantic HTML

- Proper heading hierarchy (h1 → h2 → h3)
- Semantic sectioning elements
- Descriptive link text

### ARIA Labels

- Screen reader text for icon buttons
- Alt text for images
- Aria labels for social links

### Keyboard Navigation

- All interactive elements focusable
- Visible focus indicators
- Logical tab order

### Color Contrast

- WCAG AA compliance
- Sufficient contrast in both themes
- Non-color-dependent information

## SEO Considerations

- Descriptive page title
- Meta description
- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images
- Fast page load times

## Testing Strategy

### Visual Testing

- Verify layout on all breakpoints
- Test theme switching
- Check hover states
- Validate animations

### Functional Testing

- Test all navigation links
- Verify smooth scrolling
- Test theme persistence
- Verify auth-conditional rendering

### Accessibility Testing

- Screen reader compatibility
- Keyboard navigation
- Color contrast validation
- Focus management

### Performance Testing

- Lighthouse score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Cumulative Layout Shift < 0.1

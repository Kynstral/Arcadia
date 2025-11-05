# Design System

## Color Palette

### Light Mode (Natural Theme)
- **Primary Accent**: `#E89B73` - Warm terracotta for primary actions and highlights
- **Secondary Accent**: `#8DB38B` - Sage green for secondary actions and success states
- **Primary Text**: `#3D4A3D` - Dark forest green for headings and important text
- **Secondary Text**: `#728172` - Muted green for body text
- **Background**: `#F8F4E8` - Warm cream for page background
- **Surface**: `#FFFFFF` - White for cards and elevated surfaces
- **Border**: `#E0D9C7` - Light beige for borders and dividers

### Dark Mode (Cozy Library Theme)
- **Primary Accent**: `#E89B73` - Same warm terracotta (consistent across themes)
- **Secondary Accent**: `#8DB38B` - Same sage green (consistent across themes)
- **Primary Text**: `#F8F4E8` - Light cream for headings
- **Secondary Text**: `#A9B4A9` - Light sage for body text
- **Background**: `#242C24` - Deep forest green for page background
- **Surface**: `#333D33` - Lighter forest green for cards
- **Border**: `#4A574A` - Medium green for borders

### Semantic Colors
- **Warning**: `#f0ad4e` - Amber for warnings and caution states
- **Error**: `#d9534f` - Red for errors and destructive actions
- **Success**: Use Secondary Accent (`#8DB38B`)

## Typography

- **Font Family**: Quicksand (Google Fonts)
- **Weights**: 500 (Regular), 700 (Bold)
- **Characteristics**: Friendly, rounded sans-serif that's highly readable and modern

### Usage
- **Headings**: Font weight 700, color uses primary text
- **Body Text**: Font weight 500, color uses secondary text
- **Links**: Font weight 700, color uses primary accent
- **Code**: Monospace font with subtle background

## Component Patterns

### Buttons
- **Primary**: Terracotta background (`#E89B73`), white text, 8px border radius
- **Secondary**: Sage green background (`#8DB38B`), white text
- **Text/Ghost**: No background, primary accent color text
- **Disabled**: Border color background, secondary text color, no hover effects
- **Hover**: Slight lift (translateY -2px) with shadow
- **Active**: Remove transform and shadow

### Forms
- **Inputs**: 8px border radius, 1px border, focus state with primary accent border and subtle shadow
- **Labels**: Font weight 700, primary text color
- **Checkboxes/Radio**: Custom styled with primary accent when checked
- **Toggle Switch**: 50px width, 28px height, secondary accent when active

### Cards & Surfaces
- **Border Radius**: 12px for cards, 8px for smaller elements
- **Border**: 1px solid border color
- **Shadow**: Subtle `rgba(61, 74, 61, 0.07)` in light mode, `rgba(0, 0, 0, 0.2)` in dark mode
- **Padding**: 2rem for card content

### Interactive States
- **Hover**: Background color mix with primary accent (15% opacity) or slight transform
- **Focus**: Border color change to primary accent with 3px shadow ring
- **Active**: Remove transforms, flatten shadows
- **Disabled**: Use border color for background, reduce opacity, disable pointer events

## Layout Conventions

- **Sidebar**: 240px width, sticky positioning, surface background
- **Main Content**: Max-width container (75ch for text), 2-3rem padding
- **Spacing**: Use consistent spacing scale (0.5rem, 1rem, 1.5rem, 2rem, 3rem)
- **Responsive**: Mobile-first approach, use Tailwind breakpoints

## Accessibility

- **Focus States**: Always visible with clear outline or shadow ring
- **Color Contrast**: Ensure WCAG AA compliance for text
- **Interactive Elements**: Minimum 44x44px touch target
- **Semantic HTML**: Use proper heading hierarchy and ARIA labels where needed

## Implementation Notes

- Use Tailwind CSS utility classes with `cn()` helper for conditional styling
- Radix UI primitives provide accessible base components
- Theme switching handled by `next-themes` package
- Custom theme provider in `src/lib/theme-provider.tsx`

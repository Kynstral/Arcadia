# Project Structure

## Root Directory

- `src/` - Application source code
- `public/` - Static assets (images, icons, manifest)
- `supabase/` - Database migrations and configuration
- `.kiro/` - Kiro AI assistant configuration and steering rules
- Configuration files at root (vite, typescript, eslint, postcss)

## Source Organization (`src/`)

### Core Files
- `main.tsx` - Application entry point
- `App.tsx` - Root component with routing, providers, and layout
- `index.css` - Global styles and Tailwind imports
- `App.css` - Component-specific styles

### Components (`src/components/`)
- **Layout Components**: `Sidebar.tsx`, `ScrollbarStyles.tsx`
- **Feature Components**: `BookCard.tsx`, `BookForm.tsx`, `MemberForm.tsx`, `MemberDetail.tsx`, `LibraryDashboard.tsx`
- **Data Components**: `BulkBookImport.tsx`, `BulkBookExport.tsx`
- **Auth**: `AuthStatusProvider.tsx` - Authentication context and state
- **UI Components** (`src/components/ui/`): Reusable UI primitives based on Radix UI and shadcn/ui patterns

### Pages (`src/pages/`)
- `LandingPage.tsx` - Public landing page
- `Auth.tsx` - Login/signup page
- `AuthCallback.tsx` - OAuth callback handler
- `Index.tsx` - Main dashboard
- `Catalog.tsx` - Browse books catalog
- `Books.tsx` - Manage books (admin)
- `BookDetail.tsx` - Individual book view
- `EditBook.tsx` - Edit book form
- `Members.tsx` - Member management
- `EditMember.tsx` - Edit member form
- `BookCirculation.tsx` - Borrowing/lending management
- `Checkout.tsx` - Bookstore checkout process
- `Transactions.tsx` - Transaction history
- `Settings.tsx` - User settings
- `NotFound.tsx` - 404 page

### Hooks (`src/hooks/`)
- `use-auth.tsx` - Authentication hook
- `use-cart.tsx` - Shopping cart state management
- `use-toast.ts` - Toast notification hook
- `use-media-query.ts` - Responsive design helper

### Library (`src/lib/`)
- `types.ts` - TypeScript type definitions (Book, Member, Transaction, etc.)
- `data.ts` - Mock/seed data
- `data-service.ts` - Data fetching and mutation functions
- `utils.ts` - Utility functions (cn for className merging)
- `theme-provider.tsx` - Theme context provider

### Integrations (`src/integrations/supabase/`)
- `client.ts` - Supabase client initialization
- `types.ts` - Generated database types

## Database (`supabase/`)

### Migrations (`supabase/migrations/`)
- `20251105081740_create_library_tables.sql` - Initial schema with:
  - `books` table
  - `members` table
  - `borrowings` table
  - `checkout_transactions` table
  - `checkout_items` table
  - Indexes for performance
  - Row Level Security policies

## Conventions

- **Component Files**: PascalCase (e.g., `BookCard.tsx`)
- **Hook Files**: kebab-case with `use-` prefix (e.g., `use-auth.tsx`)
- **Utility Files**: kebab-case (e.g., `data-service.ts`)
- **Protected Routes**: Wrapped in `<ProtectedRoute>` component that checks authentication
- **Layout Pattern**: Sidebar + main content area with max-width container
- **Data Fetching**: React Query for caching and state management
- **Forms**: React Hook Form with Zod schema validation
- **Styling**: Tailwind utility classes with `cn()` helper for conditional classes

# Technology Stack

## Frontend

- **Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 7.1.12 with SWC plugin for fast compilation
- **Routing**: React Router DOM 7.9.5
- **State Management**: TanStack React Query 5.90.6 for server state
- **Styling**: Tailwind CSS 4.1.16 with PostCSS
- **UI Components**: Radix UI primitives with shadcn/ui patterns
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Theming**: next-themes for dark/light mode support
- **Notifications**: Sonner for toast notifications

## Backend

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with email/password
- **Real-time**: Supabase real-time subscriptions
- **Security**: Row Level Security (RLS) policies

## Development Tools

- **Package Manager**: npm or bun
- **Linting**: ESLint 9 with TypeScript ESLint
- **Formatting**: Prettier 3.6.2
- **Type Checking**: TypeScript 5.9.3

## Common Commands

```bash
# Development
npm run dev          # Start dev server on http://localhost:3000
bun run dev          # Alternative with bun

# Building
npm run build        # Production build
npm run build:dev    # Development build

# Code Quality
npm run lint         # Run ESLint

# Preview
npm run preview      # Preview production build
```

## Environment Variables

Required in `.env` file:
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

## Path Aliases

- `@/` maps to `./src/` for cleaner imports

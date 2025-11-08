# Arcadia

A modern library management system and bookstore platform built with React, TypeScript, and Supabase.

## 🚀 Live Demo

**Application:** [https://arcadia-lms.vercel.app](https://arcadia-lms.vercel.app)

### Demo Credentials

**Library Account:**
- Email: `library@arcadia.com`
- Password: `arcadia`

**Book Store Account:**
- Email: `store@arcadia.com`
- Password: `arcadia`

### Demo Videos

- **Library Demo:** Coming soon
- **Book Store Demo:** Coming soon

## ✨ Features

### Library Management
- **Book Cataloging:** Comprehensive book management with ISBN, categories, publishers, and metadata
- **Member Management:** Track members, contact information, and borrowing history
- **Circulation System:** Automated check-in/check-out with due date tracking
- **Late Fees:** Configurable late fee calculation with grace periods and caps
- **Condition Tracking:** Assess and track book condition on returns
- **Renewal Limits:** Configurable renewal limits with staff override options
- **Borrowing Limits:** Set member borrowing limits with policy enforcement
- **Active Loans:** Real-time view of all borrowed books with renewal and return options
- **Bulk Operations:** Import/export books via CSV

### Bookstore Features
- **Inventory Management:** Track stock levels and pricing
- **Sales Tracking:** Monitor transactions and revenue
- **Checkout Process:** Streamlined purchase workflow
- **Analytics Dashboard:** Sales insights and trends

### General Features
- **Search & Filtering:** Advanced search across books and members
- **Role-Based Access:** Separate dashboards for library staff and bookstore owners
- **Real-time Updates:** Live data synchronization with Supabase
- **Responsive Design:** Works seamlessly on desktop, tablet, and mobile
- **Dark Mode:** Built-in theme support

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS, Radix UI, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Authentication, Real-time)
- **State Management:** TanStack React Query
- **Forms:** React Hook Form with Zod validation

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS version) or Bun
- A Supabase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Kynstral/Arcadia.git
cd Arcadia
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Set up environment variables**

Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project settings.

4. **Run database migrations**
```bash
npx supabase db push
```

5. **Start the development server**
```bash
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
# or
bun run build
```

Deploy the `dist` folder to your preferred hosting provider (Vercel, Netlify, etc.).

## 📝 License

This project is open source and available under the MIT License.

## 🔗 Links

- **Repository:** [https://github.com/Kynstral/Arcadia](https://github.com/Kynstral/Arcadia)
- **Live Demo:** [https://arcadia-lms.vercel.app](https://arcadia-lms.vercel.app)

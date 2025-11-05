# Design Document: Dashboard and Analytics

## Overview

The Dashboard and Analytics system provides library staff and bookstore owners with real-time insights into their operations through key metrics, visualizations, and recent activity summaries. The system adapts its display based on user role (Library vs Book Store) to show relevant information.

### Key Objectives

- Real-time operational metrics and KPIs
- Visual data representation with charts
- Recent activity monitoring
- Role-based dashboard customization
- Quick access to common actions
- Performance trend analysis

## Architecture

### High-Level System Flow

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Dashboard  │      │   Data       │      │   Charts &   │
│    Page      │─────▶│   Service    │─────▶│   Metrics    │
│  (Index.tsx) │      │              │      │              │
└──────────────┘      └──────────────┘      └──────────────┘
      │                     │                      │
      │                     │                      │
   Role Check          Fetch Stats            Render Views
      │                     │                      │
      ▼                     ▼                      ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Library    │      │  Supabase    │      │   Recharts   │
│  Dashboard   │      │  Queries     │      │  Components  │
│  Component   │      │              │      │              │
└──────────────┘      └──────────────┘      └──────────────┘
      │
      │
   Bookstore
   Dashboard
   Component
```

### Component Hierarchy

```
Index Page (/dashboard)
│
├── Role Check (userRole)
│   │
│   ├── Library Mode
│   │   └── LibraryDashboard Component
│   │       ├── Header
│   │       │   ├── Title & Description
│   │       │   └── Refresh Button
│   │       ├── Stats Cards (4 columns)
│   │       │   ├── Total Books
│   │       │   ├── Members
│   │       │   ├── Borrowed Books
│   │       │   └── Active Borrowings
│   │       ├── Tabs
│   │       │   ├── Overview Tab
│   │       │   │   ├── Recent Books
│   │       │   │   └── Recent Borrowings
│   │       │   ├── Books Tab
│   │       │   │   └── Book List
│   │       │   └── Activity Tab
│   │       │       └── Borrowing History
│   │       └── Quick Actions
│   │
│   └── Bookstore Mode
│       └── BookStoreDashboard Component
│           ├── Header
│           │   ├── Title
│           │   ├── Time Range Selector
│           │   └── Refresh Button
│           ├── Stats Cards (4 columns)
│           │   ├── Total Books
│           │   ├── Total Revenue
│           │   ├── Total Sales
│           │   └── Customers
│           ├── Tabs
│           │   ├── Overview Tab
│           │   │   ├── Revenue Chart (Bar)
│           │   │   ├── Category Distribution (Pie)
│           │   │   ├── Recent Books List
│           │   │   └── Recent Sales List
│           │   ├── Sales Tab
│           │   │   ├── Payment Method Chart (Pie)
│           │   │   └── Best Selling Books (Bar)
│           │   └── Inventory Tab
│           │       └── Inventory by Category (Bar)
│           └── Quick Links
│
└── Data Fetching (React Query)
    ├── Dashboard Stats Query
    ├── Books Query
    └── Borrowings Query (Library only)
```

## Components and Interfaces

### 1. Index Page (`src/pages/Index.tsx`)

**Purpose**: Main dashboard entry point that routes to role-specific dashboards

**Component State**:
```typescript
interface IndexState {
  recentlyBorrowed: Record<string, unknown>[];
  timeRange: string;              // "weekly" | "monthly" | "quarterly" | "yearly"
  isRefreshing: boolean;
}
```

**Data Fetching**:
```typescript
// Dashboard stats
const { data: dashboardStats } = useQuery({
  queryKey: ["dashboardStats", userId],
  queryFn: () => getDashboardStats(userId),
});

// Books
const { data: books } = useQuery({
  queryKey: ["books", userId],
  queryFn: () => getBooks(userId),
});

// Recent borrowings (Library only)
const { data: borrowings } = useQuery({
  queryKey: ["recentBorrowings", userId],
  queryFn: async () => {
    const { data } = await supabase
      .from("borrowings")
      .select(`
        id, book_id, member_id, checkout_date, due_date, return_date, status,
        books:book_id (title, author, cover_image),
        members:member_id (name)
      `)
      .eq("user_id", userId)
      .order("checkout_date", { ascending: false })
      .limit(5);
    return data;
  },
  enabled: userRole === "Library",
});
```

**Role-Based Rendering**:
```typescript
return userRole === "Library" ? (
  <LibraryDashboard
    stats={dashboardStats}
    recentBooks={books}
    recentBorrowings={recentlyBorrowed}
    onAddToCart={handleBookCheckout}
    userId={userId}
  />
) : (
  <BookStoreDashboard />
);
```

### 2. LibraryDashboard Component (`src/components/LibraryDashboard.tsx`)

**Purpose**: Dashboard view for library operations

**Props Interface**:
```typescript
interface DashboardProps {
  stats: DashboardStats;
  recentBooks: Book[];
  recentBorrowings: any[];
  onAddToCart: (book: Book) => void;
  userId: string;
}
```

**Key Features**:
- **Stats Cards**: Total books, members, borrowed books, active borrowings
- **Refresh Button**: Reload dashboard data
- **Clear Borrowings**: Remove all borrowing records
- **Recent Books**: Display latest additions to catalog
- **Recent Borrowings**: Show recent checkout activity with member info
- **Delete Individual Borrowing**: Remove specific borrowing record

**Stats Cards Layout**:
```
┌─────────────────────────────────────────────────────────────────┐
│  📚 Total Books        👥 Members        📖 Borrowed    📋 Active│
│     150                  45                 23            12     │
│  in collection      registered         borrowed &      currently│
│                     members            returned        checked  │
└─────────────────────────────────────────────────────────────────┘
```

**Recent Borrowings Display**:
- Book title, author, cover image
- Member name
- Checkout date (relative time)
- Due date
- Status badge
- Delete button

**Actions**:
```typescript
const handleRefresh = () => {
  setIsRefreshing(true);
  setTimeout(() => {
    window.location.reload();
  }, 1000);
};

const handleClearBorrowings = async () => {
  await supabase
    .from("borrowings")
    .delete()
    .eq("user_id", userId);
  
  toast({ title: "Borrowings Cleared" });
};

const handleDeleteBorrowing = async (borrowingId: string) => {
  await supabase
    .from("borrowings")
    .delete()
    .eq("id", borrowingId);
  
  toast({ title: "Record Removed" });
};
```

### 3. BookStoreDashboard Component (Inline in Index.tsx)

**Purpose**: Dashboard view for bookstore operations

**Key Features**:
- **Time Range Selector**: Filter data by week, month, quarter, year
- **Stats Cards**: Total books, revenue, sales, customers
- **Tabbed Interface**: Overview, Sales, Inventory
- **Charts**: Revenue trends, category distribution, payment methods, bestsellers
- **Recent Activity**: Latest books and sales transactions

**Stats Cards Layout**:
```
┌─────────────────────────────────────────────────────────────────┐
│  📚 Total Books    💰 Total Revenue   🛒 Total Sales  👥 Customers│
│     150               $12,450.00          89             45      │
└─────────────────────────────────────────────────────────────────┘
```

**Tabs Structure**:

**Overview Tab**:
- Revenue Chart (Bar chart by month)
- Book Categories (Pie chart)
- Recent Books (List with cover, title, author, price, stock)
- Recent Sales (List with order ID, date, amount, status)
- "View All Transactions" button

**Sales Tab**:
- Sales by Payment Method (Pie chart)
- Best Selling Books (Horizontal bar chart)
- "View Detailed Sales Reports" button

**Inventory Tab**:
- Inventory by Category (Horizontal bar chart)
- "Manage Inventory" button

**Chart Data Processing**:
```typescript
// Category distribution
const getCategoryData = () => {
  const categoryCounts = books.reduce((acc, book) => {
    const category = book.category || "Uncategorized";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));
};

// Revenue by month
const getRevenueData = () => {
  const monthlyData = dashboardStats.recentTransactions.reduce(
    (acc, transaction) => {
      const month = new Date(transaction.date).toLocaleString("default", {
        month: "short",
      });
      acc[month] = (acc[month] || 0) + transaction.totalAmount;
      return acc;
    },
    {},
  );
  
  return Object.entries(monthlyData).map(([name, value]) => ({
    name,
    value,
  }));
};

// Payment method distribution
const getPaymentMethodData = () => {
  const paymentCounts = dashboardStats.recentTransactions.reduce(
    (acc, transaction) => {
      const method = transaction.paymentMethod || "Other";
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    },
    {},
  );
  
  return Object.entries(paymentCounts).map(([name, value]) => ({
    name: formatPaymentMethod(name),
    value,
  }));
};

// Bestselling books
const getBestsellingBooks = () => {
  return dashboardStats.popularBooks
    .slice(0, 5)
    .map((book) => ({
      name: book.title,
      value: book.salesCount,
    }));
};
```

## Data Models

### DashboardStats Interface

```typescript
interface DashboardStats {
  totalRevenue: number;
  totalBooks: number;
  totalTransactions: number;
  totalUsers: number;
  recentTransactions: Transaction[];
  popularBooks: Book[];
}
```

### Chart Data Interfaces

```typescript
interface ChartDataPoint {
  name: string;
  value: number;
}

interface RevenueDataPoint {
  name: string;      // Month name
  value: number;     // Revenue amount
}

interface CategoryDataPoint {
  name: string;      // Category name
  value: number;     // Book count
}
```

## Chart Implementations

### Bar Chart (Revenue, Bestsellers, Inventory)

**Library**: Recharts `BarChart`

**Configuration**:
```typescript
<ResponsiveContainer width="100%" height="100%">
  <ReBarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
    <CartesianGrid strokeDasharray="3 3" vertical={false} />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip
      formatter={(value) => [`$${value}`, "Revenue"]}
      contentStyle={{ borderRadius: "8px" }}
    />
    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
  </ReBarChart>
</ResponsiveContainer>
```

**Use Cases**:
- Revenue trends over time
- Bestselling books (horizontal)
- Inventory by category (horizontal)

### Pie Chart (Categories, Payment Methods)

**Library**: Recharts `PieChart`

**Configuration**:
```typescript
<ResponsiveContainer width="100%" height="100%">
  <RePieChart>
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      labelLine={false}
      outerRadius={80}
      fill="#8884d8"
      dataKey="value"
      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip
      formatter={(value) => [`${value} books`, "Count"]}
      contentStyle={{ borderRadius: "8px" }}
    />
  </RePieChart>
</ResponsiveContainer>
```

**Color Palette**:
```typescript
const COLORS = [
  "#3B82F6",  // Blue
  "#10B981",  // Green
  "#F59E0B",  // Amber
  "#EF4444",  // Red
  "#8B5CF6",  // Purple
  "#EC4899",  // Pink
];
```

**Use Cases**:
- Book category distribution
- Payment method distribution

## Loading and Error States

### Loading State

```typescript
if (statsLoading || booksLoading || borrowingsLoading) {
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-lg font-medium text-muted-foreground">
          Loading dashboard data...
        </p>
      </div>
    </div>
  );
}
```

### Error State

```typescript
if (statsError || booksError || borrowingsError) {
  return (
    <div className="p-8 bg-destructive/10 rounded-lg border border-destructive max-w-md mx-auto mt-12">
      <h2 className="text-xl font-bold text-destructive mb-2">
        Error Loading Dashboard
      </h2>
      <p className="text-muted-foreground">
        There was a problem loading the dashboard data. Please try refreshing the page.
      </p>
      <pre className="mt-4 p-4 bg-card rounded text-xs overflow-auto">
        {error.message}
      </pre>
    </div>
  );
}
```

### Empty State (Charts)

```typescript
{data.length > 0 ? (
  <ResponsiveContainer>
    {/* Chart */}
  </ResponsiveContainer>
) : (
  <div className="h-full flex items-center justify-center flex-col">
    <Info className="h-10 w-10 text-muted-foreground mb-2" />
    <p className="text-muted-foreground">No data available</p>
  </div>
)}
```

## Integration Points

### Data Service Integration

**getDashboardStats Function**:
```typescript
export const getDashboardStats = async (userId: string): Promise<DashboardStats> => {
  // Fetch books
  const { data: books } = await supabase
    .from("books")
    .select("*")
    .eq("user_id", userId);
  
  // Fetch members
  const { data: members } = await supabase
    .from("members")
    .select("*")
    .eq("user_id", userId);
  
  // Fetch transactions
  const { data: transactions } = await supabase
    .from("checkout_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  
  // Calculate stats
  return {
    totalBooks: books?.length || 0,
    totalUsers: members?.length || 0,
    totalTransactions: transactions?.length || 0,
    totalRevenue: transactions?.reduce((sum, t) => sum + t.total_amount, 0) || 0,
    recentTransactions: transactions?.slice(0, 10) || [],
    popularBooks: books?.sort((a, b) => b.sales_count - a.sales_count).slice(0, 10) || [],
  };
};
```

### React Query Integration

**Caching Strategy**:
- Query key: `["dashboardStats", userId]`
- Stale time: 5 minutes
- Refetch on window focus
- Manual refetch via refresh button

**Invalidation**:
- Invalidate on book/member/transaction mutations
- Manual refresh button triggers refetch

### Supabase Integration

**Borrowings Query** (Library mode):
```typescript
const { data } = await supabase
  .from("borrowings")
  .select(`
    id,
    book_id,
    member_id,
    checkout_date,
    due_date,
    return_date,
    status,
    user_id,
    books:book_id (title, author, cover_image),
    members:member_id (name)
  `)
  .eq("user_id", userId)
  .order("checkout_date", { ascending: false })
  .limit(5);
```

## Performance Optimizations

**Data Memoization**: Chart data calculations memoized to prevent unnecessary recalculations

**Lazy Loading**: Charts only render when tab is active

**Responsive Charts**: Use ResponsiveContainer for automatic sizing

**Efficient Queries**: Limit results (e.g., top 5 books, recent 10 transactions)

**Conditional Fetching**: Borrowings only fetched for Library role

## Responsive Design

**Desktop**: 4-column stats grid, side-by-side charts

**Tablet**: 2-column stats grid, stacked charts

**Mobile**: Single column layout, scrollable charts

**Breakpoints**:
- `md:grid-cols-2`: 2 columns on medium screens
- `lg:grid-cols-4`: 4 columns on large screens

## Testing Strategy

**Unit Tests**: Chart data processing functions, stats calculations

**Integration Tests**: Data fetching, role-based rendering, refresh functionality

**E2E Tests**: Complete dashboard load, tab navigation, chart interactions

# Implementation Plan: Dashboard and Analytics

- [x] 1. Set up dashboard page structure
  - [x] 1.1 Create Index page component
    - Create `src/pages/Index.tsx`
    - Set up page layout
    - Add role-based routing logic
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.2 Set up component state
    - Add state for recentlyBorrowed
    - Add state for timeRange
    - Add state for isRefreshing
    - _Requirements: 11.1, 11.2_

  - [x] 1.3 Implement role check
    - Get userRole from useAuth
    - Conditional rendering based on role
    - Route to LibraryDashboard or BookStoreDashboard
    - _Requirements: 10.5_

- [x] 2. Implement data fetching
  - [x] 2.1 Set up React Query for dashboard stats
    - Create useQuery for dashboardStats
    - Query key: ["dashboardStats", userId]
    - Call getDashboardStats function
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 2.2 Set up React Query for books
    - Create useQuery for books
    - Query key: ["books", userId]
    - Call getBooks function
    - _Requirements: 3.1, 3.2, 6.1_

  - [x] 2.3 Set up React Query for borrowings (Library only)
    - Create useQuery for recentBorrowings
    - Query borrowings with book and member joins
    - Enable only for Library role
    - Order by checkout_date descending
    - Limit to 5 results
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 2.4 Implement getDashboardStats function
    - Fetch books, members, transactions
    - Calculate totalBooks, totalUsers, totalTransactions
    - Calculate totalRevenue
    - Get recentTransactions (last 10)
    - Get popularBooks (sorted by sales_count)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 9.1_

- [x] 3. Create LibraryDashboard component
  - [x] 3.1 Build LibraryDashboard component
    - Create `src/components/LibraryDashboard.tsx`
    - Define props interface
    - Set up component structure
    - _Requirements: 1.1, 1.2, 1.3, 5.1_

  - [x] 3.2 Implement header section
    - Add title and description
    - Add refresh button
    - Handle refresh action
    - _Requirements: 10.1, 10.2_

  - [x] 3.3 Build stats cards
    - Create Total Books card
    - Create Members card
    - Create Borrowed Books card
    - Create Active Borrowings card
    - Display with icons
    - _Requirements: 1.1, 1.2, 1.3, 5.1_

  - [x] 3.4 Implement tabs interface
    - Create Tabs component
    - Add Overview, Books, Activity tabs
    - _Requirements: 2.1, 3.1, 5.1_

  - [x] 3.5 Build recent books section
    - Display recent books list
    - Show cover image, title, author
    - Show price and stock
    - Handle empty state
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 3.6 Build recent borrowings section
    - Display borrowings list
    - Show book info with cover
    - Show member name
    - Display checkout and due dates
    - Show status badge
    - Add delete button for each
    - _Requirements: 2.1, 2.2, 2.3, 5.1, 5.2_

  - [x] 3.7 Implement clear borrowings action
    - Add "Clear Borrowings" button
    - Show confirmation
    - Delete all borrowings for user
    - Update local state
    - Show success toast
    - _Requirements: 5.1, 5.2_

  - [x] 3.8 Implement delete individual borrowing
    - Add delete button to each borrowing
    - Delete specific borrowing record
    - Update local state
    - Show success toast
    - _Requirements: 5.1, 5.2_

- [x] 4. Create BookStoreDashboard component
  - [x] 4.1 Build BookStoreDashboard inline component
    - Create component inside Index.tsx
    - Set up component structure
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 9.1_

  - [x] 4.2 Implement header section
    - Add title
    - Add time range selector
    - Add refresh button
    - _Requirements: 10.1, 10.2, 11.1, 11.2_

  - [x] 4.3 Build stats cards
    - Create Total Books card
    - Create Total Revenue card
    - Create Total Sales card
    - Create Customers card
    - Display with icons
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 9.1_

  - [x] 4.4 Implement tabs interface
    - Create Tabs component
    - Add Overview, Sales, Inventory tabs
    - _Requirements: 4.1, 4.2, 8.1, 9.1_

- [x] 5. Implement Overview tab (Bookstore)
  - [x] 5.1 Create revenue chart
    - Process revenue data by month
    - Implement getRevenueData function
    - Create Bar chart with Recharts
    - Add CartesianGrid, XAxis, YAxis, Tooltip
    - Handle empty state
    - _Requirements: 4.1, 4.2, 9.1, 9.5_

  - [x] 5.2 Create category distribution chart
    - Process category data
    - Implement getCategoryData function
    - Create Pie chart with Recharts
    - Add labels with percentages
    - Use color palette
    - Handle empty state
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 5.3 Build recent books list
    - Display recent books (first 5)
    - Show cover image, title, author
    - Show price and stock
    - Handle empty state
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 5.4 Build recent sales list
    - Display recent transactions
    - Show order ID, date, amount, status
    - Color code status
    - Handle empty state
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 5.5 Add "View All Transactions" button
    - Link to transactions page
    - Position at bottom
    - _Requirements: 2.5_

- [x] 6. Implement Sales tab (Bookstore)
  - [x] 6.1 Create payment method chart
    - Process payment method data
    - Implement getPaymentMethodData function
    - Format payment method names
    - Create Pie chart with Recharts
    - Add labels with percentages
    - Handle empty state
    - _Requirements: 9.3, 9.4_

  - [x] 6.2 Create bestselling books chart
    - Process bestseller data
    - Implement getBestsellingBooks function
    - Create horizontal Bar chart
    - Show top 5 books
    - Handle empty state
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 6.3 Add "View Detailed Sales Reports" button
    - Link to sales page
    - Position at bottom
    - _Requirements: 2.5_

- [x] 7. Implement Inventory tab (Bookstore)
  - [x] 7.1 Create inventory by category chart
    - Use getCategoryData function
    - Create horizontal Bar chart
    - Show all categories
    - Handle empty state
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 7.2 Add "Manage Inventory" button
    - Link to inventory/books page
    - Position at bottom
    - _Requirements: 10.1, 10.2_

- [x] 8. Implement chart data processing
  - [x] 8.1 Create getCategoryData function
    - Count books by category
    - Handle "Uncategorized"
    - Return array of {name, value}
    - _Requirements: 8.1, 8.2_

  - [x] 8.2 Create getRevenueData function
    - Group transactions by month
    - Sum totalAmount per month
    - Return array of {name, value}
    - _Requirements: 4.1, 4.2, 9.1, 9.5_

  - [x] 8.3 Create getPaymentMethodData function
    - Count transactions by payment method
    - Format payment method names
    - Return array of {name, value}
    - _Requirements: 9.3_

  - [x] 8.4 Create getBestsellingBooks function
    - Get top 5 from popularBooks
    - Map to {name, value} format
    - Use salesCount as value
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 8.5 Create formatPaymentMethod function
    - Convert "bank_transfer" to "Bank Transfer"
    - Convert "cash" to "Cash"
    - Convert "card" to "Card"
    - Handle "Borrow" and "Rent"
    - Capitalize other methods
    - _Requirements: 9.3_

- [x] 9. Implement Recharts components
  - [x] 9.1 Set up Bar charts
    - Import BarChart from Recharts
    - Configure ResponsiveContainer
    - Add CartesianGrid
    - Add XAxis and YAxis
    - Add Tooltip with custom formatter
    - Add Bar with color and radius
    - _Requirements: 4.1, 4.2, 4.5_

  - [x] 9.2 Set up Pie charts
    - Import PieChart from Recharts
    - Configure ResponsiveContainer
    - Add Pie with custom labels
    - Add Cell with color palette
    - Add Tooltip with custom formatter
    - _Requirements: 8.1, 8.2, 9.3_

  - [x] 9.3 Configure chart styling
    - Set up color palette (COLORS array)
    - Configure tooltip styles
    - Set chart margins
    - Add border radius to bars
    - _Requirements: 4.5_

  - [x] 9.4 Implement empty states for charts
    - Check if data.length > 0
    - Show Info icon
    - Display "No data available" message
    - Center content
    - _Requirements: 4.1, 8.1, 9.1_

- [x] 10. Implement loading and error states
  - [x] 10.1 Create loading state
    - Check if any query is loading
    - Display centered spinner
    - Show "Loading dashboard data..." message
    - _Requirements: 1.5_

  - [x] 10.2 Create error state
    - Check if any query has error
    - Display error card
    - Show error message
    - Display error details in pre tag
    - _Requirements: 12.1, 12.2_

  - [x] 10.3 Handle default stats
    - Create defaultStats object
    - Use when dashboardStats is null
    - Prevent undefined errors
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 11. Implement refresh functionality
  - [x] 11.1 Add refresh button (Library)
    - Create refresh button in header
    - Show spinning icon when refreshing
    - Disable button during refresh
    - Reload page after 1 second
    - _Requirements: 1.5, 10.1_

  - [x] 11.2 Add refresh button (Bookstore)
    - Create refresh button in header
    - Show spinning icon when refreshing
    - Disable button during refresh
    - Call refetchStats function
    - Update isRefreshing state
    - _Requirements: 1.5, 10.1_

  - [x] 11.3 Implement handleRefreshData function
    - Set isRefreshing to true
    - Call refetchStats from React Query
    - Set isRefreshing to false after delay
    - _Requirements: 1.5_

- [x] 12. Implement time range filtering (Bookstore)
  - [x] 12.1 Add time range selector
    - Create Select component
    - Add options: Last Week, Month, Quarter, Year
    - Set default to "monthly"
    - Update timeRange state on change
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 12.2 Store time range in state
    - Add timeRange state variable
    - Default to "monthly"
    - _Requirements: 11.1, 11.5_

  - [x] 12.3 Apply time range to data (future enhancement)
    - Note: Currently displays all data
    - Filter logic can be added to data processing functions
    - _Requirements: 11.4_

- [x] 13. Implement quick actions
  - [x] 13.1 Add quick links (Bookstore)
    - "View All Transactions" button
    - "View Detailed Sales Reports" button
    - "Manage Inventory" button
    - Use Link component with navigation
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 13.2 Add quick actions (Library)
    - "Clear Borrowings" button
    - Delete individual borrowing buttons
    - Refresh button
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 14. Implement responsive design
  - [x] 14.1 Make stats cards responsive
    - Grid: 1 column on mobile
    - Grid: 2 columns on md screens
    - Grid: 4 columns on lg screens
    - _Requirements: All_

  - [x] 14.2 Make charts responsive
    - Use ResponsiveContainer
    - Adjust margins for mobile
    - Stack charts on mobile
    - Side-by-side on desktop
    - _Requirements: 4.5_

  - [x] 14.3 Make header responsive
    - Stack title and actions on mobile
    - Horizontal layout on desktop
    - Adjust spacing
    - _Requirements: All_

  - [x] 14.4 Make tabs responsive
    - Full width on mobile
    - Adjust tab spacing
    - Scrollable if needed
    - _Requirements: All_

- [x] 15. Test and optimize
  - [x] 15.1 Test Library dashboard
    - Verify stats display correctly
    - Test recent books list
    - Test recent borrowings list
    - Test refresh functionality
    - Test clear borrowings
    - Test delete individual borrowing
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.1, 5.1_

  - [x] 15.2 Test Bookstore dashboard
    - Verify stats display correctly
    - Test all charts render
    - Test empty states
    - Test time range selector
    - Test refresh functionality
    - Test tab navigation
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 8.1, 9.1_

  - [x] 15.3 Test data processing functions
    - Test getCategoryData
    - Test getRevenueData
    - Test getPaymentMethodData
    - Test getBestsellingBooks
    - Test formatPaymentMethod
    - _Requirements: 3.1, 4.1, 8.1, 9.1_

  - [x] 15.4 Test loading and error states
    - Verify loading spinner displays
    - Verify error message displays
    - Test with network errors
    - _Requirements: 1.5, 12.1, 12.2_

  - [x] 15.5 Test responsive design
    - Test on mobile (< 640px)
    - Test on tablet (640px - 1024px)
    - Test on desktop (> 1024px)
    - Verify charts resize properly
    - _Requirements: All_

  - [x] 15.6 Optimize performance
    - Verify React Query caching works
    - Check for unnecessary re-renders
    - Test with large datasets
    - Optimize chart rendering
    - _Requirements: All_

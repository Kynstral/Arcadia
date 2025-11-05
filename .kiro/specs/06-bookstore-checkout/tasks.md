# Implementation Plan: Bookstore Checkout System

- [x] 1. Set up database schema and types
  - [x] 1.1 Create checkout_transactions table in Supabase
    - Define all columns with proper types
    - Set up primary key and foreign keys
    - Add indexes for performance
    - _Requirements: 5.1, 5.3, 8.1_

  - [x] 1.2 Create checkout_items table in Supabase
    - Define columns for line items
    - Link to transactions and books tables
    - Add indexes
    - _Requirements: 5.4, 9.2_

  - [x] 1.3 Configure Row Level Security policies
    - Enable RLS on both tables
    - Create policies for SELECT, INSERT, UPDATE
    - Restrict by user_id
    - _Requirements: 5.1, 8.1_

  - [x] 1.4 Define TypeScript interfaces
    - Create Transaction interface
    - Create CheckoutItem interface
    - Create CartItem interface
    - Define PaymentMethod and TransactionStatus types
    - _Requirements: 5.1, 9.1_

  - [x] 1.5 Create database functions
    - Create process_book_sale function
    - Create restore_book_stock function
    - Test functions
    - _Requirements: 7.1, 7.2, 10.4_

- [x] 2. Implement Cart Context
  - [x] 2.1 Create CartProvider component
    - Set up React Context
    - Define CartContextType interface
    - Create context and provider
    - _Requirements: 1.1, 11.1_

  - [x] 2.2 Set up cart state management
    - Add useState for cartItems
    - Calculate totalPrice
    - Calculate itemCount
    - _Requirements: 1.2, 2.4, 11.2_

  - [x] 2.3 Implement addItem function
    - Check if item already in cart
    - Increment quantity if exists
    - Add new item if not exists
    - Show success toast
    - _Requirements: 1.2, 1.4, 12.1_

  - [x] 2.4 Implement updateQuantity function
    - Validate quantity > 0
    - Update item quantity
    - Remove if quantity = 0
    - _Requirements: 3.1, 3.2, 3.5_

  - [x] 2.5 Implement removeItem function
    - Filter out item from cart
    - Show confirmation toast
    - _Requirements: 4.1, 4.2_

  - [x] 2.6 Implement clearCart function
    - Reset cartItems to empty array
    - _Requirements: 4.5, 5.5, 11.3_

  - [x] 2.7 Wrap App with CartProvider
    - Import CartProvider in App.tsx
    - Wrap application after AuthStatusProvider
    - Verify context accessibility
    - _Requirements: 11.1, 11.2_

- [x] 3. Add "Add to Cart" functionality to Catalog
  - [x] 3.1 Update BookCard component
    - Import useCart hook
    - Add quantity selector
    - Add "Add to Cart" button
    - _Requirements: 1.1, 1.3_

  - [x] 3.2 Implement stock validation
    - Check book.stock before adding
    - Show error if insufficient stock
    - Disable button if stock = 0
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 3.3 Handle add to cart action
    - Get quantity from input
    - Call addItem from context
    - Show success feedback
    - _Requirements: 1.2, 1.5_

  - [x] 3.4 Update BookDetail page
    - Add quantity input
    - Add "Add to Cart" button (bookstore mode)
    - Show stock availability
    - Implement add to cart handler
    - _Requirements: 1.1, 1.3, 12.2_

- [x] 4. Create Cart Icon component
  - [x] 4.1 Build CartIcon component
    - Create component in components folder
    - Import useCart hook
    - Display shopping cart icon
    - _Requirements: 1.5, 11.4_

  - [x] 4.2 Add item count badge
    - Show badge with itemCount
    - Hide badge if count = 0
    - Style badge appropriately
    - _Requirements: 1.5, 11.4_

  - [x] 4.3 Create cart dropdown
    - Build popover/dropdown component
    - Show cart items preview
    - Display total amount
    - Add "Go to Checkout" button
    - _Requirements: 2.1, 2.2_

  - [x] 4.4 Add CartIcon to navigation
    - Import in App.tsx or Layout
    - Position in header/navigation bar
    - Make responsive
    - _Requirements: 1.5, 11.4_

- [x] 5. Implement Checkout page
  - [x] 5.1 Create Checkout page component
    - Create `src/pages/Checkout.tsx`
    - Set up page structure
    - Add header with title
    - _Requirements: 2.1, 5.1_

  - [x] 5.2 Set up component state
    - Add state for paymentMethod
    - Add state for isProcessing
    - Add state for showConfirmation
    - _Requirements: 6.1, 6.2_

  - [x] 5.3 Access cart from context
    - Import useCart hook
    - Get cartItems, totalPrice, itemCount
    - Get updateQuantity, removeItem, clearCart
    - _Requirements: 2.1, 2.2, 11.2_

  - [x] 5.4 Build cart items section
    - Map cartItems to CartItemCard components
    - Display in grid/list layout
    - Make responsive
    - _Requirements: 2.1, 2.2_

  - [x] 5.5 Create CartItemCard component
    - Show book cover thumbnail
    - Display title, author, price
    - Add quantity controls (-, input, +)
    - Show calculated subtotal
    - Add remove button
    - _Requirements: 2.2, 2.3, 3.1, 4.1_

  - [x] 5.6 Implement quantity controls
    - Add decrement button
    - Add quantity input field
    - Add increment button
    - Validate against stock
    - Call updateQuantity on change
    - _Requirements: 3.1, 3.2, 3.4, 3.5_

  - [x] 5.7 Implement remove item
    - Add remove button to each card
    - Call removeItem from context
    - Update UI immediately
    - Show confirmation message
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 5.8 Build order summary card
    - Display subtotal
    - Display tax (optional)
    - Display total amount
    - Show item count
    - Make sticky on scroll (desktop)
    - _Requirements: 2.3, 2.4_

  - [x] 5.9 Create payment method selector
    - Add radio buttons for each method
    - Options: Credit Card, Cash, PayPal, Bank Transfer, Other
    - Update paymentMethod state on selection
    - Show selected method
    - _Requirements: 6.1, 6.2, 6.5_

  - [x] 5.10 Add "Complete Purchase" button
    - Position in order summary
    - Disable if cart empty or no payment method
    - Show loading state during processing
    - _Requirements: 5.1, 5.2, 6.2_

  - [x] 5.11 Implement empty cart state
    - Check if cartItems.length = 0
    - Display empty cart message
    - Add "Browse Catalog" button
    - _Requirements: 4.5_

  - [x] 5.12 Add "Clear Cart" button
    - Position in page header
    - Show confirmation dialog
    - Call clearCart on confirm
    - _Requirements: 11.5_

- [x] 6. Implement checkout logic
  - [x] 6.1 Create handleCompletePurchase function
    - Validate cart not empty
    - Validate payment method selected
    - Set isProcessing to true
    - _Requirements: 5.1, 5.2, 6.2_

  - [x] 6.2 Validate stock availability
    - Check each cart item against current stock
    - Show error if any item exceeds stock
    - Prevent checkout if validation fails
    - _Requirements: 7.3, 12.4, 12.5_

  - [x] 6.3 Create transaction record
    - INSERT into checkout_transactions
    - Set total_amount, payment_method, status
    - Get authenticated user_id
    - Get transaction ID from response
    - _Requirements: 5.3, 5.4, 6.3_

  - [x] 6.4 Create checkout items
    - Map cartItems to checkout items
    - INSERT into checkout_items table
    - Link to transaction_id
    - Store book_id, quantity, price
    - _Requirements: 5.4_

  - [x] 6.5 Update book inventory
    - For each cart item, call process_book_sale function
    - Decrement stock by quantity
    - Increment sales_count by quantity
    - Update status if stock = 0
    - _Requirements: 7.1, 7.2, 7.4_

  - [x] 6.6 Handle success
    - Clear cart using clearCart()
    - Show success toast
    - Navigate to transactions page
    - _Requirements: 5.5_

  - [x] 6.7 Handle errors
    - Catch and log errors
    - Show error toast with message
    - Keep cart intact for retry
    - Set isProcessing to false
    - _Requirements: 7.3, 12.4_

- [x] 7. Implement Transactions page
  - [x] 7.1 Create Transactions page component
    - Create `src/pages/Transactions.tsx`
    - Set up page structure
    - Add header with title
    - _Requirements: 8.1, 8.2_

  - [x] 7.2 Set up component state
    - Add state for dateRange filter
    - Add state for paymentMethodFilter
    - Add state for statusFilter
    - Add state for selectedTransaction
    - Add state for showDetailDialog
    - _Requirements: 8.3_

  - [x] 7.3 Implement data fetching with React Query
    - Create fetchTransactions function
    - Set up useQuery hook
    - Handle loading and error states
    - _Requirements: 8.1, 8.2_

  - [x] 7.4 Build filters bar
    - Add date range picker
    - Add payment method filter dropdown
    - Add status filter dropdown
    - Add clear filters button
    - _Requirements: 8.3_

  - [x] 7.5 Implement filter logic
    - Filter by date range
    - Filter by payment method
    - Filter by status
    - Combine filters with AND logic
    - _Requirements: 8.3_

  - [x] 7.6 Build transactions table
    - Create table with columns
    - Display date, transaction ID, items count
    - Show total amount, payment method, status
    - Add actions column
    - Make responsive (cards on mobile)
    - _Requirements: 8.2, 8.4_

  - [x] 7.7 Add sorting functionality
    - Make date column sortable
    - Make amount column sortable
    - Toggle ascending/descending
    - _Requirements: 8.4_

  - [x] 7.8 Calculate revenue summary
    - Sum total_amount for completed transactions
    - Display in page header
    - Update when filters change
    - _Requirements: 8.5_

  - [x] 7.9 Add "View Details" action
    - Add button in actions column
    - Set selectedTransaction on click
    - Open detail dialog
    - _Requirements: 9.1_

- [x] 8. Create Transaction Detail dialog
  - [x] 8.1 Build TransactionDetail component
    - Create dialog/modal component
    - Accept transaction prop
    - Add close button
    - _Requirements: 9.1, 9.2_

  - [x] 8.2 Fetch transaction items
    - Query checkout_items for transaction_id
    - Include book details (join)
    - Handle loading state
    - _Requirements: 9.2, 9.3_

  - [x] 8.3 Display transaction header
    - Show transaction ID
    - Display date and time
    - Show status badge
    - _Requirements: 9.1, 9.4_

  - [x] 8.4 Build items list
    - Map checkout items to rows
    - Display book title, quantity, price
    - Show subtotal for each item
    - _Requirements: 9.2, 9.3_

  - [x] 8.5 Display summary section
    - Show subtotal
    - Show tax (if applicable)
    - Show total amount
    - _Requirements: 9.4_

  - [x] 8.6 Show payment information
    - Display payment method
    - _Requirements: 9.4_

  - [x] 8.7 Add action buttons
    - Add "Print Receipt" button
    - Add "Process Return" button (if completed)
    - _Requirements: 9.5, 10.1_

- [x] 9. Implement return processing
  - [x] 9.1 Create return confirmation dialog
    - Show list of items in transaction
    - Add checkboxes to select items to return
    - Add confirmation button
    - _Requirements: 10.1, 10.2_

  - [x] 9.2 Implement processReturn function
    - Update transaction status to "Returned"
    - Set return_date to current timestamp
    - _Requirements: 10.3, 10.5_

  - [x] 9.3 Restore book inventory
    - For each returned item, call restore_book_stock
    - Increment stock by quantity
    - Update book status to "Available"
    - _Requirements: 10.4_

  - [x] 9.4 Update UI after return
    - Invalidate transactions query
    - Invalidate books query
    - Show success toast
    - Close dialog
    - _Requirements: 10.3, 10.4_

- [x] 10. Add stock validation throughout
  - [x] 10.1 Validate on add to cart
    - Check quantity <= book.stock
    - Show error if insufficient
    - Prevent adding if stock = 0
    - _Requirements: 12.1, 12.3_

  - [x] 10.2 Validate on quantity update
    - Check new quantity <= book.stock
    - Show error and revert if exceeds
    - Update in real-time
    - _Requirements: 3.4, 12.5_

  - [x] 10.3 Validate before checkout
    - Check all cart items against current stock
    - Show specific error for each invalid item
    - Prevent checkout if any invalid
    - _Requirements: 7.3, 12.4_

  - [x] 10.4 Display stock availability
    - Show stock count on product pages
    - Show "Out of Stock" badge if stock = 0
    - Show "Low Stock" warning if stock < 5
    - _Requirements: 12.2_

- [x] 11. Implement responsive design
  - [x] 11.1 Make Checkout page responsive
    - Two-column layout on desktop
    - Single column on mobile
    - Stack order summary below items
    - _Requirements: All_

  - [x] 11.2 Make Transactions page responsive
    - Table view on desktop
    - Card view on mobile
    - Responsive filters
    - _Requirements: 8.1, 8.2_

  - [x] 11.3 Make cart dropdown responsive
    - Adjust width for mobile
    - Limit items shown
    - Scrollable if many items
    - _Requirements: 2.1_

  - [x] 11.4 Test on all breakpoints
    - Test mobile (< 640px)
    - Test tablet (640px - 1024px)
    - Test desktop (> 1024px)
    - _Requirements: All_

- [x] 12. Test and optimize
  - [x] 12.1 Test add to cart flow
    - Add items from catalog
    - Add items from book detail
    - Verify cart updates
    - Test stock validation
    - _Requirements: 1.1-1.5, 12.1-12.3_

  - [x] 12.2 Test cart management
    - Update quantities
    - Remove items
    - Clear cart
    - Verify calculations
    - _Requirements: 2.1-2.5, 3.1-3.5, 4.1-4.5_

  - [x] 12.3 Test checkout process
    - Complete purchase with each payment method
    - Verify transaction created
    - Verify checkout items created
    - Verify stock updated
    - Verify cart cleared
    - _Requirements: 5.1-5.5, 6.1-6.5, 7.1-7.5_

  - [x] 12.4 Test transaction history
    - View all transactions
    - Apply filters
    - Sort transactions
    - View transaction details
    - Verify revenue calculation
    - _Requirements: 8.1-8.5, 9.1-9.5_

  - [x] 12.5 Test return processing
    - Process full return
    - Process partial return
    - Verify stock restored
    - Verify transaction status updated
    - _Requirements: 10.1-10.5_

  - [x] 12.6 Test error handling
    - Test insufficient stock scenarios
    - Test network errors
    - Test validation errors
    - Verify error messages
    - _Requirements: 7.3, 12.3, 12.4_

  - [x] 12.7 Optimize performance
    - Test with large cart
    - Test with many transactions
    - Verify query performance
    - Check for memory leaks
    - _Requirements: All_

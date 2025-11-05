# Design Document: Bookstore Checkout System

## Overview

The Bookstore Checkout System enables bookstore owners to process retail sales transactions, manage shopping carts, track inventory, and maintain transaction history. It provides a complete point-of-sale solution integrated with the book catalog and inventory management.

### Key Objectives

- Streamlined shopping cart management
- Real-time inventory validation
- Multiple payment method support
- Transaction history and reporting
- Return processing capabilities
- Cart persistence across sessions

## Architecture

### High-Level System Flow

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Catalog    │      │  Shopping    │      │   Checkout   │      │ Transactions │
│    Page      │─────▶│    Cart      │─────▶│     Page     │─────▶│     Page     │
│  (Browse &   │      │  (Review)    │      │  (Complete)  │      │  (History)   │
│   Add)       │      │              │      │              │      │              │
└──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
      │                     │                      │                      │
      │                     │                      │                      │
   Add to Cart         Update Cart            Process Sale           View History
      │                     │                      │                      │
      ▼                     ▼                      ▼                      ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                          Cart Context (React State)                            │
│                     (Persisted across navigation)                              │
└────────────────────────────────────────────────────────────────────────────────┘
      │                     │                      │
      │                     │                      │
      ▼                     ▼                      ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│    Books     │      │ Transactions │      │   Checkout   │
│    Table     │      │    Table     │      │    Items     │
│  (Stock &    │      │  (Sales      │      │    Table     │
│   Price)     │      │   Records)   │      │  (Line Items)│
└──────────────┘      └──────────────┘      └──────────────┘
```

### Component Hierarchy

```
App
└── CartProvider (Context - Wraps entire app)
    │
    ├── Catalog Page (/catalog)
    │   └── BookCard
    │       ├── Book Info
    │       ├── Price & Stock
    │       └── Add to Cart Button
    │           ├── Quantity Selector
    │           └── Add Button
    │
    ├── BookDetail Page (/book/:id)
    │   └── Action Panel (Bookstore Mode)
    │       ├── Price Display
    │       ├── Stock Availability
    │       ├── Quantity Input
    │       └── Add to Cart Button
    │
    ├── Checkout Page (/checkout)
    │   ├── Page Header
    │   │   ├── Title
    │   │   └── Clear Cart Button
    │   ├── Cart Items Section
    │   │   └── Cart Item Card (multiple)
    │   │       ├── Book Cover
    │   │       ├── Book Info
    │   │       ├── Price
    │   │       ├── Quantity Controls
    │   │       │   ├── Decrement Button
    │   │       │   ├── Quantity Input
    │   │       │   └── Increment Button
    │   │       ├── Subtotal
    │   │       └── Remove Button
    │   ├── Order Summary Card
    │   │   ├── Subtotal
    │   │   ├── Tax (optional)
    │   │   ├── Total
    │   │   └── Item Count
    │   ├── Payment Method Selector
    │   │   ├── Credit Card
    │   │   ├── Cash
    │   │   ├── PayPal
    │   │   ├── Bank Transfer
    │   │   └── Other
    │   ├── Complete Purchase Button
    │   └── Empty Cart State
    │
    ├── Transactions Page (/transactions)
    │   ├── Page Header
    │   │   ├── Title
    │   │   └── Revenue Summary
    │   ├── Filters Bar
    │   │   ├── Date Range Picker
    │   │   ├── Payment Method Filter
    │   │   ├── Status Filter
    │   │   └── Clear Filters
    │   ├── Transactions Table
    │   │   └── Transaction Row (multiple)
    │   │       ├── Date
    │   │       ├── Transaction ID
    │   │       ├── Items Count
    │   │       ├── Total Amount
    │   │       ├── Payment Method
    │   │       ├── Status Badge
    │   │       └── Actions
    │   │           ├── View Details
    │   │           └── Process Return
    │   └── Transaction Detail Dialog
    │       ├── Header
    │       │   ├── Transaction ID
    │       │   ├── Date & Time
    │       │   └── Status Badge
    │       ├── Items List
    │       │   └── Item Row (multiple)
    │       │       ├── Book Title
    │       │       ├── Quantity
    │       │       ├── Unit Price
    │       │       └── Subtotal
    │       ├── Summary
    │       │   ├── Subtotal
    │       │   ├── Tax
    │       │   └── Total
    │       ├── Payment Info
    │       │   └── Payment Method
    │       └── Actions
    │           ├── Print Receipt
    │           └── Process Return
    │
    └── Cart Icon (Navigation)
        ├── Cart Badge (Item Count)
        └── Cart Dropdown (Quick View)
            ├── Cart Items Preview
            ├── Total Amount
            └── Go to Checkout Button
```

### Data Flow Diagrams

**Add to Cart Flow**:
```
┌─────────────────────────────────────────────────────────────────┐
│              User Action (Add to Cart)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              BookCard/BookDetail Component                      │
│  • User selects quantity                                        │
│  • User clicks "Add to Cart" button                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Stock Validation                                   │
│  • Check if quantity <= book.stock                              │
│  • If insufficient: Show error, stop                            │
│  • If sufficient: Continue                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Cart Context (addItem)                             │
│  • Check if book already in cart                                │
│  • If yes: Increment quantity                                   │
│  • If no: Add new cart item                                     │
│  • Update cart state                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              UI Updates                                         │
│  • Update cart icon badge count                                 │
│  • Show success toast                                           │
│  • Update cart dropdown                                         │
└─────────────────────────────────────────────────────────────────┘
```

**Checkout Flow**:
```
┌─────────────────────────────────────────────────────────────────┐
│              User Action (Complete Purchase)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Checkout Page Validation                           │
│  • Cart not empty?                                              │
│  • Payment method selected?                                     │
│  • All items have sufficient stock?                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Create Transaction Record                          │
│  • INSERT into checkout_transactions                            │
│  • Set total_amount, payment_method, status                     │
│  • Get transaction ID                                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Create Checkout Items                              │
│  • For each cart item:                                          │
│    - INSERT into checkout_items                                 │
│    - Link to transaction_id                                     │
│    - Store book_id, quantity, price                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Update Book Inventory                              │
│  • For each cart item:                                          │
│    - Decrement book.stock by quantity                           │
│    - Increment book.sales_count by quantity                     │
│    - If stock = 0, set status = "Out of Stock"                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Clear Cart & Show Success                          │
│  • Clear cart context                                           │
│  • Show success toast                                           │
│  • Navigate to transactions page                                │
│  • Display transaction details                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. CartProvider Context (`src/hooks/use-cart.tsx`)

**Purpose**: Global shopping cart state management using React Context

**Context Interface**:
```typescript
interface CartItem {
  id: string;              // Book ID
  title: string;           // Book title
  price: number;           // Unit price
  quantity: number;        // Quantity in cart
  coverImage?: string;     // Book cover URL
  stock: number;           // Available stock
}

interface CartContextType {
  cartItems: CartItem[];                           // Array of cart items
  addItem: (item: CartItem) => void;               // Add item to cart
  removeItem: (id: string) => void;                // Remove item from cart
  updateQuantity: (id: string, quantity: number) => void; // Update item quantity
  clearCart: () => void;                           // Empty cart
  totalPrice: number;                              // Calculated total
  itemCount: number;                               // Total items count
}
```

**State Management**:
```typescript
const [cartItems, setCartItems] = useState<CartItem[]>([]);

// Calculated values
const totalPrice = cartItems.reduce((sum, item) => 
  sum + (item.price * item.quantity), 0
);

const itemCount = cartItems.reduce((sum, item) => 
  sum + item.quantity, 0
);
```

**Key Methods**:

**addItem**:
```typescript
const addItem = (item: CartItem) => {
  setCartItems(prev => {
    const existing = prev.find(i => i.id === item.id);
    
    if (existing) {
      // Increment quantity if already in cart
      return prev.map(i => 
        i.id === item.id 
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      );
    } else {
      // Add new item
      return [...prev, item];
    }
  });
  
  toast({ title: `Added ${item.title} to cart` });
};
```

**updateQuantity**:
```typescript
const updateQuantity = (id: string, quantity: number) => {
  if (quantity <= 0) {
    removeItem(id);
    return;
  }
  
  setCartItems(prev => 
    prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    )
  );
};
```

**removeItem**:
```typescript
const removeItem = (id: string) => {
  setCartItems(prev => prev.filter(item => item.id !== id));
  toast({ title: "Item removed from cart" });
};
```

**clearCart**:
```typescript
const clearCart = () => {
  setCartItems([]);
};
```

### 2. Checkout Page (`src/pages/Checkout.tsx`)

**Purpose**: Review cart contents and complete purchase

**Component State**:
```typescript
interface CheckoutState {
  paymentMethod: PaymentMethod | null;
  isProcessing: boolean;
  showConfirmation: boolean;
}

type PaymentMethod = "Credit Card" | "Cash" | "PayPal" | "Bank Transfer" | "Other";
```

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────┐
│  Shopping Cart                    [Clear Cart Button]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Cart Items (Left Column - 2/3 width)                  │
│  ┌───────────────────────────────────────────────────┐│
│  │  📖 [Cover]  The Great Gatsby                     ││
│  │              by F. Scott Fitzgerald                ││
│  │              $19.99                                ││
│  │              [-] 2 [+]  Subtotal: $39.98          ││
│  │              [Remove Button]                       ││
│  └───────────────────────────────────────────────────┘│
│  ┌───────────────────────────────────────────────────┐│
│  │  📖 [Cover]  1984                                  ││
│  │              by George Orwell                      ││
│  │              $15.99                                ││
│  │              [-] 1 [+]  Subtotal: $15.99          ││
│  │              [Remove Button]                       ││
│  └───────────────────────────────────────────────────┘│
│                                                         │
│  Order Summary (Right Column - 1/3 width)              │
│  ┌───────────────────────────────────────────────────┐│
│  │  Order Summary                                     ││
│  │                                                    ││
│  │  Items (3):                              $55.97   ││
│  │  Tax:                                    $5.60    ││
│  │  ─────────────────────────────────────────────    ││
│  │  Total:                                  $61.57   ││
│  │                                                    ││
│  │  Payment Method:                                  ││
│  │  ○ Credit Card                                    ││
│  │  ○ Cash                                           ││
│  │  ○ PayPal                                         ││
│  │  ○ Bank Transfer                                  ││
│  │  ○ Other                                          ││
│  │                                                    ││
│  │  [Complete Purchase Button]                       ││
│  └───────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

**Cart Item Card**:
- Book cover thumbnail
- Title and author
- Unit price
- Quantity controls (-, input, +)
- Calculated subtotal
- Remove button
- Stock validation on quantity change

**Quantity Controls**:
```typescript
const handleQuantityChange = (itemId: string, newQuantity: number) => {
  const item = cartItems.find(i => i.id === itemId);
  
  if (!item) return;
  
  // Validate against stock
  if (newQuantity > item.stock) {
    toast({
      title: "Insufficient stock",
      description: `Only ${item.stock} available`,
      variant: "destructive"
    });
    return;
  }
  
  updateQuantity(itemId, newQuantity);
};
```

**Complete Purchase Handler**:
```typescript
const handleCompletePurchase = async () => {
  if (!paymentMethod) {
    toast({
      title: "Payment method required",
      description: "Please select a payment method",
      variant: "destructive"
    });
    return;
  }
  
  setIsProcessing(true);
  
  try {
    // Create transaction
    const { data: transaction, error: txError } = await supabase
      .from('checkout_transactions')
      .insert({
        total_amount: totalPrice,
        payment_method: paymentMethod,
        status: 'Completed',
        user_id: userId,
      })
      .select()
      .single();
    
    if (txError) throw txError;
    
    // Create checkout items
    const checkoutItems = cartItems.map(item => ({
      transaction_id: transaction.id,
      book_id: item.id,
      quantity: item.quantity,
      price: item.price,
      user_id: userId,
    }));
    
    await supabase.from('checkout_items').insert(checkoutItems);
    
    // Update book stock and sales
    for (const item of cartItems) {
      await supabase.rpc('process_book_sale', {
        book_id: item.id,
        quantity_sold: item.quantity
      });
    }
    
    // Clear cart
    clearCart();
    
    // Show success
    toast({ title: "Purchase completed successfully!" });
    
    // Navigate to transactions
    navigate('/transactions');
    
  } catch (error) {
    toast({
      title: "Purchase failed",
      description: error.message,
      variant: "destructive"
    });
  } finally {
    setIsProcessing(false);
  }
};
```

**Empty Cart State**:
```
┌─────────────────────────────────────┐
│                                     │
│         🛒                          │
│                                     │
│    Your cart is empty               │
│                                     │
│    [Browse Catalog Button]          │
│                                     │
└─────────────────────────────────────┘
```

### 3. Transactions Page (`src/pages/Transactions.tsx`)

**Purpose**: View and manage sales transaction history

**Component State**:
```typescript
interface TransactionsState {
  dateRange: { from: Date; to: Date } | null;
  paymentMethodFilter: PaymentMethod | null;
  statusFilter: TransactionStatus | null;
  selectedTransaction: Transaction | null;
  showDetailDialog: boolean;
}

type TransactionStatus = "Completed" | "Pending" | "Canceled" | "Returned";
```

**Features**:
- **Date Range Filter**: Filter transactions by date range
- **Payment Method Filter**: Filter by payment method
- **Status Filter**: Filter by transaction status
- **Sorting**: Sort by date or amount
- **Revenue Summary**: Display total revenue
- **Transaction Details**: View full transaction details
- **Return Processing**: Process returns for completed transactions

**Transactions Table**:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Date         │ Transaction ID │ Items │ Total    │ Payment  │ Status      │
├─────────────────────────────────────────────────────────────────────────────┤
│  2024-01-15   │ TXN-001       │ 3     │ $61.57   │ Cash     │ [Completed] │
│  2024-01-14   │ TXN-002       │ 1     │ $19.99   │ Card     │ [Completed] │
│  2024-01-13   │ TXN-003       │ 5     │ $125.00  │ PayPal   │ [Returned]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Revenue Summary**:
```typescript
const totalRevenue = transactions
  .filter(tx => tx.status === 'Completed')
  .reduce((sum, tx) => sum + tx.total_amount, 0);
```

**Transaction Detail Dialog**:
- Transaction ID and date
- Status badge
- List of purchased items with quantities and prices
- Subtotal, tax, and total
- Payment method
- Actions: Print receipt, Process return

### 4. Cart Icon Component (`src/components/CartIcon.tsx`)

**Purpose**: Display cart status in navigation bar

**Features**:
- Cart icon with badge showing item count
- Dropdown on hover/click with cart preview
- Quick view of cart items
- Total amount display
- "Go to Checkout" button

**Badge Display**:
```typescript
<div className="relative">
  <ShoppingCart className="h-6 w-6" />
  {itemCount > 0 && (
    <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
      {itemCount}
    </span>
  )}
</div>
```

## Data Models

### Transaction Interface

```typescript
interface Transaction {
  id: string;                      // UUID
  total_amount: number;            // Total sale amount
  payment_method: PaymentMethod;   // Payment method used
  status: TransactionStatus;       // Transaction status
  transaction_date: string;        // ISO timestamp
  return_date?: string;            // ISO timestamp (if returned)
  user_id: string;                 // Bookstore owner ID
  created_at?: string;             // ISO timestamp
  updated_at?: string;             // ISO timestamp
}

type PaymentMethod = "Credit Card" | "Cash" | "PayPal" | "Bank Transfer" | "Other";
type TransactionStatus = "Completed" | "Pending" | "Canceled" | "Returned";
```

### Checkout Item Interface

```typescript
interface CheckoutItem {
  id: string;                      // UUID
  transaction_id: string;          // FK to checkout_transactions
  book_id: string;                 // FK to books
  quantity: number;                // Quantity purchased
  price: number;                   // Price at time of sale
  user_id: string;                 // Bookstore owner ID
  created_at?: string;             // ISO timestamp
}
```

### Database Schema

```sql
checkout_transactions table:
- id: UUID (PK)
- total_amount: NUMERIC NOT NULL
- payment_method: TEXT NOT NULL
- status: TEXT NOT NULL DEFAULT 'Completed'
- transaction_date: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- return_date: TIMESTAMPTZ
- user_id: UUID NOT NULL (FK to auth.users)
- created_at: TIMESTAMPTZ DEFAULT NOW()
- updated_at: TIMESTAMPTZ DEFAULT NOW()

checkout_items table:
- id: UUID (PK)
- transaction_id: UUID NOT NULL (FK to checkout_transactions)
- book_id: UUID NOT NULL (FK to books)
- quantity: INTEGER NOT NULL
- price: NUMERIC NOT NULL
- user_id: UUID NOT NULL (FK to auth.users)
- created_at: TIMESTAMPTZ DEFAULT NOW()

Indexes:
- idx_transactions_user_id ON checkout_transactions(user_id)
- idx_transactions_date ON checkout_transactions(transaction_date)
- idx_transactions_status ON checkout_transactions(status)
- idx_checkout_items_transaction ON checkout_items(transaction_id)
- idx_checkout_items_book ON checkout_items(book_id)

Foreign Keys:
- transaction_id → checkout_transactions(id) ON DELETE CASCADE
- book_id → books(id) ON DELETE CASCADE
- user_id → auth.users(id) ON DELETE CASCADE
```

## Business Logic

### Stock Validation

```typescript
const validateStock = (bookId: string, requestedQty: number): boolean => {
  const book = books.find(b => b.id === bookId);
  
  if (!book) {
    throw new Error("Book not found");
  }
  
  if (book.stock < requestedQty) {
    throw new Error(`Only ${book.stock} available`);
  }
  
  return true;
};
```

### Inventory Update on Sale

```typescript
// Supabase function
CREATE OR REPLACE FUNCTION process_book_sale(
  book_id UUID,
  quantity_sold INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE books
  SET 
    stock = stock - quantity_sold,
    sales_count = sales_count + quantity_sold,
    status = CASE 
      WHEN stock - quantity_sold = 0 THEN 'Out of Stock'
      ELSE status
    END
  WHERE id = book_id;
END;
$$ LANGUAGE plpgsql;
```

### Return Processing

```typescript
const processReturn = async (transactionId: string, itemsToReturn: string[]) => {
  // Update transaction status
  await supabase
    .from('checkout_transactions')
    .update({
      status: 'Returned',
      return_date: new Date().toISOString()
    })
    .eq('id', transactionId);
  
  // Get checkout items
  const { data: items } = await supabase
    .from('checkout_items')
    .select('*')
    .eq('transaction_id', transactionId)
    .in('id', itemsToReturn);
  
  // Restore stock
  for (const item of items) {
    await supabase.rpc('restore_book_stock', {
      book_id: item.book_id,
      quantity_returned: item.quantity
    });
  }
};
```

## Integration Points

### Books Table Integration

**Stock Checks**: Validate availability before adding to cart and during checkout

**Price Retrieval**: Get current price when adding to cart

**Stock Updates**: Decrement on sale, increment on return

**Sales Tracking**: Increment sales_count on completed transactions

### Cart Context Integration

**Add to Cart from Catalog**: BookCard and BookDetail components use addItem()

**Cart Badge**: Navigation bar displays itemCount from context

**Checkout Page**: Accesses cartItems, updateQuantity, removeItem, clearCart

### React Query Integration

**Transactions Query**:
```typescript
const { data: transactions } = useQuery({
  queryKey: ['transactions', userId],
  queryFn: () => fetchTransactions(userId),
});
```

**Transaction Mutation**:
```typescript
const createTransactionMutation = useMutation({
  mutationFn: (data: TransactionData) => createTransaction(data),
  onSuccess: () => {
    queryClient.invalidateQueries(['transactions']);
    queryClient.invalidateQueries(['books']);
  },
});
```

## Error Handling

**Insufficient Stock**: Display error toast, prevent adding to cart

**Payment Method Missing**: Show validation error, disable checkout button

**Transaction Failed**: Display error message, keep cart intact, allow retry

**Network Errors**: Show error toast with retry option

**Loading States**: Disable buttons and show spinners during operations

## Performance Optimizations

**Cart State**: Use React Context for efficient state management

**Memoization**: Memoize calculated values (totalPrice, itemCount)

**Optimistic Updates**: Update UI immediately, rollback on error

**Database Indexes**: Indexed queries on user_id, transaction_date, status

**Batch Operations**: Process multiple checkout items in single transaction

## Responsive Design

**Desktop**: Two-column layout (cart items + order summary)

**Tablet**: Two-column layout with adjusted spacing

**Mobile**: Single column, stacked layout, full-width buttons

## Testing Strategy

**Unit Tests**: Cart context methods, stock validation, price calculations

**Integration Tests**: Complete checkout flow, return processing, inventory updates

**E2E Tests**: Add to cart → checkout → complete purchase → view transaction

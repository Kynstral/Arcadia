-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT NOT NULL,
  publisher TEXT NOT NULL,
  publication_year INTEGER NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  price NUMERIC NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  language TEXT,
  page_count INTEGER,
  location TEXT,
  rating NUMERIC,
  sales_count INTEGER NOT NULL DEFAULT 0,
  tags TEXT[],
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  joined_date TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create borrowings table
CREATE TABLE IF NOT EXISTS borrowings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  checkout_date TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,
  return_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  condition_on_return TEXT,
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  reminder_date TIMESTAMPTZ,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create checkout_transactions table
CREATE TABLE IF NOT EXISTS checkout_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT,
  status TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  return_date TIMESTAMPTZ,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create checkout_items table
CREATE TABLE IF NOT EXISTS checkout_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES checkout_transactions(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for books
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);

-- Create indexes for members
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);

-- Create indexes for borrowings
CREATE INDEX IF NOT EXISTS idx_borrowings_book_id ON borrowings(book_id);
CREATE INDEX IF NOT EXISTS idx_borrowings_member_id ON borrowings(member_id);
CREATE INDEX IF NOT EXISTS idx_borrowings_status ON borrowings(status);
CREATE INDEX IF NOT EXISTS idx_borrowings_due_date ON borrowings(due_date);
CREATE INDEX IF NOT EXISTS idx_borrowings_user_id ON borrowings(user_id);

-- Create indexes for checkout_transactions
CREATE INDEX IF NOT EXISTS idx_checkout_transactions_customer_id ON checkout_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_checkout_transactions_status ON checkout_transactions(status);
CREATE INDEX IF NOT EXISTS idx_checkout_transactions_date ON checkout_transactions(date);
CREATE INDEX IF NOT EXISTS idx_checkout_transactions_user_id ON checkout_transactions(user_id);

-- Create indexes for checkout_items
CREATE INDEX IF NOT EXISTS idx_checkout_items_transaction_id ON checkout_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_checkout_items_book_id ON checkout_items(book_id);

-- Enable Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowings ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for books
CREATE POLICY "Books are viewable by everyone" ON books FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert books" ON books FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own books" ON books FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own books" ON books FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for members
CREATE POLICY "Members are viewable by everyone" ON members FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert members" ON members FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own members" ON members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own members" ON members FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for borrowings
CREATE POLICY "Borrowings are viewable by everyone" ON borrowings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert borrowings" ON borrowings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own borrowings" ON borrowings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own borrowings" ON borrowings FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for checkout_transactions
CREATE POLICY "Transactions are viewable by everyone" ON checkout_transactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert transactions" ON checkout_transactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own transactions" ON checkout_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON checkout_transactions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for checkout_items
CREATE POLICY "Checkout items are viewable by everyone" ON checkout_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert checkout items" ON checkout_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update checkout items" ON checkout_items FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete checkout items" ON checkout_items FOR DELETE USING (auth.uid() IS NOT NULL);

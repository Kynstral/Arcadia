import { supabase } from "@/integrations/supabase/client";
import {
  Book,
  BookCategory,
  BookStatus,
  CheckoutTransaction,
  DashboardStats,
  PaymentMethod,
  TransactionStatus,
} from "./types";
import { books } from "@/lib/data.ts";

export const getBooks = async (userId?: string | null): Promise<Book[]> => {
  let query = supabase.from("books").select("*").is("deleted_at", null).order("title");

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching books:", error);
    throw new Error(`Error fetching books: ${error.message}`);
  }

  return data.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    publisher: book.publisher,
    publicationYear: book.publication_year,
    description: book.description,
    pageCount: book.page_count,
    category: book.category as BookCategory,
    coverImage: book.cover_image,
    language: book.language,
    price: book.price,
    stock: book.stock,
    status: book.status as BookStatus,
    rating: book.rating,
    tags: book.tags,
    location: book.location,
    created_at: book.created_at,
    updated_at: book.updated_at,
    user_id: book.user_id,
    salesCount: book.sales_count,
  }));
};
export const searchBooks = async (query: string, userId?: string | null): Promise<Book[]> => {
  let dbQuery = supabase
    .from("books")
    .select("*")
    .is("deleted_at", null)
    .or(
      `title.ilike.%${query}%,author.ilike.%${query}%,description.ilike.%${query}%,isbn.ilike.%${query}%`
    )
    .order("title");

  if (userId) {
    dbQuery = dbQuery.eq("user_id", userId);
  }

  const { data, error } = await dbQuery;

  if (error) {
    console.error(`Error searching books with query "${query}":`, error);
    throw new Error(`Error searching books: ${error.message}`);
  }

  return data.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    publisher: book.publisher,
    publicationYear: book.publication_year,
    description: book.description,
    pageCount: book.page_count,
    category: book.category as BookCategory,
    coverImage: book.cover_image,
    language: book.language,
    price: book.price,
    stock: book.stock,
    status: book.status as BookStatus,
    rating: book.rating,
    tags: book.tags,
    location: book.location,
    created_at: book.created_at,
    updated_at: book.updated_at,
    user_id: book.user_id,
    salesCount: book.sales_count,
  }));
};
export const deleteBook = async (id: string, userId?: string | null): Promise<string> => {
  // Soft delete: set deleted_at timestamp instead of actually deleting
  const { error } = await supabase
    .from("books")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: userId,
    })
    .eq("id", id)
    .eq("user_id", userId || "");

  if (error) {
    console.error(`Error moving book to trash with ID ${id}:`, error);
    throw new Error(`Error moving book to trash: ${error.message}`);
  }

  return id;
};

export const restoreBook = async (id: string, userId?: string | null): Promise<string> => {
  const { error } = await supabase
    .from("books")
    .update({
      deleted_at: null,
      deleted_by: null,
    })
    .eq("id", id)
    .eq("user_id", userId || "");

  if (error) {
    console.error(`Error restoring book with ID ${id}:`, error);
    throw new Error(`Error restoring book: ${error.message}`);
  }

  return id;
};

export const permanentlyDeleteBook = async (
  id: string,
  userId?: string | null
): Promise<string> => {
  const { error } = await supabase
    .from("books")
    .delete()
    .eq("id", id)
    .eq("user_id", userId || "");

  if (error) {
    console.error(`Error permanently deleting book with ID ${id}:`, error);
    throw new Error(`Error permanently deleting book: ${error.message}`);
  }

  return id;
};

export const getDeletedBooks = async (userId?: string | null): Promise<Book[]> => {
  let query = supabase
    .from("books")
    .select("*")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching deleted books:", error);
    throw new Error(`Error fetching deleted books: ${error.message}`);
  }

  return data.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    publisher: book.publisher,
    publicationYear: book.publication_year,
    description: book.description,
    pageCount: book.page_count,
    category: book.category as BookCategory,
    coverImage: book.cover_image,
    language: book.language,
    price: book.price,
    stock: book.stock,
    status: book.status as BookStatus,
    rating: book.rating,
    tags: book.tags,
    location: book.location,
    created_at: book.created_at,
    updated_at: book.updated_at,
    user_id: book.user_id,
    salesCount: book.sales_count,
    deleted_at: book.deleted_at,
    deleted_by: book.deleted_by,
  }));
};

export const emptyTrash = async (userId?: string | null): Promise<number> => {
  // Get all deleted books for this user
  const { data: deletedBooks, error: fetchError } = await supabase
    .from("books")
    .select("id")
    .not("deleted_at", "is", null)
    .eq("user_id", userId || "");

  if (fetchError) {
    console.error("Error fetching deleted books:", fetchError);
    throw new Error(`Error fetching deleted books: ${fetchError.message}`);
  }

  if (!deletedBooks || deletedBooks.length === 0) {
    return 0;
  }

  // Permanently delete all
  const { error: deleteError } = await supabase
    .from("books")
    .delete()
    .not("deleted_at", "is", null)
    .eq("user_id", userId || "");

  if (deleteError) {
    console.error("Error emptying trash:", deleteError);
    throw new Error(`Error emptying trash: ${deleteError.message}`);
  }

  return deletedBooks.length;
};

export interface BulkUpdateResult {
  success: number;
  failed: number;
  errors: Array<{ bookId: string; error: string }>;
}

export const bulkUpdateBooks = async (
  bookIds: string[],
  updates: {
    category?: string;
    status?: string;
    publisher?: string;
    location?: string;
    stock?: number;
  },
  userId?: string | null
): Promise<BulkUpdateResult> => {
  const results: BulkUpdateResult = {
    success: 0,
    failed: 0,
    errors: [],
  };

  // Process updates in parallel
  const updatePromises = bookIds.map(async (bookId) => {
    try {
      const { error } = await supabase
        .from("books")
        .update({
          ...(updates.category && { category: updates.category }),
          ...(updates.status && { status: updates.status }),
          ...(updates.publisher && { publisher: updates.publisher }),
          ...(updates.location && { location: updates.location }),
          ...(updates.stock !== undefined && { stock: updates.stock }),
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookId)
        .eq("user_id", userId || "")
        .is("deleted_at", null);

      if (error) {
        throw error;
      }

      results.success++;
    } catch (error: any) {
      results.failed++;
      results.errors.push({
        bookId,
        error: error.message || "Unknown error",
      });
    }
  });

  await Promise.all(updatePromises);

  return results;
};

export const getDashboardStats = async (userId?: string | null): Promise<DashboardStats> => {
  let booksQuery = supabase
    .from("books")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  if (userId) {
    booksQuery = booksQuery.eq("user_id", userId);
  }

  const { count: totalBooks, error: booksError } = await booksQuery;

  if (booksError) {
    console.error("Error fetching total books:", booksError);
    throw new Error(`Error fetching total books: ${booksError.message}`);
  }

  let membersQuery = supabase.from("members").select("*", { count: "exact", head: true });

  if (userId) {
    membersQuery = membersQuery.eq("user_id", userId);
  }

  const { count: totalUsers, error: usersError } = await membersQuery;

  if (usersError && usersError.code !== "PGRST116") {
    console.error("Error fetching total members:", usersError);
    throw new Error(`Error fetching total members: ${usersError.message}`);
  }

  let transactionsQuery = supabase
    .from("checkout_transactions")
    .select("*", { count: "exact", head: true });

  if (userId) {
    transactionsQuery = transactionsQuery.eq("user_id", userId);
  }

  const { count: totalTransactions, error: transactionsError } = await transactionsQuery;

  if (transactionsError) {
    console.error("Error fetching total transactions:", transactionsError);
    throw new Error(`Error fetching total transactions: ${transactionsError.message}`);
  }

  let revenueQuery = supabase.from("checkout_transactions").select("total_amount");

  if (userId) {
    revenueQuery = revenueQuery.eq("user_id", userId);
  }

  const { data: revenueData, error: revenueError } = await revenueQuery;

  if (revenueError) {
    console.error("Error fetching revenue:", revenueError);
    throw new Error(`Error fetching revenue: ${revenueError.message}`);
  }

  const totalRevenue = revenueData.reduce((acc, curr) => acc + curr.total_amount, 0);

  let recentTransactionsQuery = supabase
    .from("checkout_transactions")
    .select("*")
    .order("date", { ascending: false })
    .limit(5);

  if (userId) {
    recentTransactionsQuery = recentTransactionsQuery.eq("user_id", userId);
  }

  const { data: recentTransactionsData, error: recentTransactionsError } =
    await recentTransactionsQuery;

  if (recentTransactionsError) {
    console.error("Error fetching recent transactions:", recentTransactionsError);
    throw new Error(`Error fetching recent transactions: ${recentTransactionsError.message}`);
  }

  const recentTransactions: CheckoutTransaction[] = [];

  for (const transaction of recentTransactionsData) {
    const { data: items, error: itemsError } = await supabase
      .from("checkout_items")
      .select("*")
      .eq("transaction_id", transaction.id);

    if (itemsError) {
      console.error(`Error fetching checkout items for transaction ${transaction.id}:`, itemsError);
      throw new Error(`Error fetching checkout items: ${itemsError.message}`);
    }

    recentTransactions.push({
      id: transaction.id,
      items: items.map((item) => ({
        id: item.id,
        transactionId: item.transaction_id,
        bookId: item.book_id,
        quantity: item.quantity,
        price: item.price,
        title: item.title,
      })),
      totalAmount: transaction.total_amount,
      date: new Date(transaction.date),
      customerId: transaction.customer_id,
      status: transaction.status as TransactionStatus,
      paymentMethod: transaction.payment_method as PaymentMethod,
      returnDate: transaction.return_date ? new Date(transaction.return_date) : undefined,
      user_id: transaction.user_id,
    });
  }

  const { data: popularBooksData, error: popularBooksError } = await supabase
    .from("checkout_items")
    .select(
      `
      book_id,
      quantity,
      books:book_id (
        id,
        title,
        author,
        cover_image,
        isbn,
        category,
        publication_year,
        publisher,
        description,
        price,
        status,
        stock,
        sales_count,
        user_id
      )
    `
    )
    .order("quantity", { ascending: false })
    .limit(5);

  if (popularBooksError) {
    console.error("Error fetching popular books:", popularBooksError);
    throw new Error(`Error fetching popular books: ${popularBooksError.message}`);
  }

  let popularBooks: Book[] = [];

  if (popularBooksData) {
    popularBooks = popularBooksData
      .filter((item) => item.books)
      .map((item) => ({
        id: item.books.id,
        title: item.books.title,
        author: item.books.author,
        isbn: item.books.isbn,
        category: item.books.category as BookCategory,
        publicationYear: item.books.publication_year,
        publisher: item.books.publisher,
        description: item.books.description,
        price: item.books.price,
        status: item.books.status as BookStatus,
        coverImage: item.books.cover_image,
        stock: item.books.stock,
        user_id: item.books.user_id,
        salesCount: item.books.sales_count,
      }));

    if (userId) {
      popularBooks = popularBooks.filter((book) => book.user_id === userId);
    }
  }

  return {
    totalBooks: totalBooks || 0,
    totalUsers: totalUsers || 0,
    totalTransactions: totalTransactions || 0,
    totalRevenue,
    recentTransactions,
    popularBooks,
  };
};

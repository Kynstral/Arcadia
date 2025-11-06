import { supabase } from "@/integrations/supabase/client";
import { Book } from "./types";

export interface DuplicateCheckResult {
  exactISBN: Book[];
  similarTitle: Book[];
  titleAndAuthor: Book[];
  hasDuplicates: boolean;
}

/**
 * Check for potential duplicate books
 * @param book - Partial book data to check
 * @param excludeId - Optional book ID to exclude from results (for editing)
 */
export async function checkDuplicates(
  book: { isbn?: string; title?: string; author?: string },
  excludeId?: string,
): Promise<DuplicateCheckResult> {
  const result: DuplicateCheckResult = {
    exactISBN: [],
    similarTitle: [],
    titleAndAuthor: [],
    hasDuplicates: false,
  };

  // 1. Check for exact ISBN match (highest priority)
  if (book.isbn && book.isbn.trim()) {
    const { data: isbnMatches, error: isbnError } = await supabase
      .from("books")
      .select("*")
      .eq("isbn", book.isbn.trim())
      .is("deleted_at", null);

    if (!isbnError && isbnMatches) {
      result.exactISBN = isbnMatches
        .filter((b) => b.id !== excludeId)
        .map(mapBookFromDb);
    }
  }

  // 2. Check for similar titles using ILIKE (fuzzy matching)
  if (book.title && book.title.trim()) {
    const titleWords = book.title.trim().split(" ").filter((w) => w.length > 3);
    
    if (titleWords.length > 0) {
      // Build a query that checks if any significant word appears in the title
      const { data: titleMatches, error: titleError } = await supabase
        .from("books")
        .select("*")
        .ilike("title", `%${book.title.trim()}%`)
        .is("deleted_at", null)
        .limit(10);

      if (!titleError && titleMatches) {
        result.similarTitle = titleMatches
          .filter((b) => b.id !== excludeId)
          .filter((b) => {
            // Calculate simple similarity score
            const similarity = calculateTitleSimilarity(
              book.title!.toLowerCase(),
              b.title.toLowerCase(),
            );
            return similarity > 0.6;
          })
          .map(mapBookFromDb);
      }
    }
  }

  // 3. Check for title + author combination
  if (book.title && book.author && book.title.trim() && book.author.trim()) {
    const { data: combinedMatches, error: combinedError } = await supabase
      .from("books")
      .select("*")
      .ilike("title", `%${book.title.trim()}%`)
      .ilike("author", `%${book.author.trim()}%`)
      .is("deleted_at", null)
      .limit(10);

    if (!combinedError && combinedMatches) {
      result.titleAndAuthor = combinedMatches
        .filter((b) => b.id !== excludeId)
        .map(mapBookFromDb);
    }
  }

  // Remove duplicates across categories
  const allIds = new Set<string>();
  result.exactISBN = result.exactISBN.filter((b) => {
    if (allIds.has(b.id)) return false;
    allIds.add(b.id);
    return true;
  });
  result.similarTitle = result.similarTitle.filter((b) => {
    if (allIds.has(b.id)) return false;
    allIds.add(b.id);
    return true;
  });
  result.titleAndAuthor = result.titleAndAuthor.filter((b) => {
    if (allIds.has(b.id)) return false;
    allIds.add(b.id);
    return true;
  });

  result.hasDuplicates =
    result.exactISBN.length > 0 ||
    result.similarTitle.length > 0 ||
    result.titleAndAuthor.length > 0;

  return result;
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
function calculateTitleSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Map database book to Book type
 */
function mapBookFromDb(book: any): Book {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    publisher: book.publisher,
    publicationYear: book.publication_year,
    description: book.description,
    pageCount: book.page_count,
    category: book.category,
    coverImage: book.cover_image,
    language: book.language,
    price: book.price,
    stock: book.stock,
    status: book.status,
    rating: book.rating,
    tags: book.tags,
    location: book.location,
    created_at: book.created_at,
    updated_at: book.updated_at,
    user_id: book.user_id,
    salesCount: book.sales_count,
  };
}

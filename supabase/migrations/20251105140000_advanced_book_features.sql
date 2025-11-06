-- Migration: Advanced Book Features
-- Adds support for: soft delete, favorites, duplicate detection, user preferences

-- ============================================================================
-- 1. Add soft delete columns to books table
-- ============================================================================

ALTER TABLE books ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE books ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Create index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_books_deleted_at ON books(deleted_at);

-- ============================================================================
-- 2. Add duplicate detection columns to books table
-- ============================================================================

ALTER TABLE books ADD COLUMN IF NOT EXISTS duplicate_checked BOOLEAN DEFAULT false;
ALTER TABLE books ADD COLUMN IF NOT EXISTS duplicate_of UUID REFERENCES books(id);

CREATE INDEX IF NOT EXISTS idx_books_duplicate_of ON books(duplicate_of);

-- ============================================================================
-- 3. Create favorites table
-- ============================================================================

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- Create indexes for favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_book_id ON favorites(book_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at);

-- Enable RLS for favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for favorites
CREATE POLICY "Users can view their own favorites" 
  ON favorites FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" 
  ON favorites FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
  ON favorites FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. Create user_preferences table
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  keyboard_shortcuts_enabled BOOLEAN DEFAULT true,
  custom_shortcuts JSONB DEFAULT '{}',
  label_template TEXT DEFAULT 'avery-5160',
  export_default_format TEXT DEFAULT 'csv',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for user_preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable RLS for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences" 
  ON user_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
  ON user_preferences FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
  ON user_preferences FOR UPDATE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. Create function for finding similar book titles (fuzzy matching)
-- ============================================================================

-- Enable pg_trgm extension for trigram similarity
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Function to find similar book titles
CREATE OR REPLACE FUNCTION find_similar_titles(
  search_title TEXT,
  threshold REAL DEFAULT 0.6,
  max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  author TEXT,
  isbn TEXT,
  similarity_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.title,
    b.author,
    b.isbn,
    similarity(b.title, search_title) as similarity_score
  FROM books b
  WHERE 
    b.deleted_at IS NULL
    AND similarity(b.title, search_title) > threshold
  ORDER BY similarity_score DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. Create function for cleaning up old trash (30+ days)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_trash()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete books that have been in trash for more than 30 days
  WITH deleted AS (
    DELETE FROM books
    WHERE deleted_at IS NOT NULL
      AND deleted_at < NOW() - INTERVAL '30 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. Create function for bulk book updates
-- ============================================================================

CREATE OR REPLACE FUNCTION bulk_update_books(
  book_ids UUID[],
  update_data JSONB
)
RETURNS TABLE (
  book_id UUID,
  success BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  book_id UUID;
BEGIN
  FOREACH book_id IN ARRAY book_ids
  LOOP
    BEGIN
      -- Update the book with provided data
      UPDATE books
      SET
        category = COALESCE((update_data->>'category')::TEXT, category),
        status = COALESCE((update_data->>'status')::TEXT, status),
        publisher = COALESCE((update_data->>'publisher')::TEXT, publisher),
        location = COALESCE((update_data->>'location')::TEXT, location),
        tags = COALESCE(
          ARRAY(SELECT jsonb_array_elements_text(update_data->'tags')),
          tags
        ),
        updated_at = NOW()
      WHERE id = book_id
        AND deleted_at IS NULL
        AND user_id = auth.uid();
      
      -- Check if update was successful
      IF FOUND THEN
        RETURN QUERY SELECT book_id, true, NULL::TEXT;
      ELSE
        RETURN QUERY SELECT book_id, false, 'Book not found or unauthorized'::TEXT;
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT book_id, false, SQLERRM::TEXT;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. Create indexes for full-text search on books
-- ============================================================================

-- Create GIN index for trigram similarity on title and author
CREATE INDEX IF NOT EXISTS idx_books_title_trgm ON books USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_books_author_trgm ON books USING gin (author gin_trgm_ops);

-- Create index for ISBN lookups
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn) WHERE deleted_at IS NULL;

-- ============================================================================
-- 9. Update RLS policies to exclude soft-deleted books
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Books are viewable by everyone" ON books;

-- Create new policy that excludes deleted books
CREATE POLICY "Books are viewable by everyone (excluding deleted)" 
  ON books FOR SELECT 
  USING (deleted_at IS NULL);

-- Create policy for viewing trash (only own deleted books)
CREATE POLICY "Users can view their own deleted books" 
  ON books FOR SELECT 
  USING (deleted_at IS NOT NULL AND auth.uid() = user_id);

-- ============================================================================
-- 10. Create view for active books (convenience)
-- ============================================================================

CREATE OR REPLACE VIEW active_books AS
SELECT * FROM books
WHERE deleted_at IS NULL;

-- ============================================================================
-- 11. Create trigger to update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to books table
DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to user_preferences table
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 12. Create function to get favorite count for a user
-- ============================================================================

CREATE OR REPLACE FUNCTION get_favorites_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  fav_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO fav_count
  FROM favorites
  WHERE user_id = user_uuid;
  
  RETURN fav_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 13. Create function to get trash count for a user
-- ============================================================================

CREATE OR REPLACE FUNCTION get_trash_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  trash_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO trash_count
  FROM books
  WHERE user_id = user_uuid
    AND deleted_at IS NOT NULL;
  
  RETURN trash_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Migration complete
-- ============================================================================

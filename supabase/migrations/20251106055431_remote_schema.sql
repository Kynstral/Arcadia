drop extension if exists "pg_net";

drop trigger if exists "update_books_updated_at" on "public"."books";

drop trigger if exists "update_user_preferences_updated_at" on "public"."user_preferences";

alter table "public"."books" drop constraint "books_duplicate_of_fkey";

alter table "public"."borrowings" drop constraint "borrowings_book_id_fkey";

alter table "public"."borrowings" drop constraint "borrowings_member_id_fkey";

alter table "public"."checkout_items" drop constraint "checkout_items_book_id_fkey";

alter table "public"."checkout_items" drop constraint "checkout_items_transaction_id_fkey";

alter table "public"."favorites" drop constraint "favorites_book_id_fkey";

drop index if exists "public"."idx_books_author_trgm";

drop index if exists "public"."idx_books_title_trgm";

CREATE INDEX idx_books_author_trgm ON public.books USING gin (author public.gin_trgm_ops);

CREATE INDEX idx_books_title_trgm ON public.books USING gin (title public.gin_trgm_ops);

alter table "public"."books" add constraint "books_duplicate_of_fkey" FOREIGN KEY (duplicate_of) REFERENCES public.books(id) not valid;

alter table "public"."books" validate constraint "books_duplicate_of_fkey";

alter table "public"."borrowings" add constraint "borrowings_book_id_fkey" FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE not valid;

alter table "public"."borrowings" validate constraint "borrowings_book_id_fkey";

alter table "public"."borrowings" add constraint "borrowings_member_id_fkey" FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE not valid;

alter table "public"."borrowings" validate constraint "borrowings_member_id_fkey";

alter table "public"."checkout_items" add constraint "checkout_items_book_id_fkey" FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE SET NULL not valid;

alter table "public"."checkout_items" validate constraint "checkout_items_book_id_fkey";

alter table "public"."checkout_items" add constraint "checkout_items_transaction_id_fkey" FOREIGN KEY (transaction_id) REFERENCES public.checkout_transactions(id) ON DELETE CASCADE not valid;

alter table "public"."checkout_items" validate constraint "checkout_items_transaction_id_fkey";

alter table "public"."favorites" add constraint "favorites_book_id_fkey" FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE not valid;

alter table "public"."favorites" validate constraint "favorites_book_id_fkey";

create or replace view "public"."active_books" as  SELECT id,
    title,
    author,
    isbn,
    publisher,
    publication_year,
    category,
    description,
    cover_image,
    price,
    stock,
    status,
    language,
    page_count,
    location,
    rating,
    sales_count,
    tags,
    user_id,
    created_at,
    updated_at,
    deleted_at,
    deleted_by,
    duplicate_checked,
    duplicate_of
   FROM public.books
  WHERE (deleted_at IS NULL);


CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();



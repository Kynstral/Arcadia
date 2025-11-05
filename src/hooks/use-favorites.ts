import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// Type workaround until we run supabase db pull
const favoritesClient = supabase as any;

export function useFavorites(bookId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check if book is favorited
  const { data: isFavorite = false, isLoading } = useQuery({
    queryKey: ["favorite", bookId, user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await favoritesClient
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("book_id", bookId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking favorite:", error);
        return false;
      }

      return !!data;
    },
    enabled: !!user && !!bookId,
  });

  // Toggle favorite mutation
  const toggleFavorite = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      if (isFavorite) {
        // Remove from favorites
        const { error } = await favoritesClient
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("book_id", bookId);

        if (error) throw error;
      } else {
        // Add to favorites
        const { error} = await favoritesClient
          .from("favorites")
          .insert({ user_id: user.id, book_id: bookId });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite", bookId] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast({
        title: "Success",
        description: isFavorite ? "Removed from favorites" : "Added to favorites",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update favorite: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    isFavorite,
    isLoading,
    toggleFavorite: () => toggleFavorite.mutate(),
    isToggling: toggleFavorite.isPending,
  };
}

// Hook to get all favorites for a user
export function useUserFavorites() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await favoritesClient
        .from("favorites")
        .select(`
          id,
          book_id,
          created_at,
          books (
            id,
            title,
            author,
            isbn,
            category,
            publisher,
            publication_year,
            description,
            cover_image,
            price,
            stock,
            status,
            rating,
            tags,
            location,
            page_count,
            language,
            sales_count,
            user_id,
            created_at,
            updated_at
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching favorites:", error);
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });
}

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  bookId: string;
  variant?: "default" | "ghost" | "outline" | "secondary" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function FavoriteButton({
  bookId,
  variant = "ghost",
  size = "icon",
  className,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isToggling } = useFavorites(bookId);

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size={size}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite();
          }}
          disabled={isToggling}
          className={cn(className)}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star
            className={cn(
              "h-4 w-4 transition-all",
              isFavorite ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary"
            )}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={5}>
        <p>{isFavorite ? "Remove from favorites" : "Add to favorites"}</p>
      </TooltipContent>
    </Tooltip>
  );
}

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, FileEdit, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Book } from "@/lib/types";
import { FavoriteButton } from "./FavoriteButton";

interface BookCardProps {
  book: Book;
  selectionMode: boolean;
  isSelected: boolean;
  userRole?: string | null;
  onToggleSelection: (bookId: string) => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

export function BookCard({
  book,
  selectionMode,
  isSelected,
  userRole,
  onToggleSelection,
  onEdit,
  onDelete,
}: BookCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className={`h-[300px] relative group transition-all ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""
        }`}
    >
      {/* Favorite button - top right */}
      {!selectionMode && (
        <div className="absolute top-2 right-2 z-20">
          <FavoriteButton bookId={book.id} className="bg-background/80 backdrop-blur-sm hover:bg-background" />
        </div>
      )}

      {selectionMode && (
        <div
          className="absolute top-2 left-2 z-20 cursor-pointer transition-transform hover:scale-110"
          onClick={() => onToggleSelection(book.id)}
        >
          {isSelected ? (
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center border-2 border-white shadow-lg animate-in zoom-in-50 duration-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          ) : (
            <div className="w-6 h-6 bg-background/80 backdrop-blur-sm rounded-md flex items-center justify-center border-2 border-muted shadow-md hover:border-primary hover:bg-background"></div>
          )}
        </div>
      )}

      <div className="h-full w-full relative overflow-hidden rounded-lg">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-500">
              {book.title.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        {/* Compact overlay - shows by default */}
        <div className="absolute bottom-0 left-0 right-0 bg-card/70 backdrop-blur-sm border-t p-2 transition-all duration-300 ease-in-out group-hover:bg-card/90 group-hover:p-3">
          <h3 className="font-medium text-sm line-clamp-1 text-foreground">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {book.author}
          </p>

          <div className="flex items-center justify-between mt-1 gap-2">
            {/* Show status badge if not available, otherwise show stock */}
            {book.status !== "Available" ? (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                {book.status}
              </span>
            ) : (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${book.stock <= 0
                  ? "bg-destructive text-destructive-foreground"
                  : book.stock < 5
                    ? "bg-yellow-500 text-white"
                    : "bg-secondary text-secondary-foreground"
                  }`}
              >
                {book.stock} in stock
              </span>
            )}
            {book.price > 0 && (
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded cursor-help">
                    ${book.price.toFixed(2)}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" align="end" sideOffset={5}>
                  <p>{userRole === "Library" ? "Replacement cost" : "Sale price"}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Action buttons - hidden by default, shown on hover with smooth animation */}
          <div className="flex items-center gap-1 mt-0 max-h-0 opacity-0 overflow-hidden transition-all duration-300 ease-in-out group-hover:mt-2 group-hover:max-h-12 group-hover:opacity-100">
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/book/${book.id}`)}
                  className="h-7 rounded-md px-2 py-0 text-xs flex-1"
                  aria-label={`View details for ${book.title}`}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  <span>View</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center" sideOffset={5}>
                <p>View Book Details</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onEdit(book)}
                  className="h-7 rounded-md px-2 py-0 text-xs flex-1"
                  aria-label={`Edit ${book.title}`}
                >
                  <FileEdit className="h-3.5 w-3.5 mr-1" />
                  <span>Edit</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center" sideOffset={5}>
                <p>Edit book</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(book)}
                  className="h-7 w-7 rounded-md p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  aria-label={`Delete ${book.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center" sideOffset={5}>
                <p>Delete</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </Card>
  );
}

import { useEffect, PropsWithChildren, useState, createContext, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface KeyboardShortcutsContextType {
  showHelp: () => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | null>(null);

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error("useKeyboardShortcuts must be used within KeyboardShortcutsProvider");
  }
  return context;
}

const KEYBOARD_SHORTCUTS = {
  "mod+k": { description: "Focus search", action: "focus-search" },
  "mod+n": { description: "Add new book (Books page)", action: "add-book" },
  n: { description: "Add new member (Members page)", action: "add-member" },
  "mod+/": { description: "Show keyboard shortcuts", action: "show-help" },
  escape: { description: "Close modal/dialog", action: "close-modal" },
  "mod+b": { description: "Go to books", action: "navigate-books" },
  "mod+m": { description: "Go to members", action: "navigate-members" },
  "mod+d": { description: "Go to dashboard", action: "navigate-dashboard" },
};

export function KeyboardShortcutsProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;

      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        // Allow Escape to work even in inputs
        if (e.key !== "Escape") return;
      }

      // Mod + K: Focus search
      if (mod && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[type="search"], input[placeholder*="Search" i]'
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }

      // Mod + N: Add new book (only on books page)
      if (mod && e.key === "n" && location.pathname === "/books") {
        e.preventDefault();
        const addButton = document.querySelector(
          'button[aria-label*="Add" i]'
        ) as HTMLButtonElement;
        if (addButton) {
          addButton.click();
        }
      }

      // N (without mod): Add new member (only on members page, not in input)
      if (
        !mod &&
        e.key === "n" &&
        location.pathname === "/members" &&
        target.tagName !== "INPUT" &&
        target.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        // Dispatch custom event that Members page will listen to
        window.dispatchEvent(new CustomEvent("add-member-shortcut"));
      }

      // Mod + /: Show keyboard shortcuts help
      if (mod && e.key === "/") {
        e.preventDefault();
        setShowHelp(true);
      }

      // Mod + B: Go to books
      if (mod && e.key === "b") {
        e.preventDefault();
        navigate("/books");
      }

      // Mod + M: Go to members
      if (mod && e.key === "m") {
        e.preventDefault();
        navigate("/members");
      }

      // Mod + D: Go to dashboard
      if (mod && e.key === "d") {
        e.preventDefault();
        navigate("/dashboard");
      }

      // Escape: Close modals/dialogs
      if (e.key === "Escape") {
        // Let the dialog components handle their own escape
        // This is just for documentation
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, location]);

  const isMac =
    typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modKey = isMac ? "⌘" : "Ctrl";

  return (
    <KeyboardShortcutsContext.Provider value={{ showHelp: () => setShowHelp(true) }}>
      {children}

      {/* Keyboard Shortcuts Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>Use these shortcuts to navigate faster</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {Object.entries(KEYBOARD_SHORTCUTS).map(([key, { description }]) => {
              const displayKey = key
                .replace("mod", modKey)
                .split("+")
                .map((k) => k.charAt(0).toUpperCase() + k.slice(1));

              return (
                <div key={key} className="flex items-center justify-between py-2">
                  <span className="text-sm">{description}</span>
                  <div className="flex gap-1">
                    {displayKey.map((k, i) => (
                      <Badge key={i} variant="outline" className="font-mono">
                        {k}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-xs text-muted-foreground text-center pt-4 border-t">
            Press {modKey} + / to toggle this dialog
          </div>
        </DialogContent>
      </Dialog>
    </KeyboardShortcutsContext.Provider>
  );
}

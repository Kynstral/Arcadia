import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Moon, Sun } from "lucide-react";
import { useAuth } from "@/components/AuthStatusProvider";
import { useTheme } from "@/lib/theme-provider";

export const Header = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <img src="/logo.svg" alt="Arcadia" className="w-10 h-10" />
          <span className="text-xl font-bold tracking-tight text-primary">
            Arcadia
          </span>
        </Link>

        <nav className="hidden md:flex gap-2">
          <a
            href="#features"
            className="text-sm font-bold text-muted-foreground hover:text-primary hover:bg-primary/15 transition-all px-4 py-2 rounded-lg"
          >
            Features
          </a>
          <a
            href="#testimonials"
            className="text-sm font-bold text-muted-foreground hover:text-primary hover:bg-primary/15 transition-all px-4 py-2 rounded-lg"
          >
            Testimonials
          </a>
          <a
            href="#pricing"
            className="text-sm font-bold text-muted-foreground hover:text-primary hover:bg-primary/15 transition-all px-4 py-2 rounded-lg"
          >
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9 rounded-lg hover:bg-muted cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-foreground" />
            ) : (
              <Moon className="h-5 w-5 text-foreground" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          {user ? (
            <Link to="/dashboard">
              <Button
                variant="default"
                size="sm"
                className="gap-2 px-4 font-medium"
              >
                Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="font-medium">
                  Log in
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="shadow-xs px-4 font-medium">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

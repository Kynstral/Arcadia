import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthStatusProvider, useAuth } from "./components/AuthStatusProvider";
import { ScrollbarStyles } from "@/components/ScrollbarStyles.tsx";
import { useState, lazy, Suspense } from "react";
import Sidebar from "./components/Sidebar";
import { CartProvider } from "@/hooks/use-cart.tsx";

// Lazy load all page components
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Index = lazy(() => import("./pages/Index"));
const Catalog = lazy(() => import("./pages/Catalog"));
const Books = lazy(() => import("./pages/Books"));
const BookDetail = lazy(() => import("./pages/BookDetail"));
const EditBook = lazy(() => import("./pages/EditBook"));
const Members = lazy(() => import("./pages/Members"));
const EditMember = lazy(() => import("./pages/EditMember"));
const BookCirculation = lazy(() => import("./pages/BookCirculation.tsx"));
const Checkout = lazy(() => import("./pages/Checkout.tsx"));
const Transactions = lazy(() => import("./pages/Transactions.tsx"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-pulse text-center">
      <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
      <p className="text-muted-foreground">Please wait a moment</p>
    </div>
  </div>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className="flex-1 overflow-y-auto p-8 bg-background text-foreground">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">
            Please wait while we prepare your dashboard
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <Layout>{children}</Layout>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthStatusProvider>
          <ScrollbarStyles />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CartProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route
                    path="/onboarding"
                    element={
                      <ProtectedRoute>
                        <Onboarding />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/catalog"
                    element={
                      <ProtectedRoute>
                        <Catalog />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/books"
                    element={
                      <ProtectedRoute>
                        <Books />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/book/:id"
                    element={
                      <ProtectedRoute>
                        <BookDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/books/edit/:id"
                    element={
                      <ProtectedRoute>
                        <EditBook />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/members"
                    element={
                      <ProtectedRoute>
                        <Members />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/members/edit/:id"
                    element={
                      <ProtectedRoute>
                        <EditMember />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/book-circulation"
                    element={
                      <ProtectedRoute>
                        <BookCirculation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/transactions"
                    element={
                      <ProtectedRoute>
                        <Transactions />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </CartProvider>
          </BrowserRouter>
        </AuthStatusProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

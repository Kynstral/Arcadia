import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isProfileComplete } from "@/lib/auth-utils";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error processing auth callback:", error);
          navigate("/auth");
          return;
        }

        const session = data.session;
        const user = session?.user;

        if (!session || !user) {
          navigate("/auth");
          return;
        }

        // Check if user profile is complete
        if (isProfileComplete(user)) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      } catch (error) {
        console.error("Unexpected error in auth callback:", error);
        navigate("/auth");
      }
    };

    processOAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-center">
        <h2 className="text-2xl font-semibold mb-2">
          Completing authentication...
        </h2>
        <p className="text-muted-foreground">
          You'll be redirected in a moment
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;

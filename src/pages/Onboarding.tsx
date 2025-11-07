import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserRole = "Library" | "Book Store";

const Onboarding = () => {
  const [role, setRole] = useState<UserRole>("Library");
  const [organizationName, setOrganizationName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const getOrganizationLabel = () => {
    return role === "Library" ? "Name of Library" : "Book Store Name";
  };

  const getOrganizationPlaceholder = () => {
    return role === "Library" ? "Central Library" : "Book Haven";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = organizationName.trim();
    if (trimmedName.length < 2) {
      toast({
        variant: "destructive",
        title: "Invalid name",
        description: "Organization name must be at least 2 characters long.",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          role: role,
          full_name: trimmedName,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Welcome to Arcadia!",
        description: `Your ${role.toLowerCase()} profile has been set up successfully.`,
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating user metadata:", error);
      toast({
        variant: "destructive",
        title: "Setup failed",
        description: "Failed to complete your profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md bg-card/95 backdrop-blur-xs border-0 shadow-lg">
        <CardContent className="pt-8 pb-6 px-6">
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.svg" alt="arcadia-logo" className="h-12 w-12 text-primary mb-2" />
            <h1 className="text-2xl font-bold text-primary">Welcome to Arcadia</h1>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Let's set up your profile to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-foreground/90">
                Select your role
              </Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
                disabled={loading}
              >
                <SelectTrigger className="bg-muted/50 border-muted">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Library">Library</SelectItem>
                  <SelectItem value="Book Store">Book Store</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationName" className="text-foreground/90">
                {getOrganizationLabel()}
              </Label>
              <Input
                id="organizationName"
                placeholder={getOrganizationPlaceholder()}
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                disabled={loading}
                className="bg-muted/50 border-muted"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={loading || organizationName.trim().length < 2}
              size="lg"
            >
              {loading ? "Completing setup..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;

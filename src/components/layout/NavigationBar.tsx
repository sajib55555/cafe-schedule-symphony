import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, Settings, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export function NavigationBar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    try {
      // First check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // If we have a valid session, try to sign out properly
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Sign out error:', error);
          // If it's a session error, we can still proceed with navigation
          if (error.message.includes('session') || error.status === 403) {
            navigate("/auth", { replace: true });
            return;
          }
          throw error;
        }
      } else {
        // If no valid session exists, just navigate to auth
        navigate("/auth", { replace: true });
        return;
      }

      toast({
        title: "Success",
        description: "You have been signed out successfully.",
        variant: "default",
      });

      navigate("/auth", { replace: true });
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: "Error",
        description: "An error occurred while signing out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <nav className="bg-white border-b px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/wages")}
            className="gap-2"
          >
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Wages Analysis</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/settings")}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
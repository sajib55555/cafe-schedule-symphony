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
      // First clear any existing session data
      await supabase.auth.clearSession();
      
      // Then attempt to sign out
      const { error } = await supabase.auth.signOut({
        scope: 'local'  // Use local scope instead of global to avoid session validation
      });
      
      if (error) {
        // Check for session-related errors
        if (error.message.includes('session') || error.status === 403) {
          // If it's a session error, just clear the session and proceed with navigation
          console.log('Session error during sign out:', error);
          await supabase.auth.clearSession();
        } else {
          throw error;
        }
      }

      toast({
        title: "Success",
        description: "You have been signed out successfully.",
        variant: "default",
      });

      // Navigate after successful sign out
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
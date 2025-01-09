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
      await supabase.auth.signOut();
      
      // Always navigate to auth page and show success message
      navigate("/auth", { replace: true });
      
      toast({
        title: "Success",
        description: "You have been signed out successfully.",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Sign out error:", error);
      
      // Navigate to auth page even if there's an error
      navigate("/auth", { replace: true });
      
      toast({
        title: "Notice",
        description: "You have been signed out.",
        variant: "default",
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
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { DollarSign, Settings, LogOut } from "lucide-react";

export function Header() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { error } = await supabase.auth.signOut({
        scope: 'local'
      });
      
      if (error) {
        if (error.message.includes('session') || error.status === 403) {
          console.log('Session error during sign out, clearing local state');
          await supabase.auth.signOut({ scope: 'local' });
          navigate("/auth");
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "You have been signed out successfully.",
        variant: "default",
      });

      navigate("/auth");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while signing out.",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleWagesAnalysis = () => {
    navigate("/wages");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-secondary">Café Schedule Manager</h1>
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary"
            onClick={handleWagesAnalysis}
            className="flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            <span>Wages Analysis</span>
          </Button>
          <Button 
            variant="outline"
            onClick={handleSettings}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSignOut} 
            disabled={isSigningOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
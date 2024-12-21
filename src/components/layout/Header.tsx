import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

export function Header() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    // Check session status when component mounts
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevent multiple sign-out attempts
    
    setIsSigningOut(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No active session found, redirecting to auth page');
        navigate("/auth");
        return;
      }

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        if (error.message.includes('session_not_found')) {
          console.log('Session not found, redirecting to auth page');
          navigate("/auth");
          return;
        }
        throw error;
      }

      navigate("/auth");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: "Notice",
        description: "You have been signed out.",
        variant: "default",
      });
      navigate("/auth");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-secondary">Café Schedule Manager</h1>
        <Button variant="outline" onClick={handleSignOut} disabled={isSigningOut}>
          {isSigningOut ? 'Signing out...' : 'Sign Out'}
        </Button>
      </div>
    </header>
  );
}
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function LogoutButton({ className }: { className?: string }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // First try to get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // If we have a session, try to sign out locally first
        await supabase.auth.signOut({ scope: 'local' });
        
        // Then attempt global sign out only if we had a valid session
        try {
          await supabase.auth.signOut({ scope: 'global' });
        } catch (globalError: any) {
          // Log but don't throw for global signout errors
          console.log('Global sign out error (non-critical):', globalError);
        }
        
        toast.success("Successfully logged out");
      } else {
        console.log('No active session found');
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      
      // Attempt local signout regardless of error
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (localError) {
        console.error('Local signout error:', localError);
      }
      
      // Only show error toast for non-session errors
      if (!error.message?.includes('session_not_found')) {
        toast.error("An error occurred during logout");
      }
    } finally {
      // Always clear local storage and redirect
      localStorage.clear();
      navigate("/auth");
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="ghost"
      size="sm"
      className={className}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  );
}
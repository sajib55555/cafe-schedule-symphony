import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function LogoutButton({ className }: { className?: string }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // First clear any local session data
      await supabase.auth.signOut({ scope: 'local' });
      
      try {
        // Then attempt to clear global session
        await supabase.auth.signOut({ scope: 'global' });
      } catch (globalError) {
        // If global signout fails, that's okay - we've already cleared local session
        console.log('Global sign out failed, but local session was cleared:', globalError);
      }

      console.log('Successfully signed out');
      toast.success("Successfully logged out");
      
      // Always navigate to auth page after clearing session
      navigate("/auth");
    } catch (error: any) {
      console.error("Error during logout:", error);
      
      // Even if there's an error, clear local session and redirect
      await supabase.auth.signOut({ scope: 'local' });
      navigate("/auth");
      
      // Show error toast only if it's not a session_not_found error
      if (!error.message?.includes('session_not_found')) {
        toast.error("An error occurred during logout");
      }
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
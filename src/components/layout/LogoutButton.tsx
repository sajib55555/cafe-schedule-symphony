import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function LogoutButton({ className }: { className?: string }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // First check if we have a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error checking session:', sessionError);
        // If there's a session error, we'll just clear everything and redirect
        await supabase.auth.signOut({ scope: 'local' });
        navigate("/auth");
        return;
      }

      if (!session) {
        console.log('No active session found, redirecting to auth');
        navigate("/auth");
        return;
      }

      // Try to sign out
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during sign out:', error);
        if (error.message.includes('session_not_found')) {
          // Session is already invalid, just redirect
          navigate("/auth");
          return;
        }
        toast.error(error.message || "Failed to log out");
        return;
      }
      
      console.log('Successfully signed out');
      toast.success("Successfully logged out");
      navigate("/auth");
    } catch (error: any) {
      console.error("Error logging out:", error);
      // In case of any error, attempt to clear local session
      await supabase.auth.signOut({ scope: 'local' });
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
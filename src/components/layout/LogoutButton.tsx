import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function LogoutButton({ className }: { className?: string }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // First clear all local storage to ensure clean state
      localStorage.clear();
      
      // Attempt local signout without global scope
      const { error } = await supabase.auth.signOut({
        scope: 'local'
      });
      
      if (error) {
        console.error('Logout error:', error);
        // Only show error for non-session related issues
        if (!error.message?.includes('session_not_found')) {
          toast.error("An error occurred during logout");
        }
      } else {
        toast.success("Successfully logged out");
      }
    } catch (error: any) {
      console.error('Logout error:', error);
    } finally {
      // Always redirect to auth page
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
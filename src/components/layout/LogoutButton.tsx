import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function LogoutButton({ className }: { className?: string }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Clear local storage first
      localStorage.clear();
      
      // Simple local signout
      await supabase.auth.signOut();
      
      toast.success("Successfully logged out");
      
    } catch (error: any) {
      console.error('Logout error:', error);
      // Only show error for non-session related issues
      if (!error.message?.includes('session_not_found')) {
        toast.error("An error occurred during logout");
      }
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
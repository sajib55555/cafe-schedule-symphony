import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function LogoutButton({ className }: { className?: string }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during sign out:', error);
        toast.error(error.message || "Failed to log out");
        return;
      }
      
      console.log('Successfully signed out');
      toast.success("Successfully logged out");
      navigate("/auth");
    } catch (error: any) {
      console.error("Error logging out:", error);
      toast.error(error.message || "Failed to log out");
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
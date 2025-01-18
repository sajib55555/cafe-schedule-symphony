import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarDays, Users, DollarSign, Settings, Calendar } from "lucide-react";

export function NavigationBar() {
  const { session } = useAuth();

  if (!session) return null;

  return (
    <nav className="flex space-x-4 lg:space-x-6 mx-6">
      <Button asChild variant="ghost">
        <Link to="/">
          <CalendarDays className="h-4 w-4 mr-2" />
          Schedule
        </Link>
      </Button>
      <Button asChild variant="ghost">
        <Link to="/staff">
          <Users className="h-4 w-4 mr-2" />
          Staff
        </Link>
      </Button>
      <Button asChild variant="ghost">
        <Link to="/wages">
          <DollarSign className="h-4 w-4 mr-2" />
          Wages
        </Link>
      </Button>
      <Button asChild variant="ghost">
        <Link to="/holiday">
          <Calendar className="h-4 w-4 mr-2" />
          Holiday Tracking
        </Link>
      </Button>
      <Button asChild variant="ghost">
        <Link to="/settings">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Link>
      </Button>
    </nav>
  );
}
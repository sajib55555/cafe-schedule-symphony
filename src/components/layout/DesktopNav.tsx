import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";

export function DesktopNav() {
  return (
    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
      <Link
        to="/dashboard"
        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
      >
        Schedule
      </Link>
      <Link
        to="/staff"
        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
      >
        Staff
      </Link>
      <Link
        to="/tasks"
        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
      >
        Tasks
      </Link>
      <Link
        to="/wages"
        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
      >
        Wages
      </Link>
      <Link
        to="/holiday"
        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
      >
        Holiday
      </Link>
      <Link
        to="/hr-advisor"
        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
      >
        <MessageSquare className="h-4 w-4 mr-1" />
        AI HR
      </Link>
      <Link
        to="/settings"
        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
      >
        Settings
      </Link>
    </div>
  );
}
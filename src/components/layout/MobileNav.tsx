import { Link } from "react-router-dom";
import { LogoutButton } from "./LogoutButton";
import { MessageSquare } from "lucide-react";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div className="sm:hidden">
      <div className="pt-2 pb-3 space-y-1">
        <Link
          to="/dashboard"
          className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
          onClick={onClose}
        >
          Dashboard
        </Link>
        <Link
          to="/staff"
          className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
          onClick={onClose}
        >
          Staff
        </Link>
        <Link
          to="/tasks"
          className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
          onClick={onClose}
        >
          Tasks
        </Link>
        <Link
          to="/wages"
          className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
          onClick={onClose}
        >
          Wages
        </Link>
        <Link
          to="/holiday"
          className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
          onClick={onClose}
        >
          Holiday
        </Link>
        <Link
          to="/hr-advisor"
          className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
          onClick={onClose}
        >
          <div className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            AI HR
          </div>
        </Link>
        <Link
          to="/settings"
          className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
          onClick={onClose}
        >
          Settings
        </Link>
        <LogoutButton className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50" />
      </div>
    </div>
  );
}
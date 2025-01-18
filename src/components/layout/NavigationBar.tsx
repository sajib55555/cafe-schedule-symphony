import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { LogoutButton } from "./LogoutButton";

export function NavigationBar() {
  const { session } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold"><span className="text-[#E67E22]">Easy</span><span className="text-[#A5B81D]">Rotas</span></span>
            </Link>
            {session && <DesktopNav />}
          </div>
          <div className="flex items-center">
            {session && (
              <>
                <LogoutButton className="hidden sm:inline-flex text-gray-700 hover:text-gray-900" />
                <Button
                  onClick={toggleMobileMenu}
                  variant="ghost"
                  size="sm"
                  className="sm:hidden"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {session && (
        <MobileNav
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
}
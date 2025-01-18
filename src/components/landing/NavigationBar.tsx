import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const NavigationBar = () => {
  const navigate = useNavigate();
  
  const handleSignUp = () => {
    navigate('/auth', { state: { mode: 'signup' } });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              EasyRotas
            </div>
          </div>
          <Button 
            onClick={handleSignUp}
            className="bg-primary hover:bg-primary/90"
          >
            Try EasyRotas For Free
          </Button>
        </div>
      </div>
    </nav>
  );
};
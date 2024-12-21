import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

export const WagesHeader = () => {
  const navigate = useNavigate();

  const handleBackToIndex = () => {
    navigate("/dashboard");
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Staff Wages Analysis</h1>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleBackToIndex}
        className="flex items-center gap-2"
      >
        <Home className="h-4 w-4" />
        Back to Dashboard
      </Button>
    </div>
  );
};
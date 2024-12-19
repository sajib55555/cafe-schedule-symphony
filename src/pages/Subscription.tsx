import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Subscription = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Subscription Management</h1>
          <p className="text-xl text-muted-foreground">
            Manage your subscription and billing details
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => navigate('/upgrade')}
          >
            View Plans & Upgrade
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
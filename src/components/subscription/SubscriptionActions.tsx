import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const SubscriptionActions = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-lg shadow-lg p-8 max-w-md mx-auto">
      <Button 
        className="w-full" 
        size="lg"
        onClick={() => navigate('/upgrade')}
      >
        View Plans & Upgrade
      </Button>
    </div>
  );
};

export default SubscriptionActions;
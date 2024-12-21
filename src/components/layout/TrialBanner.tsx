import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TrialBannerProps {
  daysLeft: number;
}

export function TrialBanner({ daysLeft }: TrialBannerProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate("/subscription");
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-primary-foreground bg-primary px-3 py-1 rounded-full">
        {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left in trial
      </span>
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={handleUpgrade}
      >
        Upgrade Now
      </Button>
    </div>
  );
}
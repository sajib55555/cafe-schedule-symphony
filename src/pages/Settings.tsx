import { ScheduleRulesForm } from "@/components/settings/schedule/ScheduleRulesForm";
import { UserProfile } from "@/components/profile/UserProfile";
import { Layout } from "@/components/Layout";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChartBar, DollarSign, Home } from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();

  const handleNavigateToDashboard = () => {
    navigate("/");
  };

  const handleNavigateToWages = () => {
    navigate("/wages");
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Settings</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNavigateToDashboard}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleNavigateToWages}
              className="flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              <ChartBar className="h-4 w-4" />
              Wages Analysis
            </Button>
          </div>
        </div>
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Profile Settings</h2>
            <UserProfile />
          </section>
          
          <Separator className="my-8" />
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Schedule Rules</h2>
            <ScheduleRulesForm />
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
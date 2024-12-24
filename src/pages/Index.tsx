import { EmployeeList } from "@/components/EmployeeList";
import { WeeklySchedule } from "@/components/WeeklySchedule";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChartBar, DollarSign, Rocket, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { AIScheduleHistory } from "@/components/schedule/AIScheduleHistory";

const Index = () => {
  const navigate = useNavigate();
  const { hasAccess } = useAuth();

  const handleWagesAnalysis = () => {
    navigate("/wages");
  };

  const handleUpgrade = () => {
    navigate("/upgrade");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#FDF6E3] p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="text-center mb-12 relative">
            <h1 className="text-4xl font-bold text-secondary mb-2">Café Schedule Manager</h1>
            <p className="text-gray-600">Easily manage your staff schedule</p>
            <div className="absolute top-0 right-0 flex flex-col gap-2">
              <Button 
                variant="secondary"
                size="lg"
                onClick={handleWagesAnalysis}
                className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-secondary to-secondary/90"
              >
                <DollarSign className="h-5 w-5" />
                <ChartBar className="h-5 w-5" />
                <span className="font-semibold">Wages Analysis</span>
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={handleSettings}
                className="flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 bg-white hover:bg-gray-50"
              >
                <Settings className="h-5 w-5 text-secondary" />
                <span className="font-medium text-secondary">Settings & Profile</span>
              </Button>
              {!hasAccess && (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleUpgrade}
                  className="flex items-center gap-2"
                >
                  <Rocket className="h-4 w-4" />
                  Upgrade Now
                </Button>
              )}
              <AIScheduleHistory />
            </div>
          </header>
          
          <div className="grid md:grid-cols-[300px,1fr] gap-8">
            <aside>
              <EmployeeList />
            </aside>
            <main>
              <WeeklySchedule />
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
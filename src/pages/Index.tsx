import { EmployeeList } from "@/components/EmployeeList";
import { WeeklySchedule } from "@/components/WeeklySchedule";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChartBar, DollarSign, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";

const Index = () => {
  const navigate = useNavigate();
  const { hasAccess } = useAuth();

  const handleWagesAnalysis = () => {
    navigate("/wages");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#FDF6E3] p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center mb-12 relative">
            <div className="absolute top-0 right-0 flex gap-3">
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
            </div>
          </div>
          
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
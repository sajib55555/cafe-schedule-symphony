import { EmployeeList } from "@/components/EmployeeList";
import { WeeklySchedule } from "@/components/WeeklySchedule";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DollarSign, Rocket } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { UserProfile } from "@/components/profile/UserProfile";

const Index = () => {
  const navigate = useNavigate();
  const { hasAccess } = useAuth();

  const handleWagesAnalysis = () => {
    navigate("/wages");
  };

  const handleUpgrade = () => {
    navigate("/upgrade");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#FDF6E3] p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="text-center mb-12 relative">
            <h1 className="text-4xl font-bold text-secondary mb-2">Café Schedule Manager</h1>
            <p className="text-gray-600">Easily manage your staff schedule</p>
            <div className="absolute top-0 right-0 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleWagesAnalysis}
                className="flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Wages Analysis
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
            </div>
          </header>
          
          <UserProfile />
          
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
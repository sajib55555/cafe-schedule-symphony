import { EmployeeList } from "@/components/EmployeeList";
import { WeeklySchedule } from "@/components/WeeklySchedule";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";

const Index = () => {
  const { hasAccess } = useAuth();

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
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
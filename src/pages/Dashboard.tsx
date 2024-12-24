import { Layout } from "@/components/Layout";
import { EmployeeList } from "@/components/EmployeeList";
import { WeeklySchedule } from "@/components/WeeklySchedule";

const Dashboard = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-[#FDF6E3] p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-secondary mb-2">Dashboard</h1>
            <p className="text-gray-600">Manage your staff and schedule</p>
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

export default Dashboard;
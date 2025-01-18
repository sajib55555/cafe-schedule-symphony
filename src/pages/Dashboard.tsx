import { Layout } from "@/components/Layout";
import { WeeklySchedule } from "@/components/WeeklySchedule";
import { EmployeeList } from "@/components/EmployeeList";

export default function Dashboard() {
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
}
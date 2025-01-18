import { Layout } from "@/components/Layout";
import { WeeklySchedule } from "@/components/WeeklySchedule";

export default function Dashboard() {
  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <main>
            <WeeklySchedule />
          </main>
        </div>
      </div>
    </Layout>
  );
}
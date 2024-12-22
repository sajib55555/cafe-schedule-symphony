import { ScheduleRulesForm } from "@/components/settings/schedule/ScheduleRulesForm";
import { UserProfile } from "@/components/profile/UserProfile";
import { Layout } from "@/components/Layout";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold">Settings</h1>
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
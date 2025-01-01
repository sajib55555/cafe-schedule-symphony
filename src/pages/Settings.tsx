import { Layout } from "@/components/Layout";
import { UserProfile } from "@/components/profile/UserProfile";
import { ScheduleRulesForm } from "@/components/settings/ScheduleRulesForm";
import { DeleteAccountButton } from "@/components/profile/DeleteAccountButton";

const Settings = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Profile Settings</h2>
            <div className="bg-white shadow rounded-lg p-6">
              <UserProfile />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Schedule Rules</h2>
            <div className="bg-white shadow rounded-lg p-6">
              <ScheduleRulesForm />
            </div>
          </section>
        </div>

        <section>
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Danger Zone</h2>
          <div className="bg-white shadow rounded-lg p-6">
            <DeleteAccountButton />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Settings;
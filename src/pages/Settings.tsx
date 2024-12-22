import { ScheduleRulesForm } from "@/components/settings/schedule/ScheduleRulesForm";

const Settings = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <ScheduleRulesForm />
    </div>
  );
};

export default Settings;
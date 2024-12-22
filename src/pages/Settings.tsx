import { ScheduleRulesForm } from "@/components/settings/ScheduleRulesForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Settings = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Schedule Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleRulesForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
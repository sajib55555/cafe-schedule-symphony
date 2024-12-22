import { useScheduleRules } from "../hooks/useScheduleRules";
import { ScheduleRulesList } from "./ScheduleRulesList";
import { AddRuleButton } from "./AddRuleButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ScheduleRulesForm() {
  const { rules, loading, addRule, updateRule, deleteRule } = useScheduleRules();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Rules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ScheduleRulesList
          rules={rules}
          onUpdate={updateRule}
          onDelete={deleteRule}
        />
        <AddRuleButton onClick={addRule} />
      </CardContent>
    </Card>
  );
}
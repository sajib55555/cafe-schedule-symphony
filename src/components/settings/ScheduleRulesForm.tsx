import { Button } from "@/components/ui/button";
import { useScheduleRules } from "./hooks/useScheduleRules";
import { ScheduleRuleItem } from "./ScheduleRuleItem";

export function ScheduleRulesForm() {
  const { rules, loading, addRule, updateRule, deleteRule } = useScheduleRules();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {rules.map((rule, index) => (
          <ScheduleRuleItem
            key={rule.id}
            rule={rule}
            onUpdate={(field, value) => updateRule(index, field, value)}
            onDelete={() => rule.id && deleteRule(rule.id)}
          />
        ))}
      </div>

      <Button onClick={addRule}>Add New Rule</Button>
    </div>
  );
}
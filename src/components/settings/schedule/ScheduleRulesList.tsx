import { ScheduleRule } from "../types";
import { ScheduleRuleItem } from "./ScheduleRuleItem";

interface ScheduleRulesListProps {
  rules: ScheduleRule[];
  onUpdate: (index: number, field: keyof ScheduleRule, value: string | number) => void;
  onDelete: (id: number) => void;
}

export function ScheduleRulesList({ rules, onUpdate, onDelete }: ScheduleRulesListProps) {
  return (
    <div className="space-y-4">
      {rules.map((rule, index) => (
        <ScheduleRuleItem
          key={rule.id}
          rule={rule}
          onUpdate={(field, value) => onUpdate(index, field, value)}
          onDelete={() => rule.id && onDelete(rule.id)}
        />
      ))}
    </div>
  );
}
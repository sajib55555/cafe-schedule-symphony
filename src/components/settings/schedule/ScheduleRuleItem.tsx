import { ScheduleRule, DAYS, ROLES } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";

interface ScheduleRuleItemProps {
  rule: ScheduleRule;
  onUpdate: (field: keyof ScheduleRule, value: string | number) => void;
  onDelete: () => void;
}

export function ScheduleRuleItem({ rule, onUpdate, onDelete }: ScheduleRuleItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <Select
        value={rule.role}
        onValueChange={(value) => onUpdate("role", value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((role) => (
            <SelectItem key={role} value={role}>
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={rule.day_of_week.toString()}
        onValueChange={(value) => onUpdate("day_of_week", parseInt(value))}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select day" />
        </SelectTrigger>
        <SelectContent>
          {DAYS.map((day) => (
            <SelectItem key={day.value} value={day.value.toString()}>
              {day.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="time"
        value={rule.start_time}
        onChange={(e) => onUpdate("start_time", e.target.value)}
        className="w-[150px]"
      />

      <Input
        type="time"
        value={rule.end_time}
        onChange={(e) => onUpdate("end_time", e.target.value)}
        className="w-[150px]"
      />

      <Input
        type="number"
        min="0"
        value={rule.min_staff}
        onChange={(e) => onUpdate("min_staff", parseInt(e.target.value))}
        className="w-[100px]"
        placeholder="Min staff"
      />

      <Input
        type="number"
        min={rule.min_staff}
        value={rule.max_staff}
        onChange={(e) => onUpdate("max_staff", parseInt(e.target.value))}
        className="w-[100px]"
        placeholder="Max staff"
      />

      <Button
        variant="destructive"
        size="icon"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
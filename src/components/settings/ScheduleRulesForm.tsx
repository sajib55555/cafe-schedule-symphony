import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";

interface ScheduleRule {
  id?: number;
  role: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const ROLES = ["Barista", "Floor"];

export function ScheduleRulesForm() {
  const [rules, setRules] = useState<ScheduleRule[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", session?.user?.id)
        .maybeSingle();

      if (!profile?.company_id) {
        toast({
          title: "Error",
          description: "Company not found",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("schedule_rules")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("day_of_week", { ascending: true });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error("Error fetching rules:", error);
      toast({
        title: "Error",
        description: "Failed to fetch schedule rules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async () => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", session?.user?.id)
        .maybeSingle();

      if (!profile?.company_id) {
        toast({
          title: "Error",
          description: "Company not found",
          variant: "destructive",
        });
        return;
      }

      const newRule = {
        company_id: profile.company_id,
        role: ROLES[0],
        day_of_week: 1,
        start_time: "09:00",
        end_time: "17:00",
      };

      const { data, error } = await supabase
        .from("schedule_rules")
        .insert([newRule])
        .select()
        .single();

      if (error) throw error;
      setRules([...rules, data]);
      toast({
        title: "Success",
        description: "Schedule rule added",
      });
    } catch (error) {
      console.error("Error adding rule:", error);
      toast({
        title: "Error",
        description: "Failed to add schedule rule",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRule = async (index: number, field: keyof ScheduleRule, value: string | number) => {
    try {
      const updatedRule = { ...rules[index], [field]: value };
      const { error } = await supabase
        .from("schedule_rules")
        .update(updatedRule)
        .eq("id", updatedRule.id);

      if (error) throw error;

      const newRules = [...rules];
      newRules[index] = updatedRule;
      setRules(newRules);

      toast({
        title: "Success",
        description: "Schedule rule updated",
      });
    } catch (error) {
      console.error("Error updating rule:", error);
      toast({
        title: "Error",
        description: "Failed to update schedule rule",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRule = async (id: number) => {
    try {
      const { error } = await supabase
        .from("schedule_rules")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setRules(rules.filter(rule => rule.id !== id));
      toast({
        title: "Success",
        description: "Schedule rule deleted",
      });
    } catch (error) {
      console.error("Error deleting rule:", error);
      toast({
        title: "Error",
        description: "Failed to delete schedule rule",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {rules.map((rule, index) => (
          <div key={rule.id} className="flex items-center gap-4 p-4 border rounded-lg">
            <Select
              value={rule.role}
              onValueChange={(value) => handleUpdateRule(index, "role", value)}
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
              onValueChange={(value) => handleUpdateRule(index, "day_of_week", parseInt(value))}
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
              onChange={(e) => handleUpdateRule(index, "start_time", e.target.value)}
              className="w-[150px]"
            />

            <Input
              type="time"
              value={rule.end_time}
              onChange={(e) => handleUpdateRule(index, "end_time", e.target.value)}
              className="w-[150px]"
            />

            <Button
              variant="destructive"
              size="icon"
              onClick={() => rule.id && handleDeleteRule(rule.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={handleAddRule}>Add New Rule</Button>
    </div>
  );
}
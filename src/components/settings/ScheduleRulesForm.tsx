import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ScheduleRule, ROLES } from "./types";
import { ScheduleRuleItem } from "./ScheduleRuleItem";

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

      // Check if a rule for this role and day already exists
      const existingRule = rules.find(r => 
        r.role === ROLES[0] && r.day_of_week === 1
      );

      if (existingRule) {
        toast({
          title: "Error",
          description: "A rule for this role and day already exists",
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
        min_staff: 1,
        max_staff: 1,
      };

      const { data, error } = await supabase
        .from("schedule_rules")
        .insert([newRule])
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Error",
            description: "A rule for this role and day already exists",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

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
      
      // Ensure max_staff is not less than min_staff
      if (field === "min_staff" && typeof value === "number" && updatedRule.max_staff < value) {
        updatedRule.max_staff = value;
      }

      // Check for duplicate rule if changing role or day
      if (field === "role" || field === "day_of_week") {
        const existingRule = rules.find(r => 
          r.id !== updatedRule.id && 
          r.role === updatedRule.role && 
          r.day_of_week === updatedRule.day_of_week
        );

        if (existingRule) {
          toast({
            title: "Error",
            description: "A rule for this role and day already exists",
            variant: "destructive",
          });
          return;
        }
      }

      const { error } = await supabase
        .from("schedule_rules")
        .update(updatedRule)
        .eq("id", updatedRule.id);

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Error",
            description: "A rule for this role and day already exists",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

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
          <ScheduleRuleItem
            key={rule.id}
            rule={rule}
            onUpdate={(field, value) => handleUpdateRule(index, field, value)}
            onDelete={() => rule.id && handleDeleteRule(rule.id)}
          />
        ))}
      </div>

      <Button onClick={handleAddRule}>Add New Rule</Button>
    </div>
  );
}
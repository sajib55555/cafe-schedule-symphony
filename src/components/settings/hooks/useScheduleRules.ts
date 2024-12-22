import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScheduleRule } from "../types";

export function useScheduleRules() {
  const [rules, setRules] = useState<ScheduleRule[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  const { toast } = useToast();

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

  const addRule = async () => {
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
        role: "Barista" as const,
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

  const updateRule = async (index: number, field: keyof ScheduleRule, value: string | number) => {
    try {
      const updatedRule = { ...rules[index], [field]: value };
      
      if (field === "min_staff" && typeof value === "number" && updatedRule.max_staff < value) {
        updatedRule.max_staff = value;
      }

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

  const deleteRule = async (id: number) => {
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

  useEffect(() => {
    fetchRules();
  }, []);

  return {
    rules,
    loading,
    addRule,
    updateRule,
    deleteRule
  };
}
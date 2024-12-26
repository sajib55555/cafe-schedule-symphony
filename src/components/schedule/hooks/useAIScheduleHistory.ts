import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AISchedule } from '../types/aiSchedule.types';
import { StaffShifts } from '../types';

export const useAIScheduleHistory = () => {
  const [schedules, setSchedules] = useState<AISchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', session?.user?.id)
          .single();

        if (!profile?.company_id) return;

        const { data, error } = await supabase
          .from('ai_schedules')
          .select('*')
          .eq('company_id', profile.company_id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const typedSchedules: AISchedule[] = (data || []).map(schedule => ({
          id: schedule.id,
          company_id: schedule.company_id,
          week_start: schedule.week_start,
          schedule_data: schedule.schedule_data as unknown as StaffShifts,
          created_at: schedule.created_at
        }));

        setSchedules(typedSchedules);
      } catch (error) {
        console.error('Error loading AI schedules:', error);
        toast({
          title: "Error",
          description: "Failed to load AI schedules",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadSchedules();
  }, [session, toast]);

  return {
    schedules,
    loading
  };
};
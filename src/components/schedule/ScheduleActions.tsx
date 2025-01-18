import React from 'react';
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ScheduleActionsProps {
  handleSaveSchedule: () => Promise<void>;
  isSaving: boolean;
  onLoadSchedule: (scheduleData: any) => void;
}

export function ScheduleActions({
  handleSaveSchedule,
  isSaving,
}: ScheduleActionsProps) {
  const { toast } = useToast();
  const { session } = useAuth();

  return (
    <div className="flex gap-2">
      <Button 
        onClick={handleSaveSchedule} 
        disabled={isSaving}
        className="flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        {isSaving ? 'Saving...' : 'Save Schedule'}
      </Button>
    </div>
  );
}
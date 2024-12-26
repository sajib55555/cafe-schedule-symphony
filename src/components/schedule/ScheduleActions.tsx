import React from 'react';
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface ScheduleActionsProps {
  handleSaveSchedule: () => Promise<void>;
  isSaving: boolean;
}

export function ScheduleActions({
  handleSaveSchedule,
  isSaving
}: ScheduleActionsProps) {
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
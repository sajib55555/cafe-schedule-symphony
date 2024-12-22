import React from 'react';
import { Button } from "@/components/ui/button";
import { Save, Wand2 } from "lucide-react";

interface ScheduleActionsProps {
  handleGenerateAISchedule: () => Promise<void>;
  handleSaveSchedule: () => Promise<void>;
  isGeneratingAISchedule: boolean;
  isSaving: boolean;
}

export function ScheduleActions({
  handleGenerateAISchedule,
  handleSaveSchedule,
  isGeneratingAISchedule,
  isSaving
}: ScheduleActionsProps) {
  return (
    <div className="flex gap-2">
      <Button
        onClick={handleGenerateAISchedule}
        disabled={isGeneratingAISchedule}
        variant="secondary"
        className="flex items-center gap-2"
      >
        <Wand2 className="w-4 h-4" />
        {isGeneratingAISchedule ? 'Generating...' : '1 Click AI Magic Rota Maker'}
      </Button>
      <Button 
        onClick={handleSaveSchedule} 
        disabled={isSaving}
      >
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? 'Saving...' : 'Save Schedule'}
      </Button>
    </div>
  );
}
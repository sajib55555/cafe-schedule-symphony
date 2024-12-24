import { Button } from "@/components/ui/button";
import { Wand2, Save } from "lucide-react";

interface ScheduleActionsProps {
  handleGenerateAISchedule: () => void;
  handleSaveSchedule: () => void;
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
    <div className="flex items-center gap-4">
      <Button 
        onClick={handleGenerateAISchedule}
        disabled={isGeneratingAISchedule}
        variant="secondary"
        className="flex items-center gap-2"
      >
        <Wand2 className="w-4 h-4" />
        {isGeneratingAISchedule ? 'Generating...' : 'AI Magic Rota Maker'}
      </Button>
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
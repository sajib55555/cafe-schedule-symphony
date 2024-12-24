import React from 'react';
import { List } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Calendar } from 'lucide-react';
import { AIScheduleTable } from './AIScheduleTable';
import { useAIScheduleHistory } from './hooks/useAIScheduleHistory';
import { AIScheduleHistoryProps } from './types/aiSchedule.types';

export const AIScheduleHistory = ({ onLoadSchedule }: AIScheduleHistoryProps) => {
  const { schedules, loading } = useAIScheduleHistory();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <List className="h-4 w-4" />
          AI Schedule History
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] md:w-[750px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            AI-Generated Schedules History
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading schedules...</p>
          ) : schedules.length === 0 ? (
            <p className="text-center text-muted-foreground">No AI-generated schedules found</p>
          ) : (
            <AIScheduleTable schedules={schedules} onLoadSchedule={onLoadSchedule} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
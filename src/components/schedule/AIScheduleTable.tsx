import React from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AISchedule } from './types/aiSchedule.types';
import { useToast } from "@/components/ui/use-toast";
import { Eye, Edit } from 'lucide-react';
import { AIScheduleDetails } from './AIScheduleDetails';

interface AIScheduleTableProps {
  schedules: AISchedule[];
  onLoadSchedule: (scheduleData: AISchedule['schedule_data']) => void;
}

export const AIScheduleTable = ({ schedules, onLoadSchedule }: AIScheduleTableProps) => {
  const { toast } = useToast();
  const [selectedSchedule, setSelectedSchedule] = React.useState<AISchedule | null>(null);

  const formatDate = (date: string) => {
    return format(new Date(date), 'PPP');
  };

  const handleLoadSchedule = (schedule: AISchedule) => {
    try {
      onLoadSchedule(schedule.schedule_data);
      toast({
        title: "Success",
        description: "Schedule loaded successfully!",
      });
    } catch (error) {
      console.error('Error loading schedule:', error);
      toast({
        title: "Error",
        description: "Failed to load schedule",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Week Starting</TableHead>
            <TableHead>Generated On</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell>{formatDate(schedule.week_start)}</TableCell>
              <TableCell>{formatDate(schedule.created_at)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLoadSchedule(schedule)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Load & Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSchedule(schedule)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedSchedule && (
        <AIScheduleDetails 
          schedule={selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
        />
      )}
    </>
  );
};
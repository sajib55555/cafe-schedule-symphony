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

interface AIScheduleTableProps {
  schedules: AISchedule[];
  onLoadSchedule: (scheduleData: AISchedule['schedule_data']) => void;
}

export const AIScheduleTable = ({ schedules, onLoadSchedule }: AIScheduleTableProps) => {
  const { toast } = useToast();

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
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLoadSchedule(schedule)}
              >
                Load Schedule
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
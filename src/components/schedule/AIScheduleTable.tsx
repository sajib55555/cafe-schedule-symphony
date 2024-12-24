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
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ShiftDialog } from './ShiftDialog';
import { useState } from 'react';

interface AIScheduleTableProps {
  schedules: AISchedule[];
  onLoadSchedule: (scheduleData: AISchedule['schedule_data']) => void;
}

export const AIScheduleTable = ({ schedules, onLoadSchedule }: AIScheduleTableProps) => {
  const { toast } = useToast();
  const [selectedSchedule, setSelectedSchedule] = useState<AISchedule | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [newShift, setNewShift] = useState({
    startTime: '09:00',
    endTime: '17:00',
    role: 'Barista' as const
  });

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

  const handleViewSchedule = (schedule: AISchedule) => {
    setSelectedSchedule(schedule);
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
                    onClick={() => handleViewSchedule(schedule)}
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
        <div className="mt-4 border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Schedule Details</h3>
          <div className="grid grid-cols-[200px,repeat(7,1fr)] gap-2">
            <div className="font-medium">Staff</div>
            {Array.from({ length: 7 }, (_, i) => {
              const date = new Date(selectedSchedule.week_start);
              date.setDate(date.getDate() + i);
              return (
                <div key={i} className="font-medium text-center">
                  {format(date, 'EEE, MMM d')}
                </div>
              );
            })}
            
            {Object.entries(selectedSchedule.schedule_data).map(([staffName, staffShifts]) => (
              <React.Fragment key={staffName}>
                <div className="py-2">{staffName}</div>
                {Array.from({ length: 7 }, (_, i) => {
                  const date = new Date(selectedSchedule.week_start);
                  date.setDate(date.getDate() + i);
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const shift = staffShifts[dateStr];
                  
                  return (
                    <div key={dateStr} className="border p-2 min-h-[60px]">
                      {shift && (
                        <div className="text-sm">
                          <div>{shift.startTime} - {shift.endTime}</div>
                          <div>{shift.role}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <Button 
            className="mt-4"
            variant="outline"
            onClick={() => setSelectedSchedule(null)}
          >
            Close
          </Button>
        </div>
      )}
    </>
  );
};
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, List } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface AISchedule {
  id: number;
  week_start: string;
  schedule_data: any;
  created_at: string;
}

export const AIScheduleHistory = () => {
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

        setSchedules(data || []);
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

  const formatDate = (date: string) => {
    return format(new Date(date), 'PPP');
  };

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
                        onClick={() => {
                          // Load this schedule into the current view
                          // This will be implemented in the next iteration
                          toast({
                            title: "Coming Soon",
                            description: "This feature will be available soon!",
                          });
                        }}
                      >
                        Load Schedule
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
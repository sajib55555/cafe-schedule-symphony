import { useState, useRef, useEffect } from "react";
import { useStaff } from "@/contexts/StaffContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { startOfWeek, format } from "date-fns";
import { Download } from "lucide-react";
import toPdf from 'react-to-pdf';

export default function Tasks() {
  const { staff } = useStaff();
  const { session } = useAuth();
  const { toast } = useToast();
  const [selectedStaff, setSelectedStaff] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const tasksRef = useRef<HTMLDivElement>(null);

  const loadTasks = async () => {
    if (!session?.user?.id) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', session.user.id)
        .single();

      if (!profileData?.company_id) return;

      const currentWeekStart = startOfWeek(new Date());
      const { data: tasksData, error } = await supabase
        .from('staff_tasks')
        .select(`
          id,
          task_description,
          completed,
          staff:staff_id (
            name
          )
        `)
        .eq('company_id', profileData.company_id)
        .eq('week_start', format(currentWeekStart, 'yyyy-MM-dd'));

      if (error) throw error;
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tasks. Please try again.",
      });
    }
  };

  const handleAddTask = async () => {
    if (!session?.user?.id || !selectedStaff || !taskDescription.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a staff member and enter a task description.",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', session.user.id)
        .single();

      if (!profileData?.company_id) throw new Error('Company ID not found');

      const currentWeekStart = startOfWeek(new Date());
      const { error } = await supabase
        .from('staff_tasks')
        .insert({
          staff_id: parseInt(selectedStaff),
          company_id: profileData.company_id,
          task_description: taskDescription,
          week_start: format(currentWeekStart, 'yyyy-MM-dd'),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task added successfully.",
      });

      setTaskDescription("");
      loadTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add task. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (tasksRef.current) {
      try {
        await toPdf(() => tasksRef.current, {
          filename: 'staff-tasks.pdf',
          page: {
            margin: 20,
            format: 'letter',
          }
        });
      } catch (error) {
        console.error('Error generating PDF:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate PDF. Please try again.",
        });
      }
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      loadTasks();
    }
  }, [session?.user?.id]);

  return (
    <div className="container mx-auto p-6 animate-fade-in">
      <div className="space-y-6">
        <div className="flex items-end gap-4 bg-white/30 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-primary/10">
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium text-secondary">Staff Member</label>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger className="bg-white/50 border-primary/20">
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium text-secondary">Task Description</label>
            <Input
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Enter task description"
              className="bg-white/50 border-primary/20"
            />
          </div>
          <Button 
            onClick={handleAddTask} 
            disabled={loading}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          >
            Add Task
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Weekly Tasks
            </h2>
            <Button 
              variant="outline" 
              onClick={handleDownloadPdf}
              className="border-primary/20 hover:bg-primary/10 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>

          <div 
            ref={tasksRef} 
            className="bg-white/30 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-primary/10 transition-all hover:shadow-xl"
          >
            <h3 className="text-xl font-semibold mb-4 text-secondary">
              Week Starting: {format(startOfWeek(new Date()), 'PPP')}
            </h3>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 bg-gradient-to-r from-white/50 to-primary/5 rounded-lg border border-primary/10 flex items-start justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="font-medium text-secondary">{task.staff.name}</p>
                    <p className="text-muted-foreground">{task.task_description}</p>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No tasks added for this week</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

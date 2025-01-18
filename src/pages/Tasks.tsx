import { useState, useRef } from "react";
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
        await toPdf(tasksRef.current, {
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

  useState(() => {
    loadTasks();
  }, [session?.user?.id]);

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="flex items-end gap-4">
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">Staff Member</label>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger>
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
            <label className="text-sm font-medium">Task Description</label>
            <Input
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Enter task description"
            />
          </div>
          <Button onClick={handleAddTask} disabled={loading}>
            Add Task
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Weekly Tasks</h2>
            <Button variant="outline" onClick={handleDownloadPdf}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>

          <div ref={tasksRef} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">
              Week Starting: {format(startOfWeek(new Date()), 'PPP')}
            </h3>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 border rounded-lg flex items-start justify-between"
                >
                  <div>
                    <p className="font-medium">{task.staff.name}</p>
                    <p className="text-gray-600">{task.task_description}</p>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-gray-500 text-center">No tasks added for this week</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStaff } from '@/contexts/StaffContext';
import { useToast } from "@/components/ui/use-toast";

export function StaffCard({ employee, onEdit }: { 
  employee: any;
  onEdit: (id: number) => void;
}) {
  const { setStaff } = useStaff();
  const { toast } = useToast();

  const handleDelete = () => {
    setStaff(prev => prev.filter(emp => emp.id !== employee.id));
    toast({
      title: "Success",
      description: "Staff member deleted successfully",
    });
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{employee.name}</h3>
            <p className="text-sm text-gray-600">{employee.role}</p>
            <p className="text-sm text-gray-600">{employee.email}</p>
            <p className="text-sm text-gray-600">{employee.phone}</p>
            <p className="text-sm text-gray-600 mt-2">
              Monthly Hours: {employee.hours} hrs
            </p>
          </div>
          <div className="space-y-2">
            <Button onClick={() => onEdit(employee.id)}>
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          <p>Available on:</p>
          <p>{employee.availability.join(", ")}</p>
        </div>
      </div>
    </Card>
  );
}
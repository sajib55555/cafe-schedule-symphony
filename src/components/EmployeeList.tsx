import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useStaff } from '@/contexts/StaffContext';
import { StaffCard } from "./StaffCard";
import { AddStaffForm } from "./AddStaffForm";
import { EditStaffForm } from "./EditStaffForm";

export function EmployeeList() {
  const { staff } = useStaff();
  const [editingEmployee, setEditingEmployee] = useState<number | null>(null);
  const { toast } = useToast();
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

  const handleEditEmployee = (id: number) => {
    setEditingEmployee(null);
    toast({
      title: "Success",
      description: "Staff details updated successfully",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-secondary">Staff</h2>
        <Sheet open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
          <SheetTrigger asChild>
            <Button>Add Staff</Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add New Staff Member</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <AddStaffForm onClose={() => setIsAddStaffOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4">
        {staff.map((employee) => (
          <div key={employee.id}>
            {editingEmployee === employee.id ? (
              <EditStaffForm
                employee={employee}
                onSave={() => handleEditEmployee(employee.id)}
                onCancel={() => setEditingEmployee(null)}
              />
            ) : (
              <StaffCard
                employee={employee}
                onEdit={() => setEditingEmployee(employee.id)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
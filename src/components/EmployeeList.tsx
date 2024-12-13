import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface Employee {
  id: number;
  name: string;
  role: string;
  availability: string[];
}

const initialEmployees: Employee[] = [
  {
    id: 1,
    name: "John Smith",
    role: "Barista",
    availability: ["Monday", "Tuesday", "Wednesday"],
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Server",
    availability: ["Thursday", "Friday", "Saturday"],
  },
  {
    id: 3,
    name: "Mike Wilson",
    role: "Chef",
    availability: ["Monday", "Wednesday", "Friday"],
  },
];

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [newEmployee, setNewEmployee] = useState({ name: "", role: "" });
  const { toast } = useToast();

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.role) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const employee: Employee = {
      id: employees.length + 1,
      name: newEmployee.name,
      role: newEmployee.role,
      availability: [],
    };

    setEmployees([...employees, employee]);
    setNewEmployee({ name: "", role: "" });
    toast({
      title: "Success",
      description: "New employee added successfully",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-secondary">Employees</h2>
        <Sheet>
          <SheetTrigger asChild>
            <Button>Add Staff</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New Staff Member</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  placeholder="Enter staff name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                  placeholder="Enter staff role"
                />
              </div>
              <Button onClick={handleAddEmployee} className="w-full">
                Add Staff Member
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="grid gap-4">
        {employees.map((employee) => (
          <Card key={employee.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{employee.name}</h3>
                <p className="text-sm text-gray-600">{employee.role}</p>
              </div>
              <div className="text-sm text-gray-500">
                <p>Available:</p>
                <p>{employee.availability.join(", ") || "No availability set"}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface Employee {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  availability: string[];
}

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const initialEmployees: Employee[] = [
  {
    id: 1,
    name: "John Smith",
    role: "Barista",
    email: "john@example.com",
    phone: "123-456-7890",
    availability: ["Monday", "Tuesday", "Wednesday"],
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Server",
    email: "sarah@example.com",
    phone: "234-567-8901",
    availability: ["Thursday", "Friday", "Saturday"],
  },
  {
    id: 3,
    name: "Mike Wilson",
    role: "Chef",
    email: "mike@example.com",
    phone: "345-678-9012",
    availability: ["Monday", "Wednesday", "Friday"],
  },
];

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    availability: [] as string[],
  });
  const { toast } = useToast();

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.role || !newEmployee.email || !newEmployee.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const employee: Employee = {
      id: employees.length + 1,
      ...newEmployee,
    };

    setEmployees([...employees, employee]);
    setNewEmployee({ name: "", role: "", email: "", phone: "", availability: [] });
    toast({
      title: "Success",
      description: "New staff member added successfully",
    });
  };

  const handleEditEmployee = () => {
    if (!editingEmployee) return;

    setEmployees(employees.map((emp) => 
      emp.id === editingEmployee.id ? editingEmployee : emp
    ));

    setEditingEmployee(null);
    toast({
      title: "Success",
      description: "Staff details updated successfully",
    });
  };

  const handleAvailabilityChange = (day: string, isEditing: boolean) => {
    if (isEditing && editingEmployee) {
      const newAvailability = editingEmployee.availability.includes(day)
        ? editingEmployee.availability.filter((d) => d !== day)
        : [...editingEmployee.availability, day];
      
      setEditingEmployee({
        ...editingEmployee,
        availability: newAvailability,
      });
    } else {
      const newAvailability = newEmployee.availability.includes(day)
        ? newEmployee.availability.filter((d) => d !== day)
        : [...newEmployee.availability, day];
      
      setNewEmployee({
        ...newEmployee,
        availability: newAvailability,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-secondary">Staff</h2>
        <Sheet>
          <SheetTrigger asChild>
            <Button>Add Staff</Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add New Staff Member</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  placeholder="Enter staff name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                  placeholder="Enter staff role"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label>Availability</Label>
                <div className="grid grid-cols-2 gap-2">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={`new-${day}`}
                        checked={newEmployee.availability.includes(day)}
                        onCheckedChange={() => handleAvailabilityChange(day, false)}
                      />
                      <label htmlFor={`new-${day}`} className="text-sm">{day}</label>
                    </div>
                  ))}
                </div>
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
            {editingEmployee?.id === employee.id ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editingEmployee.name}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Input
                    id="edit-role"
                    value={editingEmployee.role}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingEmployee.email}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editingEmployee.phone}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-${day}`}
                          checked={editingEmployee.availability.includes(day)}
                          onCheckedChange={() => handleAvailabilityChange(day, true)}
                        />
                        <label htmlFor={`edit-${day}`} className="text-sm">{day}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleEditEmployee}>Save</Button>
                  <Button variant="outline" onClick={() => setEditingEmployee(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{employee.name}</h3>
                    <p className="text-sm text-gray-600">{employee.role}</p>
                    <p className="text-sm text-gray-600">{employee.email}</p>
                    <p className="text-sm text-gray-600">{employee.phone}</p>
                  </div>
                  <Button variant="outline" onClick={() => setEditingEmployee(employee)}>
                    Edit
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Available on:</p>
                  <p>{employee.availability.join(", ")}</p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
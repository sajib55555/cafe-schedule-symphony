import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useStaff } from '@/contexts/StaffContext';

export function EmployeeList() {
  const { staff, setStaff } = useStaff();
  const [editingEmployee, setEditingEmployee] = useState<number | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    availability: [] as string[],
    hours: 0
  });
  const { toast } = useToast();

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.role || !newEmployee.email || !newEmployee.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const employee = {
      id: Math.max(0, ...staff.map(s => s.id)) + 1,
      ...newEmployee,
    };

    setStaff([...staff, employee]);
    setNewEmployee({ name: "", role: "", email: "", phone: "", availability: [], hours: 0 });
    toast({
      title: "Success",
      description: "New staff member added successfully",
    });
  };

  const handleEditEmployee = (id: number) => {
    setStaff(staff.map((emp) => 
      emp.id === id ? {
        ...emp,
        ...staff.find(e => e.id === editingEmployee)
      } : emp
    ));

    setEditingEmployee(null);
    toast({
      title: "Success",
      description: "Staff details updated successfully",
    });
  };

  const handleAvailabilityChange = (day: string, employeeId: number | null) => {
    if (employeeId === null) {
      const newAvailability = newEmployee.availability.includes(day)
        ? newEmployee.availability.filter((d) => d !== day)
        : [...newEmployee.availability, day];
      
      setNewEmployee({
        ...newEmployee,
        availability: newAvailability,
      });
    } else {
      setStaff(staff.map(emp => {
        if (emp.id === employeeId) {
          const newAvailability = emp.availability.includes(day)
            ? emp.availability.filter((d) => d !== day)
            : [...emp.availability, day];
          return { ...emp, availability: newAvailability };
        }
        return emp;
      }));
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
                        onCheckedChange={() => handleAvailabilityChange(day, null)}
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
        {staff.map((employee) => (
          <Card key={employee.id} className="p-4 hover:shadow-lg transition-shadow">
            {editingEmployee === employee.id ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={employee.name}
                    onChange={(e) => setStaff(staff.map(emp => 
                      emp.id === employee.id ? { ...emp, name: e.target.value } : emp
                    ))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Input
                    id="edit-role"
                    value={employee.role}
                    onChange={(e) => setStaff(staff.map(emp => 
                      emp.id === employee.id ? { ...emp, role: e.target.value } : emp
                    ))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={employee.email}
                    onChange={(e) => setStaff(staff.map(emp => 
                      emp.id === employee.id ? { ...emp, email: e.target.value } : emp
                    ))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={employee.phone}
                    onChange={(e) => setStaff(staff.map(emp => 
                      emp.id === employee.id ? { ...emp, phone: e.target.value } : emp
                    ))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-${day}-${employee.id}`}
                          checked={employee.availability.includes(day)}
                          onCheckedChange={() => handleAvailabilityChange(day, employee.id)}
                        />
                        <label htmlFor={`edit-${day}-${employee.id}`} className="text-sm">{day}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => handleEditEmployee(employee.id)}>Save</Button>
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
                  <Button variant="outline" onClick={() => setEditingEmployee(employee.id)}>
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
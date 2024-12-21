import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useStaff } from '@/contexts/StaffContext';

export function AddStaffForm({ onClose }: { onClose: () => void }) {
  const { staff, setStaff } = useStaff();
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    availability: [] as string[],
    hours: 0,
    hourly_pay: 0
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
    setNewEmployee({ name: "", role: "", email: "", phone: "", availability: [], hours: 0, hourly_pay: 0 });
    toast({
      title: "Success",
      description: "New staff member added successfully",
    });
    onClose();
  };

  const handleAvailabilityChange = (day: string) => {
    const newAvailability = newEmployee.availability.includes(day)
      ? newEmployee.availability.filter((d) => d !== day)
      : [...newEmployee.availability, day];
    
    setNewEmployee({
      ...newEmployee,
      availability: newAvailability,
    });
  };

  return (
    <div className="space-y-4">
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
        <Label htmlFor="hourly_pay">Hourly Pay ($) *</Label>
        <Input
          id="hourly_pay"
          type="number"
          min="0"
          step="0.01"
          value={newEmployee.hourly_pay}
          onChange={(e) => setNewEmployee({ ...newEmployee, hourly_pay: parseFloat(e.target.value) })}
          placeholder="Enter hourly pay rate"
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
                onCheckedChange={() => handleAvailabilityChange(day)}
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
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStaff } from '@/contexts/StaffContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { RolesSelector } from "./staff/RolesSelector";
import { AvailabilitySelector } from "./staff/AvailabilitySelector";

export function AddStaffForm({ onClose }: { onClose: () => void }) {
  const { staff, setStaff } = useStaff();
  const { session } = useAuth();
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    roles: [] as string[],
    email: "",
    phone: "",
    availability: [] as string[],
    hours: 0,
    hourly_pay: 0
  });
  const { toast } = useToast();

  const handleAddEmployee = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to add staff members",
        variant: "destructive",
      });
      return;
    }

    if (!newEmployee.name || newEmployee.roles.length === 0 || !newEmployee.email || !newEmployee.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select at least one role",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert roles array to a comma-separated string for the role column
      const roleString = newEmployee.roles.join(', ');

      const { data: insertedStaff, error: insertError } = await supabase
        .from('staff')
        .insert([{
          name: newEmployee.name,
          role: roleString,
          email: newEmployee.email,
          phone: newEmployee.phone,
          availability: newEmployee.availability,
          hours: newEmployee.hours,
          hourly_pay: newEmployee.hourly_pay,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      if (insertedStaff) {
        setStaff([...staff, insertedStaff]);
        setNewEmployee({ 
          name: "", 
          roles: [], 
          email: "", 
          phone: "", 
          availability: [], 
          hours: 0, 
          hourly_pay: 0 
        });
        toast({
          title: "Success",
          description: "New staff member added successfully",
        });
        onClose();
      }
    } catch (error) {
      console.error('Error adding staff member:', error);
      toast({
        title: "Error",
        description: "Failed to add staff member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRoleToggle = (role: string) => {
    setNewEmployee(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleAvailabilityChange = (day: string) => {
    setNewEmployee(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter((d) => d !== day)
        : [...prev.availability, day]
    }));
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

      <RolesSelector
        selectedRoles={newEmployee.roles}
        onRoleToggle={handleRoleToggle}
      />

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

      <AvailabilitySelector
        availability={newEmployee.availability}
        onAvailabilityChange={handleAvailabilityChange}
      />

      <Button onClick={handleAddEmployee} className="w-full">
        Add Staff Member
      </Button>
    </div>
  );
}
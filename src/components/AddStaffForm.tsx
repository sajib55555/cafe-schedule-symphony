import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useStaff } from '@/contexts/StaffContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  const ROLES = [
    "Waiter",
    "Waitress",
    "Team Leader",
    "Shift Leader",
    "Assistant Manager",
    "General Manager",
    "Operation Manager",
    "Duty Manager",
    "Food Runner",
    "Cleaner",
    "Kitchen Porter",
    "Head Chef",
    "Sous Chef",
    "Commie Chef",
    "Cook",
    "Waiting Staff"
  ];

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

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
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profileData?.company_id) {
        throw new Error('Could not get company ID');
      }

      const { data: insertedStaff, error: insertError } = await supabase
        .from('staff')
        .insert([{
          ...newEmployee,
          role: newEmployee.roles.join(', '), // Join multiple roles with comma
          company_id: profileData.company_id
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
        <Label>Roles *</Label>
        <Card className="p-4">
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-2">
              {ROLES.map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${role}`}
                    checked={newEmployee.roles.includes(role)}
                    onCheckedChange={() => handleRoleToggle(role)}
                  />
                  <label
                    htmlFor={`role-${role}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {role}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
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
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
    try {
      console.log('Starting staff addition process...');
      
      if (!session?.user?.id) {
        toast({
          title: "Error",
          description: "You must be logged in to add staff members",
          variant: "destructive",
        });
        return;
      }

      // Validate required fields
      if (!newEmployee.name || newEmployee.roles.length === 0 || !newEmployee.email || !newEmployee.phone) {
        toast({
          title: "Error",
          description: "Please fill in all required fields and select at least one role",
          variant: "destructive",
        });
        return;
      }

      console.log('Fetching company ID for user:', session.user.id);
      
      // First get the user's company_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching company ID:', profileError);
        toast({
          title: "Error",
          description: "Failed to fetch company information",
          variant: "destructive",
        });
        return;
      }

      if (!profileData?.company_id) {
        console.error('No company ID found for user');
        toast({
          title: "Error",
          description: "No company associated with your account. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      console.log('Found company ID:', profileData.company_id);

      // Convert roles array to a comma-separated string for the role column
      const roleString = newEmployee.roles.join(', ');
      
      // Prepare the staff data
      const staffData = {
        name: newEmployee.name,
        role: roleString,
        email: newEmployee.email,
        phone: newEmployee.phone,
        availability: newEmployee.availability,
        hours: 0, // Start with 0 hours
        hourly_pay: parseFloat(newEmployee.hourly_pay.toString()) || 0,
        company_id: profileData.company_id
      };

      console.log('Inserting new staff member with data:', staffData);

      const { data: insertedStaff, error: insertError } = await supabase
        .from('staff')
        .insert([staffData])
        .select()
        .maybeSingle();

      if (insertError) {
        console.error('Error inserting staff:', insertError);
        toast({
          title: "Error",
          description: "Failed to add staff member. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (insertedStaff) {
        console.log('Successfully added staff member:', insertedStaff);
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
      console.error('Unexpected error adding staff member:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
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
          value={newEmployee.hourly_pay || ''}
          onChange={(e) => setNewEmployee({ ...newEmployee, hourly_pay: parseFloat(e.target.value) || 0 })}
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
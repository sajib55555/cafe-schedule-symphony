import { useState } from "react";
import { useStaff } from '@/contexts/StaffContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface StaffFormData {
  name: string;
  roles: string[];
  email: string;
  phone: string;
  availability: string[];
  hours: number;
  hourly_pay: number;
}

const initialFormState: StaffFormData = {
  name: "",
  roles: [],
  email: "",
  phone: "",
  availability: [],
  hours: 0,
  hourly_pay: 0
};

export const useStaffForm = (onSuccess: () => void) => {
  const [formData, setFormData] = useState<StaffFormData>(initialFormState);
  const { staff, setStaff } = useStaff();
  const { session } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async () => {
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
      if (!formData.name || formData.roles.length === 0 || !formData.email || !formData.phone) {
        toast({
          title: "Error",
          description: "Please fill in all required fields and select at least one role",
          variant: "destructive",
        });
        return;
      }

      console.log('Fetching company ID for user:', session.user.id);
      
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
      const roleString = formData.roles.join(', ');
      
      const staffData = {
        name: formData.name,
        role: roleString,
        email: formData.email,
        phone: formData.phone,
        availability: formData.availability,
        hours: 0,
        hourly_pay: parseFloat(formData.hourly_pay.toString()) || 0,
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
        setFormData(initialFormState);
        toast({
          title: "Success",
          description: "New staff member added successfully",
        });
        onSuccess();
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

  return {
    formData,
    setFormData,
    handleSubmit
  };
};
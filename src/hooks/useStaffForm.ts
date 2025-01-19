import { useState } from "react";
import { StaffFormData } from "@/utils/staffSchema";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";

export function useStaffForm(
  companyId: string | undefined,
  onClose: () => void,
  setStaff: React.Dispatch<React.SetStateAction<any[]>>,
  form: UseFormReturn<StaffFormData>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: StaffFormData) => {
    if (!companyId) {
      toast.error('Please create a company first');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting staff data:', data);

      const { data: newStaff, error: insertError } = await supabase
        .from('staff')
        .insert([
          {
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: data.role,
            hourly_pay: Number(data.hourly_pay),
            company_id: companyId,
            availability: [],
            hours: 0,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Staff insertion error:', insertError);
        toast.error('Failed to add staff member');
        return;
      }

      if (newStaff) {
        console.log('Staff member added successfully:', newStaff);
        setStaff(currentStaff => [...currentStaff, newStaff]);
        toast.success('Staff member added successfully');
        form.reset();
        onClose();
      }
    } catch (error) {
      console.error('Error in onSubmit:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
}
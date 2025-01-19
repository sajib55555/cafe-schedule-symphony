import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useCompanyId } from "@/hooks/useCompanyId";
import { StaffFormFields } from "./staff/StaffFormFields";
import { staffFormSchema, type StaffFormData } from "@/utils/staffSchema";

interface AddStaffFormProps {
  onClose: () => void;
}

export function AddStaffForm({ onClose }: AddStaffFormProps) {
  const { companyId } = useCompanyId();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
      hourly_pay: "",
    },
  });

  const onSubmit = async (data: StaffFormData) => {
    if (!companyId) {
      toast.error('Please create a company first');
      return;
    }

    setIsLoading(true);
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

      console.log('Staff member added successfully:', newStaff);
      toast.success('Staff member added successfully');
      onClose();
    } catch (error) {
      console.error('Error in onSubmit:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <DialogTitle className="mb-4">Add New Staff Member</DialogTitle>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <StaffFormFields form={form} />
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Staff Member"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
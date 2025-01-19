import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormField } from "@/components/ui/form";
import { FormItem } from "@/components/ui/form";
import { FormLabel } from "@/components/ui/form";
import { FormControl } from "@/components/ui/form";
import { FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { useEffect, useState } from "react";
import { DialogTitle } from "@/components/ui/dialog";

const staffFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  role: z.string().min(2, "Role must be at least 2 characters"),
  hourly_pay: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Hourly pay must be a positive number",
  }),
});

type StaffFormData = z.infer<typeof staffFormSchema>;

interface AddStaffFormProps {
  onClose: () => void;
}

export function AddStaffForm({ onClose }: AddStaffFormProps) {
  const [companyId, setCompanyId] = useState<string | null>(null);
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

  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          toast.error('Error fetching session');
          return;
        }

        if (!session?.user?.id) {
          console.error('No user session found');
          toast.error('Please sign in again');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          toast.error('Error fetching company information');
          return;
        }

        if (!profile?.company_id) {
          console.error('No company ID found');
          toast.error('Please create a company first');
          return;
        }

        console.log('Company ID fetched:', profile.company_id);
        setCompanyId(profile.company_id);
      } catch (error) {
        console.error('Error in fetchCompanyId:', error);
        toast.error('Failed to fetch company information');
      }
    };

    fetchCompanyId();
  }, []);

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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="+1234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Input placeholder="Barista" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hourly_pay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hourly Pay ($)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" min="0" placeholder="15.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
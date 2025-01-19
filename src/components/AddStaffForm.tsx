import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { DialogTitle } from "@/components/ui/dialog";
import { useCompanyId } from "@/hooks/useCompanyId";
import { StaffFormFields } from "./staff/StaffFormFields";
import { staffFormSchema, type StaffFormData } from "@/utils/staffSchema";
import { useStaff } from "@/contexts/StaffContext";
import { FormActions } from "./staff/FormActions";
import { useStaffForm } from "@/hooks/useStaffForm";
import { toast } from "sonner";

interface AddStaffFormProps {
  onClose: () => void;
}

export function AddStaffForm({ onClose }: AddStaffFormProps) {
  const { companyId, isLoading: isLoadingCompany } = useCompanyId();
  const { setStaff } = useStaff();

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

  const { isSubmitting, handleSubmit } = useStaffForm(companyId, onClose, setStaff, form);

  if (isLoadingCompany) {
    return <div className="p-4">Loading...</div>;
  }

  if (!companyId) {
    toast.error("Please create a company first");
    onClose();
    return null;
  }

  return (
    <Form {...form}>
      <DialogTitle className="mb-4">Add New Staff Member</DialogTitle>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <StaffFormFields form={form} />
        <FormActions onClose={onClose} isSubmitting={isSubmitting} />
      </form>
    </Form>
  );
}
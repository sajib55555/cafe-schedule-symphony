import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { PersonalInfoFields } from "./signup/PersonalInfoFields";
import { CompanyInfoFields } from "./signup/CompanyInfoFields";
import { FormData, formSchema } from "./signup/types";
import { handleSignUp } from "@/utils/auth";
import { toast } from "sonner";

export const SignUpForm = () => {
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      companyName: "",
      industry: "",
      companySize: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const user = await handleSignUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        companyName: data.companyName,
        industry: data.industry || null,
        companySize: data.companySize || null,
      });
      
      if (user) {
        toast.success("Your account has been created. Please check your email to verify your account.");
        navigate("/");
      }
    } catch (error) {
      console.error("Error during sign up:", error);
      // Toast error is already handled in handleSignUp
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <PersonalInfoFields form={form} />
          <CompanyInfoFields form={form} />
        </div>
        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </form>
    </Form>
  );
};
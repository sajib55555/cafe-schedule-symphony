import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { PersonalInfoFields } from "./signup/PersonalInfoFields";
import { FormData, formSchema } from "./signup/types";
import { handleSignUp } from "@/utils/auth";
import { toast } from "sonner";
import { AuthError } from "@supabase/supabase-js";

export const SignUpForm = ({ onModeChange }: { onModeChange: (mode: 'signup' | 'signin' | 'reset') => void }) => {
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      companyName: "",
      companyAddress: "",
      companyPhone: "",
      companyWebsite: "",
      companyDescription: "",
      position: "",
      department: "",
      phone: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      console.log("Starting signup process with data:", { ...data, password: '[REDACTED]' });
      const user = await handleSignUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        companyName: data.companyName,
        companyAddress: data.companyAddress,
        companyPhone: data.companyPhone,
        companyWebsite: data.companyWebsite,
        companyDescription: data.companyDescription,
        position: data.position,
        department: data.department,
        phone: data.phone,
      });
      
      if (user) {
        console.log("Signup successful, user:", user);
        toast.success("Account created successfully! Please check your email to confirm your registration.");
        toast("You will be redirected to sign in once you confirm your email.", {
          duration: 5000,
        });
        
        // Redirect to sign in page after a short delay
        setTimeout(() => {
          console.log("Redirecting to signin...");
          onModeChange('signin');
        }, 5000);
      }
    } catch (error: any) {
      console.error("Error during sign up:", error);
      
      if (error instanceof AuthError) {
        if (error.message.includes("already registered")) {
          toast.error("An account with this email already exists. Please sign in instead.");
          setTimeout(() => onModeChange('signin'), 2000);
        } else {
          toast.error(error.message || "Failed to create account");
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <PersonalInfoFields form={form} />
        <div className="space-y-4">
          <Button type="submit" className="w-full">
            Create Account
          </Button>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => onModeChange('signin')}
                className="text-primary hover:underline"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};
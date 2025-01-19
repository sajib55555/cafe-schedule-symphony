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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { differenceInDays } from "date-fns";

export const SignUpForm = ({ onModeChange }: { onModeChange: (mode: 'signup' | 'signin' | 'reset') => void }) => {
  const navigate = useNavigate();
  const [showVerification, setShowVerification] = useState(false);
  const [email, setEmail] = useState("");
  const [trialEnd, setTrialEnd] = useState<string | null>(null);

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
      console.log("Starting signup process...");
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
        setEmail(data.email);
        
        // Calculate trial end date (30 days from now)
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 30);
        setTrialEnd(trialEndDate.toISOString());
        
        // Show verification message
        setShowVerification(true);
        
        toast.success("Account created successfully! Please check your email to verify your account.");
      }
    } catch (error: any) {
      console.error("Error during sign up:", error);
      
      if (error instanceof AuthError && error.message.includes("already registered")) {
        toast.error("An account with this email already exists. Please sign in instead.");
        setTimeout(() => onModeChange('signin'), 2000);
      } else {
        toast.error(error.message || "Failed to create account");
      }
    }
  };

  if (showVerification) {
    const daysLeft = trialEnd ? differenceInDays(new Date(trialEnd), new Date()) : 30;
    
    return (
      <div className="space-y-6">
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            <div className="space-y-4">
              <p className="font-medium">Please verify your email address</p>
              <p>We've sent a verification link to <span className="font-medium">{email}</span></p>
              <p>Please check your inbox and click the link to verify your account.</p>
            </div>
          </AlertDescription>
        </Alert>

        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              <p className="font-medium">Your 30-day trial is now active!</p>
              <p>You have {daysLeft} days remaining in your trial period.</p>
              <p>During this time, you'll have full access to all features.</p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="text-center space-y-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onModeChange('signin')}
            className="w-full"
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

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
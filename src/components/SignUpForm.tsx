import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { PersonalInfoFields } from "./signup/PersonalInfoFields";
import { useState } from "react";
import { useSignUpForm } from "@/hooks/useSignUpForm";
import { VerificationMessage } from "./signup/VerificationMessage";

export const SignUpForm = ({ onModeChange }: { onModeChange: (mode: 'signup' | 'signin' | 'reset') => void }) => {
  const [showVerification, setShowVerification] = useState(false);
  const [email, setEmail] = useState("");
  const [trialEnd, setTrialEnd] = useState<string | null>(null);
  
  const { form, onSubmit } = useSignUpForm(onModeChange);

  const handleSubmit = async (data: any) => {
    const result = await onSubmit(data);
    if (result?.success) {
      setEmail(result.email);
      setTrialEnd(result.trialEnd);
      setShowVerification(true);
    }
  };

  if (showVerification && trialEnd) {
    return (
      <VerificationMessage
        email={email}
        trialEnd={trialEnd}
        onModeChange={onModeChange}
        onRetry={() => setShowVerification(false)}
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { differenceInDays } from "date-fns";

interface VerificationMessageProps {
  email: string;
  trialEnd: string;
  onModeChange: (mode: 'signup' | 'signin' | 'reset') => void;
  onRetry: () => void;
}

export const VerificationMessage = ({ 
  email, 
  trialEnd, 
  onModeChange, 
  onRetry 
}: VerificationMessageProps) => {
  const daysLeft = differenceInDays(new Date(trialEnd), new Date());

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-blue-800">
          <div className="space-y-4">
            <p className="font-medium">Please verify your email address</p>
            <p>We've sent a verification link to <span className="font-medium">{email}</span></p>
            <p>Please check your inbox and click the link to verify your account.</p>
            <p className="text-sm mt-2">
              Note: If you don't see the email in your inbox, please check your spam folder.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      <Alert className="bg-green-50 border-green-200">
        <AlertDescription className="text-green-800">
          <div className="space-y-2">
            <p className="font-medium">Your 30-day trial is ready!</p>
            <p>You have {daysLeft} days remaining in your trial period.</p>
            <p>During this time, you'll have full access to all features.</p>
            <p className="text-sm mt-2">
              Important: Your trial will be activated once you verify your email.
            </p>
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
        <p className="text-sm text-muted-foreground">
          Didn't receive the email? Check your spam folder or{" "}
          <button
            type="button"
            onClick={onRetry}
            className="text-primary hover:underline"
          >
            try again
          </button>
        </p>
      </div>
    </div>
  );
};
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const resetFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ResetFormData = z.infer<typeof resetFormSchema>;

export const ResetPasswordForm = ({ onModeChange }: { onModeChange: (mode: 'signup' | 'signin' | 'reset') => void }) => {
  const form = useForm<ResetFormData>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetFormData) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success("Password reset instructions have been sent to your email");
      onModeChange('signin');
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.message || "Failed to send reset password instructions");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@company.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-4">
          <Button type="submit" className="w-full">
            Send Reset Instructions
          </Button>
          <div className="text-center">
            <button
              type="button"
              onClick={() => onModeChange('signin')}
              className="text-sm text-primary hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </form>
    </Form>
  );
};
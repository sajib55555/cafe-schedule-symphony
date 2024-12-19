import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SignUpFormFields, formSchema } from "./SignUpFormFields";
import { handleSignUp } from "@/utils/auth";
import type { z } from "zod";

type FormData = z.infer<typeof formSchema>;

export function SignUpForm() {
  const { toast } = useToast();
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

  const onSubmit = async (values: FormData) => {
    try {
      const user = await handleSignUp({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        companyName: values.companyName,
        industry: values.industry,
        companySize: values.companySize,
      });
      
      if (user) {
        toast({
          title: "Success!",
          description: "Your account has been created and your 30-day trial has started.",
        });
        navigate('/');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SignUpFormFields form={form} />
        <Button type="submit" className="w-full">
          Start Free Trial
        </Button>
      </form>
    </Form>
  );
}
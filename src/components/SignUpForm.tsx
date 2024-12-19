import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { SignUpFormFields, formSchema, FormData } from "./SignUpFormFields";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const SignUpForm = () => {
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

  const handleSignUp = async (data: FormData) => {
    try {
      // Sign up the user
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Create company
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .insert([
          {
            name: data.companyName,
            industry: data.industry || null,
            size: data.companySize || null,
          },
        ])
        .select()
        .single();

      if (companyError) throw companyError;

      // Update user's profile with company_id
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ company_id: companyData.id })
        .eq("email", data.email);

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "Your account has been created. Please check your email to verify your account.",
      });

      // Navigate to index page
      navigate("/");
    } catch (error) {
      console.error("Error during sign up:", error);
      toast({
        title: "Error",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-6">
        <SignUpFormFields form={form} />
        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </form>
    </Form>
  );
};
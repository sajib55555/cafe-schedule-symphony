import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export default function AuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check current auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/");
      } else if (event === "USER_UPDATED") {
        // Handle email confirmation
        toast({
          title: "Email confirmed",
          description: "You can now sign in to your account.",
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-secondary mb-8">
          Welcome to Café Schedule Manager
        </h1>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            style: {
              button: {
                background: '#1e293b',
                color: 'white',
                borderRadius: '0.375rem',
              },
              anchor: {
                color: '#1e293b',
              },
            },
          }}
          theme="light"
          providers={[]}
          redirectTo={window.location.origin}
          onError={(error) => {
            toast({
              variant: "destructive",
              title: "Authentication Error",
              description: error.message === "Email not confirmed" 
                ? "Please check your email and confirm your account before signing in."
                : error.message,
            });
          }}
        />
      </div>
    </div>
  );
}
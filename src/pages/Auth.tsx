import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate("/dashboard");
    }
  }, [session, navigate]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        toast.success("Successfully signed in!");
        navigate("/dashboard");
      }
      if (event === "SIGNED_OUT") {
        toast.success("Successfully signed out!");
        navigate("/");
      }
      if (event === "USER_UPDATED") {
        const { error } = supabase.auth.getSession();
        if (error) {
          toast.error(getErrorMessage(error));
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const getErrorMessage = (error: any) => {
    if (error.message.includes("Email not confirmed")) {
      return "Please verify your email address before signing in.";
    }
    if (error.message.includes("Invalid login credentials")) {
      return "Invalid email or password. Please check your credentials and try again.";
    }
    return error.message;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Welcome to EasyRotas
        </h1>
        <SupabaseAuth 
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#E67E22',
                  brandAccent: '#7CB342',
                }
              }
            },
            className: {
              container: 'w-full',
              button: 'w-full px-4 py-2 rounded-md',
              input: 'w-full px-3 py-2 border rounded-md',
            }
          }}
          providers={[]}
          redirectTo={`${window.location.origin}/auth/callback`}
        />
      </div>
    </div>
  );
};

export default Auth;
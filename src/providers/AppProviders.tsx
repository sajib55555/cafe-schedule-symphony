import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { StaffProvider } from "@/contexts/StaffContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as UIToaster } from "@/components/ui/toaster";
import { Toaster } from "sonner";

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StaffProvider>
          <TooltipProvider>
            <UIToaster />
            <Toaster />
            {children}
          </TooltipProvider>
        </StaffProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
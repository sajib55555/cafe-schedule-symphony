import { createContext, useContext } from "react";
import { Session } from "@supabase/supabase-js";
import { useAuthState } from "@/hooks/useAuthState";
import { useAccessStatus } from "@/hooks/useAccessStatus";

interface AuthContextType {
  loading: boolean;
  hasAccess: boolean;
  session: Session | null;
  trialEnded: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { hasAccess, trialEnded, checkAccessStatus } = useAccessStatus();
  const { loading, session } = useAuthState((newSession) => {
    checkAccessStatus(newSession);
  });

  return (
    <AuthContext.Provider value={{ loading, hasAccess, session, trialEnded }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
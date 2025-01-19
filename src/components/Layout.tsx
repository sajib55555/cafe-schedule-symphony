import { NavigationBar } from "./layout/NavigationBar";
import { SessionManager } from "./auth/SessionManager";
import { TrialStatusManager } from "./subscription/TrialStatusManager";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FDF6E3]">
      <SessionManager />
      <NavigationBar />
      <TrialStatusManager />
      <div className="pt-4">
        {children}
      </div>
    </div>
  );
}
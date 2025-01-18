import { LucideIcon } from "lucide-react";

interface ProfileFieldProps {
  icon: LucideIcon;
  label: string;
  value: string | null | undefined;
}

export function ProfileField({ icon: Icon, label, value }: ProfileFieldProps) {
  return (
    <div className="flex items-center space-x-4">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-lg font-medium">{value || "Not set"}</p>
      </div>
    </div>
  );
}
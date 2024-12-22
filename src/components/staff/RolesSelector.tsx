import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { ROLES } from "./constants";

interface RolesSelectorProps {
  selectedRoles: string[];
  onRoleToggle: (role: string) => void;
}

export function RolesSelector({ selectedRoles, onRoleToggle }: RolesSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Roles *</Label>
      <Card className="p-4">
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-2">
            {ROLES.map((role) => (
              <div key={role} className="flex items-center space-x-2">
                <Checkbox
                  id={`role-${role}`}
                  checked={selectedRoles.includes(role)}
                  onCheckedChange={() => onRoleToggle(role)}
                />
                <label
                  htmlFor={`role-${role}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {role}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
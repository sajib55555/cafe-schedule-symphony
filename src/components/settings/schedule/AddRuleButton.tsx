import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddRuleButtonProps {
  onClick: () => void;
}

export function AddRuleButton({ onClick }: AddRuleButtonProps) {
  return (
    <Button onClick={onClick} className="w-full">
      <Plus className="h-4 w-4 mr-2" />
      Add New Rule
    </Button>
  );
}
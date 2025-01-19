import { Dialog, DialogContent, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { AddStaffForm } from "@/components/AddStaffForm";

interface AddStaffDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddStaffDialog({ isOpen, onOpenChange }: AddStaffDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="whitespace-nowrap">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogDescription className="sr-only">
          Form to add a new staff member
        </DialogDescription>
        <AddStaffForm onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
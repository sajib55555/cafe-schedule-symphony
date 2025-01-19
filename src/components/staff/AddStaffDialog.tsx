import { Dialog, DialogContent, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { AddStaffForm } from "@/components/AddStaffForm";
import { useState } from "react";

interface AddStaffDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddStaffDialog({ isOpen, onOpenChange }: AddStaffDialogProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    onOpenChange(false);
    setTimeout(() => setIsClosing(false), 300);
  };

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
        {!isClosing && <AddStaffForm onClose={handleClose} />}
      </DialogContent>
    </Dialog>
  );
}
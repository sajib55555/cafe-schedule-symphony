import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AddStaffForm } from "@/components/AddStaffForm";
import { EmployeeList } from "@/components/EmployeeList";
import { UserPlus } from "lucide-react";

export default function Staff() {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <h1 className="text-2xl font-bold">Staff Management</h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="whitespace-nowrap">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent>
                <AddStaffForm onClose={() => {
                  const closeButton = document.querySelector('[aria-label="Close"]');
                  if (closeButton instanceof HTMLElement) {
                    closeButton.click();
                  }
                }} />
              </DialogContent>
            </Dialog>
          </div>
          <EmployeeList />
        </div>
      </div>
    </Layout>
  );
}
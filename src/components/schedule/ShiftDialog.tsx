import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ROLES } from '@/components/staff/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ShiftDialogProps {
  selectedStaff: string;
  selectedDate: string;
  newShift: {
    startTime: string;
    endTime: string;
    role: string;
  };
  setNewShift: React.Dispatch<React.SetStateAction<{
    startTime: string;
    endTime: string;
    role: string;
  }>>;
  handleAddShift: () => void;
  mode: 'add' | 'edit';
}

export function ShiftDialog({ 
  selectedStaff, 
  selectedDate, 
  newShift, 
  setNewShift, 
  handleAddShift,
  mode
}: ShiftDialogProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{mode === 'add' ? 'Add' : 'Edit'} Shift for {selectedStaff}</DialogTitle>
        <DialogDescription>
          {mode === 'add' ? 'Add a new shift' : 'Edit existing shift'} for {selectedStaff}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Time</label>
            <Input
              type="time"
              value={newShift.startTime}
              onChange={(e) => setNewShift(prev => ({ ...prev, startTime: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">End Time</label>
            <Input
              type="time"
              value={newShift.endTime}
              onChange={(e) => setNewShift(prev => ({ ...prev, endTime: e.target.value }))}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Role</label>
          <Select
            value={newShift.role}
            onValueChange={(value) => setNewShift(prev => ({ ...prev, role: value }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full" onClick={handleAddShift}>
          {mode === 'add' ? 'Add' : 'Save'} Shift
        </Button>
      </div>
    </DialogContent>
  );
}
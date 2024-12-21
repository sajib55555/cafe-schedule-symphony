import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useStaff } from '@/contexts/StaffContext';

export function EditStaffForm({ 
  employee,
  onSave,
  onCancel 
}: { 
  employee: any;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { staff, setStaff } = useStaff();
  
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleAvailabilityChange = (day: string) => {
    setStaff(staff.map(emp => {
      if (emp.id === employee.id) {
        const newAvailability = emp.availability.includes(day)
          ? emp.availability.filter((d) => d !== day)
          : [...emp.availability, day];
        return { ...emp, availability: newAvailability };
      }
      return emp;
    }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-name">Name</Label>
        <Input
          id="edit-name"
          value={employee.name}
          onChange={(e) => setStaff(staff.map(emp => 
            emp.id === employee.id ? { ...emp, name: e.target.value } : emp
          ))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-role">Role</Label>
        <Input
          id="edit-role"
          value={employee.role}
          onChange={(e) => setStaff(staff.map(emp => 
            emp.id === employee.id ? { ...emp, role: e.target.value } : emp
          ))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-email">Email</Label>
        <Input
          id="edit-email"
          type="email"
          value={employee.email}
          onChange={(e) => setStaff(staff.map(emp => 
            emp.id === employee.id ? { ...emp, email: e.target.value } : emp
          ))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-phone">Phone</Label>
        <Input
          id="edit-phone"
          value={employee.phone}
          onChange={(e) => setStaff(staff.map(emp => 
            emp.id === employee.id ? { ...emp, phone: e.target.value } : emp
          ))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-hourly-pay">Hourly Pay ($)</Label>
        <Input
          id="edit-hourly-pay"
          type="number"
          min="0"
          step="0.01"
          value={employee.hourly_pay}
          onChange={(e) => setStaff(staff.map(emp => 
            emp.id === employee.id ? { ...emp, hourly_pay: parseFloat(e.target.value) } : emp
          ))}
        />
      </div>
      <div className="space-y-2">
        <Label>Availability</Label>
        <div className="grid grid-cols-2 gap-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="flex items-center space-x-2">
              <Checkbox
                id={`edit-${day}-${employee.id}`}
                checked={employee.availability.includes(day)}
                onCheckedChange={() => handleAvailabilityChange(day)}
              />
              <label htmlFor={`edit-${day}-${employee.id}`} className="text-sm">{day}</label>
            </div>
          ))}
        </div>
      </div>
      <div className="flex space-x-2">
        <Button onClick={onSave}>Save</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
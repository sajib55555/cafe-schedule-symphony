import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DAYS_OF_WEEK } from "./constants";

interface AvailabilitySelectorProps {
  availability: string[];
  onAvailabilityChange: (day: string) => void;
}

export function AvailabilitySelector({ availability, onAvailabilityChange }: AvailabilitySelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Availability</Label>
      <div className="grid grid-cols-2 gap-2">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="flex items-center space-x-2">
            <Checkbox
              id={`new-${day}`}
              checked={availability.includes(day)}
              onCheckedChange={() => onAvailabilityChange(day)}
            />
            <label htmlFor={`new-${day}`} className="text-sm">{day}</label>
          </div>
        ))}
      </div>
    </div>
  );
}
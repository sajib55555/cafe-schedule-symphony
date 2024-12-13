import { Card } from "@/components/ui/card";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

export function WeeklySchedule() {
  return (
    <div className="space-y-4 overflow-x-auto">
      <h2 className="text-2xl font-bold text-secondary">Weekly Schedule</h2>
      <div className="min-w-[800px]">
        <div className="grid grid-cols-8 gap-2">
          <div className="sticky left-0 bg-background"></div>
          {days.map((day) => (
            <div key={day} className="text-center font-semibold p-2 bg-primary text-white rounded-t-lg">
              {day}
            </div>
          ))}
          {timeSlots.map((time) => (
            <React.Fragment key={time}>
              <div className="sticky left-0 bg-background font-medium p-2 text-right">{time}</div>
              {days.map((day) => (
                <Card key={`${day}-${time}`} className="p-2 min-h-[60px] hover:bg-accent/10 transition-colors cursor-pointer">
                </Card>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
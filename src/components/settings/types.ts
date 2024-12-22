export interface ScheduleRule {
  id?: number;
  role: StaffRole;
  day_of_week: number;
  start_time: string;
  end_time: string;
  min_staff: number;
  max_staff: number;
}

export const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export type StaffRole = 
  | "Barista"
  | "Floor"
  | "Waiter"
  | "Waitress"
  | "Team Leader"
  | "Shift Leader"
  | "Assistant Manager"
  | "General Manager"
  | "Operation Manager"
  | "Duty Manager"
  | "Food Runner"
  | "Cleaner"
  | "Kitchen Porter"
  | "Head Chef"
  | "Sous Chef"
  | "Commie Chef"
  | "Cook";

export const ROLES: StaffRole[] = [
  "Barista",
  "Floor",
  "Waiter",
  "Waitress",
  "Team Leader",
  "Shift Leader",
  "Assistant Manager",
  "General Manager",
  "Operation Manager",
  "Duty Manager",
  "Food Runner",
  "Cleaner",
  "Kitchen Porter",
  "Head Chef",
  "Sous Chef",
  "Commie Chef",
  "Cook",
];
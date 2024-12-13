import { Card } from "@/components/ui/card";

interface Employee {
  id: number;
  name: string;
  role: string;
  availability: string[];
}

const employees: Employee[] = [
  {
    id: 1,
    name: "John Smith",
    role: "Barista",
    availability: ["Monday", "Tuesday", "Wednesday"],
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Server",
    availability: ["Thursday", "Friday", "Saturday"],
  },
  {
    id: 3,
    name: "Mike Wilson",
    role: "Chef",
    availability: ["Monday", "Wednesday", "Friday"],
  },
];

export function EmployeeList() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-secondary">Employees</h2>
      <div className="grid gap-4">
        {employees.map((employee) => (
          <Card key={employee.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{employee.name}</h3>
                <p className="text-sm text-gray-600">{employee.role}</p>
              </div>
              <div className="text-sm text-gray-500">
                <p>Available:</p>
                <p>{employee.availability.join(", ")}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
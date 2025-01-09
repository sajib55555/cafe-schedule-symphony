import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { Dispatch, SetStateAction } from "react";

interface MonthNavigationProps {
  selectedMonth: Date;
  onMonthChange: Dispatch<SetStateAction<Date>>;
  disabled?: boolean;
}

export const MonthNavigation = ({ 
  selectedMonth, 
  onMonthChange, 
  disabled = false 
}: MonthNavigationProps) => {
  const handlePreviousMonth = () => {
    onMonthChange(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(prevDate => addMonths(prevDate, 1));
  };

  return (
    <div className="flex items-center space-x-4">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePreviousMonth}
        disabled={disabled}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="font-medium">
        {format(selectedMonth, 'MMMM yyyy')}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={handleNextMonth}
        disabled={disabled}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
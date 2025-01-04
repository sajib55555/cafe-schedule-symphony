import { useEffect, useState } from "react";
import { startOfMonth, endOfMonth, format, addMonths, subMonths } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Staff } from "@/contexts/StaffContext";
import { calculateMonthlyWages, updateMonthlyWagesRecord } from "../schedule/utils/wageCalculations";

interface MonthlyWage {
  staff_id: number;
  total_hours: number;
  total_wages: number;
}

export function StaffWagesTable({ staff }: { staff: Staff[] }) {
  const [monthlyWages, setMonthlyWages] = useState<MonthlyWage[]>([]);
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { session } = useAuth();
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);

  const handlePreviousMonth = () => {
    setSelectedDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(prevDate => addMonths(prevDate, 1));
  };

  useEffect(() => {
    const fetchCurrencySymbol = async () => {
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('currency_symbol')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!error && data) {
          setCurrencySymbol(data.currency_symbol);
        }
      }
    };

    fetchCurrencySymbol();
  }, [session]);

  useEffect(() => {
    const calculateWages = async () => {
      if (!session?.user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!profile?.company_id) return;

      const wagesPromises = staff.map(async (member) => {
        const totalHours = await calculateMonthlyWages(
          member.id,
          profile.company_id,
          monthStart,
          monthEnd
        );

        await updateMonthlyWagesRecord(
          member.id,
          profile.company_id,
          monthStart,
          monthEnd,
          totalHours,
          member.hourly_pay
        );

        return {
          staff_id: member.id,
          total_hours: totalHours,
          total_wages: totalHours * member.hourly_pay
        };
      });

      const wages = await Promise.all(wagesPromises);
      setMonthlyWages(wages);
    };

    calculateWages();
  }, [session, staff, monthStart, monthEnd]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Staff Monthly Wages</CardTitle>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium">
            {format(selectedDate, 'MMMM yyyy')}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead>Total Hours</TableHead>
              <TableHead>Hourly Pay</TableHead>
              <TableHead>Total Wages</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => {
              const wage = monthlyWages.find(w => w.staff_id === member.id);
              return (
                <TableRow key={member.id}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{wage?.total_hours || 0}</TableCell>
                  <TableCell>{currencySymbol}{member.hourly_pay}</TableCell>
                  <TableCell>{currencySymbol}{wage?.total_wages || 0}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
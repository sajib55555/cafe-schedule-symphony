import { useEffect, useState, useRef } from "react";
import { startOfMonth, endOfMonth, format, differenceInHours } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Staff } from "@/contexts/StaffContext";
import { WagesPdfExport } from "./WagesPdfExport";

interface MonthlyWage {
  staff_id: number;
  total_hours: number;
  total_wages: number;
}

export function StaffWagesTable({ staff, selectedMonth }: { staff: Staff[]; selectedMonth: Date }) {
  const [monthlyWages, setMonthlyWages] = useState<MonthlyWage[]>([]);
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const wagesRef = useRef<HTMLDivElement>(null);
  const { session } = useAuth();
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);

  useEffect(() => {
    const fetchCurrencySymbol = async () => {
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('currency_symbol')
          .eq('id', session.user.id)
          .maybeSingle();

        if (data) {
          setCurrencySymbol(data.currency_symbol);
        }
      }
    };

    fetchCurrencySymbol();
  }, [session]);

  useEffect(() => {
    const calculateWages = async () => {
      if (!session?.user) return;

      try {
        // Get all shifts for each staff member in the selected month
        const wagesPromises = staff.map(async (member) => {
          const { data: shifts } = await supabase
            .from('shifts')
            .select('start_time, end_time')
            .eq('staff_id', member.id)
            .gte('start_time', format(monthStart, 'yyyy-MM-dd'))
            .lte('end_time', format(monthEnd, 'yyyy-MM-dd'));

          const totalHours = shifts?.reduce((sum, shift) => {
            const hours = differenceInHours(
              new Date(shift.end_time),
              new Date(shift.start_time)
            );
            return sum + hours;
          }, 0) || 0;

          const totalWages = totalHours * member.hourly_pay;

          // Update monthly wages record
          await supabase
            .from('monthly_wages')
            .upsert({
              staff_id: member.id,
              month_start: format(monthStart, 'yyyy-MM-dd'),
              month_end: format(monthEnd, 'yyyy-MM-dd'),
              total_hours: totalHours,
              total_wages: totalWages,
              updated_at: new Date().toISOString()
            });

          return {
            staff_id: member.id,
            total_hours: totalHours,
            total_wages: totalWages
          };
        });

        const wages = await Promise.all(wagesPromises);
        setMonthlyWages(wages);
      } catch (error) {
        console.error('Error calculating wages:', error);
      }
    };

    calculateWages();
  }, [session, staff, monthStart, monthEnd]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Staff Monthly Wages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <WagesPdfExport 
            wagesRef={wagesRef}
            onPdfGenerating={setIsGeneratingPdf}
          />
        </div>
        <div ref={wagesRef}>
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
                    <TableCell>{wage?.total_hours.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>{currencySymbol}{member.hourly_pay}</TableCell>
                    <TableCell>{currencySymbol}{wage?.total_wages.toFixed(2) || '0.00'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
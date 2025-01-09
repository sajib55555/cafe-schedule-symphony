import { useEffect, useState, useRef } from "react";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Staff } from "@/contexts/StaffContext";
import { calculateMonthlyWages, updateMonthlyWagesRecord } from "../schedule/utils/wageCalculations";
import { WagesPdfExport } from "./WagesPdfExport";

interface MonthlyWage {
  staff_id: number;
  total_hours: number;
  total_wages: number;
}

interface StaffWagesTableProps {
  staff: Staff[];
  selectedMonth: Date;
}

export function StaffWagesTable({ staff, selectedMonth }: StaffWagesTableProps) {
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
          <span className="font-medium">
            {format(selectedMonth, 'MMMM yyyy')}
          </span>
        </div>
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
                    <TableCell>{wage?.total_hours || 0}</TableCell>
                    <TableCell>{currencySymbol}{member.hourly_pay}</TableCell>
                    <TableCell>{currencySymbol}{wage?.total_wages || 0}</TableCell>
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
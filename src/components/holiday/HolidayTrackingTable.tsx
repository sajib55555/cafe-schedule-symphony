import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStaff } from "@/contexts/StaffContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface HolidayTracking {
  staff_id: number;
  year: number;
  total_worked_hours: number;
  holiday_entitlement_hours: number;
  holiday_hours_taken: number;
}

export function HolidayTrackingTable() {
  const { staff } = useStaff();
  const [holidayData, setHolidayData] = useState<HolidayTracking[]>([]);
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchHolidayData = async () => {
      try {
        const { data, error } = await supabase
          .from('holiday_tracking')
          .select('*')
          .eq('year', currentYear);

        if (error) throw error;

        setHolidayData(data || []);
      } catch (error) {
        console.error('Error fetching holiday data:', error);
        toast({
          title: "Error",
          description: "Failed to load holiday tracking data",
          variant: "destructive",
        });
      }
    };

    fetchHolidayData();
  }, [toast]);

  const getStaffName = (staffId: number) => {
    return staff.find(s => s.id === staffId)?.name || 'Unknown Staff';
  };

  const getRemainingHours = (entitlement: number, taken: number) => {
    return Math.max(0, entitlement - taken);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Holiday Entitlement {currentYear}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Name</TableHead>
              <TableHead>Total Hours Worked</TableHead>
              <TableHead>Holiday Entitlement (Hours)</TableHead>
              <TableHead>Holiday Hours Taken</TableHead>
              <TableHead>Remaining Holiday Hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => {
              const holidayRecord = holidayData.find(h => h.staff_id === member.id);
              return (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>
                    {holidayRecord?.total_worked_hours?.toFixed(1) || '0.0'}
                  </TableCell>
                  <TableCell>
                    {holidayRecord?.holiday_entitlement_hours?.toFixed(1) || '0.0'}
                  </TableCell>
                  <TableCell>
                    {holidayRecord?.holiday_hours_taken?.toFixed(1) || '0.0'}
                  </TableCell>
                  <TableCell>
                    {holidayRecord 
                      ? getRemainingHours(
                          holidayRecord.holiday_entitlement_hours,
                          holidayRecord.holiday_hours_taken
                        ).toFixed(1)
                      : '0.0'
                    }
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
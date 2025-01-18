import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStaff } from "@/contexts/StaffContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const [newHolidayHours, setNewHolidayHours] = useState<{ [key: number]: string }>({});
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchHolidayData();
  }, []);

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

  const handleHolidayHoursChange = (staffId: number, value: string) => {
    setNewHolidayHours(prev => ({
      ...prev,
      [staffId]: value
    }));
  };

  const handleSaveHolidayHours = async (staffId: number) => {
    const hours = parseFloat(newHolidayHours[staffId]);
    if (isNaN(hours) || hours < 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid number of hours",
        variant: "destructive",
      });
      return;
    }

    const holidayRecord = holidayData.find(h => h.staff_id === staffId);
    const currentTaken = holidayRecord?.holiday_hours_taken || 0;
    const entitlement = holidayRecord?.holiday_entitlement_hours || 0;

    if (currentTaken + hours > entitlement) {
      toast({
        title: "Warning",
        description: "This would exceed the staff member's holiday entitlement",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('holiday_tracking')
        .update({ 
          holiday_hours_taken: currentTaken + hours,
          updated_at: new Date().toISOString()
        })
        .eq('staff_id', staffId)
        .eq('year', currentYear);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Holiday hours updated successfully",
      });

      // Clear the input
      setNewHolidayHours(prev => ({
        ...prev,
        [staffId]: ''
      }));

      // Refresh the data
      fetchHolidayData();
    } catch (error) {
      console.error('Error updating holiday hours:', error);
      toast({
        title: "Error",
        description: "Failed to update holiday hours",
        variant: "destructive",
      });
    }
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
              <TableHead>Add Holiday Hours</TableHead>
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
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="Hours"
                        value={newHolidayHours[member.id] || ''}
                        onChange={(e) => handleHolidayHoursChange(member.id, e.target.value)}
                        className="w-24"
                      />
                      <Button 
                        onClick={() => handleSaveHolidayHours(member.id)}
                        disabled={!newHolidayHours[member.id]}
                      >
                        Add
                      </Button>
                    </div>
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
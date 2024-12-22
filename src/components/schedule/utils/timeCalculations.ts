export const calculateHours = (startTime: string, endTime: string) => {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
};

export const calculateTotalHours = (staffName: string, weekStartStr: string, currentShifts: any) => {
  let totalHours = 0;
  const staffShifts = currentShifts[staffName] || {};
  
  for (const shift of Object.values(staffShifts)) {
    const shiftData = shift as { startTime: string; endTime: string };
    totalHours += calculateHours(shiftData.startTime, shiftData.endTime);
  }
  
  return totalHours;
};
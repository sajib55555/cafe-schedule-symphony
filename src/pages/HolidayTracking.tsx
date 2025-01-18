import { HolidayTrackingTable } from "@/components/holiday/HolidayTrackingTable";

const HolidayTracking = () => {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <HolidayTrackingTable />
      </div>
    </div>
  );
};

export default HolidayTracking;
import { Layout } from "@/components/Layout";
import { HolidayTrackingTable } from "@/components/holiday/HolidayTrackingTable";

const HolidayTracking = () => {
  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <HolidayTrackingTable />
        </div>
      </div>
    </Layout>
  );
};

export default HolidayTracking;
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SchedulePdfExportProps {
  scheduleRef: React.RefObject<HTMLDivElement>;
}

export function SchedulePdfExport({ scheduleRef }: SchedulePdfExportProps) {
  const { toast } = useToast();

  const handleDownload = async () => {
    if (scheduleRef.current) {
      try {
        const { toPdf } = await import('react-to-pdf');
        await toPdf(scheduleRef.current, {
          filename: 'cafe-schedule.pdf',
          page: {
            margin: 20,
            format: 'letter',
            orientation: 'landscape'
          }
        });
      } catch (error) {
        console.error('Error generating PDF:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate PDF. Please try again.",
        });
      }
    }
  };

  return (
    <Button 
      onClick={handleDownload}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Download Schedule
    </Button>
  );
}
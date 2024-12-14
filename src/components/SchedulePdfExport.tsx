import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { generatePDF } from '@react-pdf/renderer';

interface SchedulePdfExportProps {
  scheduleRef: React.RefObject<HTMLDivElement>;
}

export function SchedulePdfExport({ scheduleRef }: SchedulePdfExportProps) {
  const handleDownload = async () => {
    if (scheduleRef.current) {
      try {
        const { toPDF } = await import('react-to-pdf');
        await toPDF(scheduleRef, {
          filename: 'cafe-schedule.pdf',
          page: {
            margin: 20,
            format: 'letter',
            orientation: 'landscape'
          }
        });
      } catch (error) {
        console.error('Error generating PDF:', error);
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
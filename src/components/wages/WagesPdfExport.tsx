import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import toPdf from 'react-to-pdf';

interface WagesPdfExportProps {
  wagesRef: React.RefObject<HTMLDivElement>;
  onPdfGenerating: (generating: boolean) => void;
}

export function WagesPdfExport({ wagesRef, onPdfGenerating }: WagesPdfExportProps) {
  const { toast } = useToast();

  const handleDownload = async () => {
    if (wagesRef.current) {
      try {
        onPdfGenerating(true);
        await toPdf(() => wagesRef.current, {
          filename: 'monthly-wages.pdf',
          page: {
            margin: 20,
            format: 'letter',
            orientation: 'portrait'
          }
        });
      } catch (error) {
        console.error('Error generating PDF:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate PDF. Please try again.",
        });
      } finally {
        onPdfGenerating(false);
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
      Download Wages List
    </Button>
  );
}
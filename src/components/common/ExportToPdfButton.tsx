import React, { useState } from 'react';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportToPdfButtonProps {
  targetRef: React.RefObject<HTMLElement>;
  filename: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ExportToPdfButton: React.FC<ExportToPdfButtonProps> = ({ 
  targetRef, 
  filename, 
  className = '',
  size = 'md'
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-6 w-6';
      default:
        return 'h-4 w-4';
    }
  };

  const exportToPdf = async () => {
    if (!targetRef.current) {
      console.error('Target element not found');
      return;
    }

    setIsExporting(true);

    try {
      // Hide any scrollbars temporarily
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Wait a bit for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the element as canvas
      const canvas = await html2canvas(targetRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: targetRef.current.scrollWidth,
        height: targetRef.current.scrollHeight,
        scrollX: 0,
        scrollY: 0,
      });

      // Restore original overflow
      document.body.style.overflow = originalOverflow;

      // Calculate PDF dimensions
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      
      // Calculate scaling to fit content
      const ratio = Math.min(pdfWidth / (imgWidth * 0.264583), pdfHeight / (imgHeight * 0.264583));
      const scaledWidth = imgWidth * 0.264583 * ratio;
      const scaledHeight = imgHeight * 0.264583 * ratio;

      // Create PDF
      const pdf = new jsPDF({
        orientation: scaledWidth > scaledHeight ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add the image to PDF
      const imgData = canvas.toDataURL('image/png');
      
      // Center the content on the page
      const x = (pdf.internal.pageSize.getWidth() - scaledWidth) / 2;
      const y = (pdf.internal.pageSize.getHeight() - scaledHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);

      // Add metadata
      pdf.setProperties({
        title: filename,
        creator: 'Idea Portal Dashboard',
        author: 'Mitratech',
        subject: 'Dashboard Export'
      });

      // Save the PDF
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      pdf.save(`${filename}_${timestamp}.pdf`);

    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={exportToPdf}
      disabled={isExporting}
      className={`inline-flex items-center font-medium rounded-md transition-colors duration-200 border border-gray-200 ${
        isExporting 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          : 'bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
      } ${getSizeClasses()} ${className}`}
    >
      <Download className={`${getIconSize()} mr-2 ${isExporting ? 'animate-bounce' : ''}`} />
      {isExporting ? 'Exporting...' : 'Export PDF'}
    </button>
  );
};

export default ExportToPdfButton;
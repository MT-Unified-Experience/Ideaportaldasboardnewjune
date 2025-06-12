import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import ErrorModal from '../common/ErrorModal';
import { CSVError, validateCSVData } from '../../utils/csvParser';

export const CsvUploader: React.FC = () => {
  const { uploadCSV, isLoading, error, currentProduct } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showError, setShowError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{
    message: string;
    type?: 'file' | 'data' | 'application';
    details?: string[];
  }>({ message: '' });

  // Show error modal when error state changes
  React.useEffect(() => {
    if (error) {
      if (error instanceof CSVError) {
        setErrorDetails({
          message: error.message,
          type: error.type,
          details: error.details
        });
      } else {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setErrorDetails({
          message: errorMessage,
          type: 'application'
        });
      }
      setShowError(true);
    }
  }, [error]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    try {
      // Validate that the CSV contains data for the current product
      const fileContent = await file.text();
      await validateCSVData(fileContent, currentProduct);
      
      await uploadCSV(file);
    } catch (err) {
      if (err instanceof CSVError) {
        setErrorDetails({
          message: err.message,
          type: err.type,
          details: err.details
        });
        setShowError(true);
      }
      console.error(err);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleCloseError = () => {
    setShowError(false);
  };
  
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-end">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="h-[0.7rem] w-[0.7rem] mr-2" />
          {isLoading ? 'Uploading...' : 'Upload CSV'}
        </button>
        <a 
          href={`${import.meta.env.BASE_URL}template.csv?t=${Date.now()}`}
          className="block mt-2 text-[10px] text-blue-600 hover:text-blue-800 text-right"
        > 
          Download sample CSV<br />template
        </a>
      </div>
      <ErrorModal
        isOpen={showError}
        onClose={handleCloseError}
        error={errorDetails}
      />
    </div>
  );
};
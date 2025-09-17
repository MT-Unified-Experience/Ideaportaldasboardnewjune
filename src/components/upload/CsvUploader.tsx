import React, { useState, useRef } from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

export const CsvUploader: React.FC = () => {
  const { uploadCSV, isLoading, currentProduct } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    try {
      setUploadSuccess(false);
      
      await uploadCSV(file);
      
      // Show success message
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
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
        <div className="relative">
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={isLoading}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
              uploadSuccess 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {uploadSuccess ? (
              <>
                <CheckCircle className="h-[0.7rem] w-[0.7rem] mr-2" />
                Uploaded Successfully
              </>
            ) : (
              <>
                <Upload className="h-[0.7rem] w-[0.7rem] mr-2" />
                {isLoading ? 'Uploading...' : 'Upload CSV (Demo)'}
              </>
            )}
          </button>
          
          {uploadSuccess && (
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
          )}
        </div>
        
        <a 
          href={`${import.meta.env.BASE_URL}template.csv?t=${Date.now()}`}
          className="block mt-2 text-[10px] text-blue-600 hover:text-blue-800 text-right"
        > 
          Download sample CSV<br />template
        </a>
      </div>
    </div>
  );
};
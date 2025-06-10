import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import { parseCSV } from '../../utils/csvParser';

interface UploadMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (file: File, mapping: { [csvHeader: string]: string }) => void;
  currentProduct: string;
}

const UploadMappingModal: React.FC<UploadMappingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  currentProduct
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<{ [csvHeader: string]: string }>({});
  const [step, setStep] = useState<'upload' | 'mapping'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const expectedFields = [
    'Feature Name',
    'Feature Description', 
    'Status',
    'Priority',
    'Assigned To',
    'Due Date',
    'Progress',
    'Category',
    'Tags',
    'Comments'
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    try {
      const result = await parseCSV(selectedFile);
      setFile(selectedFile);
      setCsvHeaders(result.headers);
      
      // Auto-map headers that match expected fields
      const autoMapping: { [key: string]: string } = {};
      result.headers.forEach(header => {
        const normalizedHeader = header.toLowerCase().trim();
        const matchedField = expectedFields.find(field => 
          field.toLowerCase().replace(/\s+/g, '') === normalizedHeader.replace(/\s+/g, '')
        );
        if (matchedField) {
          autoMapping[header] = matchedField;
        }
      });
      
      setMapping(autoMapping);
      setStep('mapping');
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error parsing CSV file. Please check the file format.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleMappingChange = (csvHeader: string, expectedField: string) => {
    setMapping(prev => ({
      ...prev,
      [csvHeader]: expectedField
    }));
  };

  const handleComplete = () => {
    if (file && Object.keys(mapping).length > 0) {
      onComplete(file, mapping);
    }
  };

  const handleReset = () => {
    setFile(null);
    setCsvHeaders([]);
    setMapping({});
    setStep('upload');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Upload CSV for {currentProduct}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {step === 'upload' && (
            <div className="space-y-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop your CSV file here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supports CSV files up to 10MB
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-900 mb-1">
                      CSV Format Requirements
                    </h3>
                    <p className="text-sm text-blue-700">
                      Your CSV should include columns for: Feature Name, Status, Priority, 
                      Assigned To, Due Date, Progress, Category, and other relevant fields. 
                      You'll be able to map your column headers to our expected fields in the next step.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-green-900">
                      File uploaded successfully: {file?.name}
                    </h3>
                    <p className="text-sm text-green-700">
                      Found {csvHeaders.length} columns. Map them to the expected fields below.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Map CSV Columns to Expected Fields
                </h3>
                
                <div className="grid gap-4">
                  {csvHeaders.map((header, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CSV Column: <span className="font-semibold">{header}</span>
                        </label>
                      </div>
                      <div className="flex-1">
                        <select
                          value={mapping[header] || ''}
                          onChange={(e) => handleMappingChange(header, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select field...</option>
                          {expectedFields.map((field) => (
                            <option key={field} value={field}>
                              {field}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Upload Different File
                </button>
                <div className="space-x-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={Object.keys(mapping).length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Import Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadMappingModal;
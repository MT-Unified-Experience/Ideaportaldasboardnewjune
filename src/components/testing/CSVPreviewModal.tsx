import React, { useState } from 'react';
import { X, FileText, AlertCircle, CheckCircle, Eye, Download } from 'lucide-react';
import Papa from 'papaparse';

interface CSVPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  csvFile: File | null;
  onValidateAndUpload: (file: File) => void;
}

interface CSVValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  rowCount: number;
  columnCount: number;
  missingFields: string[];
  duplicateRows: number;
}

const CSVPreviewModal: React.FC<CSVPreviewModalProps> = ({
  isOpen,
  onClose,
  csvFile,
  onValidateAndUpload
}) => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [validation, setValidation] = useState<CSVValidation | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Required fields for validation
  const requiredFields = [
    'product',
    'quarter', 
    'responsiveness',
    'feature_name',
    'vote_count',
    'status'
  ];

  // Analyze CSV file
  const analyzeCSV = async (file: File) => {
    setIsAnalyzing(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        const headers = results.meta.fields || [];
        
        setCsvData(data.slice(0, 10)); // Show first 10 rows
        setCsvHeaders(headers);
        
        // Validate CSV
        const validation = validateCSV(data, headers);
        setValidation(validation);
        setIsAnalyzing(false);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        setIsAnalyzing(false);
      }
    });
  };

  // Validate CSV data
  const validateCSV = (data: any[], headers: string[]): CSVValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check for required fields
    const missingFields = requiredFields.filter(field => !headers.includes(field));
    if (missingFields.length > 0) {
      errors.push(`Missing required columns: ${missingFields.join(', ')}`);
    }
    
    // Check for empty data
    if (data.length === 0) {
      errors.push('CSV file contains no data rows');
    }
    
    // Check for duplicate rows
    const uniqueRows = new Set(data.map(row => JSON.stringify(row)));
    const duplicateRows = data.length - uniqueRows.size;
    if (duplicateRows > 0) {
      warnings.push(`Found ${duplicateRows} duplicate rows`);
    }
    
    // Check for missing values in required fields
    let missingValueCount = 0;
    data.forEach((row, index) => {
      requiredFields.forEach(field => {
        if (headers.includes(field) && (!row[field] || row[field].toString().trim() === '')) {
          missingValueCount++;
        }
      });
    });
    
    if (missingValueCount > 0) {
      warnings.push(`Found ${missingValueCount} missing values in required fields`);
    }
    
    // Check data types
    const numericFields = ['responsiveness', 'vote_count', 'roadmap_alignment_committed', 'roadmap_alignment_total'];
    let invalidNumericCount = 0;
    
    data.forEach(row => {
      numericFields.forEach(field => {
        if (headers.includes(field) && row[field] && isNaN(Number(row[field]))) {
          invalidNumericCount++;
        }
      });
    });
    
    if (invalidNumericCount > 0) {
      warnings.push(`Found ${invalidNumericCount} non-numeric values in numeric fields`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      rowCount: data.length,
      columnCount: headers.length,
      missingFields,
      duplicateRows
    };
  };

  // Export validation report
  const exportValidationReport = () => {
    if (!validation || !csvFile) return;
    
    const report = {
      fileName: csvFile.name,
      fileSize: csvFile.size,
      timestamp: new Date().toISOString(),
      validation,
      headers: csvHeaders,
      sampleData: csvData.slice(0, 5)
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `csv-validation-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle file upload
  React.useEffect(() => {
    if (csvFile && isOpen) {
      analyzeCSV(csvFile);
    }
  }, [csvFile, isOpen]);

  if (!isOpen || !csvFile) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white w-full max-w-6xl shadow-xl">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    CSV Preview & Validation
                  </h2>
                  <p className="text-sm text-gray-600">
                    {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            {isAnalyzing ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Analyzing CSV file...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Validation Summary */}
                {validation && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Validation Summary</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{validation.rowCount}</div>
                        <div className="text-sm text-gray-600">Data Rows</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{validation.columnCount}</div>
                        <div className="text-sm text-gray-600">Columns</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{validation.errors.length}</div>
                        <div className="text-sm text-gray-600">Errors</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{validation.warnings.length}</div>
                        <div className="text-sm text-gray-600">Warnings</div>
                      </div>
                    </div>

                    {/* Validation Status */}
                    <div className={`p-4 rounded-lg border ${
                      validation.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center">
                        {validation.isValid ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                        )}
                        <span className={`font-medium ${
                          validation.isValid ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {validation.isValid ? 'CSV is valid and ready for upload' : 'CSV has validation errors'}
                        </span>
                      </div>
                    </div>

                    {/* Errors */}
                    {validation.errors.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {validation.errors.map((error, index) => (
                            <li key={index} className="text-sm text-red-700">{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Warnings */}
                    {validation.warnings.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-yellow-800 mb-2">Warnings:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {validation.warnings.map((warning, index) => (
                            <li key={index} className="text-sm text-yellow-700">{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Data Preview */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Data Preview (First 10 rows)</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {csvHeaders.map((header, index) => (
                            <th
                              key={index}
                              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              <div className="flex items-center">
                                {header}
                                {requiredFields.includes(header) && (
                                  <span className="ml-1 text-red-500">*</span>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {csvData.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-gray-50">
                            {csvHeaders.map((header, colIndex) => (
                              <td
                                key={colIndex}
                                className="px-3 py-2 text-sm text-gray-900 max-w-[200px] truncate"
                              >
                                {row[header] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Column Analysis */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Column Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-800 mb-2">Required Fields Present:</h4>
                      <div className="space-y-1">
                        {requiredFields.filter(field => csvHeaders.includes(field)).map(field => (
                          <div key={field} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-green-700">{field}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-800 mb-2">Missing Required Fields:</h4>
                      <div className="space-y-1">
                        {validation?.missingFields.map(field => (
                          <div key={field} className="flex items-center text-sm">
                            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                            <span className="text-red-700">{field}</span>
                          </div>
                        )) || <span className="text-sm text-gray-500">None</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between">
            <div className="flex space-x-3">
              <button
                onClick={exportValidationReport}
                disabled={!validation}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </button>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (csvFile) {
                    onValidateAndUpload(csvFile);
                    onClose();
                  }
                }}
                disabled={!validation?.isValid}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="h-4 w-4 mr-2" />
                {validation?.isValid ? 'Upload CSV' : 'Fix Errors First'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVPreviewModal;
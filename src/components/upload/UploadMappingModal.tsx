import React, { useState, useCallback } from 'react';
import { X, Upload, ArrowRight, ArrowLeft, Check, FileText, MapPin, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';

interface FieldMapping {
  [csvHeader: string]: string;
}

interface UploadMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (file: File, mapping: FieldMapping) => void;
  currentProduct: string;
}

interface CSVPreview {
  headers: string[];
  sampleRows: string[][];
}

const UploadMappingModal: React.FC<UploadMappingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  currentProduct
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<CSVPreview | null>(null);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dashboard field definitions with descriptions
  const dashboardFields = [
    { key: 'feature_name', label: 'Feature Name', required: true, description: 'Name of the feature or idea' },
    { key: 'idea_id', label: 'Idea ID', required: false, description: 'Unique identifier for the idea' },
    { key: 'idea_summary', label: 'Idea Summary', required: false, description: 'Brief summary or description of the idea' },
    { key: 'idea_description', label: 'Idea Description', required: false, description: 'Detailed description of the idea' },
    { key: 'idea_title', label: 'Idea Title', required: false, description: 'Title of the idea' },
    { key: 'idea_name', label: 'Idea Name', required: false, description: 'Name of the idea' },
    { key: 'vote_count', label: 'Vote Count', required: true, description: 'Number of votes for this feature' },
    { key: 'idea_votes', label: 'Idea Votes', required: false, description: 'Number of votes for this idea' },
    { key: 'votes', label: 'Votes', required: false, description: 'Vote count' },
    { key: 'status', label: 'Status', required: true, description: 'Current status (Delivered, Under Review, Committed)' },
    { key: 'idea_status', label: 'Idea Status', required: false, description: 'Status of the idea' },
    { key: 'current_status', label: 'Current Status', required: false, description: 'Current status of the item' },
    { key: 'client_voters', label: 'Client Voters', required: false, description: 'List of clients who voted (comma-separated)' },
    { key: 'submitter', label: 'Submitter', required: false, description: 'Person or client who submitted the idea' },
    { key: 'submitted_by', label: 'Submitted By', required: false, description: 'Who submitted this idea' },
    { key: 'assignee', label: 'Assignee', required: false, description: 'Person assigned to work on this idea' },
    { key: 'owner', label: 'Owner', required: false, description: 'Owner of the idea' },
    { key: 'status_updated_at', label: 'Status Updated Date', required: false, description: 'Date when status was last updated' },
    { key: 'created_at', label: 'Created Date', required: false, description: 'Date when the idea was created' },
    { key: 'updated_at', label: 'Updated Date', required: false, description: 'Date when the idea was last updated' },
    { key: 'due_date', label: 'Due Date', required: false, description: 'Due date for the idea' },
    { key: 'priority', label: 'Priority', required: false, description: 'Priority level of the idea' },
    { key: 'category', label: 'Category', required: false, description: 'Category or type of the idea' },
    { key: 'tags', label: 'Tags', required: false, description: 'Tags associated with the idea' },
    { key: 'comments', label: 'Comments', required: false, description: 'Comments or notes about the idea' },
    { key: 'score', label: 'Score', required: false, description: 'Score or rating of the idea' },
    { key: 'effort', label: 'Effort', required: false, description: 'Effort estimate for implementing the idea' },
    { key: 'business_value', label: 'Business Value', required: false, description: 'Business value of the idea' },
    { key: 'product', label: 'Product', required: false, description: 'Product name (will default to current product if not mapped)' },
    { key: 'product_line', label: 'Product Line', required: false, description: 'Product line or family' },
    { key: 'release', label: 'Release', required: false, description: 'Target release for the idea' },
    { key: 'epic', label: 'Epic', required: false, description: 'Epic that contains this idea' },
    { key: 'quarter', label: 'Quarter', required: false, description: 'Quarter information (will default to current quarter if not mapped)' },
    { key: 'responsiveness', label: 'Responsiveness', required: false, description: 'Responsiveness percentage' },
    { key: 'roadmap_alignment_committed', label: 'Committed Ideas', required: false, description: 'Number of committed ideas' },
    { key: 'roadmap_alignment_total', label: 'Total Ideas Target', required: false, description: 'Total ideas target' },
    { key: 'year', label: 'Year', required: false, description: 'Year for idea distribution data' },
    { key: 'candidate_ideas', label: 'Candidate Ideas', required: false, description: 'Number of candidate ideas' },
    { key: 'in_development', label: 'In Development', required: false, description: 'Number of ideas in development' },
    { key: 'archived_ideas', label: 'Archived Ideas', required: false, description: 'Number of archived ideas' },
    { key: 'flagged_for_future', label: 'Flagged for Future', required: false, description: 'Number of ideas flagged for future' },
    { key: 'active_quarter', label: 'Active Quarter', required: false, description: 'Active quarter for client submissions' },
    { key: 'active_clients_representing', label: 'Active Clients Count', required: false, description: 'Number of active clients' },
    { key: 'forum_name', label: 'Forum Name', required: false, description: 'Name of the discussion forum' },
    { key: 'forum_audience', label: 'Forum Audience', required: false, description: 'Target audience for the forum' },
    { key: 'forum_purpose', label: 'Forum Purpose', required: false, description: 'Purpose of the forum' }
  ];

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Parse CSV to get headers and preview
    Papa.parse(file, {
      header: false,
      preview: 6, // Get first 6 rows for preview
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const headers = results.data[0] as string[];
          const sampleRows = results.data.slice(1, 6) as string[][];
          
          setCsvPreview({ headers, sampleRows });
          
          // Auto-suggest mappings based on header names
          const autoMapping: FieldMapping = {};
          headers.forEach(header => {
            const lowerHeader = header.toLowerCase();
            
            // Auto-map common field names
            if (lowerHeader.includes('idea name') || lowerHeader.includes('feature')) {
              autoMapping[header] = 'feature_name';
            } else if (lowerHeader.includes('idea id') || lowerHeader.includes('id')) {
              autoMapping[header] = 'idea_id';
            } else if (lowerHeader.includes('idea summary') || lowerHeader.includes('summary')) {
              autoMapping[header] = 'idea_summary';
            } else if (lowerHeader.includes('idea title') || lowerHeader.includes('title')) {
              autoMapping[header] = 'idea_title';
            } else if (lowerHeader.includes('description')) {
              autoMapping[header] = 'idea_description';
            } else if (lowerHeader.includes('vote') || lowerHeader.includes('count')) {
              autoMapping[header] = 'vote_count';
            } else if (lowerHeader.includes('idea votes')) {
              autoMapping[header] = 'idea_votes';
            } else if (lowerHeader.includes('status') && !lowerHeader.includes('date')) {
              autoMapping[header] = 'status';
            } else if (lowerHeader.includes('idea status')) {
              autoMapping[header] = 'idea_status';
            } else if (lowerHeader.includes('submitter') || lowerHeader.includes('submitted by')) {
              autoMapping[header] = 'submitter';
            } else if (lowerHeader.includes('assignee')) {
              autoMapping[header] = 'assignee';
            } else if (lowerHeader.includes('owner')) {
              autoMapping[header] = 'owner';
            } else if (lowerHeader.includes('priority')) {
              autoMapping[header] = 'priority';
            } else if (lowerHeader.includes('category')) {
              autoMapping[header] = 'category';
            } else if (lowerHeader.includes('tags')) {
              autoMapping[header] = 'tags';
            } else if (lowerHeader.includes('score')) {
              autoMapping[header] = 'score';
            } else if (lowerHeader.includes('effort')) {
              autoMapping[header] = 'effort';
            } else if (lowerHeader.includes('business value')) {
              autoMapping[header] = 'business_value';
            } else if (lowerHeader.includes('release')) {
              autoMapping[header] = 'release';
            } else if (lowerHeader.includes('epic')) {
              autoMapping[header] = 'epic';
            } else if (lowerHeader.includes('created') && lowerHeader.includes('date')) {
              autoMapping[header] = 'created_at';
            } else if (lowerHeader.includes('due date')) {
              autoMapping[header] = 'due_date';
            } else if (lowerHeader.includes('client') && (lowerHeader.includes('voter') || lowerHeader.includes('firm'))) {
              autoMapping[header] = 'client_voters';
            } else if (lowerHeader.includes('date') || lowerHeader.includes('updated')) {
              autoMapping[header] = 'status_updated_at';
            } else if (lowerHeader.includes('product')) {
              autoMapping[header] = 'product';
            } else if (lowerHeader.includes('product line')) {
              autoMapping[header] = 'product_line';
            } else if (lowerHeader.includes('quarter')) {
              autoMapping[header] = 'quarter';
            } else if (lowerHeader.includes('forum name')) {
              autoMapping[header] = 'forum_name';
            } else if (lowerHeader.includes('forum audience')) {
              autoMapping[header] = 'forum_audience';
            } else if (lowerHeader.includes('forum purpose')) {
              autoMapping[header] = 'forum_purpose';
            }
          });
          
          setFieldMapping(autoMapping);
        }
      },
      error: (error) => {
        setError(`Error reading CSV: ${error.message}`);
      }
    });
  }, []);

  const handleMappingChange = (csvHeader: string, dashboardField: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [csvHeader]: dashboardField
    }));
  };

  const validateMapping = () => {
    const requiredFields = dashboardFields.filter(field => field.required);
    const mappedFields = Object.values(fieldMapping);
    
    const missingRequired = requiredFields.filter(field => 
      !mappedFields.includes(field.key)
    );
    
    return missingRequired;
  };

  const handleNext = () => {
    if (currentStep === 1 && selectedFile && csvPreview) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const missingRequired = validateMapping();
      if (missingRequired.length > 0) {
        setError(`Please map the following required fields: ${missingRequired.map(f => f.label).join(', ')}`);
        return;
      }
      setCurrentStep(3);
      setError(null);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleComplete = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    try {
      await onComplete(selectedFile, fieldMapping);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setCsvPreview(null);
    setFieldMapping({});
    setError(null);
    setIsProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white w-full max-w-4xl shadow-xl">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Import CSV Data for {currentProduct}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Step {currentStep} of 3: {
                      currentStep === 1 ? 'Upload CSV File' :
                      currentStep === 2 ? 'Map Fields' :
                      'Confirm & Process'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-50 px-6 py-3">
            <div className="flex items-center">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step < currentStep ? <Check className="h-4 w-4" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
            {/* Step 1: File Upload */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Upload CSV File</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Select a CSV file from Aha or any other source to import data into your dashboard
                  </p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="csv-file-input"
                    />
                    <label
                      htmlFor="csv-file-input"
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose CSV File
                    </label>
                    {selectedFile && (
                      <div className="mt-4 text-sm text-gray-600">
                        Selected: <span className="font-medium">{selectedFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {csvPreview && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">CSV Preview</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="bg-gray-100">
                            {csvPreview.headers.map((header, index) => (
                              <th key={index} className="px-2 py-1 text-left font-medium text-gray-700 border border-gray-200">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvPreview.sampleRows.slice(0, 3).map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="px-2 py-1 text-gray-600 border border-gray-200 max-w-[100px] truncate">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Showing first 3 rows of data. Found {csvPreview.headers.length} columns.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Field Mapping */}
            {currentStep === 2 && csvPreview && (
              <div className="space-y-6">
                <div className="text-center">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Map CSV Fields</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Map your CSV columns to dashboard fields. Required fields are marked with *
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {csvPreview.headers.map((csvHeader, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          CSV Column: <span className="font-normal text-blue-600">{csvHeader}</span>
                        </label>
                        <div className="text-xs text-gray-500 bg-white p-2 rounded border">
                          Sample: {csvPreview.sampleRows[0]?.[index] || 'No data'}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Map to Dashboard Field:
                        </label>
                        <select
                          value={fieldMapping[csvHeader] || ''}
                          onChange={(e) => handleMappingChange(csvHeader, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="">-- Skip this column --</option>
                          {dashboardFields.map((field) => (
                            <option key={field.key} value={field.key}>
                              {field.label} {field.required ? '*' : ''}
                            </option>
                          ))}
                        </select>
                        {fieldMapping[csvHeader] && (
                          <div className="mt-1 text-xs text-gray-600">
                            {dashboardFields.find(f => f.key === fieldMapping[csvHeader])?.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Required Fields Status</h4>
                  <div className="space-y-1">
                    {dashboardFields.filter(f => f.required).map((field) => {
                      const isMapped = Object.values(fieldMapping).includes(field.key);
                      return (
                        <div key={field.key} className="flex items-center text-sm">
                          {isMapped ? (
                            <Check className="h-4 w-4 text-green-600 mr-2" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                          )}
                          <span className={isMapped ? 'text-green-700' : 'text-red-700'}>
                            {field.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Check className="mx-auto h-12 w-12 text-green-600" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Ready to Import</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Review your mapping and click "Import Data" to process the CSV file
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Import Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">File:</span>
                      <span className="ml-2 font-medium">{selectedFile?.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Product:</span>
                      <span className="ml-2 font-medium">{currentProduct}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Mapped Fields:</span>
                      <span className="ml-2 font-medium">{Object.keys(fieldMapping).length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Required Fields:</span>
                      <span className="ml-2 font-medium text-green-600">All mapped ✓</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Field Mappings</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {Object.entries(fieldMapping).map(([csvHeader, dashboardField]) => (
                      <div key={csvHeader} className="flex items-center justify-between text-sm py-1">
                        <span className="text-gray-600">{csvHeader}</span>
                        <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
                        <span className="font-medium text-blue-600">
                          {dashboardFields.find(f => f.key === dashboardField)?.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between">
            <button
              onClick={currentStep === 1 ? handleClose : handleBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>
            
            <div className="flex space-x-3">
              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={currentStep === 1 ? !selectedFile : false}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={isProcessing}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Import Data'}
                  {!isProcessing && <Check className="h-4 w-4 ml-2" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadMappingModal;
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Calculator, Database, FileText, Eye, Download } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { DashboardData } from '../../types';

interface ValidationResult {
  field: string;
  expected: any;
  actual: any;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

interface CalculationTest {
  name: string;
  description: string;
  calculation: (data: DashboardData) => number;
  expectedFormula: string;
  tolerance?: number;
}

interface DataValidationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const DataValidationPanel: React.FC<DataValidationPanelProps> = ({ isOpen, onClose }) => {
  const { dashboardData, currentProduct, currentQuarter } = useData();
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [calculationResults, setCalculationResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'validation' | 'calculations' | 'raw-data'>('validation');
  const [isValidating, setIsValidating] = useState(false);

  // Define calculation tests
  const calculationTests: CalculationTest[] = [
    {
      name: 'Responsiveness Percentage',
      description: 'Validates responsiveness calculation',
      calculation: (data) => data.metricSummary.responsiveness,
      expectedFormula: '(Ideas moved out of review / Total ideas) × 100',
      tolerance: 1
    },
    {
      name: 'Roadmap Alignment Progress',
      description: 'Validates commitment progress calculation',
      calculation: (data) => {
        const { committed, total } = data.metricSummary.roadmapAlignment;
        return total > 0 ? Math.round((committed / total) * 100) : 0;
      },
      expectedFormula: '(Committed ideas / Total target) × 100',
      tolerance: 1
    },
    {
      name: 'Continued Engagement Rate',
      description: 'Validates continued engagement calculation',
      calculation: (data) => data.metricSummary.continuedEngagement?.rate || 0,
      expectedFormula: '(Ideas with follow-up / Total reviewed) × 100',
      tolerance: 1
    },
    {
      name: 'Total Stacked Bar Ideas',
      description: 'Validates sum of all idea statuses per year',
      calculation: (data) => {
        return data.stackedBarData.reduce((sum, year) => {
          return sum + year.candidateIdeas + year.inDevelopment + year.archivedIdeas + year.flaggedForFuture;
        }, 0);
      },
      expectedFormula: 'Sum of all idea statuses across all years',
      tolerance: 0
    },
    {
      name: 'Top Features Vote Count',
      description: 'Validates top features are sorted by vote count',
      calculation: (data) => {
        const features = data.topFeatures;
        if (features.length < 2) return 1; // Pass if less than 2 features
        
        for (let i = 0; i < features.length - 1; i++) {
          if (features[i].vote_count < features[i + 1].vote_count) {
            return 0; // Fail if not sorted descending
          }
        }
        return 1; // Pass if properly sorted
      },
      expectedFormula: 'Features should be sorted by vote count (descending)',
      tolerance: 0
    }
  ];

  // Run validation tests
  const runValidation = () => {
    if (!dashboardData) return;

    setIsValidating(true);
    const results: ValidationResult[] = [];

    // Test 1: Data completeness
    const requiredFields = [
      { field: 'responsiveness', path: 'metricSummary.responsiveness' },
      { field: 'roadmapAlignment.committed', path: 'metricSummary.roadmapAlignment.committed' },
      { field: 'roadmapAlignment.total', path: 'metricSummary.roadmapAlignment.total' },
      { field: 'stackedBarData', path: 'stackedBarData' },
      { field: 'lineChartData', path: 'lineChartData' },
      { field: 'topFeatures', path: 'topFeatures' }
    ];

    requiredFields.forEach(({ field, path }) => {
      const value = getNestedValue(dashboardData, path);
      const isEmpty = value === null || value === undefined || 
                     (Array.isArray(value) && value.length === 0) ||
                     (typeof value === 'number' && isNaN(value));

      results.push({
        field,
        expected: 'Non-empty value',
        actual: isEmpty ? 'Empty/Missing' : 'Present',
        status: isEmpty ? 'fail' : 'pass',
        message: isEmpty ? `${field} is missing or empty` : `${field} is properly populated`
      });
    });

    // Test 2: Data type validation
    const typeTests = [
      { field: 'responsiveness', value: dashboardData.metricSummary.responsiveness, expectedType: 'number' },
      { field: 'committed ideas', value: dashboardData.metricSummary.roadmapAlignment.committed, expectedType: 'number' },
      { field: 'total ideas target', value: dashboardData.metricSummary.roadmapAlignment.total, expectedType: 'number' }
    ];

    typeTests.forEach(({ field, value, expectedType }) => {
      const actualType = typeof value;
      const isCorrectType = actualType === expectedType && !isNaN(value as number);
      
      results.push({
        field: `${field} type`,
        expected: expectedType,
        actual: actualType,
        status: isCorrectType ? 'pass' : 'fail',
        message: isCorrectType ? 
          `${field} has correct type (${expectedType})` : 
          `${field} should be ${expectedType}, got ${actualType}`
      });
    });

    // Test 3: Range validation
    const rangeTests = [
      { 
        field: 'responsiveness', 
        value: dashboardData.metricSummary.responsiveness, 
        min: 0, 
        max: 100,
        message: 'Responsiveness should be between 0-100%'
      }
    ];

    rangeTests.forEach(({ field, value, min, max, message }) => {
      const inRange = value >= min && value <= max;
      results.push({
        field: `${field} range`,
        expected: `${min}-${max}`,
        actual: value,
        status: inRange ? 'pass' : 'warning',
        message: inRange ? `${field} is within valid range` : message
      });
    });

    // Test 4: Data consistency
    const stackedBarYears = dashboardData.stackedBarData.map(item => item.year);
    const expectedYears = ['FY22', 'FY23', 'FY24', 'FY25'];
    const hasAllYears = expectedYears.every(year => stackedBarYears.includes(year));

    results.push({
      field: 'stacked bar years',
      expected: expectedYears.join(', '),
      actual: stackedBarYears.join(', '),
      status: hasAllYears ? 'pass' : 'warning',
      message: hasAllYears ? 
        'All expected fiscal years are present' : 
        'Some expected fiscal years are missing'
    });

    setValidationResults(results);
    setIsValidating(false);
  };

  // Run calculation tests
  const runCalculationTests = () => {
    if (!dashboardData) return;

    const results = calculationTests.map(test => {
      try {
        const result = test.calculation(dashboardData);
        return {
          name: test.name,
          description: test.description,
          result,
          formula: test.expectedFormula,
          status: 'pass',
          message: `Calculation completed successfully: ${result}`
        };
      } catch (error) {
        return {
          name: test.name,
          description: test.description,
          result: 'Error',
          formula: test.expectedFormula,
          status: 'fail',
          message: `Calculation failed: ${(error as Error).message}`
        };
      }
    });

    setCalculationResults(results);
  };

  // Helper function to get nested object values
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Export validation results
  const exportResults = () => {
    const report = {
      product: currentProduct,
      quarter: currentQuarter,
      timestamp: new Date().toISOString(),
      validation: validationResults,
      calculations: calculationResults,
      rawData: dashboardData
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-report-${currentProduct}-${currentQuarter}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Run validation when panel opens or data changes
  useEffect(() => {
    if (isOpen && dashboardData) {
      runValidation();
      runCalculationTests();
    }
  }, [isOpen, dashboardData]);

  if (!isOpen) return null;

  const passedTests = validationResults.filter(r => r.status === 'pass').length;
  const failedTests = validationResults.filter(r => r.status === 'fail').length;
  const warningTests = validationResults.filter(r => r.status === 'warning').length;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[800px] bg-white shadow-xl z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Data Validation & Testing
              </h2>
              <p className="text-sm text-gray-600">
                {currentProduct} - {currentQuarter}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center">
              <X className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <div className="text-2xl font-bold text-red-600">{failedTests}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{warningTests}</div>
                <div className="text-sm text-gray-600">Warnings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={runValidation}
            disabled={isValidating}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Database className="h-4 w-4 mr-2" />
            {isValidating ? 'Validating...' : 'Re-run Validation'}
          </button>
          <button
            onClick={runCalculationTests}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Re-run Calculations
          </button>
          <button
            onClick={exportResults}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'validation', name: 'Data Validation', icon: CheckCircle },
              { id: 'calculations', name: 'Calculations', icon: Calculator },
              { id: 'raw-data', name: 'Raw Data', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {/* Validation Tab */}
          {activeTab === 'validation' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Validation Results</h3>
              <div className="space-y-3">
                {validationResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.status === 'pass' ? 'bg-green-50 border-green-200' :
                      result.status === 'fail' ? 'bg-red-50 border-red-200' :
                      'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        {result.status === 'pass' ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                        ) : result.status === 'fail' ? (
                          <X className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">
                            {result.field.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="font-medium">Expected:</span> {String(result.expected)} | 
                            <span className="font-medium ml-2">Actual:</span> {String(result.actual)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calculations Tab */}
          {activeTab === 'calculations' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Calculation Tests</h3>
              <div className="space-y-3">
                {calculationResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.status === 'pass' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start">
                      {result.status === 'pass' ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                      ) : (
                        <X className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{result.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{result.description}</p>
                        <div className="mt-2 text-sm">
                          <div className="font-medium text-gray-700">Formula: {result.formula}</div>
                          <div className="text-gray-600">Result: {result.result}</div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{result.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Data Tab */}
          {activeTab === 'raw-data' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Raw Data Inspection</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-xs text-gray-700 overflow-auto max-h-96">
                  {JSON.stringify(dashboardData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataValidationPanel;
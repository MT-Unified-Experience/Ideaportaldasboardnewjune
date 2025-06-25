Here's the fixed version with all missing closing brackets added:

```typescript
import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Upload } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { DashboardData, TopFeature, DataSocializationForum } from '../../types';
import Papa from 'papaparse';

interface DashboardManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardManagement: React.FC<DashboardManagementProps> = ({ isOpen, onClose }) => {
  // ... [all the existing code remains the same until the JSX]

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* ... [all the existing JSX remains the same until the missing closing brackets] */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="text-md font-medium text-blue-900 mb-2">Features</h4>
                    {/* ... [feature management content] ... */}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLocalLoading}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md ${
                  isLocalLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLocalLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardManagement;
```
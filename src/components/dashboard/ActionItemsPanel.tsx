import React, { useState } from 'react';
import { useEffect } from 'react';
import { X, CheckSquare, Square, Edit2, Save, Trash2 } from 'lucide-react';
import ExportToPdfButton from '../common/ExportToPdfButton';
import { useData } from '../../contexts/DataContext';
import { ActionItem } from '../../types';

interface ActionItemsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ActionItemsPanel: React.FC<ActionItemsPanelProps> = ({ isOpen, onClose }) => {
  const { 
    currentProduct, 
    currentQuarter, 
    fetchActionItems, 
    createActionItem, 
    updateActionItem, 
    deleteActionItem,
    isSupabaseAvailable 
  } = useData();
  const panelContentRef = React.useRef<HTMLDivElement>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load action items when panel opens or product/quarter changes
  useEffect(() => {
    if (isOpen && isSupabaseAvailable) {
      loadActionItems();
    }
  }, [isOpen, currentProduct, currentQuarter, isSupabaseAvailable]);

  const loadActionItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const items = await fetchActionItems(currentProduct, currentQuarter);
      setActionItems(items);
    } catch (err) {
      console.error('Error loading action items:', err);
      setError('Failed to load action items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async (id: string) => {
    try {
      const item = actionItems.find(item => item.id === id);
      if (!item) return;

      await updateActionItem(id, { completed: !item.completed });
      
      // Update local state
      setActionItems(items =>
        items.map(item =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      );
    } catch (err) {
      console.error('Error toggling action item:', err);
      setError('Failed to update action item');
    }
  };

  const handleEdit = (item: ActionItem) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  const handleSave = async (id: string) => {
    try {
      await updateActionItem(id, { text: editText.trim() });
      
      // Update local state
      setActionItems(items =>
        items.map(item =>
          item.id === id ? { ...item, text: editText.trim() } : item
        )
      );
      setEditingId(null);
    } catch (err) {
      console.error('Error saving action item:', err);
      setError('Failed to save action item');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteActionItem(id);
      
      // Update local state
      setActionItems(items => items.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting action item:', err);
      setError('Failed to delete action item');
    }
  };

  const handleAddNew = async () => {
    if (newItemText.trim()) {
      try {
        const newItem = await createActionItem(currentProduct, currentQuarter, newItemText.trim());
        
        // Update local state
        setActionItems(items => [newItem, ...items]);
        setNewItemText('');
        setIsAddingNew(false);
      } catch (err) {
        console.error('Error creating action item:', err);
        setError('Failed to create action item');
      }
    }
  };

  // Group action items by quarter for display
  const groupedItems = actionItems.reduce((groups, item) => {
    const quarter = item.quarter;
    if (!groups[quarter]) {
      groups[quarter] = [];
    }
    groups[quarter].push(item);
    return groups;
  }, {} as Record<string, ActionItem[]>);

  // Get quarters in reverse chronological order
  const quarters = Object.keys(groupedItems).sort((a, b) => {
    // Extract quarter numbers for comparison
    const getQuarterNum = (quarter: string) => {
      const match = quarter.match(/FY(\d+)\s+Q(\d+)/);
      if (match) {
        const year = parseInt(match[1]);
        const q = parseInt(match[2]);
        return year * 10 + q;
      }
      return 0;
    };
    return getQuarterNum(b) - getQuarterNum(a);
  });

  if (!isOpen) return null;

  // Show message if Supabase is not available
  if (!isSupabaseAvailable) {
    return (
      <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-xl z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentProduct} Action Items
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              Database connection is not available. Action items cannot be saved or loaded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-xl z-50 overflow-y-auto">
      <div ref={panelContentRef} className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {currentProduct} Action Items
          </h2>
          <div className="flex items-center gap-3">
            <ExportToPdfButton 
              targetRef={panelContentRef}
              filename={`${currentProduct}_Action_Items`}
              size="sm"
            />
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-4 text-center">
            <div className="inline-flex items-center px-4 py-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Loading action items...
            </div>
          </div>
        )}

        {/* Add New Action Item Form */}
        <div className="mb-6">
          <button
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add New Action Item
          </button>

          {isAddingNew && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action Item Text
                  </label>
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter action item description"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Product:</strong> {currentProduct}<br />
                  <strong>Quarter:</strong> {currentQuarter}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNew(false);
                      setNewItemText('');
                    }}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNew}
                    disabled={!newItemText.trim()}
                    className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {quarters.length === 0 && !isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <p>No action items found for {currentProduct}.</p>
              <p className="text-sm mt-2">Click "Add New Action Item" to create your first item.</p>
            </div>
          ) : (
            quarters.map(quarter => {
              const quarterItems = groupedItems[quarter];
              
              return (
                <div key={quarter} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{quarter}</h3>
                    <span className="text-sm text-gray-500">
                      {quarterItems.length} item{quarterItems.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {quarterItems.map(item => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border ${
                          item.completed
                            ? 'bg-gray-50 border-gray-200'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <button
                          onClick={() => handleToggleComplete(item.id)}
                          className="flex-shrink-0 mt-1"
                        >
                          {item.completed ? (
                            <CheckSquare className="h-5 w-5 text-green-600" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        <div className="flex-grow min-w-0">
                          {editingId === item.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="flex-grow px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                onClick={() => handleSave(item.id)}
                                className="p-1 text-green-600 hover:text-green-700"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-4">
                              <p className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                {item.text}
                              </p>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-1 text-red-400 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Created on {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionItemsPanel;
      setNewItemText('');
      setIsAddingNew(false);
    }
  };

  if (!isOpen) return null;

  const quarters = ['FY25 Q4', 'FY25 Q3', 'FY25 Q2', 'FY25 Q1'];

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-xl z-50 overflow-y-auto">
      <div ref={panelContentRef} className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {currentProduct} Action Items
          </h2>
          <div className="flex items-center gap-3">
            <ExportToPdfButton 
              targetRef={panelContentRef}
              filename={`${currentProduct}_Action_Items`}
              size="sm"
            />
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Add New Action Item Form */}
        <div className="mb-6">
          <button
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add New Action Item
          </button>

          {isAddingNew && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action Item Text
                  </label>
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter action item description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quarter
                  </label>
                  <select
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {quarters.map(quarter => (
                      <option key={quarter} value={quarter}>{quarter}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNew}
                    disabled={!newItemText.trim()}
                    className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {quarters.map(quarter => {
            const quarterItems = actionItems.filter(item => 
              item.quarter === quarter && item.product === currentProduct
            );
            if (quarterItems.length === 0) return null;

            return (
              <div key={quarter} className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">{quarter}</h3>
                <div className="space-y-3">
                  {quarterItems.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border ${
                        item.completed
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <button
                        onClick={() => handleToggleComplete(item.id)}
                        className="flex-shrink-0 mt-1"
                      >
                        {item.completed ? (
                          <CheckSquare className="h-5 w-5 text-green-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      <div className="flex-grow min-w-0">
                        {editingId === item.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="flex-grow px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => handleSave(item.id)}
                              className="p-1 text-green-600 hover:text-green-700"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-4">
                            <p className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                              {item.text}
                            </p>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1 text-red-400 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Created on {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActionItemsPanel;
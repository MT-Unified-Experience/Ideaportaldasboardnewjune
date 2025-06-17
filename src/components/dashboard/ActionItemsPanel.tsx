import React, { useState } from 'react';
import { X, CheckSquare, Square, Edit2, Save, Trash2 } from 'lucide-react';
import ExportToPdfButton from '../common/ExportToPdfButton';
import { useData } from '../../contexts/DataContext';

interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  quarter: string;
  createdAt: string;
  product: string;
}

interface ActionItemsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ActionItemsPanel: React.FC<ActionItemsPanelProps> = ({ isOpen, onClose }) => {
  const { currentProduct } = useData();
  const panelContentRef = React.useRef<HTMLDivElement>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    {
      id: '1',
      text: 'Review aging ideas and create action plan',
      completed: false,
      quarter: 'FY25 Q1',
      createdAt: '2025-01-15',
      product: 'TeamConnect'
    },
    {
      id: '2',
      text: 'Schedule follow-up meetings with top contributing clients',
      completed: true,
      quarter: 'FY25 Q1',
      createdAt: '2025-01-20',
      product: 'TeamConnect'
    },
    // Add more mock items as needed
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('FY25 Q1');

  const handleToggleComplete = (id: string) => {
    setActionItems(items =>
      items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleEdit = (item: ActionItem) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  const handleSave = (id: string) => {
    setActionItems(items =>
      items.map(item =>
        item.id === id ? { ...item, text: editText } : item
      )
    );
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setActionItems(items => items.filter(item => item.id !== id));
  };

  const handleAddNew = () => {
    if (newItemText.trim()) {
      const newItem: ActionItem = {
        id: Date.now().toString(),
        text: newItemText.trim(),
        completed: false,
        quarter: selectedQuarter,
        createdAt: new Date().toISOString(),
        product: currentProduct
      };
      setActionItems(items => [...items, newItem]);
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
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { X, Clock } from 'lucide-react';

interface AgingIdeasModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Array<{
    quarter: string;
    count: number;
  }>;
}

const AgingIdeasModal: React.FC<AgingIdeasModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 ml-4">
              Aging Ideas Trend
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="quarter" 
                    tickFormatter={(value) => value.replace('FY', '20')}
                  />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number, name: string) => [value, 'Aging Ideas']}
                    labelFormatter={(label: string) => `Quarter: ${label.replace('FY', '20')}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Aging Ideas"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-4">
              <p className="text-sm text-gray-600">
                Number of ideas in Candidate status for over 90 days, tracked quarterly
              </p>
              <div className="grid grid-cols-4 gap-4">
                {data.slice(0, -1).map((item, index) => {
                  const nextItem = data[index + 1];
                  const change = ((nextItem.count - item.count) / item.count) * 100;
                  return (
                    <div key={item.quarter} className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-xs text-gray-500">{item.quarter} → {nextItem.quarter}</p>
                      <p className={`text-sm font-medium ${change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgingIdeasModal;
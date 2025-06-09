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
import { X, TrendingUp } from 'lucide-react';

interface ResponsivenessTrendData {
  quarter: string;
  percentage: number;
  responded: number;
  total: number;
}

interface ResponsivenessTrendModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ResponsivenessTrendData[];
}

const ResponsivenessTrendModal: React.FC<ResponsivenessTrendModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <p className="text-sm text-blue-600 font-medium">
            {data.percentage}% ({data.responded} of {data.total} ideas responded)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 ml-4">
              Responsiveness Trend – Last 4 Quarters
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
                  <YAxis 
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    name="Responsiveness %"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 space-y-4">
              <p className="text-sm text-gray-600">
                Percentage of ideas that received a status update after being moved out of "Needs Review"
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {data.map((item, index) => {
                  const nextItem = data[index + 1];
                  if (!nextItem) return null;
                  
                  const change = nextItem.percentage - item.percentage;
                  return (
                    <div key={item.quarter} className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-xs text-gray-500">{item.quarter} → {nextItem.quarter}</p>
                      <p className={`text-sm font-medium ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Quarterly Breakdown</h3>
            <div className="space-y-3">
              {data.map((item) => (
                <div
                  key={item.quarter}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{item.quarter}</h4>
                    <p className="text-sm text-gray-600">
                      {item.responded} of {item.total} ideas responded to
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {item.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsivenessTrendModal;
import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { StackedBarData } from '../../types';

interface HorizontalStackedBarChartProps {
  data: StackedBarData[];
}

const HorizontalStackedBarChart: React.FC<HorizontalStackedBarChartProps> = ({ data }) => {
  // Sort data by year in descending order
  const sortedData = [...data].sort((a, b) => b.year.localeCompare(a.year));
  
  // Transform the data to include FY prefix only once
  const transformedData = sortedData.map(item => ({
    ...item,
    year: item.year.startsWith('FY') ? item.year : `FY${item.year}`
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                <span
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: entry.fill }}
                />
                {entry.name}:
              </span>
              <span className="ml-4 font-medium">
                {entry.value} ({((entry.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex justify-between text-sm font-medium">
              <span>Total:</span>
              <span>{total}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="flex flex-wrap gap-4 justify-center mt-2">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center">
          <span
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Idea Status Distribution by Year
        </h3>
        <div className="relative group">
          <HelpCircle className="h-4 w-4 text-[#6E6E6E] cursor-help" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            View the yearly breakdown of ideas by their current status (Candidate, In Development, etc.)
          </div>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={sortedData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            barSize={24}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number"
              tickFormatter={(value) => value.toString()}
            />
            <YAxis
              dataKey="year"
              type="category"
              tickFormatter={(value) => value}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            <Bar
              dataKey="candidateIdeas"
              name="Candidate"
              stackId="a"
              fill="#3b82f6"
            />
            <Bar
              dataKey="inDevelopment"
              name="In Development"
              stackId="a"
              fill="#8b5cf6"
            />
            <Bar
              dataKey="archivedIdeas"
              name="Archived"
              stackId="a"
              fill="#6b7280"
            />
            <Bar
              dataKey="flaggedForFuture"
              name="Flagged for Future"
              stackId="a"
              fill="#93c5fd"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HorizontalStackedBarChart;
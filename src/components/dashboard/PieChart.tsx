import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { PieChartData } from '../../types';

interface PieChartProps {
  data: PieChartData[];
}

const STATUS_COLORS = {
  'Committed': '#3b82f6',
  'Under Review': '#8b5cf6',
  'Delivered': '#22c55e',
};

export default function PieChart({ data }: PieChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p className="text-sm font-medium">{item.name}</p>
          <p className="text-xs text-gray-600">Value: {item.value}</p>
          <p className="text-xs text-gray-600">
            Status: <span style={{ color: STATUS_COLORS[item.status] }}>{item.status}</span>
            {item.quarter && ` (${item.quarter})`}
          </p>
        </div>
      );
    }

    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-col gap-1">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <div className="flex flex-col">
              <span className="text-xs font-medium">{entry.payload.name}</span>
              <span className="text-xs text-gray-500">
                {entry.payload.status}
                {entry.payload.quarter && ` (${entry.payload.quarter})`}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Top 3 Requested Features
      </h3>
      <div className="h-64 flex">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="40%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              animationDuration={1000}
              animationBegin={0}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={STATUS_COLORS[entry.status]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              content={<CustomLegend />}
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{
                paddingLeft: "10px",
                marginLeft: "-25px"
              }}
            />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
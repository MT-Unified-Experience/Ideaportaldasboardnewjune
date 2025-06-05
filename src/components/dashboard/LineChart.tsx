import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { X, Users, HelpCircle } from 'lucide-react';
import { LineChartData, Feature } from '../../types';

interface ClientListProps {
  quarter: string;
  clients: string[];
  onClose: () => void;
}

const ClientList: React.FC<ClientListProps> = ({ quarter, clients, onClose }) => (
  <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-xl z-50 overflow-y-auto">
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
        {quarter} Client Submissions
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-6 w-6 text-gray-500" />
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <div className="space-y-3">
          {clients.map((client, index) => (
            <div
              key={index}
              className="flex items-center text-sm text-gray-700 bg-white p-3 rounded-lg shadow-sm"
            >
              <Users className="h-4 w-4 text-purple-500 mr-2" />
              {client}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

interface LineChartProps {
  data: LineChartData[];
  features?: Feature[];
}

const LineChart: React.FC<LineChartProps> = ({ data, features }) => {
  const [selectedQuarter, setSelectedQuarter] = React.useState<string | null>(null);

  const getQuarterClients = (quarter: string) => {
    const quarterData = data.find(d => d.quarter === quarter);
    return quarterData?.clients || [];
  };

  const handleClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const quarter = data.activePayload[0].payload.quarter;
      setSelectedQuarter(quarter);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Client Submissions by Quarter
        </h3>
        <div className="relative group">
          <HelpCircle className="h-4 w-4 text-[#6E6E6E] cursor-help" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            Track quarterly submission trends and compare client engagement across different time periods
          </div>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={data.map(d => ({
              ...d,
              clients: d.clients || []
            }))}
            onClick={handleClick}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" />
            <YAxis label={{ value: '# of clients with submissions', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="clientsRepresenting"
              name="# of clients with submissions"
              stroke="#8b5cf6"
              animationDuration={1000}
              strokeWidth={2}
              className="cursor-pointer"
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
      {selectedQuarter && (
        <ClientList
          quarter={selectedQuarter}
          clients={getQuarterClients(selectedQuarter)}
          onClose={() => setSelectedQuarter(null)}
        />
      )}
    </div>
  );
};

export default LineChart;
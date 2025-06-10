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

const ClientList: React.FC<ClientListProps> = ({ quarter, clients, onClose }) => {
  // Generate sample ideas for the selected quarter
  const generateIdeasForQuarter = (quarter: string, clients: string[]) => {
    const ideaTemplates = [
      'AI-Powered Document Analysis',
      'Mobile App Enhancement',
      'Reporting Dashboard Improvements',
      'API Integration Updates',
      'Custom Workflow Builder',
      'Document Management System',
      'Search Functionality Enhancement',
      'Bulk Actions Feature',
      'Dashboard Customization',
      'Email Integration',
      'Advanced Analytics Dashboard',
      'Multi-language Support',
      'Real-time Notifications',
      'Data Export Enhancements',
      'User Permission Management',
      'Automated Workflow Templates',
      'Integration with Third-party Tools',
      'Mobile Responsive Design',
      'Advanced Search Filters',
      'Audit Trail Improvements',
      'Cloud Storage Integration',
      'Enhanced Security Features',
      'Performance Optimization',
      'Custom Report Builder',
      'Collaboration Tools'
    ];

    const ideas = [];
    let ideaCounter = 1;

    // Generate 2-4 ideas per client
    clients.forEach((client, clientIndex) => {
      const ideasPerClient = 2 + Math.floor(Math.random() * 3); // 2-4 ideas per client
      
      for (let i = 0; i < ideasPerClient; i++) {
        const ideaIndex = (clientIndex * ideasPerClient + i) % ideaTemplates.length;
        ideas.push({
          id: `${quarter.replace(/\s+/g, '')}-${String(ideaCounter).padStart(3, '0')}`,
          clientName: client,
          summary: ideaTemplates[ideaIndex]
        });
        ideaCounter++;
      }
    });

    return ideas;
  };

  const ideas = generateIdeasForQuarter(quarter, clients);

  return (
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

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{clients.length}</div>
              <div className="text-sm text-gray-600">Contributing Clients</div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{ideas.length}</div>
              <div className="text-sm text-gray-600">Total Ideas Submitted</div>
            </div>
          </div>
        </div>

        {/* Contributing Clients List */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Contributing Clients</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        {/* Ideas Data Table */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Ideas Submitted This Quarter</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                      Idea ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                      Client or Firm Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                      Idea Summary Title
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ideas.map((idea, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-blue-600 border-r border-gray-200">
                        {idea.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-purple-500 mr-2" />
                          {idea.clientName}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {idea.summary}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-md font-medium text-gray-900 mb-2">Quarter Insights</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Average of {clients.length > 0 ? Math.round(ideas.length / clients.length * 10) / 10 : 0} ideas per contributing client</p>
            <p>• Most active client contributed {clients.length > 0 ? Math.max(...clients.map(client => ideas.filter(idea => idea.clientName === client).length)) : 0} ideas</p>
            <p>• Ideas span across multiple functional areas including AI, mobile, reporting, and workflow automation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface LineChartProps {
  data: LineChartData[];
  features?: Feature[];
}

const LineChart: React.FC<LineChartProps> = ({ data, features }) => {
  const [selectedQuarter, setSelectedQuarter] = React.useState<string | null>(null);

  // Generate default clients if none provided
  const generateDefaultClients = (count: number): string[] => {
    const clientNames = [
      'Acme Corporation',
      'Global Tech Solutions',
      'Enterprise Systems Inc',
      'Innovation Partners LLC',
      'Strategic Consulting Group',
      'Digital Transformation Co',
      'Advanced Analytics Corp',
      'Future Technologies Ltd',
      'Business Intelligence Inc',
      'Data Solutions Group',
      'Cloud Computing Corp',
      'Automation Systems LLC',
      'Smart Solutions Inc',
      'Tech Innovators Group',
      'Digital Solutions Corp'
    ];
    
    return clientNames.slice(0, count);
  };

  const getQuarterClients = (quarter: string) => {
    const quarterData = data.find(d => d.quarter === quarter);
    const clients = quarterData?.clients || [];
    
    // If no clients are provided but there's a clientsRepresenting count, generate default clients
    if (clients.length === 0 && quarterData?.clientsRepresenting > 0) {
      return generateDefaultClients(quarterData.clientsRepresenting);
    }
    
    return clients;
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
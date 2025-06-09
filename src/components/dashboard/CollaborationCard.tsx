import React, { useState } from 'react';
import { Users, X, HelpCircle } from 'lucide-react';
import CrossClientCollaborationTrend from './CrossClientCollaborationTrend';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CollaborationCardProps {
  value: number;
  tooltip?: string;
  collaborationTrends: Array<{
    rate: number;
    clientName: string;
  }>;
}

const CollaborationCard: React.FC<CollaborationCardProps> = ({ value, collaborationTrends, tooltip }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTrendChart, setShowTrendChart] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState<string | null>(null);
  const [showClientList, setShowClientList] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  const quarters = ['FY25 Q1', 'FY25 Q2', 'FY25 Q3', 'FY25 Q4'];
  
  const transformedTrends = quarters.map((quarter, index) => {
    const trend = collaborationTrends[index] || { rate: 0, clientName: '' };
    return {
      quarter,
      collaborationCount: trend.rate,
      clientName: trend.clientName || '',
      clients: trend.clientName ? trend.clientName.split(',').map(s => s.trim()).filter(Boolean) : []
    };
  });

  const handlePointClick = (data: any) => {
    if (data && data.payload) {
      const quarter = data.payload.quarter;
      const quarterData = transformedTrends.find(t => t.quarter === quarter);
      setSelectedQuarter(quarter);
      if (quarterData) {
        const uniqueClients = quarterData.clients;
        setSelectedClients(uniqueClients);
        setShowClientList(true);
      }
    }
  };

  const handleChartClick = () => {
    setShowClientList(false);
  };

  const handleCloseTrendChart = () => {
    setShowTrendChart(false);
  };
  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-full transition-all duration-300 cursor-pointer hover:shadow-md hover:-translate-y-1"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-medium text-gray-500">Cross-Client Collaboration</h3>
              {tooltip && (
                <div className="relative group">
                  <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    {tooltip}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-1 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{value}%</p>
            </div>
            <p className="mt-1 text-xs text-gray-500">% ideas solving for multiple clients</p>
          </div>
          <div className="p-2 rounded-full bg-amber-100">
            <Users className="h-5 w-5 text-amber-600" />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-xl z-50 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 ml-4">
                  Cross-Client Collaboration
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTrendChart(true)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTrendChart(true);
                  }}
                  className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  View Trend Analysis
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedQuarter(null);
                    setShowTrendChart(false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={transformedTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quarter" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        }}
                        formatter={(value: number, name: string) => {
                          if (name === 'collaborationCount') {
                            const quarterData = transformedTrends.find(t => t.collaborationCount === value);
                            return [
                              <div>
                                <div>{`${value}%`}</div>
                                {quarterData?.clientName && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Clients: {quarterData.clientName}
                                  </div>
                                )}
                              </div>,
                              'Collaboration Rate'
                            ];
                          }
                          return [value, name];
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="collaborationCount"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        className="cursor-pointer"
                        dot={{ fill: '#f59e0b', r: 4 }}
                        activeDot={{
                          r: 8,
                          onClick: handlePointClick,
                          style: { cursor: 'pointer' },
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {showClientList && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {selectedQuarter} Clients ({selectedClients.length})
                      </h3>
                      <button
                        onClick={() => setShowClientList(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
                      {selectedClients.map((client, index) => (
                        <div
                          key={index}
                          className="flex items-center p-4 hover:bg-gray-50 transition-colors duration-150"
                        >
                          <Users className="h-4 w-4 text-amber-500 mr-3" />
                          <span className="text-sm text-gray-700">{client}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedQuarter && !showClientList && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {selectedQuarter} Client Details
                    </h3>
                    <div className="space-y-4">
                      {(() => {
                        const quarterData = transformedTrends.find(t => t.quarter === selectedQuarter);
                        return quarterData && quarterData.clientName ? (
                          <div
                            key={quarterData.quarter}
                            className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:border-amber-200 transition-colors duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="flex flex-wrap gap-2">
                                  {quarterData.clients.map((client, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
                                    >
                                      {client}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <span className="text-sm font-medium text-amber-600">
                                {quarterData.collaborationCount}% collaboration rate
                              </span>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <CrossClientCollaborationTrend
        isOpen={showTrendChart}
        onClose={handleCloseTrendChart}
      />
    </>
  );
};

export default CollaborationCard;
import React from 'react';
import { X, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { CollaborativeIdea } from '../../types';

interface QuarterlyCollaborationData {
  quarter: string;
  year: number;
  collaborativeIdeas: number;
  totalIdeas: number;
  collaborationRate: number;
  significantChange: boolean;
  changeDirection: 'up' | 'down' | 'stable';
  changePercentage: number;
  topCollaborativeIdeas: CollaborativeIdea[];
}

interface CrossClientCollaborationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: QuarterlyCollaborationData | null;
}

const CrossClientCollaborationDetailsModal: React.FC<CrossClientCollaborationDetailsModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  if (!isOpen || !data) return null;

  // Generate sample ideas if none provided
  const generateSampleIdeas = (count: number): CollaborativeIdea[] => {
    const ideaTemplates = [
      'AI-Powered Document Analysis',
      'Multi-Client Workflow Integration',
      'Cross-Platform Data Sync',
      'Collaborative Review Dashboard',
      'Unified Reporting System',
      'Smart Notification Engine',
      'Advanced Search Capabilities',
      'Real-time Collaboration Tools'
    ];

    const commentTemplates = [
      'Multiple clients have requested enhanced AI capabilities for document processing and analysis.',
      'Cross-client collaboration needed for workflow standardization across different organizations.',
      'Data synchronization requirements identified by several enterprise clients.',
      'Collaborative review features requested to improve multi-stakeholder decision making.',
      'Unified reporting system to consolidate data from multiple client environments.',
      'Smart notifications to improve cross-client communication and updates.',
      'Advanced search requested by clients dealing with large document repositories.',
      'Real-time collaboration tools for distributed teams across client organizations.'
    ];

    return Array.from({ length: count }, (_, index) => ({
      id: `COLLAB-${data.year}-${data.quarter}-${String(index + 1).padStart(3, '0')}`,
      name: ideaTemplates[index % 8],
      originalSubmitter: ['Client A', 'Client B', 'Client C', 'Client D'][Math.floor(Math.random() * 4)],
      contributors: [
        'Client A', 'Client B', 'Client C', 'Client D', 'Client E', 'Client F'
      ].slice(0, 2 + Math.floor(Math.random() * 3)),
      submissionDate: new Date(data.year, (parseInt(data.quarter.slice(-1)) - 1) * 3, 1).toISOString(),
      collaborationScore: 60 + Math.floor(Math.random() * 40),
      status: ['Active', 'Delivered', 'In Development'][Math.floor(Math.random() * 3)] as any,
      comments: commentTemplates[index % 8]
    }));
  };

  // Use provided ideas or generate sample ones
  const displayIdeas = data.topCollaborativeIdeas && data.topCollaborativeIdeas.length > 0 
    ? data.topCollaborativeIdeas 
    : generateSampleIdeas(Math.min(5, data.collaborativeIdeas));

  return (
    <>
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-40"
        onClick={onClose}
      />
      
      {/* Fly-out panel */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[700px] bg-white shadow-xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {data.quarter} {data.year} - Detailed Metrics
                </h2>
                <p className="text-sm text-gray-600">
                  Cross-client collaboration analysis and insights
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Metrics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Collaboration Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Collaborative Ideas</span>
                    <span className="font-medium text-amber-600">{data.collaborativeIdeas}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Total Ideas</span>
                    <span className="font-medium text-gray-900">{data.totalIdeas}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Collaboration Rate</span>
                    <span className="font-medium text-blue-600">{data.collaborationRate}%</span>
                  </div>
                  {data.significantChange && (
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <span className="text-sm text-gray-600">Quarter-over-Quarter Change</span>
                      <div className="flex items-center">
                        {data.changeDirection === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : data.changeDirection === 'down' ? (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        ) : null}
                        <span className={`font-medium ${
                          data.changeDirection === 'up' ? 'text-green-600' : 
                          data.changeDirection === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {data.changePercentage > 0 ? '+' : ''}{data.changePercentage}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Key Insights</h3>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-amber-800">Collaboration Score</span>
                      <span className="text-lg font-bold text-amber-600">{data.collaborationRate}%</span>
                    </div>
                    <div className="text-xs text-amber-700">
                      {data.collaborationRate >= 70 ? 'Excellent collaboration' :
                       data.collaborationRate >= 50 ? 'Good collaboration' :
                       data.collaborationRate >= 30 ? 'Moderate collaboration' :
                       'Low collaboration'}
                    </div>
                    {data.significantChange && (
                      <div className="pt-2 border-t border-amber-200">
                        <div className="text-xs text-amber-700">
                          {data.changeDirection === 'up' ? 'Trending upward' :
                           data.changeDirection === 'down' ? 'Trending downward' :
                           'Stable trend'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Collaborative Ideas Data Table */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Top Collaborative Ideas</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b border-gray-200">
                          Idea ID
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b border-gray-200">
                          Idea Summary
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b border-gray-200">
                          Status
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-b border-gray-200">
                          Idea Comments
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {displayIdeas.map((idea, index) => (
                        <tr key={idea.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-xs font-medium text-blue-600 border-r border-gray-200">
                            {idea.id}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900 border-r border-gray-200">
                            <div className="max-w-[150px]">
                              <div className="font-medium">{idea.name}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                Contributors: {idea.contributors.length}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-xs border-r border-gray-200">
                            <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                              idea.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                              idea.status === 'In Development' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {idea.status}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-700">
                            <div className="max-w-[200px]">
                              {idea.comments}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Analysis Summary */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="text-md font-medium text-blue-900 mb-2">Analysis Summary</h4>
              <div className="text-sm text-blue-700 space-y-2">
                <p>
                  • This quarter shows {data.collaborativeIdeas} collaborative ideas out of {data.totalIdeas} total ideas ({data.collaborationRate}% collaboration rate)
                </p>
                <p>
                  • Average collaboration score across all ideas: {Math.round(displayIdeas.reduce((sum, idea) => sum + idea.collaborationScore, 0) / displayIdeas.length)}%
                </p>
                <p>
                  • Most active collaboration areas: {displayIdeas.slice(0, 3).map(idea => idea.name).join(', ')}
                </p>
                {data.significantChange && (
                  <p>
                    • Significant {data.changeDirection === 'up' ? 'increase' : 'decrease'} of {Math.abs(data.changePercentage)}% compared to previous quarter
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CrossClientCollaborationDetailsModal;
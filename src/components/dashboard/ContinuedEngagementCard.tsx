import React, { useState } from 'react';
import { RefreshCw, X, HelpCircle, CheckCircle, Clock } from 'lucide-react';

interface ContinuedEngagementCardProps {
  value: number;
  numerator: number;
  denominator: number;
  tooltip?: string;
  ideas?: Array<{
    id: string;
    name: string;
    initialStatusChange: string;
    subsequentChanges: Array<{
      date: string;
      status: string;
    }>;
    daysBetween: number;
    included: boolean;
  }>;
}

const ContinuedEngagementCard: React.FC<ContinuedEngagementCardProps> = ({ 
  value, 
  numerator, 
  denominator, 
  tooltip,
  ideas = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'included' | 'excluded'>('included');

  const includedIdeas = ideas.filter(idea => idea.included);
  const excludedIdeas = ideas.filter(idea => !idea.included);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
              <h3 className="text-[13px] font-medium text-gray-500">Continued Engagement Rate</h3>
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
            <p className="mt-1 text-xs text-gray-500">% of reviewed ideas updated again within 90 days</p>
            <p className="mt-2 text-xs text-gray-400">{numerator} of {denominator} ideas</p>
          </div>
          <div className="p-2 rounded-full bg-green-100">
            <RefreshCw className="h-5 w-5 text-green-600" />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[700px] bg-white shadow-xl z-50 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <RefreshCw className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 ml-4">
                  Continued Engagement Rate
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{value}%</div>
                    <div className="text-sm text-gray-600">Engagement Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{numerator}</div>
                    <div className="text-sm text-gray-600">Ideas with Follow-up</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-600">{denominator}</div>
                    <div className="text-sm text-gray-600">Total Reviewed</div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p className="mb-2">
                    <strong>Calculation:</strong> Ideas that received at least one additional status update 
                    within 90 days after being moved out of "Needs Review\" status.
                  </p>
                  <p>
                    This metric helps track whether ideas continue progressing through the pipeline 
                    after initial review, indicating sustained engagement and follow-through.
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('included')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'included'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Ideas with Follow-up ({includedIdeas.length})
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('excluded')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'excluded'
                        ? 'border-gray-500 text-gray-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Ideas without Follow-up ({excludedIdeas.length})
                    </div>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="space-y-4">
                {activeTab === 'included' && (
                  <div className="space-y-3">
                    {includedIdeas.length > 0 ? (
                      includedIdeas.map((idea) => (
                        <div
                          key={idea.id}
                          className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-2">{idea.name}</h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>
                                  <span className="font-medium">Initial change:</span> {formatDate(idea.initialStatusChange)}
                                </p>
                                <p>
                                  <span className="font-medium">Follow-up changes:</span>
                                </p>
                                <div className="ml-4 space-y-1">
                                  {idea.subsequentChanges.map((change, index) => (
                                    <div key={index} className="flex items-center text-xs">
                                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                      {formatDate(change.date)} - {change.status}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="ml-4 text-right">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {idea.daysBetween} days
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No ideas with follow-up changes found
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'excluded' && (
                  <div className="space-y-3">
                    {excludedIdeas.length > 0 ? (
                      excludedIdeas.map((idea) => (
                        <div
                          key={idea.id}
                          className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-2">{idea.name}</h4>
                              <div className="text-sm text-gray-600">
                                <p>
                                  <span className="font-medium">Initial change:</span> {formatDate(idea.initialStatusChange)}
                                </p>
                                <p className="text-gray-500 mt-1">
                                  No additional status changes within 90 days
                                </p>
                              </div>
                            </div>
                            <div className="ml-4 text-right">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                No follow-up
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        All reviewed ideas had follow-up changes
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContinuedEngagementCard;
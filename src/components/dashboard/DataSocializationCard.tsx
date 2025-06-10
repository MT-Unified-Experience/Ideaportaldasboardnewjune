import React from 'react';
import { Users, Calendar, LineChart, Presentation, HelpCircle, Check, X } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const DataSocializationCard: React.FC = () => {
  const { dashboardData, currentProduct } = useData();
  const forums = dashboardData?.data_socialization_forums || [];

  // Define all possible forums with their details
  const allForums = [
    {
      name: 'CSC',
      fullName: 'Client Success Committee',
      icon: Users
    },
    {
      name: 'Sprint Reviews',
      fullName: 'Sprint Reviews',
      icon: Calendar
    },
    {
      name: 'Customer Advisory Board (CAB)',
      fullName: 'Customer Advisory Board',
      icon: Presentation
    },
    {
      name: 'CWG',
      fullName: 'Client Working Group',
      icon: Users
    },
    {
      name: 'Quarterly Product Reviews (QBRs)',
      fullName: 'Quarterly Business Reviews',
      icon: LineChart
    }
  ];

  // Check if a forum is used by the current product
  const isForumUsed = (forumName: string) => {
    return forums.some(forum => 
      forum.name.toLowerCase().includes(forumName.toLowerCase()) ||
      forumName.toLowerCase().includes(forum.name.toLowerCase())
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Data Socialization Forums - {currentProduct}
        </h3>
        <div className="relative group">
          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            Forums where {currentProduct} data insights and metrics are shared and discussed with stakeholders
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allForums.map((forum, index) => {
          const Icon = forum.icon;
          const isUsed = isForumUsed(forum.name);
          
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                isUsed 
                  ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                  : 'border-red-200 bg-red-50 hover:bg-red-100'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isUsed ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      isUsed ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div className={`p-1 rounded-full ${
                    isUsed ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {isUsed ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : (
                      <X className="h-4 w-4 text-white" />
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  isUsed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isUsed ? 'Active' : 'Not Used'}
                </span>
              </div>
              
              <div className="text-center">
                <h4 className="font-semibold text-sm text-gray-900 mb-3">
                  {forum.fullName}
                </h4>
                
                {/* Usage indicator bar */}
                <div className="flex items-center justify-center">
                  <div className={`w-20 h-3 rounded-full ${
                    isUsed ? 'bg-green-200' : 'bg-red-200'
                  }`}>
                    <div className={`h-full rounded-full transition-all duration-300 ${
                      isUsed ? 'w-full bg-green-500' : 'w-0 bg-red-500'
                    }`} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Summary Statistics */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-green-600">
              {allForums.filter(forum => isForumUsed(forum.name)).length}
            </div>
            <div className="text-xs text-gray-600">Active Forums</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-red-600">
              {allForums.filter(forum => !isForumUsed(forum.name)).length}
            </div>
            <div className="text-xs text-gray-600">Unused Forums</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((allForums.filter(forum => isForumUsed(forum.name)).length / allForums.length) * 100)}%
            </div>
            <div className="text-xs text-gray-600">Coverage Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSocializationCard;
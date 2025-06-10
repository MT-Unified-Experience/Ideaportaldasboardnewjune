import React from 'react';
import { Users, Calendar, LineChart, Presentation, HelpCircle, Check, X } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const DataSocializationCard: React.FC = () => {
  const { dashboardData } = useData();
  const forums = dashboardData?.data_socialization_forums || [];

  // Define all possible forums with their details
  const allForums = [
    { name: 'CSC', icon: Users },
    { name: 'Sprint Reviews', icon: Calendar },
    { name: 'Customer Advisory Board (CAB)', icon: Presentation },
    { name: 'CWG', icon: Users },
    { name: 'Quarterly Product Reviews (QBRs)', icon: LineChart }
  ];

  // Check if a forum is used by the current product
  const isForumUsed = (forumName: string) => {
    return forums.some(forum => 
      forum.name.toLowerCase().includes(forumName.toLowerCase()) ||
      forumName.toLowerCase().includes(forum.name.toLowerCase())
    );
  };

  const activeForums = allForums.filter(forum => isForumUsed(forum.name)).length;
  const coverageRate = Math.round((activeForums / allForums.length) * 100);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-full">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-medium text-gray-500">Data Socialization Forums</h3>
            <div className="relative group">
              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                Forums where data insights and metrics are shared with stakeholders
              </div>
            </div>
          </div>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{activeForums}/{allForums.length}</p>
          </div>
          <p className="mt-1 text-xs text-gray-500">Active forums ({coverageRate}% coverage)</p>
        </div>
        <div className="p-2 rounded-full bg-blue-100">
          <Users className="h-5 w-5 text-blue-600" />
        </div>
      </div>
      
      {/* Compact forum list */}
      <div className="mt-4 space-y-2">
        {Array.from({ length: Math.ceil(allForums.length / 2) }, (_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-2 gap-2">
            {allForums.slice(rowIndex * 2, rowIndex * 2 + 2).map((forum, index) => {
              const Icon = forum.icon;
              const isUsed = isForumUsed(forum.name);
              
              return (
                <div
                  key={rowIndex * 2 + index}
                  className="flex items-center p-2 rounded-md bg-gray-50"
                >
                  <div className={`p-0.5 rounded-full ${
                    isUsed ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {isUsed ? (
                      <Check className="h-2.5 w-2.5 text-white" />
                    ) : (
                      <X className="h-2.5 w-2.5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 ml-2">
                    <span className="text-xs font-medium text-gray-700 text-left break-words">
                      {forum.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataSocializationCard;
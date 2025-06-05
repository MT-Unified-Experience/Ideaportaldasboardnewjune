import React from 'react';
import { Users, Calendar, LineChart, Presentation, HelpCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const DataSocializationCard: React.FC = () => {
  const { dashboardData } = useData();
  const forums = dashboardData?.data_socialization_forums || [];

  const getIcon = (forumName: string) => {
    switch (forumName) {
      case 'CSC':
        return Users;
      case 'Sprint Reviews':
        return Calendar;
      case 'Customer Advisory Board (CAB)':
        return Presentation;
      case 'CWG':
        return Users;
      case 'Quarterly Product Reviews (QBRs)':
        return LineChart;
      default:
        return Users;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-7">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Data Socialization Forums
        </h3>
        <div className="relative group">
          <HelpCircle className="h-4 w-4 text-[#6E6E6E] cursor-help" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            Overview of discussion forums where data insights and analysis are shared and collaborated on
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {forums.map((forum, index) => {
          const Icon = getIcon(forum.name);
          return forum.name && (
            <div
              key={index}
              className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex-shrink-0">
                <div className="p-0.5 bg-blue-100 rounded-lg">
                  <Icon className="h-2.5 w-2.5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {forum.name}
                </p>
              </div>
            </div>
          );
        }).filter(Boolean)}
      </div>
    </div>
  );
};

export default DataSocializationCard;
import React from 'react';
import { TrendingUp, Users, Briefcase, Clock, HelpCircle } from 'lucide-react';

interface MetricSummaryCardProps {
  title: string;
  value: number | { committed: number; total: number } | null;
  type: 'percentage' | 'number';
  icon: 'responsiveness' | 'roadmap' | 'clients' | 'collaboration' | 'aging';
  tooltip?: string;
  trendData?: Array<{ quarter: string; count: number; }>;
  description: string;
  subLabel?: string;
  onCardClick?: () => void;
}

const MetricSummaryCard: React.FC<MetricSummaryCardProps> = ({
  title,
  value,
  type,
  icon,
  tooltip,
  trendData,
  description,
  subLabel,
  onCardClick,
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'responsiveness':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'roadmap':
        return <Briefcase className="h-5 w-5 text-purple-600" />;
      case 'clients':
        return <Users className="h-5 w-5 text-teal-600" />;
      case 'collaboration':
        return <Users className="h-5 w-5 text-amber-600" />;
      case 'aging':
        return <Clock className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getIconBackground = () => {
    switch (icon) {
      case 'responsiveness':
        return 'bg-blue-100';
      case 'roadmap':
        return 'bg-purple-100';
      case 'clients':
        return 'bg-teal-100';
      case 'collaboration':
        return 'bg-amber-100';
      case 'aging':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  const renderValue = () => {
    if (value === null) {
      return 'N/A';
    }
    
    if (typeof value === 'number') {
      return type === 'percentage' ? `${value}%` : value;
    }
    
    if ('committed' in value && 'total' in value) {
      return `${value.committed}/${value.total}`;
    }

    return 'Invalid data';
  };

  return (
    <div
      onClick={onCardClick}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-full transition-all duration-300 ${
        onCardClick ? 'cursor-pointer transform transition-transform duration-300 hover:shadow-md hover:-translate-y-1' : ''
      }`}
      title={trendData ? "Click to view trend" : undefined}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-medium text-gray-500">{title}</h3>
              {tooltip && (
                <div className="relative group">
                  <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    {tooltip}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">
              {renderValue()}
            </p>
          </div>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
          {subLabel && (
            <p className="mt-2 text-xs text-gray-400">{subLabel}</p>
          )}
        </div>
        <div className={`p-2 rounded-full ${getIconBackground()}`}>
          {getIcon()}
        </div>
      </div>
    </div>
  );
};

export default MetricSummaryCard;
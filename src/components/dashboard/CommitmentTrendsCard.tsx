import React, { useState } from 'react';
import { Briefcase, HelpCircle } from 'lucide-react';
import CommitmentTrendsDetailsModal from './CommitmentTrendsDetailsModal';

interface CommitmentTrendsCardProps {
  value: { committed: number; total: number; commitmentStatus?: 'On Track' | 'Off Track' | 'At Risk' };
  tooltip?: string;
  commitmentTrends?: Array<{
    year: string;
    committed: number;
    delivered: number;
    ideas?: Array<{
      id: string;
      summary: string;
    }>;
  }>;
  quarterlyDeliveries?: Array<{
    quarter: string;
    year: string;
    delivered: number;
    ideas?: Array<{
      id: string;
      summary: string;
    }>;
  }>;
}

const CommitmentTrendsCard: React.FC<CommitmentTrendsCardProps> = ({ 
  value, 
  tooltip,
  commitmentTrends = [],
  quarterlyDeliveries = []
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-full transition-all duration-300 cursor-pointer hover:shadow-md hover:-translate-y-1"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-medium text-gray-500">Idea Portal Commitment</h3>
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
              <div className="flex items-center gap-3">
                <p className="text-2xl font-semibold text-gray-900">
                {value.total}/{value.committed}
                </p>
                {value.commitmentStatus && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    value.commitmentStatus === 'On Track' ? 'bg-green-100 text-green-800' :
                    value.commitmentStatus === 'Off Track' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {value.commitmentStatus}
                  </span>
                )}
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">Ideas Delivered to Date vs Annual Commitment</p>
          </div>
          <div className="p-2 rounded-full bg-purple-100">
            <Briefcase className="h-5 w-5 text-purple-600" />
          </div>
        </div>
      </div>

      <CommitmentTrendsDetailsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        value={value}
        commitmentTrends={commitmentTrends}
        quarterlyDeliveries={quarterlyDeliveries}
      />
    </>
  );
};

export default CommitmentTrendsCard;
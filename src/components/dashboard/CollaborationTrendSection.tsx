import React from 'react';
import CrossClientCollaborationTrend from './CrossClientCollaborationTrend';

interface CollaborationTrendSectionProps {
  isVisible?: boolean;
}

const CollaborationTrendSection: React.FC<CollaborationTrendSectionProps> = ({ 
  isVisible = true 
}) => {
  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <CrossClientCollaborationTrend
        isOpen={true}
        onClose={() => {}}
        embedded={true}
      />
    </div>
  );
};

export default CollaborationTrendSection;
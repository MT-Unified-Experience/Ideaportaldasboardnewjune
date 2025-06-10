import React, { useState } from 'react';
import { Share2 } from 'lucide-react';

const ShareButton: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="inline-flex items-center px-2 sm:px-3 py-2 bg-white text-gray-700 text-xs sm:text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 border border-gray-200"
      >
        <Share2 className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Share</span>
      </button>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap">
          URL copied!
        </div>
      )}
    </div>
  );
};

export default ShareButton;
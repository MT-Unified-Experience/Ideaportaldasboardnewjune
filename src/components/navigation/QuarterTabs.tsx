import React from 'react';
import { Quarter } from '../../types';
import { useData } from '../../contexts/DataContext';

const QuarterTabs: React.FC = () => {
  const { currentQuarter, setCurrentQuarter } = useData();
  
  const quarters: Quarter[] = ['FY25 Q1', 'FY25 Q2', 'FY25 Q3', 'FY25 Q4', 'FY26 Q1'];

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
      {quarters.map((quarter) => (
        <button
          key={quarter}
          onClick={() => setCurrentQuarter(quarter)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            currentQuarter === quarter
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
          aria-current={currentQuarter === quarter ? 'page' : undefined}
        >
          {quarter}
        </button>
      ))}
    </div>
  );
};

export default QuarterTabs;
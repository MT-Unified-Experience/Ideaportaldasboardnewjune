import React from 'react';

interface DashboardSectionProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ 
  children, 
  className = '',
  spacing = 'md'
}) => {
  const spacingClasses = {
    sm: 'space-y-2 lg:space-y-3',
    md: 'space-y-4 lg:space-y-6',
    lg: 'space-y-6 lg:space-y-8'
  };

  return (
    <div className={`${spacingClasses[spacing]} w-full ${className}`}>
      {children}
    </div>
  );
};

export default DashboardSection;
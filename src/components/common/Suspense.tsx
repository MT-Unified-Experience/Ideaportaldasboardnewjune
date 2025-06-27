import React, { Suspense as ReactSuspense } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface SuspenseProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  text?: string;
}

export const Suspense: React.FC<SuspenseProps> = ({
  children,
  fallback,
  text = 'Loading...',
}) => {
  const defaultFallback = (
    <div className="flex items-center justify-center min-h-[200px]">
      <LoadingSpinner text={text} />
    </div>
  );

  return (
    <ReactSuspense fallback={fallback || defaultFallback}>
      {children}
    </ReactSuspense>
  );
};
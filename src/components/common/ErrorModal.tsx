import React from 'react';
import { X, FileWarning, Database, AlertTriangle } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: {
    message: string;
    type?: 'file' | 'data' | 'application';
    details?: string[];
  };
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, error }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (error.type) {
      case 'file':
        return <FileWarning className="h-6 w-6 text-red-600" />;
      case 'data':
        return <Database className="h-6 w-6 text-red-600" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
    }
  };

  const getTitle = () => {
    switch (error.type) {
      case 'file':
        return 'File Error';
      case 'data':
        return 'Data Error';
      default:
        return 'Application Error';
    }
  };
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity\" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                {getIcon()}
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  {getTitle()}
                </h3>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900">{error.message}</p>
                  {error.details && (
                    <div className="mt-2 text-sm text-gray-500">
                      {error.details.map((detail, index) => (
                        <p key={index} className="mt-1">{detail}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
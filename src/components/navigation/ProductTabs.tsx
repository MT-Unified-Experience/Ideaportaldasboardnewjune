import React from 'react';
import { Product } from '../../types';
import { useData } from '../../contexts/DataContext';

const ProductTabs: React.FC = () => {
  const { currentProduct, setCurrentProduct } = useData();
  
  const products: Product[] = [
    'TeamConnect',
    'Collaborati',
    'LegalHold',
    'TAP Workflow Automation',
    'HotDocs',
    'eCounsel',
    'CaseCloud',
  ];

  return (
    <div className="overflow-x-auto">
      <div className="flex border-b border-gray-200 min-w-max">
        {products.map((product) => (
          <button
            key={product}
            onClick={() => setCurrentProduct(product)}
            className={`px-4 py-3 font-medium text-sm transition-all duration-200 border-b-2 whitespace-nowrap ${
              currentProduct === product
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            aria-current={currentProduct === product ? 'page' : undefined}
          >
            {product}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductTabs;
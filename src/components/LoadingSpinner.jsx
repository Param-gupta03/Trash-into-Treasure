import React from 'react';

/**
 * A simple loading spinner component
 */
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="ml-4 text-lg text-gray-600">Analyzing image...</p>
  </div>
);

export default LoadingSpinner;

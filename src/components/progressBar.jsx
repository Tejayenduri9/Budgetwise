// ProgressBar.js
import React from 'react';

const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
      <div
        className="bg-green-500 h-4 rounded-full"
        style={{ width: `${progress}%` }}>
      </div>
    </div>
  );
};

export default ProgressBar;

import React from 'react';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const progressPercentage = Math.min(Math.max(progress, 0), 5) * 20; // Ensure progress is between 0 and 5

  return (
    <div className="relative bg-gray-200 w-full h-4 mt-2">
      <div
        className="bg-green-500 h-full"
        style={{ width: `${progressPercentage}%` }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-700">
        {progress} of 5
      </span>
    </div>
  );
};

export default ProgressBar;

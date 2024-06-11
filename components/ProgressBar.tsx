import React from 'react';
interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const total_strings = 7;

  const progress_ratio = 100 / total_strings;

  const progressPercentage =
    Math.min(Math.max(progress, 0), total_strings) * progress_ratio;

  return (
    <div className="relative mt-2 h-4 w-full bg-gray-200">
      <div
        className="h-full bg-green-500"
        style={{ width: `${progressPercentage}%` }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-700">
        {progress} of {total_strings}
      </span>
    </div>
  );
};

export default ProgressBar;

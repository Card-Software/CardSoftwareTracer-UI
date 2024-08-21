import React from 'react';

interface TracerButtonProps {
  onClick?: () => void;
  name: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const TracerButton: React.FC<TracerButtonProps> = ({
  onClick,
  name,
  icon,
  disabled,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-nowrap rounded-md px-4 py-2 text-white ${
        disabled
          ? 'cursor-not-allowed bg-gray-400'
          : 'bg-teal-700 hover:bg-teal-600'
      }`}
    >
      {icon && <span className="mr-2 inline-block">{icon}</span>}
      <span>{name}</span>
    </button>
  );
};

export default TracerButton;

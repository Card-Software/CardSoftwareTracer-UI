import React from 'react';

interface TracerButtonProps {
  onClick?: () => void;
  name: string;
  icon?: React.ReactNode;
}

const TracerButton: React.FC<TracerButtonProps> = ({ onClick, name, icon }) => {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-md bg-teal-700 px-4 py-2 text-white hover:bg-teal-600 focus:outline-none"
    >
      {icon && <span className="mr-2 inline-block">{icon}</span>}
      <span>{name}</span>
    </button>
  );
};

export default TracerButton;

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
      className="button-dashboard flex items-center space-x-2"
    >
      {icon && <span className="inline-block mr-2">{icon}</span>}
      <span>{name}</span>
    </button>
  );
};

export default TracerButton;

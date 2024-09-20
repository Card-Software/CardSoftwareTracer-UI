import React from 'react';

interface TracerButtonProps {
  onClick?: () => void;
  name: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const TracerButton: React.FC<TracerButtonProps> = ({
  onClick,
  name,
  icon,
  type = 'button',
  disabled,
}) => {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className="w-fit-content text-nowrap rounded-md px-4 py-2 text-white"
      style={{ backgroundColor: 'var(--primary-button)' }}
    >
      {icon && <span className="mr-2 inline-block">{icon}</span>}
      <span>{name}</span>
    </button>
  );
};

export default TracerButton;

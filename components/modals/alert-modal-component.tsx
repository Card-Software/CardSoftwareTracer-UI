import React, { useEffect, useState } from 'react';

interface AlertProps {
  isOpen: boolean;
  type: string;
  title: string;
  message: string;
  icon: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
}

const AlertModal: React.FC<AlertProps> = ({
  isOpen,
  type,
  title,
  message,
  icon,
  onClose,
  onConfirm,
}) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
    } else {
      setTimeout(() => setShowModal(false), 300);
    }
  }, [isOpen]);

  if (!showModal && !isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`w-96 rounded-lg bg-white p-8 transition-all duration-300 ${
          isOpen ? 'animate-grow' : ''
        }`}
      >
        <div className="flex items-center justify-center">
          <div className="rounded-full p-3">{icon}</div>
        </div>
        <div className="mt-4 text-center">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <p className="text-gray-600">{message}</p>
        </div>
        <div className="mt-8 flex justify-center space-x-4">
          <button
            className="rounded-lg bg-gray-500 px-4 py-2 text-white"
            onClick={onClose}
          >
            Close
          </button>
          {type === 'delete' ? (
            <button
              className="rounded-lg bg-red-500 px-4 py-2 text-white"
              onClick={onConfirm}
            >
              Delete
            </button>
          ) : (
            <button
              className="rounded-lg bg-green-500 px-4 py-2 text-white"
              onClick={onConfirm}
            >
              Update
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertModal;

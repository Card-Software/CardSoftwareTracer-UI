// components/ArrayModal.tsx
import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#__next'); // Set the app element for accessibility

interface ArrayModalProps {
  isOpen: boolean;
  title: string;
  data: string[];
  onClose: () => void;
}

const ArrayModal: React.FC<ArrayModalProps> = ({
  isOpen,
  title,
  data,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={title}
      className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75"
      overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-75"
    >
      <div className="w-full max-w-md rounded-md bg-white p-6 shadow-lg">
        <h2 className="text-lg font-bold">{title}</h2>
        <ul className="mt-4">
          {data.map((item, index) => (
            <li key={index} className="py-1">
              {item}
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="mt-4 rounded-md bg-gray-500 px-4 py-2 text-white"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default ArrayModal;

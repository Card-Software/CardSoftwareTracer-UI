// components/BaseModal.tsx
import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import '@/styles/base-components/base-modal.css';
import TracerButton from '../tracer-button.component';
import LoadingOverlay from '../loading-overlay.component';

interface BaseModalProps {
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
  onSave?: () => void;
  canSave?: boolean;
  saveButtonDisplayText?: string;
  title: string;
  children: React.ReactNode;
}

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  loading,
  onClose,
  onSave,
  canSave,
  saveButtonDisplayText = 'Save',
  title,
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setClosing(false);
    } else if (visible) {
      setClosing(true);
      setTimeout(() => {
        setVisible(false);
      }, 300);
    }
  }, [isOpen]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
      setVisible(false);
      setClosing(false);
    }, 300);
  };

  if (!visible && !closing) {
    return null;
  }

  return (
    <div className={`modal-wrapper ${closing ? 'closing' : 'open'}`}>
      <LoadingOverlay show={loading} />
      <div className="modal-overlay" onClick={handleClose} />
      <div className="modal-content">
        <div className="modal-header">
          <h1>{title}</h1>
          <button
            onClick={handleClose}
            className="close-button square"
            type="button"
          >
            <FaTimes size={24} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer ">
          <div className="flex w-fit items-center gap-3">
            {onSave && (
              <TracerButton
                type="submit"
                name={saveButtonDisplayText}
                onClick={onSave}
                disabled={!canSave}
              />
            )}
            <button
              className=" border border-white bg-none text-white hover:bg-gray-600 "
              style={{ borderRadius: '10px' }}
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseModal;

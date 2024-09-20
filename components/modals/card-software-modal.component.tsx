// components/Modal.tsx
import React, { ReactNode } from 'react';
import styles from '../styles/Modal.module.css';

interface CardSoftwareModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const CardSoftwareModal: React.FC<CardSoftwareModalProps> = ({
  show,
  onClose,
  title,
  children,
}) => {
  if (!show) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
};

export default CardSoftwareModal;

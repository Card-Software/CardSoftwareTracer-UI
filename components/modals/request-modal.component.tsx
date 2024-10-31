// components/ActivityLogModal.tsx
import React from 'react';
import { ActivityLog } from '@/models/activity-log';
import { ActivityType } from '@/models/enum/activity-type';
import BaseModal from '../_base/base-modal.component';

interface RequestModalProps {
  onClose: () => void;
}

const RequestModal: React.FC<RequestModalProps> = ({ onClose }) => {
  return (
    <BaseModal title="Request" onClose={onClose} isOpen={true} loading={false}>
      ss
    </BaseModal>
  );
};

export default RequestModal;

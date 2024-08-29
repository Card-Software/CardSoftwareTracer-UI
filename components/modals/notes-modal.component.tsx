// components/ActivityLogModal.tsx
import React from 'react';
import { ActivityLog } from '@/models/activity-log';
import { ActivityType } from '@/models/enum/activity-type';
import BaseModal from '../_base/base-modal.component';
import { Note } from '@/models/note';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: any[];
}

const NotesModal: React.FC<NotesModalProps> = ({
  isOpen = false,
  onClose,
  notes = [],
}) => {
  return (
    <BaseModal
      title="Activity Log"
      onClose={onClose}
      isOpen={isOpen}
      loading={false}
      typeSaveButton="button"
    >
      <div>NOte Modal</div>
      <div>NOte Modal</div>
      <div>
        {notes.map((note, index) => (
          <p key={index}>{note.content}</p>
        ))}
      </div>
    </BaseModal>
  );
};

export default NotesModal;

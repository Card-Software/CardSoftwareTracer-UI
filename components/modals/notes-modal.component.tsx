import React, { useEffect, useRef, useState } from 'react';
import BaseModal from '../_base/base-modal.component';
import { Note } from '@/models/note';
import { User } from '@/models/user';
import '@/styles/notes.css';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  currentUser: User;
}

const NotesModal: React.FC<NotesModalProps> = ({
  isOpen = false,
  onClose,
  notes = [],
  setNotes,
  currentUser,
}) => {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [expandedNoteIndex, setExpandedNoteIndex] = useState<number | null>(
    null,
  );

  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewNoteContent(e.target.value);
  };

  const handleSaveNote = () => {
    if (newNoteContent.trim()) {
      const newNote: Note = {
        content: newNoteContent,
        enteredBy: currentUser,
        dateEntered: new Date(),
      };
      setNotes([...notes, newNote]);
      setNewNoteContent('');
    }
  };

  const toggleNoteExpansion = (index: number) => {
    setExpandedNoteIndex(expandedNoteIndex === index ? null : index);
  };

  useEffect(() => {
    if (expandedNoteIndex !== null && contentRefs.current[expandedNoteIndex]) {
      const element = contentRefs.current[expandedNoteIndex];
      element!.style.maxHeight = `${element!.scrollHeight}px`;
    }
  }, [expandedNoteIndex]);

  return (
    <BaseModal
      title="Add Note"
      onClose={onClose}
      isOpen={isOpen}
      loading={false}
      typeSaveButton="button"
      onSave={handleSaveNote}
      canSave={newNoteContent.trim().length > 0}
    >
      <div className="mt-4">
        <label
          htmlFor="new-note"
          className="block text-sm font-medium text-gray-700"
        >
          Add a Note
        </label>
        <textarea
          id="new-note"
          className="input-custom"
          rows={3}
          value={newNoteContent}
          onChange={handleInputChange}
          placeholder="Write your note here..."
        />
      </div>

      <div className="mt-4">
        {notes.map((note, index) => (
          <div key={index} className="mb-2">
            <button
              className={`flex w-full items-center justify-between rounded-lg px-4 py-2 text-left ${
                expandedNoteIndex === index ? 'bg-gray-300 ' : 'bg-transparent'
              }`}
              onClick={() => toggleNoteExpansion(index)}
            >
              <span className="flex-1 truncate">{note.content}</span>
              <span className="ml-4 text-xl">
                {expandedNoteIndex === index ? '-' : '+'}
              </span>
            </button>
            <div
              ref={(el) => {
                contentRefs.current[index] = el;
              }}
              className={`transition-max-height relative overflow-hidden duration-500 ease-in-out`}
              style={{
                maxHeight:
                  expandedNoteIndex === index
                    ? `${contentRefs.current[index]?.scrollHeight}px`
                    : '0px',
              }}
            >
              <div className="mt-2 rounded-b-lg bg-white p-4 text-gray-700">
                <div className="max-h-20 overflow-hidden">
                  <p>{note.content}</p>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {note.dateEntered.toString().split('T')[0].replace(/-/g, '/')}{' '}
                  • {note.enteredBy.firstName} {note.enteredBy.lastname}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </BaseModal>
  );
};

export default NotesModal;

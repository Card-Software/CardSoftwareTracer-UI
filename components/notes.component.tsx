import React, { useState } from 'react';
import '@/styles/notes.css';
import NotesModal from './modals/notes-modal.component';
import { Note } from '@/models/note';
import { User } from '@/models/user';
import parse from 'html-react-parser';
import { FaPlus } from 'react-icons/fa';

interface NotesProps {
  notes?: Note[] | [];
  currentUser: User;
  onChange: (updatedNotes: Note[]) => void;
}

const Notes: React.FC<NotesProps> = ({ notes, currentUser, onChange }) => {
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [currentNotes, setCurrentNotes] = useState(notes ?? []);
  const [searchTerm, setSearchTerm] = useState('');

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0].replace(/-/g, '/');
  };

  const openNotesModal = () => {
    setNoteModalOpen(true);
  };

  const handleNotesChanged: React.Dispatch<React.SetStateAction<Note[]>> = (
    updatedNotes,
  ) => {
    const newNotes =
      typeof updatedNotes === 'function'
        ? updatedNotes(currentNotes)
        : updatedNotes;
    setCurrentNotes(newNotes);
    onChange(newNotes);
  };

  const filteredNotes = currentNotes.filter((note) =>
    note.content.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div
      className=" max-w-lg rounded-lg border bg-white shadow-lg"
      style={{ maxHeight: '25rem' }}
    >
      {/* Header with title and add button */}
      <div className="flex items-center justify-between rounded-t-lg bg-[var(--primary-color)] p-4">
        <h2 className="text-xl font-semibold text-white">Notes</h2>
        <div>
          <button
            onClick={openNotesModal}
            className="rounded-full bg-white p-2 text-[var(--primary-color)] shadow hover:bg-[var(--primary-button-hover)]"
          >
            <FaPlus />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="border-b p-4">
        <div className="flex items-center rounded-lg bg-gray-100 px-3 py-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 11h4M8 15h4m-6 0a2 2 0 102 2m0-4v1m4-3v1"
            />
          </svg>
          <input
            type="text"
            placeholder="Search Notes"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ml-2 w-full bg-gray-100 text-gray-700 outline-none"
          />
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto p-4">
        {filteredNotes.map((note, index) => (
          <div
            key={index}
            className="flex items-center border-b border-gray-200 py-4 last:border-none"
            onClick={openNotesModal}
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--primary-color)] font-bold text-white">
              {note.enteredBy.firstName.charAt(0)}
              {note.enteredBy.lastname.charAt(0)}
            </div>
            <div className="ml-4">
              <p className="note-content font-semibold text-gray-900">
                {note.content.length > 50
                  ? parse(note.content.slice(0, 50))
                  : parse(note.content)}
              </p>
              <p className="text-sm text-gray-600">
                {formatDate(new Date(note.dateEntered))} •{' '}
                {note.enteredBy.firstName} {note.enteredBy.lastname}
              </p>
            </div>
          </div>
        ))}
      </div>

      <NotesModal
        isOpen={noteModalOpen}
        notes={currentNotes}
        onClose={() => {
          setNoteModalOpen(false);
        }}
        setNotes={handleNotesChanged}
        currentUser={currentUser}
      />
    </div>
  );
};

export default Notes;

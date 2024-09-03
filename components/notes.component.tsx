import React, { useState } from 'react';
import '@/styles/notes.css';
import NotesModal from './modals/notes-modal.component';
import { Note } from '@/models/note';
import { User } from '@/models/user';
import { set } from 'lodash';

interface NotesProps {
  notes?: Note[] | [];
  currentUser: User; // Añadido para pasar el usuario actual
  // setNotes: React.Dispatch<React.SetStateAction<Note[]>>; // Para actualizar las notas en el componente padre
  onChange: (updatedNotes: Note[]) => void;
}

const Notes: React.FC<NotesProps> = ({ notes, currentUser, onChange }) => {
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [currentNotes, setCurrentNotes] = useState(notes ?? []);

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

  return (
    <div className="input-custom max-w-sm rounded-lg p-6">
      <div className="mt-3 flex justify-between">
        <h2 className="mb-4 mt-3 text-xl font-semibold text-gray-700">Notes</h2>
        <button
          onClick={openNotesModal}
          className="mx-2 mb-6 max-h-64 cursor-pointer rounded-lg border-none bg-white border-inherit"
        >
          +
        </button>
        
      </div>
      <div className="mx-2 mb-6 max-h-64 cursor-pointer overflow-y-auto rounded-lg bg-white drop-shadow-xl">
        {currentNotes.map((note, index) => (
          <div
            key={index}
            className="flex items-center border-b border-gray-200 p-4 last:border-none"
            onClick={openNotesModal}
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold text-white">
              {note.enteredBy.firstName.charAt(0)}{' '}
              {note.enteredBy.lastname.charAt(0)}
            </div>
            <div className="ml-4">
              <p className="note-content font-semibold text-gray-900">
                {note.content.length > 50
                  ? `${note.content.slice(0, 50)}...`
                  : note.content}
              </p>
              <p className="text-sm text-gray-600">
                {note.dateEntered.toString().split('T')[0].replace(/-/g, '/')} •{' '}
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

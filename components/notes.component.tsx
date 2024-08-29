import React, { useState } from 'react';
import '@/styles/notes.css';
import BaseModal from './_base/base-modal.component';
import NotesModal from './modals/notes-modal.component';

const notesData = [
  {
    id: 1,
    content:
      'UNA NOTA MUCHISIIMO MAS LARGA QUE LAS DEMAS VAMOS A COER SOMDOSAMODMAOSMDFOASDMOFAJMDO',
    date: '04/02/2024',
    author: 'Jonathan',
  },
  { id: 2, content: 'FIBER', date: '04/02/2024', author: 'Jonathan' },
  { id: 3, content: '$$$', date: '04/02/2024', author: 'Jonathan' },
  { id: 4, content: 'FIBER', date: '04/02/2024', author: 'Jonathan' },
  { id: 5, content: '$$$', date: '04/02/2024', author: 'Jonathan' },
  { id: 6, content: 'FIBER', date: '04/02/2024', author: 'Jonathan' },
];

const Notes: React.FC = () => {
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  const openNotesModal = () => {
    setNoteModalOpen(true);
  };

  return (
    <div className="max-w-sm rounded-lg bg-gray-800 p-6">
      <div className="flex">
        <h2 className="mb-4 text-xl font-semibold text-white">Notes</h2>
        <button onClick={openNotesModal} className="white">
          +
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto rounded-lg bg-white shadow-lg">
        {notesData.map((note) => (
          <div
            key={note.id}
            className="flex items-center border-b border-gray-200 p-4 last:border-none"
            onClick={openNotesModal}
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold text-white">
              {note.author.charAt(0)}
            </div>
            <div className="ml-4">
              <p className="note-content font-semibold text-gray-900">
                {note.content}
              </p>
              <p className="text-sm text-gray-600">
                {note.date} • {note.author}
              </p>
            </div>
          </div>
        ))}
      </div>
      <NotesModal
        isOpen={noteModalOpen}
        notes={notesData}
        onClose={() => {
          setNoteModalOpen(false);
        }}
      ></NotesModal>
    </div>
  );
};

export default Notes;

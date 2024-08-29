import React, { useState } from 'react';
import '@/styles/notes.css';
import NotesModal from './modals/notes-modal.component';

const notesData = [
  {
    id: 1,
    content:
      'Contet here is a note that is very long and should be truncated to a certain length asdfasdfasdfasdfasdfasdfasdfas',
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
  const [notes, setNotes] = useState(notesData);

  const openNotesModal = () => {
    setNoteModalOpen(true);
  };

  return (
    <div className="input-custom max-w-sm rounded-lg p-6 ">
      <div className="mt-3 flex gap-64">
        <h2 className="mb-4 mt-3 text-xl font-semibold text-gray-700">Notes</h2>
        <button onClick={openNotesModal} className="white">
          +
        </button>
      </div>
      <div className="mx-2 mb-6 max-h-64 cursor-pointer overflow-y-auto rounded-lg bg-white drop-shadow-xl">
        {notes.map((note) => (
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
        notes={notes}
        onClose={() => {
          setNoteModalOpen(false);
        }}
        setNotes={setNotes}
      ></NotesModal>
    </div>
  );
};

export default Notes;

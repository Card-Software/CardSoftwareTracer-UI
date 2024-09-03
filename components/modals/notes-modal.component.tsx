// import React, { useEffect, useRef, useState } from 'react';
// import BaseModal from '../_base/base-modal.component';
// import { Note } from '@/models/note';
// import { User } from '@/models/user';
// import '@/styles/notes.css';
// import { FaEllipsisV } from 'react-icons/fa';

// interface NotesModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   notes: Note[];
//   setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
//   currentUser: User;
// }

// const NotesModal: React.FC<NotesModalProps> = ({
//   isOpen = false,
//   onClose,
//   notes = [],
//   setNotes,
//   currentUser,
// }) => {
//   const [newNoteContent, setNewNoteContent] = useState('');
//   const [expandedNoteIndex, setExpandedNoteIndex] = useState<number | null>(
//     null,
//   );

//   const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setNewNoteContent(e.target.value);
//   };

//   const handleSaveNote = () => {
//     if (newNoteContent.trim()) {
//       const newNote: Note = {
//         content: newNoteContent,
//         enteredBy: currentUser,
//         dateEntered: new Date(),
//       };
//       setNotes([...notes, newNote]);
//       setNewNoteContent('');
//     }
//   };

//   const toggleNoteExpansion = (index: number) => {
//     setExpandedNoteIndex(expandedNoteIndex === index ? null : index);
//   };

//   useEffect(() => {
//     if (expandedNoteIndex !== null && contentRefs.current[expandedNoteIndex]) {
//       const element = contentRefs.current[expandedNoteIndex];
//       element!.style.maxHeight = `${element!.scrollHeight}px`;
//     }
//   }, [expandedNoteIndex]);

//   return (
//     <BaseModal
//       title="Add Note"
//       onClose={onClose}
//       isOpen={isOpen}
//       loading={false}
//       // typeSaveButton="button"
//       // onSave={handleSaveNote}
//       // canSave={newNoteContent.trim().length > 0}
//     >
//       <div className="mt-4">
//         <textarea
//           id="new-note"
//           className="input-custom"
//           rows={3}
//           value={newNoteContent}
//           onChange={handleInputChange}
//           placeholder="Write a new note here..."
//         />
//         <div className="mb-8 mt-3 flex justify-end">
//           <button
//             className={`w-fit-content text-nowrap rounded-md px-4 py-2 text-white ${
//               newNoteContent.trim().length === 0
//                 ? 'cursor-not-allowed bg-gray-400'
//                 : 'bg-teal-700 hover:bg-teal-600'
//             }`}
//             onClick={handleSaveNote}
//             disabled={newNoteContent.trim().length === 0}
//           >
//             Add note
//           </button>
//         </div>
//       </div>
//       <div>
//         {notes.map((note, index) => (
//           <div
//             key={index}
//             className="flex items-center border-b border-gray-200 p-4 last:border-none"
//           >
//             <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold text-white">
//               {note.enteredBy.firstName.charAt(0)}{' '}
//               {note.enteredBy.lastname.charAt(0)}
//             </div>
//             <div className="ml-4">
//               <p className=" font-semibold text-gray-900">
//                 {note.content}
//               </p>
//               <p className="text-sm text-gray-600">
//                 {note.dateEntered.toString().split('T')[0].replace(/-/g, '/')} •{' '}
//                 {note.enteredBy.firstName} {note.enteredBy.lastname}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </BaseModal>
//   );
// };

// export default NotesModal;

import React, { useState } from 'react';
import { FaTrashAlt, FaEdit } from 'react-icons/fa'; // Importa los íconos
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

  const handleEditNote = (index: number) => {
    // Lógica para editar la nota
    console.log(`Editando nota ${index}`);
  };

  const handleDeleteNote = (index: number) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
  };

  return (
    <BaseModal
      title="Add Note"
      onClose={onClose}
      isOpen={isOpen}
      loading={false}
    >
      <div className="mt-4">
        <textarea
          id="new-note"
          className="input-custom"
          rows={3}
          value={newNoteContent}
          onChange={handleInputChange}
          placeholder="Write a new note here..."
        />
        <div className="mb-8 mt-3 flex justify-end">
          <button
            className={`w-fit-content text-nowrap rounded-md px-4 py-2 text-white ${
              newNoteContent.trim().length === 0
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-teal-700 hover:bg-teal-600'
            }`}
            onClick={handleSaveNote}
            disabled={newNoteContent.trim().length === 0}
          >
            Add note
          </button>
        </div>
      </div>
      <div>
        {notes.map((note, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b border-gray-200 p-4 last:border-none"
          >
            <div className="flex items-center">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold text-white">
                {note.enteredBy.firstName.charAt(0)}{' '}
                {note.enteredBy.lastname.charAt(0)}
              </div>
              <div className="ml-4">
                <p className="font-semibold text-gray-900">{note.content}</p>
                <p className="text-sm text-gray-600">
                  {note.dateEntered.toString().split('T')[0].replace(/-/g, '/')}{' '}
                  • {note.enteredBy.firstName} {note.enteredBy.lastname}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEditNote(index)}
                className="p-2 text-gray-500 hover:text-yellow-500 focus:outline-none"
                style={{ border: 'none', boxShadow: 'none' }}
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDeleteNote(index)}
                className="p-2 text-gray-500 hover:text-red-500 focus:outline-none"
                style={{ border: 'none', boxShadow: 'none' }}
              >
                <FaTrashAlt />
              </button>
            </div>
          </div>
        ))}
      </div>
    </BaseModal>
  );
};

export default NotesModal;

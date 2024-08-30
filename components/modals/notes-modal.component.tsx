import React, { useState } from 'react';
import BaseModal from '../_base/base-modal.component';
import { Note } from '@/models/note';
import { User } from '@/models/user';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  currentUser: User; // Añadido para determinar el usuario que está añadiendo la nota
}

const NotesModal: React.FC<NotesModalProps> = ({
  isOpen = false,
  onClose,
  notes = [],
  setNotes,
  currentUser,
}) => {
  const [newNoteContent, setNewNoteContent] = useState('');

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
      setNotes([...notes, newNote]); // Actualiza el array de notas
      setNewNoteContent(''); // Limpia el campo de texto
    }
  };

  return (
    <BaseModal
      title="Add Note"
      onClose={onClose}
      isOpen={isOpen}
      loading={false}
      typeSaveButton="button"
      onSave={handleSaveNote} // Vincula el botón de guardar al manejador de guardado
      canSave={newNoteContent.trim().length > 0} // Deshabilita el botón de guardar si no hay contenido
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
      <div>
        {notes.map((note, index) => (
          <p key={index}>{note.content}</p>
        ))}
      </div>
    </BaseModal>
  );
};

export default NotesModal;

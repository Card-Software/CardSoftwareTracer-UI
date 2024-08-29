import React, { useState } from 'react';
import BaseModal from '../_base/base-modal.component';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: any[];
  setNotes: React.Dispatch<React.SetStateAction<any[]>>; // Añadimos setNotes como prop
}

const NotesModal: React.FC<NotesModalProps> = ({
  isOpen = false,
  onClose,
  notes = [],
  setNotes,
}) => {
  const [newNote, setNewNote] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewNote(e.target.value);
  };

  const handleSaveNote = () => {
    if (newNote.trim()) {
      const newNoteObject = {
        id: notes.length + 1, // Genera un ID simple, podrías usar un mejor método para esto
        content: newNote,
        date: new Date().toLocaleDateString(),
        author: 'User', // Puedes cambiar esto según tu lógica
      };
      setNotes([...notes, newNoteObject]); // Actualiza el array de notas
      setNewNote(''); // Limpia el campo de texto
    }
  };

  return (
    <BaseModal
      title="Activity Log"
      onClose={onClose}
      isOpen={isOpen}
      loading={false}
      typeSaveButton="button"
      onSave={handleSaveNote} // Vincula el botón de guardar al manejador de guardado
      canSave={newNote.trim().length > 0} // Deshabilita el botón de guardar si no hay contenido
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          rows={3}
          value={newNote}
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

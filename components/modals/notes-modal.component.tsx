import React, { useState } from 'react';
import { FaTrashAlt, FaEdit } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import BaseModal from '../_base/base-modal.component';
import { Note } from '@/models/note';
import { User } from '@/models/user';
import '@/styles/notes.css';
import 'react-quill/dist/quill.snow.css';
import parse from 'html-react-parser';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

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
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0].replace(/-/g, '/');
  };

  const [newNoteContent, setNewNoteContent] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null); 
  const [editNoteContent, setEditNoteContent] = useState(''); 

  const handleInputChange = (value: string) => {
    setNewNoteContent(value);
  };

  // const roleUser = currentUser.role.includes("Admin");

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

  const handleEditNote = (index: number) => {
    setEditIndex(index); 
    setEditNoteContent(notes[index].content); 
  };

  const handleUpdateNote = () => {
    if (editIndex !== null && editNoteContent.trim()) {
      const updatedNotes = [...notes];
      updatedNotes[editIndex].content = editNoteContent; 
      setNotes(updatedNotes);
      setEditIndex(null); 
      setEditNoteContent(''); 
    }
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
        <ReactQuill
          theme="snow"
          value={newNoteContent}
          onChange={handleInputChange}
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
            className="flex flex-col items-start justify-between border-b border-gray-200 p-4 last:border-none"
          >
            <div className="flex w-full items-center">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold text-white">
                {note.enteredBy.firstName.charAt(0)}{' '}
                {note.enteredBy.lastname.charAt(0)}
              </div>
              <div className="ml-4 flex-grow">
                <p className="w-[90%] text-justify text-gray-900">
                  {parse(note.content)}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDate(new Date(note.dateEntered))} •{' '}
                  {note.enteredBy.firstName} {note.enteredBy.lastname}
                </p>
              </div>
              {(currentUser.id === note.enteredBy.id || currentUser.role.includes("Admin"))  ? (
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
              ) : null}
            </div>

            {editIndex === index && (
              <div className="mt-4 w-full">
                <ReactQuill
                  theme="snow"
                  value={editNoteContent}
                  onChange={setEditNoteContent}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    className={`w-fit-content text-nowrap rounded-md px-4 py-2 text-white ${
                      editNoteContent.trim().length === 0
                        ? 'cursor-not-allowed bg-gray-400'
                        : 'bg-teal-700 hover:bg-teal-600'
                    }`}
                    onClick={handleUpdateNote}
                    disabled={editNoteContent.trim().length === 0}
                  >
                    Update note
                  </button>
                  <button
                    className="w-fit-content ml-2 text-nowrap rounded-md bg-red-600 hover:bg-red-500 px-4 py-2 text-white"
                    onClick={() => setEditIndex(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </BaseModal>
  );
};

export default NotesModal;

import React, { useState } from 'react';
import styled from 'styled-components';

interface SectionModalProps {
  productOrder: any;
  section: any;
  onClose: () => void;
}

const SectionModal: React.FC<SectionModalProps> = ({ section, onClose }) => {
  const [description, setDescription] = useState(section.SectionDescription);
  const [name, setName] = useState(section.SectionName);
  const [newNote, setNewNote] = useState('');

  const handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewNote(event.target.value);
  };

  const handleAddNote = () => {
    alert('Add note functionality not implemented.');
    setNewNote('');
  };

  return (
    <ModalWrapper className="open">
      <ModalOverlay onClick={onClose} />
      <ModalContent>
        <ModalHeader>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Section Name"
            className="section-name"
          />
          <button onClick={onClose}>Close</button>
        </ModalHeader>
        <ModalBody>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Section Description"
            className="section-description"
          />
          <h3>Assigned to: {section.assignedUser.Name}</h3>
          <h3>Notes:</h3>
          <ul>
            {section.Notes.map((note: any) => (
              <li key={note.id}>{note.content}</li>
            ))}
          </ul>
          <TextArea
            value={newNote}
            onChange={handleNoteChange}
            placeholder="Add a new note"
          />
          <button onClick={handleAddNote}>Add Note</button>
          <h3>Files:</h3>
          <ul>
            {section.Files.map((file: any) => (
              <li key={file.Name}>
                <a
                  href={file.PresignedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {file.Name}
                </a>
                <button>Edit</button>
                <button>Delete</button>
              </li>
            ))}
          </ul>
          <DragAndDropArea>
            <p>Drag & drop files here or click to upload</p>
            <button>Upload File</button>
          </DragAndDropArea>
        </ModalBody>
        <ModalFooter>
          <button onClick={onClose}>Close</button>
        </ModalFooter>
      </ModalContent>
    </ModalWrapper>
  );
};

export default SectionModal;

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 0;
  overflow: hidden;
  transition: width 0.3s;
  z-index: 1000;

  &.open {
    width: 30%;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 100%;
  max-width: 500px;
  background: #fff;
  display: flex;
  flex-direction: column;
  z-index: 1001;
`;

const ModalHeader = styled.div`
  background: #1a202c; /* bg-blue-900 */
  color: #fff;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .section-name {
    flex: 1;
    font-size: 18px;
    margin-right: 10px;
    padding: 10px;
    color: #000;
  }
`;

const ModalBody = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;

  .section-description {
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    font-size: 16px;
    border: 1px solid #ccc;
  }
`;

const ModalFooter = styled.div`
  padding: 20px;
  background: #f1f1f1;
  text-align: right;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 100px;
  margin-bottom: 10px;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
`;

const DragAndDropArea = styled.div`
  border: 2px dashed #007bff;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin-top: 20px;

  p {
    margin-bottom: 10px;
  }

  button {
    background-color: #007bff;
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
  }
`;

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
          <Button onClick={handleAddNote}>Add Note</Button>
          <h3>Files:</h3>
          <ul>
            {section.Files.map((file: any) => (
              <FileItem key={file.Name}>
                <a
                  href={file.PresignedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {file.Name}
                </a>
                <Button>Edit</Button>
                <Button>Delete</Button>
              </FileItem>
            ))}
          </ul>
          <DragAndDropArea>
            <p>Drag & drop files here or click to upload</p>
            <Button>Upload File</Button>
          </DragAndDropArea>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
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
  z-index: 999;
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px 0 0 8px;
`;

const ModalHeader = styled.div`
  background: #2d3748; /* bg-gray-800 */
  color: #fff;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 8px;

  .section-name {
    flex: 1;
    font-size: 17px;
    margin-right: 10px;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
    color: #2d3748;
  }

  button {
    background: #e53e3e;
    border: none;
    color: #fff;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: #c53030;
    }
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
    border: 1px solid #e2e8f0;
    border-radius: 4px;
  }

  h3 {
    margin-top: 20px;
    font-size: 18px;
    color: #4a5568;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      padding: 10px 0;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
`;

const ModalFooter = styled.div`
  padding: 20px;
  background: #f7fafc;
  text-align: right;
  border-bottom-left-radius: 8px;

  button {
    background: #2d3748;
    border: none;
    color: #fff;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: #1a202c;
    }
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 100px;
  margin-bottom: 10px;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
`;

const Button = styled.button`
  background: #3182ce;
  border: none;
  color: #fff;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #2b6cb0;
  }
`;

const FileItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;

  a {
    color: #3182ce;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  button {
    background: #e53e3e;
    border: none;
    color: #fff;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: #c53030;
    }
  }
`;

const DragAndDropArea = styled.div`
  border: 2px dashed #3182ce;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin-top: 20px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #ebf8ff;
  }

  p {
    margin-bottom: 10px;
    color: #4a5568;
  }

  button {
    background-color: #3182ce;
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background-color: #2b6cb0;
    }
  }
`;

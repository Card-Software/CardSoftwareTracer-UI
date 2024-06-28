import { Section } from '@/models/Section';
import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { userAuthorizationService } from '@/services/UserAuthorization.service';
import { fileManagementApiProxy } from '@/proxies/FileManagement.proxy';
import ProdcutOrder from './ProductOrderItem';

interface SectionModalProps {
  productOrder: string;
  tracerStreamId: string;
  section: Section;
  onClose: () => void;
}

const SectionModal: React.FC<SectionModalProps> = ({
  productOrder,
  tracerStreamId,
  section,
  onClose,
}) => {
  const [description, setDescription] = useState(section.sectionDescription);
  const [newNote, setNewNote] = useState('');
  const [tracerStreamName, setTracerStreamName] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]); // State to hold uploaded file names
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input element

  const handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewNote(event.target.value);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucketName', 'your-bucket-name'); // Replace with your actual bucket name
        formData.append('prefix', 'optional-prefix'); // Optional: Add prefix if needed

        const response = await fetch('/File/UploadFile', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const { fileName } = await response.json();
          setUploadedFiles([...uploadedFiles, fileName]); // Update state with uploaded file name
        } else {
          console.error('Failed to upload file');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  const handleAddNote = () => {
    alert('Add note functionality not implemented.');
    setNewNote('');
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const file = event.dataTransfer.files[0];
    uploadFile(file);
  };

  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    uploadFile(file);
  };

  const uploadFile = async (file: File | undefined) => {
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucketName', 'your-bucket-name'); // Replace with your actual bucket name
        formData.append('prefix', 'optional-prefix'); // Optional: Add prefix if needed

        const response = await fetch('/File/UploadFile', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const { fileName } = await response.json();
          setUploadedFiles([...uploadedFiles, fileName]); // Update state with uploaded file name
        } else {
          console.error('Failed to upload file');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  return (
    <ModalWrapper className="open">
      <ModalOverlay onClick={onClose} />
      <ModalContent>
        <ModalHeader>
          <h2>Section</h2>
          <button onClick={onClose}>Close</button>
        </ModalHeader>
        <ModalBody>
          <label>Tracer Stream Name</label>
          <input
            type="text"
            value={tracerStreamName}
            onChange={(e) => setTracerStreamName(e.target.value)}
            placeholder="Tracer Stream Name"
            className="tracer-stream-name"
          />
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Section Description"
            className="section-description"
          />
          <h3>Notes:</h3>
          <ul>
            {section.notes.map((note: any) => (
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
            {uploadedFiles.map((fileName, index) => (
              <li key={index}>
                {fileName}
                <Button>Edit</Button>
                <Button>Delete</Button>
              </li>
            ))}
          </ul>
          <DragAndDropArea
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()} // Trigger file input click
          >
            <label>Drag & drop files here or click to upload:</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
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
  background: #2d3748;
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

  .tracer-stream-name {
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    font-size: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
  }

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
  margin-top: 10px;

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

  label {
    margin-bottom: 10px;
    color: #4a5568;
    display: block;
  }

  input[type='file'] {
    display: none;
  }

  input {
    display: none;
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

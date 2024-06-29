import { Section } from '@/models/Section';
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { userAuthorizationService } from '@/services/UserAuthorization.service';
import { fileManagementApiProxy } from '@/proxies/FileManagement.proxy';
import { S3ObjectDto } from '@/models/S3ObjectDto';
import Link from 'next/link';

interface SectionModalProps {
  productOrder?: string;
  tracerStreamId?: string;
  originalSection: Section;
  onClose: () => void;
  onSave: (section: Section) => void;
  mode: 'edit' | 'sectionCreation' | 'sectionCreationOnExistingTracer';
}

const SectionModal: React.FC<SectionModalProps> = ({
  productOrder,
  tracerStreamId,
  originalSection,
  onClose,
  onSave,
  mode,
}) => {
  const [section, setSection] = useState<Section>(
    originalSection || ({} as Section),
  );
  const [newNote, setNewNote] = useState('');
  const [tracerStreamName, setTracerStreamName] = useState(
    tracerStreamId || '',
  );
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input element
  const bucketName = userAuthorizationService.organization.s3BucketName;
  const prefix = `${productOrder}/${tracerStreamId}/${section.sectionName}`;

  const handleSectionChange = (
    property: string,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setSection((prevSection) => ({
      ...prevSection,
      [property]: event.target.value,
    }));
  };

  const handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewNote(event.target.value);
  };

  useEffect(() => {
    if (mode === 'edit' || mode === 'sectionCreationOnExistingTracer') {
      const fetchFiles = async () => {
        if (bucketName) {
          try {
            const files = await fileManagementApiProxy.getAllFiles(
              bucketName,
              prefix,
            );
            setSection((prevSection) => ({ ...prevSection, files }));
          } catch (error) {
            console.error('Error fetching files:', error);
          }
        }
      };

      fetchFiles();
    }
  }, [bucketName, prefix, mode]);

  const uploadFile = async (file: File) => {
    if (file) {
      try {
        if (!bucketName) {
          console.error('Bucket name not found');
          return;
        }
        const response = await fileManagementApiProxy.UploadFile(
          bucketName,
          productOrder!,
          tracerStreamId!,
          section!.sectionName,
          file,
        );

        if (response.ok) {
          const allFiles = await fileManagementApiProxy.getAllFiles(
            bucketName,
            prefix,
          );
          setSection((prevSection) => ({ ...prevSection, files: allFiles }));
        } else {
          console.error('Failed to upload file');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      uploadFile(file);
    }
  };

  const handleAddNote = () => {
    alert('Add note functionality not implemented.');
    setNewNote('');
  };

  const getOnlyFileName = (name: string) => {
    const parts = name.split('/');
    return parts[parts.length - 1];
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const file = event.dataTransfer.files[0];
    uploadFile(file);
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
          {mode !== 'edit' && (
            <>
              <label>Section Name</label>
              <input
                type="text"
                value={section.sectionName}
                onChange={(e) => handleSectionChange('sectionName', e)}
                placeholder="Section Name"
                className="tracer-stream-name"
              />
            </>
          )}
          <label>Description</label>
          <textarea
            value={section.sectionDescription}
            onChange={(e) => handleSectionChange('sectionDescription', e)}
            placeholder="Section Description"
            className="section-description"
          />
          <label>Position</label>
          <input
            type="number"
            value={section.position}
            onChange={(e) => handleSectionChange('position', e)}
            placeholder="Position"
            className="tracer-stream-name"
          ></input>
          {mode !== 'sectionCreation' && (
            <>
              <h3>Notes:</h3>
              <ul>
                {section?.notes.map((note: any) => (
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
                {section.files?.map((s3Object: S3ObjectDto, index: number) => (
                  <FileItem key={index}>
                    {getOnlyFileName(s3Object.name || '')}
                    <Link
                      className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                      href={s3Object.presignedUrl || ''}
                      target="_blank"
                    >
                      View
                    </Link>
                    <Button>Delete</Button>
                  </FileItem>
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
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <Button>Upload File</Button>
              </DragAndDropArea>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => onSave(section)}>Save</Button>
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
    width: 50%;
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

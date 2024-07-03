import { Section } from '@/models/Section';
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { fileManagementApiProxy } from '@/proxies/FileManagement.proxy';
import { S3ObjectDto } from '@/models/S3ObjectDto';
import Link from 'next/link';
import { FaTimes } from 'react-icons/fa';
import { userAuthenticationService } from '@/services/UserAuthentication.service';
import LoadingOverlay from './LoadingOverlay';

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
  const [loading, setLoading] = useState(false);
  const [tracerStreamName, setTracerStreamName] = useState(
    tracerStreamId || '',
  );
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input element
  const bucketName = userAuthenticationService.getOrganization()?.s3BucketName;
  const prefix = `${productOrder}/${tracerStreamId}/${section.sectionId}`;

  const handleRedirect = (url: string) => {
    window.open(url, '_blank');
  };

  const handleFileDelete = async (s3Object: S3ObjectDto) => {
    //show model to doubel chekc if they want to delte
    //if yes then delete
    //if no then do nothing
    const action = confirm('Are you sure you want to delete this file?');
    if (action) {
      const response = await fileManagementApiProxy.DeleteFile(
        bucketName!,
        s3Object.name!,
      );

      if (response.ok) {
        const allFiles = await fileManagementApiProxy.getAllFiles(
          bucketName!,
          prefix,
        );
        setSection((section) => ({ ...section, files: allFiles }));
      } else {
        console.error('Failed to delete file');
      }
    }
  };

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
    if (mode === 'edit') {
      const fetchFiles = async () => {
        if (bucketName) {
          setLoading(true);
          try {
            const files = await fileManagementApiProxy.getAllFiles(
              bucketName,
              prefix,
            );
            setSection((section) => ({ ...section, files }));
          } catch (error) {
            console.error('Error fetching files:', error);
          } finally {
            setLoading(false);
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
        setLoading(true);
        const response = await fileManagementApiProxy.UploadFile(
          bucketName,
          productOrder!,
          tracerStreamId!,
          originalSection.sectionId,
          file,
        );

        if (response.ok) {
          const allFiles = await fileManagementApiProxy.getAllFiles(
            bucketName,
            prefix,
          );
          setSection((section) => ({ ...section, files: allFiles }));
        } else {
          console.error('Failed to upload file');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setLoading(false);
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
      <LoadingOverlay show={loading} />
      <ModalOverlay onClick={onClose} />
      <ModalContent>
        <ModalHeader>
          <h1>Section Management</h1>
          <button onClick={onClose} className="close-button">
            <FaTimes size={24} />
          </button>
        </ModalHeader>
        <ModalBody>
          <label>
            <input
              type="checkbox"
              checked={section.isRequired}
              onChange={(e) =>
                setSection((prevSection) => ({
                  ...prevSection,
                  isRequired: e.target.checked,
                }))
              }
            />
            Is Required
          </label>
          <br />
          <label>Section Name</label>
          <input
            type="text"
            value={section.sectionName}
            onChange={(e) => handleSectionChange('sectionName', e)}
            placeholder="Section Name"
            className="tracer-stream-name"
          />
          <label>Description</label>
          <textarea
            value={section.sectionDescription}
            onChange={(e) => handleSectionChange('sectionDescription', e)}
            placeholder="Section Description"
            className="section-description"
          />
          {mode !== 'sectionCreation' && (
            <>
              <h3>Files:</h3>
              <div style={{ overflow: 'hidden' }}>
                <ul>
                  {section.files?.map(
                    (s3Object: S3ObjectDto, index: number) => (
                      <FileItem
                        key={index}
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        <span
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '60%', // Adjust the max-width as needed
                            display: 'inline-block',
                          }}
                        >
                          {getOnlyFileName(s3Object.name || '')}
                        </span>
                        <div>
                          <Button
                            style={{ marginRight: '10px' }}
                            onClick={() => {
                              handleRedirect(s3Object.presignedUrl || '');
                            }}
                          >
                            View
                          </Button>
                          <CancelButton
                            onClick={() => {
                              handleFileDelete(s3Object);
                            }}
                          >
                            Delete
                          </CancelButton>
                        </div>
                      </FileItem>
                    ),
                  )}
                </ul>
              </div>

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
          <CancelButton
            className="bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            onClick={onClose}
          >
            Close
          </CancelButton>
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
    width: 40%;
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
  background: #2d3748;
  text-align: right;
  border-bottom-left-radius: 8px;

  button:not(:last-child) {
    margin-right: 10px;
  }
`;

const Button = styled.button`
  background: rgb(15 118 110);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 10px;

  &:hover {
    background: rgb(13 148 136);
  }
`;

const CancelButton = styled.button`
  background: #6b7280; /* bg-gray-500 */
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 10px;

  &:hover {
    background: #4b5563; /* hover:bg-gray-600 */
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
    background: rgb(15 118 110);
    border: none;
    color: #fff;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: rgb(13 148 136);
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
    background-color: rgb(15 118 110);
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background-color: rgb(13 148 136);
    }
  }
`;

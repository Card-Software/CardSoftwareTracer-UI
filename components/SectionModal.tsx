import { Section } from '@/models/Section';
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { fileManagementApiProxy } from '@/proxies/FileManagement.proxy';
import { S3ObjectDto } from '@/models/S3ObjectDto';
import Link from 'next/link';
import { FaTimes, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { userAuthenticationService } from '@/services/UserAuthentication.service';
import LoadingOverlay from './LoadingOverlay';
import { teamLabelProxy } from '@/proxies/TeamLabel.proxy';
import { TeamLabel } from '@/models/TeamLabel';
import { activityLogProxy } from '@/proxies/ActivityLog.proxy';
import { ActivityLog } from '@/models/ActivityLog';
import { ActivityType } from '@/models/enum/ActivityType';
import { User } from '@/models/User';
interface SectionModalProps {
  productOrder?: string;
  tracerStreamId?: string;
  originalSection: Section;
  onClose: () => void;
  onSave: (section: Section, move: 'Right' | 'Left' | null | undefined) => void;
  mode: 'edit' | 'sectionCreation' | 'sectionCreationOnExistingTracer';
  totalSections?: number;
}

const SectionModal: React.FC<SectionModalProps> = ({
  productOrder,
  tracerStreamId,
  originalSection,
  onClose,
  onSave,
  mode,
  totalSections,
}) => {
  const [canRightClick, setCanRightClick] = useState(false);
  const [canLeftClick, setCanLeftClick] = useState(false);
  const [section, setSection] = useState<Section>(
    originalSection || ({} as Section),
  );
  const [teamLabels, setTeamLabels] = useState<TeamLabel[]>([]);
  const organization = userAuthenticationService.getOrganization();
  const user: User = userAuthenticationService.getUser() as User;
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bucketName = userAuthenticationService.getOrganization()?.s3BucketName;
  const prefix = `${productOrder}/${tracerStreamId}/${section.sectionId}`;
  const loadedStates = useRef({ loadedTeamLabels: false });

  useEffect(() => {
    setSection(originalSection);
    if (!totalSections) {
      return;
    }
    const position = originalSection.position;
    if (position + 1 > totalSections) {
      setCanRightClick(false);
    } else {
      setCanRightClick(true);
    }

    if (position - 1 < 1) {
      setCanLeftClick(false);
    } else {
      setCanLeftClick(true);
    }
  }, [totalSections, originalSection]);

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

  useEffect(() => {
    const fetchTeamLabels = async () => {
      if (!organization?.name) return;
      const teamLabels = await teamLabelProxy.getTeamLabelsByOrganizationName(
        organization?.name,
      );
      setTeamLabels(teamLabels);
    };
    if (!loadedStates.current.loadedTeamLabels) {
      loadedStates.current.loadedTeamLabels = true;
      fetchTeamLabels();
    }
  }, [organization]);

  // #region File Handling
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
          insertLogs(file.name, section.sectionName);
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

  const handleFileDelete = async (s3Object: S3ObjectDto) => {
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

  const getOnlyFileName = (name: string) => {
    const parts = name.split('/');
    return parts[parts.length - 1];
  };
  // #endregion

  // #region Tag Handling
  const handleTagSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTag = teamLabels.find(
      (label) => label.id === event.target.value,
    );
    if (
      selectedTag &&
      !section.teamLabels.some((label) => label.id === selectedTag.id)
    ) {
      setSection((prevSection) => ({
        ...prevSection,
        teamLabels: [...prevSection.teamLabels, selectedTag],
      }));
    }
  };

  const handleDeleteTag = (tagId: string) => {
    setSection((prevSection) => ({
      ...prevSection,
      teamLabels: prevSection.teamLabels.filter((label) => label.id !== tagId),
    }));
  };
  // #endregion

  // #region Drag and Drop Handling
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const file = event.dataTransfer.files[0];
    uploadFile(file);
  };
  // #endregion

  // #region Other Handlers

  const handleRedirect = (url: string) => {
    window.open(url, '_blank');
  };

  const insertLogs = (fileName: string, section: string) => {
    const activityLog: ActivityLog = {
      activityType: ActivityType.FileUpload,
      fileName: fileName,
      section: section,
      productOrderNumber: productOrder || '',
      userFirstName: user?.firstName || '',
      userLastName: user?.lastname || '',
      timeStamp: new Date(),
      traceabilityStream: tracerStreamId || '',
    };
    activityLogProxy.insertActivityLog(activityLog);
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

  // #endregion

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
        <ModalContentWrapper>
          <ModalBody>
            <div className="flex items-center">
              {canLeftClick && (
                <ArrowButton
                  onClick={() => onSave(section, 'Left')}
                  className=""
                >
                  <FaChevronLeft size={24} />
                </ArrowButton>
              )}
              <div
                className={`flex-1 overflow-y-auto  ${
                  !canLeftClick || !canRightClick ? 'px-8' : ''
                }`}
              >
                <label className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    className="peer hidden"
                    checked={section.isRequired}
                    onChange={(e) =>
                      setSection((prevSection) => ({
                        ...prevSection,
                        isRequired: e.target.checked,
                      }))
                    }
                    id="custom-checkbox"
                  />
                  <span
                    className={`h-5 w-5 rounded border-2 border-gray-400 ${
                      section.isRequired ? 'bg-teal-600' : 'bg-white'
                    } flex items-center justify-center peer-checked:bg-teal-600`}
                  >
                    {section.isRequired && (
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    )}
                  </span>
                  <span className="ms-2">Is Required</span>
                </label>

                <div className="mb-4">
                  <label htmlFor="sectionName">Section Name </label>
                  <input
                    id="sectionName"
                    value={section.sectionName}
                    onChange={(e) => handleSectionChange('sectionName', e)}
                    placeholder="Section Name"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="description">Description</label>
                  <TextArea
                    id="description"
                    value={section.sectionDescription}
                    onChange={(e) =>
                      handleSectionChange('sectionDescription', e)
                    }
                    placeholder="Section Description"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="tags" className="mb-2 block">
                    Tags
                  </label>
                  <div className="inline-block">
                    <select
                      onChange={handleTagSelect}
                      className="block w-auto max-w-fit rounded-md border border-gray-300 px-4 py-2 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select a tag</option>
                      {teamLabels.map((teamLabel) => (
                        <option key={teamLabel.id} value={teamLabel.id}>
                          {teamLabel.labelName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {section.teamLabels.map((label) => (
                      <div
                        key={label.id}
                        className="flex items-center space-x-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
                      >
                        <span>{label.labelName}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteTag(label.id)}
                          className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-700 text-white hover:bg-blue-800"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {mode !== 'sectionCreation' && (
                  <>
                    <h3 className="mb-2">Files:</h3>
                    <div className="mb-4 overflow-hidden">
                      <ul>
                        {section.files?.map(
                          (s3Object: S3ObjectDto, index: number) => (
                            <FileItem
                              key={index}
                              className="mb-2 flex items-center justify-between"
                            >
                              <span
                                className="truncate"
                                style={{
                                  maxWidth: '60%', // Adjust the max-width as needed
                                }}
                              >
                                {getOnlyFileName(s3Object.name || '')}
                              </span>
                              <div>
                                <Button
                                  className="mr-2"
                                  onClick={() => {
                                    handleRedirect(s3Object.presignedUrl || '');
                                  }}
                                >
                                  View
                                </Button>
                                <CancelButton
                                  className="border-r-md border border-red-600 bg-white p-2 text-red-600 hover:bg-red-600 hover:text-white"
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
              </div>
              {canRightClick && (
                <ArrowButton
                  onClick={() => onSave(section, 'Right')}
                  className="flex-shrink-0"
                >
                  <FaChevronRight size={24} />
                </ArrowButton>
              )}
            </div>
          </ModalBody>
        </ModalContentWrapper>

        <ModalFooter>
          <Button onClick={() => onSave(section, null)}>Save</Button>
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

const ModalContentWrapper = styled.div`
  display: flex;
  height: calc(100% - 120px);
`;

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

const ArrowButton = styled.button`
  border: none;
  color: #bebebe;
  padding: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
  z-index: 1001;
`;

const ModalBody = styled.div`
  flex: 1;
  padding-top: 20px;
  padding-bottom: 20px;
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

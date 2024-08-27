import React, { useState, useRef, useEffect, use } from 'react';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import BaseModal from '@/components/_base/base-modal.component'; // Import the BaseModal component
import { Section } from '@/models/section';
import { fileManagementApiProxy } from '@/proxies/file-management.proxy';
import { S3ObjectDto } from '@/models/s3-object-dto';
import { userAuthenticationService } from '@/services/user-authentication.service';
import { teamLabelProxy } from '@/proxies/team-label.proxy';
import { TeamLabel } from '@/models/team-label';
import { ActivityLog } from '@/models/activity-log';
import { ActivityType } from '@/models/enum/activity-type';
import { User } from '@/models/user';
import { activityLogProxy } from '@/proxies/activity-log.proxy';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import '@/styles/modals/section-modal.css';
import { Controller, useForm } from 'react-hook-form';
import TracerButton from '../tracer-button.component';
import DragAndDropArea from '../_base/drag-and-drop-area';

const isUserValid = (value: any): value is User => {
  return (
    value &&
    typeof value.id === 'string' &&
    typeof value.firstName === 'string' &&
    typeof value.lastname === 'string' &&
    typeof value.email === 'string' &&
    typeof value.organizationRef === 'string' &&
    Array.isArray(value.role)
  );
};

const sectionSchema = Yup.object().shape({
  position: Yup.number().nonNullable().required('Position is required'),
  sectionId: Yup.string().nonNullable().required('Section ID is required'),
  sectionName: Yup.string().required('Section Name is required'),
  sectionDescription: Yup.string().required('Section Description is required'),
  files: Yup.array().required('Files is required'),
  fileNameOnExport: Yup.string()
    .required('File Name on Export is required')
    .nullable(),
  assignedUser: Yup.mixed<User>()
    .nullable()
    .test('is-valid-user', 'Assigned User is not valid', (value) => {
      if (value === null) {
        return true;
      }
      return isUserValid(value);
    }),
  notes: Yup.array().required('Notes is required'),
  isRequired: Yup.boolean().required('Is Required is required'),
  teamLabels: Yup.array().required('Team Labels is required'),
  ownerRef: Yup.string().required('Owner Ref is required'),
});

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (section: Section, move: 'Right' | 'Left' | null | undefined) => void;
  productOrder?: string;
  tracerStreamId?: string;
  initialSection: Section;
  mode: 'edit' | 'sectionCreation' | 'sectionCreationOnExistingTracer';
  totalSections?: number;
}

const validationSchema = Yup.object().shape({
  section: sectionSchema,
});

const SectionModal: React.FC<SectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productOrder,
  tracerStreamId,
  initialSection,
  mode,
  totalSections,
}) => {
  const {
    control,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      section: initialSection,
    },
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  });

  const form = watch();

  // #region States

  const [canRightClick, setCanRightClick] = useState(false);
  const [canLeftClick, setCanLeftClick] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prefix, setPrefix] = useState('');
  const [teamLabels, setTeamLabels] = useState<TeamLabel[]>([]);
  const hasPageBeenRendered = useRef({ teamLabelsLoaded: false });

  const organization = userAuthenticationService.getOrganization();
  const user: User = userAuthenticationService.getUser() as User;
  const bucketName = userAuthenticationService.getOrganization()?.s3BucketName;

  // #endregion

  // #region Use Effects

  useEffect(() => {
    if (isOpen && initialSection) {
      setValue('section', initialSection);
      setPrefix(
        `${productOrder}/${tracerStreamId}/${initialSection.sectionId}`,
      );
    }
  }, [isOpen, initialSection]);

  useEffect(() => {
    if (!totalSections) return;

    if (initialSection) {
      const position = initialSection.position;
      setCanRightClick(position + 1 <= totalSections);
      setCanLeftClick(position - 1 >= 1);
    }
  }, [totalSections, initialSection]);

  useEffect(() => {
    if (mode === 'edit' && bucketName && prefix !== '') {
      const fetchFiles = async () => {
        if (bucketName) {
          setLoading(true);
          try {
            const files = await fileManagementApiProxy.getAllFiles(
              bucketName,
              prefix,
            );
            setValue('section.files', files);
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
    if (!hasPageBeenRendered.current.teamLabelsLoaded) {
      hasPageBeenRendered.current.teamLabelsLoaded = true;
      fetchTeamLabels();
    }
  }, [organization]);
  // #endregion

  // #region file handling
  const uploadFile = async (file: File) => {
    if (!bucketName) {
      console.error('Bucket name not found');
      return;
    }

    try {
      setLoading(true);
      const response = await fileManagementApiProxy.UploadFile(
        bucketName,
        productOrder!,
        tracerStreamId!,
        initialSection.sectionId,
        file,
      );
      try {
        const allFiles = await fileManagementApiProxy.getAllFiles(
          bucketName,
          prefix,
        );
        insertLogs(file.name, form.section.sectionName);
        setValue('section.files', allFiles);
        console.log(response);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileDelete = async (s3Object: S3ObjectDto) => {
    if (confirm('Are you sure you want to delete this file?')) {
      await fileManagementApiProxy.DeleteFile(bucketName!, s3Object.name!);
      try {
        const allFiles = await fileManagementApiProxy.getAllFiles(
          bucketName!,
          prefix,
        );
        setValue('section.files', allFiles);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    }
  };

  const handleRedirect = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    uploadFile(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const fileInput = event.target;
    const file = event.target.files?.[0];

    if (file) {
      uploadFile(file);
      console.log('File selected', file);

      fileInput.value = '';
    }
  };
  // #endregion

  // #region helper functions
  const handleTagSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTag = teamLabels.find(
      (label) => label.id === event.target.value,
    );
    if (
      selectedTag &&
      !form.section?.teamLabels?.some((label) => label.id === selectedTag.id)
    ) {
      setValue(
        'section.teamLabels',
        form.section?.teamLabels?.concat(selectedTag),
      );
    }
  };

  const handleDeleteTag = (tagId: string) => {
    setValue(
      'section.teamLabels',
      form.section?.teamLabels?.filter(
        (label: TeamLabel) => label.id !== tagId,
      ),
    );
  };

  const getOnlyFileName = (name: string) => {
    const parts = name.split('/');
    return parts[parts.length - 1];
  };

  const insertLogs = (fileName: string, section: string) => {
    const activityLog: ActivityLog = {
      activityType: ActivityType.FileUpload,
      fileName,
      section,
      productOrderNumber: productOrder || '',
      userFirstName: user?.firstName || '',
      userLastName: user?.lastname || '',
      timeStamp: new Date(),
      traceabilityStream: tracerStreamId || '',
    };
    activityLogProxy.insertActivityLog(activityLog);
  };

  // #endregion

  return (
    <BaseModal
      isOpen={isOpen}
      loading={loading}
      onClose={onClose}
      canSave={isValid}
      onSave={() => onSave(form.section, null)}
      title="Section Management"
    >
      {isOpen && form.section && (
        <div className="modal-body">
          <div className="flex items-center">
            {canLeftClick && (
              <button
                className="arrow-button"
                onClick={() => onSave(form.section, 'Left')}
              >
                <FaChevronLeft size={24} />
              </button>
            )}

            <form
              className={`flex-1 overflow-y-auto ${!canLeftClick || !canRightClick ? 'px-8' : ''}`}
            >
              <label className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  className="peer hidden"
                  checked={form.section.isRequired}
                  onChange={(e) =>
                    setValue('section.isRequired', e.target.checked)
                  }
                />
                <span
                  className={`h-5 w-5 rounded border-2 border-gray-400 ${
                    form.section.isRequired ? 'bg-teal-600' : 'bg-white'
                  } flex items-center justify-center peer-checked:bg-teal-600`}
                >
                  {form.section.isRequired && (
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
                <label htmlFor="sectionName">Section Name</label>
                <Controller
                  name={'section.sectionName'}
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="sectionName"
                      placeholder="Section Name"
                      className="input-custom"
                    />
                  )}
                ></Controller>
                {errors.section?.sectionName && (
                  <p className="error">
                    {errors.section?.sectionName?.message}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="description">Description</label>
                <Controller
                  name={'section.sectionDescription'}
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      id="sectionName"
                      placeholder="Section Name"
                      className="input-custom"
                    />
                  )}
                ></Controller>
                {errors.section?.sectionDescription && (
                  <p className="error">
                    {errors.section?.sectionDescription?.message}
                  </p>
                )}
              </div>
              <div className="mb-6">
                <label htmlFor="tags" className="mb-2 block">
                  Tags
                </label>
                <Controller
                  name={'section.teamLabels'}
                  control={control}
                  render={({ field }) => (
                    <div className="inline-block">
                      <select
                        onChange={(e) => {
                          handleTagSelect(e);
                        }}
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
                  )}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.section.teamLabels.map((label) => (
                    <div
                      key={label.id}
                      className="flex items-center space-x-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
                    >
                      <span>{label.labelName}</span>
                      <button
                        type="button"
                        onClick={() => {
                          handleDeleteTag(label.id);
                        }}
                        className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-700 text-white hover:bg-blue-800"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                {errors.section?.teamLabels && (
                  <p className="error">{errors.section?.teamLabels?.message}</p>
                )}
              </div>
              {mode !== 'sectionCreation' && (
                <>
                  <h3 className="mb-2">Files:</h3>
                  <div className="mb-4 overflow-hidden">
                    <ul>
                      {form.section.files?.map(
                        (s3Object: S3ObjectDto, index: number) => (
                          <div
                            key={index}
                            className="file-item mb-2 flex items-center justify-between"
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
                              <TracerButton
                                name="View"
                                onClick={() => {
                                  handleRedirect(s3Object.presignedUrl || '');
                                }}
                              />
                              <button
                                className="cancel-button"
                                onClick={() => {
                                  handleFileDelete(s3Object);
                                }}
                                type="button"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ),
                      )}
                    </ul>
                  </div>

                  <DragAndDropArea
                    onDrop={handleDrop}
                    onFileSelect={handleFileSelect}
                  />
                </>
              )}
            </form>
            {canRightClick && (
              <button
                onClick={() => onSave(form.section, 'Right')}
                className="arrow-button flex-shrink-0"
              >
                <FaChevronRight size={24} />
              </button>
            )}
          </div>
        </div>
      )}
    </BaseModal>
  );
};

export default SectionModal;

import React, { useState, useRef, useEffect, use } from 'react';
import { FaChevronRight, FaChevronLeft, FaTrash } from 'react-icons/fa';
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
import { forkJoin, of } from 'rxjs';
import { from } from 'rxjs';
import AlertModal from './alert-modal-component';
import { get, set } from 'lodash';
import { SectionService } from '@/services/sections.service';

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
  fileNameOnExport: Yup.string().required('File Name on Export is required').nullable(),
  assignedUser: Yup.mixed<User>()
    .nullable()
    .optional()
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
  mode: 'edit' | 'sectionCreation' | 'sectionCreationOnExistingTracer';
}

const validationSchema = Yup.object().shape({
  section: sectionSchema,
});

const SectionModal: React.FC<SectionModalProps> = ({ isOpen, onClose, onSave, mode }) => {
  const {
    control,
    reset,
    formState: { errors, isValid, isDirty, dirtyFields },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  });

  const form = watch();

  useEffect(() => {
    console.log('Form errors:', errors);
    console.log('Is form valid?', isValid);
    console.log('Is form dirty?', isDirty);
    console.log('Dirty Fields:', dirtyFields);
  }, [errors, isValid, isDirty, dirtyFields]);

  // #region States
  const [loading, setLoading] = useState(false);
  const [teamLabels, setTeamLabels] = useState<TeamLabel[]>([]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<S3ObjectDto | null>(null);
  const hasPageBeenRendered = useRef({ teamLabelsLoaded: false });
  const sectionService = useRef<SectionService | null>(null);
  const organization = userAuthenticationService.getOrganization();
  const [moved, setMoved] = useState(0);
  // #endregion

  // #region Use Effects
  useEffect(() => {
    sectionService.current = SectionService.getInstance();

    if (sectionService.current?.editingSection) {
      reset({ section: sectionService.current.editingSection });
      setValue('section.fileNameOnExport', 'default');
      setValue('section.assignedUser', null);
    }
  }, []);

  useEffect(() => {
    if (sectionService.current?.editingSection && moved > 0) {
      reset({ section: sectionService.current.editingSection });
      setValue('section.fileNameOnExport', 'default');
      setValue('section.assignedUser', null);
    }
  }, [moved]);

  useEffect(() => {
    const fetchTeamLabels = async () => {
      if (!organization?.name) return;
      const teamLabels = await teamLabelProxy.getTeamLabelsByOrganizationName(organization?.name);

      setTeamLabels(teamLabels);
    };
    if (!hasPageBeenRendered.current.teamLabelsLoaded) {
      hasPageBeenRendered.current.teamLabelsLoaded = true;
      fetchTeamLabels();
    }
  }, [organization]);
  // #endregion

  // #region file handling

  const handleRedirect = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    // uploadFile(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const fileInput = event.target;
    const file = event.target.files?.[0];

    if (file) {
      // uploadFile(file);
      console.log('File selected', file);

      fileInput.value = '';
    }
  };
  // #endregion

  // #region helper functions
  const handleTagSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTag = teamLabels.find((label) => label.id === event.target.value);
    if (selectedTag && !form.section?.teamLabels?.some((label) => label.id === selectedTag.id)) {
      setValue('section.teamLabels', form.section?.teamLabels?.concat(selectedTag));
    }
  };

  const handleDeleteTag = (tagId: string) => {
    setValue(
      'section.teamLabels',
      form.section?.teamLabels?.filter((label: TeamLabel) => label.id !== tagId),
    );
  };

  const getOnlyFileName = (name: string) => {
    const parts = name.split('/');
    return parts[parts.length - 1];
  };

  const test = () => {
    console.log('test');
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
            {sectionService.current?.canMoveToPreviousSection(form.section.position) && (
              <button
                className="arrow-button"
                onClick={() => {
                  sectionService.current!.moveToPreviousSection();
                  setMoved(moved + 1);
                }}
              >
                <FaChevronLeft size={24} />
              </button>
            )}
            <button className="mainAction" onClick={test}>
              Testing
            </button>

            <form
              className={`flex-1 overflow-y-auto ${!sectionService.current?.canMoveToPreviousSection(form.section.position) || !sectionService.current?.canMoveToNextSection(form.section.position) ? 'px-8' : ''}`}
            >
              <label className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  className="peer hidden"
                  checked={form.section.isRequired}
                  onChange={(e) => setValue('section.isRequired', e.target.checked)}
                />
                <span
                  className={`h-5 w-5 rounded border-2 border-gray-400 ${
                    form.section.isRequired ? 'bg-[var(--primary-button-hover)]' : 'bg-white'
                  } flex items-center justify-center peer-checked:bg-[var(--primary-button-hover)]`}
                >
                  {form.section.isRequired && (
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/ 2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
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
                {errors.section?.sectionName && <p className="error">{errors.section?.sectionName?.message}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="description">Description</label>
                <Controller
                  name={'section.sectionDescription'}
                  control={control}
                  render={({ field }) => (
                    <textarea {...field} id="sectionName" placeholder="Section Name" className="input-custom" />
                  )}
                ></Controller>
                {errors.section?.sectionDescription && (
                  <p className="error">{errors.section?.sectionDescription?.message}</p>
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
                {errors.section?.teamLabels && <p className="error">{errors.section?.teamLabels?.message}</p>}
              </div>
              {mode !== 'sectionCreation' && (
                <>
                  <h3 className="mb-2">Files:</h3>
                  <div className="mb-4 overflow-hidden">
                    <ul>
                      {form.section.files?.map((s3Object: S3ObjectDto, index: number) => (
                        <div key={index} className="file-item mb-2 flex items-center justify-between">
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
                              className="cancel-button ml-3"
                              onClick={() => {
                                setFileToDelete(s3Object);
                                setIsAlertModalOpen(true);
                              }}
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </ul>
                  </div>

                  <DragAndDropArea onDrop={handleDrop} onFileSelect={handleFileSelect} />
                </>
              )}
            </form>
            {sectionService.current?.canMoveToNextSection(form.section.position) && (
              <button
                onClick={() => {
                  sectionService.current?.moveToNextSection();
                  setMoved(moved + 1);
                }}
                className="arrow-button flex-shrink-0"
              >
                <FaChevronRight size={24} />
              </button>
            )}
          </div>
        </div>
      )}
      <AlertModal
        isOpen={isAlertModalOpen}
        type="delete"
        title="Delete File"
        message="Are you sure you want to delete this file?"
        icon={<FaTrash className="h-6 w-6 text-red-500" />}
        onClose={() => {
          setIsAlertModalOpen(false);
          setFileToDelete(null);
        }}
        onConfirm={() => {}}
      />
    </BaseModal>
  );
};

export default SectionModal;

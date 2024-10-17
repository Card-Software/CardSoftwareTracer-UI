import { useEffect, useState } from 'react';
import BaseModal from '../_base/base-modal.component';

import toast, { Toaster } from 'react-hot-toast';
import { teamStatusProxy } from '@/proxies/team-status.proxy';
import { TeamStatus } from '@/models/team-status';
import { userAuthenticationService } from '@/services/user-authentication.service';
import { Organization } from '@/models/organization';
import { FaPlus, FaTrash } from 'react-icons/fa';

interface TeamStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamStatusId: string | null;
  onSave: (teamStatus: TeamStatus) => void;
}

const TeamStatusModal: React.FC<TeamStatusModalProps> = ({
  isOpen,
  onClose,
  teamStatusId = null,
  onSave,
}) => {
  const [orginalStatus, setOrginalStatus] = useState<TeamStatus | null>(null);
  const [teamStatus, setTeamStatus] = useState<TeamStatus>({
    name: '',
    createdByEmail: '',
    description: '',
    possibleValues: [],
    ownerId: '',
  });
  const [organization, SetOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newPossibleValue, setNewPossibleValue] = useState('');
  const [newPossibleValues, setNewPossibleValues] = useState<string[]>([]);

  const successToast = () => toast.success('Team label saved successfully');
  const successEditToast = () =>
    toast.success('Team label updated successfully');
  const errorToast = () => toast.error('Error saving team label');

  const editMode = !!teamStatusId;

  useEffect(() => {
    const fetchTeamStatus = async () => {
      if (editMode && teamStatusId) {
        setIsLoading(true);
        try {
          const data = await teamStatusProxy.getTeamStatusById(teamStatusId);
          setTeamStatus(data);
          setOrginalStatus(data);
        } catch (error) {
          console.error('Error fetching team label:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchTeamStatus();
    const org = userAuthenticationService.getOrganization();

    if (org) {
      SetOrganization(org);
    }
  }, [editMode, teamStatusId]);

  const closingModal = () => {
    resetTeamStatus();
    onClose();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setTeamStatus((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePossibleValueChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setNewPossibleValue(e.target.value);
  };

  const handleAddPossibleValue = () => {
    if (!newPossibleValue.trim()) return; // Prevent adding empty values

    if (possibleValueExists(newPossibleValue)) {
      return;
    }

    setNewPossibleValues((prev) => [...prev, newPossibleValue]);
    setNewPossibleValue(''); // Clear input
  };

  const handleDeletePossibleValue = (value: string) => {
    // Only allow deleting values that are not originally loaded from teamStatus
    setNewPossibleValues((prev) => prev.filter((v) => v !== value));
  };

  const resetTeamStatus = () => {
    setTeamStatus({
      name: '',
      createdByEmail: '',
      description: '',
      possibleValues: [],
      ownerId: '',
    });
    setNewPossibleValue('');
    setNewPossibleValues([]);
  };

  const possibleValueExists = (value: string) => {
    if (teamStatus.possibleValues.includes(value)) {
      return true;
    }
    if (newPossibleValues.includes(value)) {
      return true;
    }
    return false;
  };

  const handleSubmit = async () => {
    teamStatus.possibleValues.push(...newPossibleValues);
    setIsLoading(true);
    try {
      if (editMode) {
        if (!teamStatus.id) {
          errorToast();
          throw new Error('Team label ID is missing');
        }
        await teamStatusProxy.updateTeamStatus(teamStatus.id, teamStatus);
        resetTeamStatus();
        onSave(teamStatus);
        successEditToast();
      } else {
        const user = userAuthenticationService.getUser();
        if (!organization || !user) {
          errorToast();
          throw new Error('Organization is missing');
        }
        teamStatus.ownerId = organization.id as string;
        teamStatus.createdByEmail = user.email;
        const createdTeamStatus =
          await teamStatusProxy.createTeamStatus(teamStatus);
        resetTeamStatus();
        onSave(createdTeamStatus);
        successToast();
      }
      closingModal();
    } catch (error) {
      console.error('Error saving team label:', error);
      errorToast();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModal
      title={editMode ? 'Edit Status' : 'Create Status'}
      onClose={closingModal}
      isOpen={isOpen}
      loading={isLoading}
      onSave={handleSubmit}
      canSave={!!teamStatus.name && !!teamStatus.description}
    >
      <div className="my-4">
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          name="name"
          value={teamStatus.name}
          onChange={handleInputChange}
          className="input-custom"
        />
      </div>
      <div className="my-4">
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <input
          name="description"
          value={teamStatus.description}
          onChange={handleInputChange}
          className="input-custom"
        />
      </div>

      <div className="my-4">
        <label className="block text-sm font-medium text-gray-700">
          Possible Values
        </label>
        {possibleValueExists(newPossibleValue) && (
          <p className="text-sm text-red-400">
            Value already exists in possible values
          </p>
        )}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newPossibleValue}
            onChange={handlePossibleValueChange}
            className="input-custom"
            placeholder="Add a possible value"
            id="possible-value"
          />
          <button
            disabled={
              possibleValueExists(newPossibleValue) || !newPossibleValue.trim()
            }
            type="button"
            id="add-possible-value"
            onClick={handleAddPossibleValue}
            className="rounded-full bg-[var(--primary-button)] p-2 text-white shadow hover:bg-[var(--primary-button-hover)]"
          >
            <FaPlus className="h-4 w-4" />
          </button>
        </div>
        <ul className="mt-2">
          {teamStatus.possibleValues.map((value, index) => (
            <li
              key={value}
              className="m-2 my-2 flex items-center justify-between rounded-full bg-gray-200 px-4 py-2"
            >
              <span>{value}</span>
            </li>
          ))}
          {newPossibleValues.map((value, index) => (
            <li
              key={value}
              className="m-2 my-2 flex items-center justify-between rounded-full bg-gray-200 px-4 py-2"
            >
              <span>{value}</span>
              <button
                type="button"
                onClick={() => handleDeletePossibleValue(value)}
                className="square"
              >
                <FaTrash className="h-4 w-4 text-red-500" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </BaseModal>
  );
};

export default TeamStatusModal;

import { useEffect, useState } from 'react';
import BaseModal from '../_base/base-modal.component';
import { Organization } from '@/models/organization';
import { TeamLabel } from '@/models/team-label';
import { organizationManagementProxy } from '@/proxies/organization-management.proxy';
import { teamLabelProxy } from '@/proxies/team-label.proxy';
import TracerButton from '../tracer-button.component';
import toast, { Toaster } from 'react-hot-toast';

interface TeamLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamLabelId: string;
  onSave: (teamLabel: TeamLabel) => void;
}

const TeamLabelModal: React.FC<TeamLabelModalProps> = ({
  isOpen,
  onClose,
  teamLabelId,
  onSave,
}) => {
  const [teamLabel, setTeamLabel] = useState<TeamLabel>({
    id: '',
    checked: false,
    timeChecked: new Date(),
    labelName: '',
    owner: { id: '', name: '' },
  });
  const [organization, setOrganization] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const successToast = () => toast.success('Team label saved successfully');
  const successEditToast = () =>
    toast.success('Team label updated successfully');
  const errorToast = () => toast.error('Error saving team label');

  const editMode = !!teamLabelId;

  useEffect(() => {
    const fetchOrganizations = async () => {
      setIsLoading(true);
      try {
        const data = await organizationManagementProxy.GetAllOrganizations();
        setOrganization(data);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrganizations();
  }, []);

  useEffect(() => {
    const fetchTeamLabel = async () => {
      setIsLoading(true);
      if (editMode && teamLabelId) {
        try {
          const data = await teamLabelProxy.getTeamLabelById(teamLabelId);
          setTeamLabel(data);
          setSelectedOrganization(data.owner.id || '');
        } catch (error) {
          console.error('Error fetching team label:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchTeamLabel();
  }, [editMode, teamLabelId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === 'organization') {
      setSelectedOrganization(value);
      const selectedOrg = organization.find((org) => org.id === value);
      if (selectedOrg) {
        setTeamLabel((prev) => ({
          ...prev,
          owner: {
            id: selectedOrg.id,
            name: selectedOrg.name,
          },
        }));
      }
    } else {
      setTeamLabel((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (editMode) {
        await teamLabelProxy.updateTeamLabel(teamLabel.id, teamLabel);
        onSave(teamLabel);
        successEditToast();
      } else {
        await teamLabelProxy.createTeamLabel(teamLabel);
        onSave(teamLabel);
        successToast();
      }
      onClose();
    } catch (error) {
      console.error('Error saving team label:', error);
      errorToast();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModal
      title={editMode ? 'Edit Team Label' : 'Create Team Label'}
      onClose={onClose}
      isOpen={isOpen}
      loading={isLoading}
      onSave={() => onSave(teamLabel)}
    >
      <div className="my-4">
        <label className="block text-sm font-medium text-gray-700">
          Label Name
        </label>
        <input
          type="text"
          name="labelName"
          value={teamLabel.labelName}
          onChange={handleInputChange}
          className="input-custom"
        />
      </div>
      <div className="my-4">
        <label className="block text-sm font-medium text-gray-700">
          Owner Name
        </label>
        <select
          name="organization"
          value={selectedOrganization}
          onChange={handleInputChange}
          className="input-custom"
        >
          <option value="">Select an organization</option>
          {organization.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex">
        <div className="my-4">
          <TracerButton
            name={editMode ? 'Update Label' : 'Create Label'}
            onClick={handleSubmit}
          />
        </div>
      </div>
      <Toaster />
    </BaseModal>
  );
};

export default TeamLabelModal;

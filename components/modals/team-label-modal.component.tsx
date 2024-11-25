import { useEffect, useState } from 'react';
import BaseModal from '../_base/base-modal.component';
import { TeamLabel } from '@/models/team-label';
import { teamLabelProxy } from '@/proxies/team-label.proxy';

import toast, { Toaster } from 'react-hot-toast';
import { Organization } from '@/models/organization';
import { userAuthenticationService } from '@/services/user-authentication.service';

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
    checked: false,
    timeChecked: new Date(),
    labelName: '',
    owner: { id: '', name: '' },
  });
  const [organization, SetOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const successToast = () => toast.success('Team label saved successfully');
  const successEditToast = () =>
    toast.success('Team label updated successfully');
  const errorToast = () => toast.error('Error saving team label');

  const editMode = !!teamLabelId;

  useEffect(() => {
    const org = userAuthenticationService.getOrganization();
    if (org) {
      SetOrganization(org);
    }
    const fetchTeamLabel = async () => {
      if (editMode && teamLabelId) {
        setIsLoading(true);
        try {
          const data = await teamLabelProxy.getTeamLabelById(teamLabelId);
          setTeamLabel(data);
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
    setTeamLabel((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (editMode) {
        if (!teamLabel.id) {
          throw new Error('Team label ID is missing');
        }
        await teamLabelProxy.updateTeamLabel(teamLabel.id, teamLabel);
        onSave(teamLabel);
        successEditToast();
      } else {
        if (!organization) {
          throw new Error('Organization is missing');
        }
        teamLabel.owner = { id: organization.id, name: organization.name };
        const createdTeamLabel =
          await teamLabelProxy.createTeamLabel(teamLabel);
        onSave(createdTeamLabel);
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
      onSave={handleSubmit}
      canSave={!!teamLabel.labelName}
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
    </BaseModal>
  );
};

export default TeamLabelModal;

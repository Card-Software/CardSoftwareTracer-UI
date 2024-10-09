import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { teamLabelProxy } from '@/proxies/team-label.proxy';
import Layout from '@/app/layout';
import LoadingOverlay from '@/components/loading-overlay.component';
import TracerButton from '@/components/tracer-button.component';
import { TeamLabel } from '@/models/team-label';
import { HiCheck } from 'react-icons/hi';
import { Site } from '@/models/site';
import { User } from '@/models/user';
import { organizationManagementProxy } from '@/proxies/organization-management.proxy';
import toast, { Toaster } from 'react-hot-toast';

interface Organization {
  id: string;
  name: string;
  users: User[];
  s3BucketName: string;
  sites: Site[];
}

const TeamLabelDetails = () => {
  const router = useRouter();
  const { id } = router.query;
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
  const isEditMode = !!id;

  const successToast = () => toast.success('Team label saved successfully');
  const successEditToast = () =>
    toast.success('Team label updated successfully');
  const errorToast = () => toast.error('Error saving team label');

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
      if (isEditMode && id) {
        setIsLoading(true);
        try {
          const data = await teamLabelProxy.getTeamLabelById(id as string);
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
  }, [id, isEditMode]);

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
      if (isEditMode) {
        await teamLabelProxy.updateTeamLabel(teamLabel.id, teamLabel);
        successEditToast();
      } else {
        await teamLabelProxy.createTeamLabel(teamLabel);
        successToast();
      }
      setTimeout(() => router.push('/team-labels'), 1000);
    } catch (error) {
      console.error('Error saving team label:', error);
      errorToast();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <LoadingOverlay show={isLoading} />
      <div className="my-4">
        <h1 className="text-3xl font-bold text-[var(--primary-color)]">
          {isEditMode ? 'Edit Team Label' : 'Create New Team Label'}
        </h1>
      </div>
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
            name={isEditMode ? 'Update Label' : 'Create Label'}
            onClick={handleSubmit}
          />
        </div>
        <div className="my-4 ml-5">
          <button
            className="rounded-md bg-red-500 px-4 py-2 text-white"
            onClick={() => router.push('/team-labels')}
          >
            Cancel
          </button>
        </div>
      </div>
      <Toaster />
    </Layout>
  );
};

export default TeamLabelDetails;

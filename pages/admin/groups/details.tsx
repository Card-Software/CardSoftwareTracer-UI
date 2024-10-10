import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Group } from '@/models/group';
import { userAuthorizationProxy } from '@/proxies/user-authorization.proxy';
import Layout from '@/app/layout';
import LoadingOverlay from '@/components/loading-overlay.component';
import TracerButton from '@/components/tracer-button.component';
import { HiCheck } from 'react-icons/hi';
import { Site } from '@/models/site';
import { User } from '@/models/user';
import { organizationManagementProxy } from '@/proxies/organization-management.proxy';
import { userProxy } from '@/proxies/user.proxy';
import Select from 'react-select';
import toast, { Toaster } from 'react-hot-toast';

interface Organization {
  id: string;
  name: string;
  users: User[];
  s3BucketName: string;
  sites: Site[];
}

const GroupDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const isEditMode = !!id;
  const [organization, setOrganization] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<
    { label: string; value: string }[]
  >([]);

  const successToast = () => toast.success('Group saved successfully');
  const successEditToast = () => toast.success('Group updated successfully');
  const errorToast = () => toast.error('Error saving group');

  const [group, setGroup] = useState<Group>({
    id: '',
    name: '',
    description: '',
    ownerRef: '',
    membersEmail: [],
  });
  const [isLoading, setIsLoading] = useState(false);

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
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const data = await userProxy.getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchGroup = async () => {
      if (isEditMode && id) {
        setIsLoading(true);
        try {
          const groupToEdit = await userAuthorizationProxy.getGroupById(
            id as string,
          );
          if (groupToEdit) {
            setGroup(groupToEdit);
            setSelectedOrganization(groupToEdit.ownerRef || '');
            setSelectedUsers(
              groupToEdit.membersEmail.map((email) => ({
                label: email,
                value: email,
              })) || [],
            );
          }
        } catch (error) {
          console.error('Error fetching group:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchGroup();
  }, [id, isEditMode]);

  const handleEmailChange = (selectedOptions: any) => {
    setSelectedUsers(selectedOptions);
    const emails = selectedOptions.map(
      (option: { value: string }) => option.value,
    );
    setGroup((prev) => ({
      ...prev,
      membersEmail: emails,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (isEditMode) {
        await userAuthorizationProxy.updateGroup(group.id as string, group);
        successEditToast();
      } else {
        await userAuthorizationProxy.createGroup(group);
        successToast();
      }
      router.push('/groups');
    } catch (error) {
      console.error('Error saving group:', error);
      errorToast();
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === 'organization') {
      setSelectedOrganization(value);
      const selectedOrg = organization.find((org) => org.id === value);
      if (selectedOrg) {
        setGroup((prev) => ({
          ...prev,
          ownerRef: selectedOrg.id,
        }));
      }
    } else {
      setGroup((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <Layout>
      <LoadingOverlay show={isLoading} />
      <div className="my-4">
        <h1 className="text-3xl font-bold text-[var(--primary-color)]">
          {isEditMode ? 'Edit Group' : 'Create New Group'}
        </h1>
      </div>

      <div className="my-4">
        <label className="block text-sm font-medium text-gray-700">
          Group Name
        </label>
        <input
          type="text"
          name="name"
          value={group.name || ''}
          onChange={handleInputChange}
          className="input-custom"
        />
      </div>

      <div className="my-4">
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          value={group.description || ''}
          onChange={handleInputChange}
          className="input-custom"
        />
      </div>

      <div className="my-4">
        <label className="block text-sm font-medium text-gray-700">
          Members (Emails)
        </label>
        {/* Multi-select dropdown de react-select */}
        <Select
          isMulti
          name="membersEmail"
          value={selectedUsers}
          options={users.map((user) => ({
            label: user.email || '',
            value: user.email || '',
          }))}
          onChange={handleEmailChange}
          className="react-select"
        />
      </div>

      <div className="my-4">
        <label className="block text-sm font-medium text-gray-700">
          Owner Reference
        </label>
        <select
          name="organization"
          value={selectedOrganization}
          onChange={handleInputChange}
          className="input-custom"
        >
          <option value="">Select an Organization</option>
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
            name={isEditMode ? 'Update Group' : 'Create Group'}
            icon={<HiCheck />}
            onClick={handleSubmit}
          />
        </div>
        <div className="my-4 ml-5">
          <button
            className="rounded-md bg-red-500 px-4 py-2 text-white"
            onClick={() => router.push('/groups')}
          >
            Cancel
          </button>
        </div>
      </div>
      <Toaster />
    </Layout>
  );
};

export default GroupDetails;

`use client`;
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Group } from '@/models/group';
import { userAuthorizationProxy } from '@/proxies/user-authorization.proxy';
import Layout from '@/app/layout';
import LoadingOverlay from '@/components/loading-overlay.component';
import TracerButton from '@/components/tracer-button.component';
import { Site } from '@/models/site';
import { User } from '@/models/user';
import { organizationManagementProxy } from '@/proxies/organization-management.proxy';
import { userProxy } from '@/proxies/user.proxy';
import Select from 'react-select';
import toast, { Toaster } from 'react-hot-toast';
import { userAuthenticationService } from '@/services/user-authentication.service';

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
  const [organization, setOrganization] = useState<Organization>();
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<{ label: string; value: string }[]>([]);

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
    const org = userAuthenticationService.getOrganization();
    if (org) {
      setOrganization(org);
    }
  }, []);

  useEffect(() => {
    const fetchGroup = async () => {
      if (isEditMode && id) {
        setIsLoading(true);
        try {
          const groupToEdit = await userAuthorizationProxy.getGroupById(id as string);
          if (groupToEdit) {
            setGroup(groupToEdit);
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
    const emails = selectedOptions.map((option: { value: string }) => option.value);
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
        group.ownerRef = organization?.id as string;
        await userAuthorizationProxy.createGroup(group);
        successToast();
      }
      router.push('/admin/groups');
    } catch (error) {
      console.error('Error saving group:', error);
      errorToast();
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGroup((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Layout>
      <LoadingOverlay show={isLoading} />
      <div className="content">
        <div aria-label="Toolbar">
          <div className="tool-bar-content">
            <h1>{isEditMode ? 'Edit Group' : 'Create New Group'}</h1>
          </div>
        </div>
        <div>
          <label className="row text-sm font-medium text-gray-700">Group Name</label>
          <input type="text" name="name" value={group.name || ''} onChange={handleInputChange} className="w-full" />
        </div>

        <div className="my-4">
          <label className="row text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={group.description || ''}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="my-4">
          <label className="block text-sm font-medium text-gray-700">Members (Emails)</label>
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
      </div>

      <footer>
        <TracerButton name={isEditMode ? 'Update Group' : 'Create Group'} onClick={handleSubmit} />
        <button className="cancel" onClick={() => router.back()}>
          Cancel
        </button>
        <Toaster />
      </footer>
      <Toaster />
    </Layout>
  );
};

export default GroupDetails;

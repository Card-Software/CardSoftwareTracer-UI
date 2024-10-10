import { Group } from '@/models/group';
import { userAuthorizationProxy } from '@/proxies/user-authorization.proxy';
import { userAuthenticationService } from '@/services/user-authentication.service';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import Layout from '@/app/layout';
import LoadingOverlay from '@/components/loading-overlay.component';
import TracerButton from '@/components/tracer-button.component';
import { Toaster } from 'react-hot-toast';
import { FaTrash } from 'react-icons/fa';
import { HiPlus } from 'react-icons/hi';
import toast, { Toast } from 'react-hot-toast';

const Groups = () => {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasPageBeenRendered = useRef({ allGroupsLoaded: false });

  const successDeleteToast = () => toast.success('Group deleted successfully');

  useEffect(() => {
    const organization = userAuthenticationService.getOrganization();
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (organization) {
          const data = await userAuthorizationProxy.getAllGroups(
            organization.id,
          );
          setGroups(data);
          setFilteredGroups(data);
        } else {
          console.error('Organization is null');
        }
      } catch (error) {
        console.error('Failed to fetch groups', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!hasPageBeenRendered.current.allGroupsLoaded) {
      hasPageBeenRendered.current.allGroupsLoaded = true;
      fetchData();
    }
  }, []);

  const handleAddGroup = () => {
    router.push('/groups/details');
  };

  const handleGroupClick = (id: string) => {
    router.push(`/groups/details?id=${id}`);
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      await userAuthorizationProxy.deleteGroup(id);
      const updatedGroups = groups.filter((group) => group.id !== id);
      setGroups(updatedGroups);
      setFilteredGroups(updatedGroups);
      successDeleteToast();
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const handleDeleteClick = (id: string) => async (e: React.MouseEvent) => {
    e.stopPropagation();
    await handleDeleteGroup(id);
  };
  return (
    <Layout>
      <LoadingOverlay show={isLoading} />
      <div className="tool-bar">
        <div className="tool-bar-title">
          <h1 className="text-3xl font-bold text-[var(--primary-color)]">
            Groups
          </h1>
        </div>
        <div className="tool-bar-buttons">
          <TracerButton
            name="Add Group"
            icon={<HiPlus />}
            onClick={handleAddGroup}
          />
        </div>
      </div>

      <div
        className="my-4 w-full border-b-4"
        style={{ borderColor: 'var(--primary-color)' }}
      ></div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredGroups.map((group) => (
          <div
            key={group.id}
            className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-300 p-4 shadow-md"
            onClick={() => group.id && handleGroupClick(group.id)}
          >
            <div>
              <h2 className="text-lg font-bold text-gray-700">{group.name}</h2>
              <p className="text-sm text-gray-500">
                Description: {group.description}
              </p>
            </div>
            <div onClick={handleDeleteClick(group.id || '')}>
              <FaTrash color="#EF4444" />
            </div>
            <Toaster />
          </div>
        ))}
      </div>
    </Layout>
  );
};
export default Groups;

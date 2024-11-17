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
import AlertModal from '@/components/modals/alert-modal-component';

const Groups = () => {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasPageBeenRendered = useRef({ allGroupsLoaded: false });
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

  const successDeleteToast = () => toast.success('Group deleted successfully');

  useEffect(() => {
    const organization = userAuthenticationService.getOrganization();
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (organization) {
          const data = await userAuthorizationProxy.getAllGroups(organization.id);
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
    router.push(`${router.asPath}/details`);
  };

  const handleGroupClick = (id: string) => {
    router.push(`${router.asPath}/details?id=${id}`);
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
    setGroupToDelete(null);
    setIsAlertModalOpen(false);
  };

  return (
    <Layout>
      <LoadingOverlay show={isLoading} />
      <div className="content">
        <div aria-label="Toolbar">
          <div className="tool-bar-content">
            <h1>Groups</h1>
            <div className="row">
              <TracerButton name="Add Group" icon={<HiPlus />} onClick={handleAddGroup} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="adminCard"
              onClick={() => group.id && handleGroupClick(group.id)}
            >
              <div>
                <h2 className="text-lg font-bold text-gray-700">{group.name}</h2>
                <p className="text-sm text-gray-500">Description: {group.description}</p>
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setGroupToDelete(group);
                  setIsAlertModalOpen(true);
                }}
              >
                <FaTrash className="trashButton h-5 w-5" />
              </div>
              <Toaster />
            </div>
          ))}
        </div>
        {isAlertModalOpen && (
          <AlertModal
            isOpen={isAlertModalOpen}
            type="delete"
            title="Delete Team Label"
            message="Are you sure you want to delete this Team Label"
            icon={<FaTrash className="h-6 w-6 text-red-500" />}
            onClose={() => {
              setIsAlertModalOpen(false);
              setGroupToDelete(null);
            }}
            onConfirm={() => {
              if (groupToDelete?.id) {
                handleDeleteGroup(groupToDelete.id);
              } else {
                console.error('Team label id is null');
              }
            }}
          />
        )}
      </div>
    </Layout>
  );
};
export default Groups;

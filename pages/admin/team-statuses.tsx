import React, { useEffect, useRef, useState } from 'react';
import LoadingOverlay from '@/components/loading-overlay.component';
import { HiPlus } from 'react-icons/hi';
import TracerButton from '@/components/tracer-button.component';
import Layout from '@/app/layout';
import { FaTrash } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import AlertModal from '@/components/modals/alert-modal-component';
import TeamStatusModal from '@/components/modals/team-status-modal.component';
import { teamStatusProxy } from '@/proxies/team-status.proxy';
import { TeamStatus } from '@/models/team-status';

const Statuses = () => {
  const [teamStatuses, setTeamStatuses] = useState<TeamStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [teamStatusToDelete, setTeamStatusToDelete] = useState<TeamStatus | null>(null);

  const successDeleteToast = () => toast.success('Team status deleted successfully');
  const errorToast = () => toast.error('Error deleting team status');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await teamStatusProxy.getAllTeamStatus();
      setTeamStatuses(data);
    } catch (error) {
      console.error('Failed to fetch team statuses', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStatus = () => {
    setIsModalOpen(true);
    setId(null);
  };

  const handleStatusClick = (id: string) => {
    setIsModalOpen(true);
    setId(id);
  };

  const handleDeleteStatus = async (id: string) => {
    try {
      await teamStatusProxy.deleteTeamStatus(id);
      fetchData();
      successDeleteToast();
    } catch (error) {
      console.error('Failed to delete team status', error);
      errorToast();
    }
    setTeamStatusToDelete(null);
    setIsAlertModalOpen(false);
  };

  return (
    <Layout>
      <LoadingOverlay show={isLoading} />
      <div className="content">
        <div aria-label="Toolbar">
          <div className="tool-bar-content">
            <h1>Team Statuses</h1>
            <div>
              <TracerButton name="Add Status" icon={<HiPlus />} onClick={handleAddStatus} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teamStatuses.map((teamStatus) => (
            <div
              key={teamStatus.id}
              className="adminCard"
              onClick={() => handleStatusClick(teamStatus.id as string)}
            >
              <div>
                <h2 className="text-lg font-bold text-gray-700">{teamStatus.name}</h2>
              </div>
              <div
                onClick={(e) => {
                  setIsAlertModalOpen(true);
                  setTeamStatusToDelete(teamStatus);
                  e.stopPropagation();
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
            title="Delete Team Status"
            message="Are you sure you want to delete this Team Status"
            icon={<FaTrash className="h-6 w-6 text-red-500" />}
            onClose={() => {
              setIsAlertModalOpen(false);
              setTeamStatusToDelete(null);
            }}
            onConfirm={() => {
              if (teamStatusToDelete?.id) {
                handleDeleteStatus(teamStatusToDelete.id);
              } else {
                console.error('Team status id is null' + teamStatusToDelete);
              }
            }}
          />
        )}

        <TeamStatusModal
          isOpen={isModalOpen}
          teamStatusId={id}
          onClose={() => {
            setIsModalOpen(false);
            setId(null);
          }}
          onSave={() => {
            fetchData();
            setId(null);
          }}
        />
      </div>
    </Layout>
  );
};

export default Statuses;

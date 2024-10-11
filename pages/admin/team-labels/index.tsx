import { useRouter } from 'next/router';
import { TeamLabel } from '@/models/team-label';
import React, { useEffect, useRef, useState } from 'react';
import { teamLabelProxy } from '@/proxies/team-label.proxy';
import { userAuthenticationService } from '@/services/user-authentication.service';
import LoadingOverlay from '@/components/loading-overlay.component';
import '@/styles/traceability-stream.css';
import { HiPlus } from 'react-icons/hi';
import TracerButton from '@/components/tracer-button.component';
import Layout from '@/app/layout';
import { FaTrash } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import TeamLabelModal from '@/components/modals/team-lable-modal.component';
import AlertModal from '@/components/modals/alert-modal-component';

const TeamLabels = () => {
  const [teamLabels, setTeamLabels] = useState<TeamLabel[]>([]);
  const [filteredTeamLabels, setFilteredTeamLabels] = useState<TeamLabel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasPageBeenRendered = useRef({ allTeamLabelsLoaded: false });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState('');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [tlToDelete, setTlToDelete] = useState<TeamLabel | null>(null);

  const successDeleteToast = () =>
    toast.success('Team label deleted successfully');
  const errorToast = () => toast.error('Error deleting team label');

  useEffect(() => {
    const organization = userAuthenticationService.getOrganization();
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (organization) {
          const data = await teamLabelProxy.getTeamLabelsByOrganizationName(
            organization.name,
          );
          setTeamLabels(data);
          setFilteredTeamLabels(data);
        } else {
          console.error('Organization is null');
        }
      } catch (error) {
        console.error('Failed to fetch team labels', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!hasPageBeenRendered.current.allTeamLabelsLoaded) {
      hasPageBeenRendered.current.allTeamLabelsLoaded = true;
      fetchData();
    }
  }, []);

  const handleAddLabel = () => {
    setIsModalOpen(true);
    setId('');
  };

  const handleLabelClick = (id: string) => {
    setIsModalOpen(true);
    setId(id);
  };

  const handleDeleteLabel = async (id: string) => {
    try {
      await teamLabelProxy.deleteTeamLabel(id);
      const updatedTeamLabels = teamLabels.filter(
        (teamLabel) => teamLabel.id !== id,
      );
      setTeamLabels(updatedTeamLabels);
      setFilteredTeamLabels(updatedTeamLabels);
      successDeleteToast();
    } catch (error) {
      console.error('Failed to delete team label', error);
      errorToast();
    }
    setTlToDelete(null);
    setIsAlertModalOpen(false);
  };

  const updateTeamLabels = (updatedLabel: TeamLabel) => {
    setTeamLabels((prevLabels) => {
      const labelExists = prevLabels.find(
        (label) => label.id === updatedLabel.id,
      );
      if (labelExists) {
        return prevLabels.map((label) =>
          label.id === updatedLabel.id ? updatedLabel : label,
        );
      } else {
        return [...prevLabels, updatedLabel];
      }
    });
    setFilteredTeamLabels((prevLabels) => {
      const labelExists = prevLabels.find(
        (label) => label.id === updatedLabel.id,
      );
      if (labelExists) {
        return prevLabels.map((label) =>
          label.id === updatedLabel.id ? updatedLabel : label,
        );
      } else {
        return [...prevLabels, updatedLabel];
      }
    });
  };

  return (
    <Layout>
      <LoadingOverlay show={isLoading} />
      <div className="tool-bar">
        <div className="tool-bar-title">
          <h1 className="text-3xl font-bold text-[var(--primary-color)]">
            Team Labels
          </h1>
        </div>
        <div className="tool-bar-buttons">
          <TracerButton
            name="Add Label"
            icon={<HiPlus />}
            onClick={handleAddLabel}
          />
        </div>
      </div>

      <div
        className="my-4 w-full border-b-4"
        style={{ borderColor: 'var(--primary-color)' }}
      ></div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTeamLabels.map((teamLabel) => (
          <div
            key={teamLabel.id}
            className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-300 p-4 shadow-md"
            onClick={() => handleLabelClick(teamLabel.id)}
          >
            <div>
              <h2 className="text-lg font-bold text-gray-700">
                {teamLabel.labelName}
              </h2>
              <p className="text-sm text-gray-500">
                Owner: {teamLabel.owner.name}
              </p>
            </div>
            <div
              onClick={(e) => {
                setIsAlertModalOpen(true);
                setTlToDelete(teamLabel);
                e.stopPropagation();
              }}
            >
              <FaTrash
                color="#ef4444"
                className="h-5 w-5 transition-transform duration-200 hover:scale-125"
              />
            </div>
            <Toaster />
          </div>
        ))}
      </div>

      {isModalOpen && (
        <TeamLabelModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          teamLabelId={id}
          onSave={updateTeamLabels}
        />
      )}

      {isAlertModalOpen && (
        <AlertModal
          isOpen={isAlertModalOpen}
          type="delete"
          title="Delete Team Label"
          message="Are you sure you want to delete this Team Label"
          icon={<FaTrash className="h-6 w-6 text-red-500" />}
          onClose={() => {
            setIsAlertModalOpen(false);
            setTlToDelete(null);
          }}
          onConfirm={() => {
            if (tlToDelete?.id) {
              handleDeleteLabel(tlToDelete.id);
            } else {
              console.error('Team label id is null' + tlToDelete);
            }
          }}
        />
      )}
    </Layout>
  );
};

export default TeamLabels;

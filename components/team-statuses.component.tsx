import React, { useEffect, useState } from 'react';
import { FaHistory } from 'react-icons/fa';
import { TeamStatus, TeamStatusExtended } from '@/models/team-status';
import { teamStatusProxy } from '@/proxies/team-status.proxy';
import { IoClose } from 'react-icons/io5';

interface TeamStatusesProps {
  onChange: (updatedStatuses: TeamStatusExtended[]) => void;
  originalStatuses: TeamStatusExtended[];
  disableHistoryButton: boolean;
  onHistoryClick: () => void;
}

const TeamStatuses: React.FC<TeamStatusesProps> = ({
  onChange,
  originalStatuses,
  disableHistoryButton = true,
  onHistoryClick,
}) => {
  const [teamStatuses, SetTeamStatuses] = useState<TeamStatusExtended[]>([]);
  const [allTeamStatuses, SetAllTeamStatuses] = useState<TeamStatus[]>([]);
  const [teamStatusDeleted, SetTeamStatusDeleted] = useState<string>();

  useEffect(() => {
    if (originalStatuses) {
      SetTeamStatuses(originalStatuses);
    } else {
      SetTeamStatuses([]);
    }
    const fetchData = async () => {
      try {
        const teamStatuses = await teamStatusProxy.getAllTeamStatus();
        SetAllTeamStatuses(teamStatuses);
        if (originalStatuses?.length === 0 || !originalStatuses) {
          SetTeamStatuses(
            teamStatuses.map((status) => ({
              id: status.id as string,
              name: status.name,
              selectedValue: '',
            })),
          );
        }
      } catch (error) {
        console.error('Failed to fetch team statuses', error);
      }
    };
    fetchData();
  }, []);

  const teamStatusSelectedValue = (id: string, value: string) => {
    const updatedStatuses = teamStatuses.map((status) => {
      if (status.id === id) {
        return { ...status, selectedValue: value };
      }
      return status;
    });
    SetTeamStatuses(updatedStatuses);
    onChange(updatedStatuses);
  };

  const getTeamStatus = (id: string) => {
    return allTeamStatuses.find((s) => s.id === id);
  };

  const deleteTeamStatus = (id: string) => {
    SetTeamStatusDeleted(id);
    const updatedStatuses = teamStatuses.filter((status) => status.id !== id);
    SetTeamStatuses(updatedStatuses);
    onChange(updatedStatuses);
  };

  return (
    <div className="max-w-lg rounded-lg border bg-white shadow-lg">
      <div className="flex items-center justify-between rounded-t-lg bg-[var(--primary-color)] p-4 pb-1">
        <h2 className="mb-4 text-xl font-semibold text-white">Team Statuses</h2>
        <div>
          <button
            disabled={disableHistoryButton}
            onClick={onHistoryClick}
            className="mb-3 rounded bg-white px-4 font-bold text-[var(--primary-color)] hover:bg-[var(--primary-button-hover)]"
          >
            <FaHistory />
          </button>
        </div>
      </div>

      <div className="border-b p-4">
        <select
          onChange={(e) => {
            const selectedId = e.target.value;
            const selectedStatus = getTeamStatus(selectedId);
            if (selectedStatus) {
              const updatedStatuses = [
                ...teamStatuses,
                {
                  id: selectedId,
                  name: selectedStatus.name,
                  selectedValue: '',
                },
              ];
              SetTeamStatuses(updatedStatuses);
              onChange(updatedStatuses);
              e.target.value = '';
            }
          }}
          className="w-full "
        >
          <option value="">Select a team status</option>
          {allTeamStatuses
            .filter((status) => !teamStatuses.some((ts) => ts.id === status.id))
            .map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
        {teamStatuses.map((status) => (
          <div key={status.id} className="mb-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-2">
                <label>{status.name}</label>
                <IoClose
                  className="cursor-pointer hover:text-red-500"
                  onClick={() => deleteTeamStatus(status.id)}
                />
              </div>

              <select
                onChange={(e) =>
                  teamStatusSelectedValue(status.id, e.target.value)
                }
                value={status.selectedValue}
              >
                {getTeamStatus(status.id)?.possibleValues.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamStatuses;

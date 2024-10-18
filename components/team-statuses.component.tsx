import React, { useEffect, useState } from 'react';
import { FaHistory } from 'react-icons/fa';
import { TeamStatus, TeamStatusExtended } from '@/models/team-status';
import { teamStatusProxy } from '@/proxies/team-status.proxy';

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

      <div className="mt-8 grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
        {teamStatuses.map((status) => (
          <div key={status.id} className="mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-lg font-semibold text-gray-700">
                {status.name}
              </label>
              <select
                onChange={(e) =>
                  teamStatusSelectedValue(status.id, e.target.value)
                }
                value={status.selectedValue}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

import React, { useEffect } from 'react';
import { Status } from '../models/status';
import {
  Statuses,
  DeliveryStatus,
  PlanningStatuses,
} from '@/models/enum/statuses';
import { FaHistory } from 'react-icons/fa';

interface TeamStatusesProps {
  onChange: (updatedStatuses: Status[]) => void;
  originalStatus: Status[];
  disableHistoryButton: boolean;
  onHistoryClick: () => void;
}

const TeamStatuses: React.FC<TeamStatusesProps> = ({
  onChange,
  originalStatus,
  disableHistoryButton = true,
  onHistoryClick,
}) => {
  const [status, setStatus] = React.useState<Status[]>(originalStatus);

  useEffect(() => {
    if (status.length === 0) {
      setStatus([
        {
          team: 'Planning',
          teamStatus: PlanningStatuses.Pending,
          feedback: '',
        },
        { team: 'SAC', teamStatus: Statuses.Pending, feedback: '' },
        { team: 'NT', teamStatus: Statuses.Pending, feedback: '' },
        { team: 'Delivery', teamStatus: DeliveryStatus.NotSent, feedback: '' },
      ]);
    }
  }, [status]);

  useEffect(() => {
    const updatedStatus = status.map((s) =>
      s.team === 'Delivery' &&
      !Object.values(DeliveryStatus).includes(s.teamStatus as DeliveryStatus)
        ? { ...s, teamStatus: DeliveryStatus.NotSent }
        : s,
    );
    if (JSON.stringify(updatedStatus) !== JSON.stringify(status)) {
      setStatus(updatedStatus);
    }
  }, [status]);

  const handleStatusChange = (team: string, newStatus: string) => {
    const updatedStatus = status.map((s) =>
      s.team === team ? { ...s, teamStatus: newStatus } : s,
    );
    setStatus(updatedStatus);
    onChange(updatedStatus);
  };

  const handleFeedbackChange = (team: string, feedback: string) => {
    const updatedStatus = status.map((s) =>
      s.team === team ? { ...s, feedback: feedback } : s,
    );
    setStatus(updatedStatus);
    onChange(updatedStatus);
  };

  const getStatusOptions = (team: string) => {
    switch (team) {
      case 'Delivery':
        return Object.values(DeliveryStatus);
      case 'Planning':
        return Object.values(PlanningStatuses);
      default:
        return Object.values(Statuses);
    }
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
        {status.map((s) => (
          <div key={s.team} className="mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-lg font-semibold text-gray-700">
                {s.team}
              </label>
              <select
                value={s.teamStatus}
                onChange={(e) => handleStatusChange(s.team, e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {getStatusOptions(s.team).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {s.teamStatus === Statuses.Returned && (
                <textarea
                  placeholder="Provide feedback"
                  value={s.feedback}
                  onChange={(e) => handleFeedbackChange(s.team, e.target.value)}
                  required
                  className="mt-4 rounded-lg border border-gray-300 p-4 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                ></textarea>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamStatuses;

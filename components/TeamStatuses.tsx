// components/TeamStatuses.tsx
import React, { useEffect } from 'react';
import { Status } from '../models/Status';
import { Statuses } from '@/models/enum/statuses';

interface TeamStatusesProps {
  onChange: (updatedStatuses: Status[]) => void;
  originalStatus: Status[];
}

const TeamStatuses: React.FC<TeamStatusesProps> = ({
  onChange,
  originalStatus,
}) => {
  const [status, setStatus] = React.useState<Status[]>(originalStatus);

  useEffect(() => {
    if (status.length === 0) {
      setStatus([
        { team: 'NT', teamStatus: Statuses.Pending, feedback: '' },
        { team: 'Planning', teamStatus: Statuses.Pending, feedback: '' },
        { team: 'SAC', teamStatus: Statuses.Pending, feedback: '' },
      ]);
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

  return (
    <div className="flex flex-row gap-4">
      {status.map((s) => (
        <div key={s.team} className="flex items-center gap-4">
          <label className="font-semibold text-gray-700">{s.team}</label>
          <select
            value={s.teamStatus}
            onChange={(e) => handleStatusChange(s.team, e.target.value)}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {Object.values(Statuses).map((status) => (
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
              className="ml-4 rounded-md border border-gray-300 p-2 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            ></textarea>
          )}
        </div>
      ))}
    </div>
  );
};

export default TeamStatuses;

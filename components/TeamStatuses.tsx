// components/TeamStatuses.tsx
import React, { useEffect } from 'react';
import { Status } from '../models/Status';
import { Statuses, NTStasuses } from '@/models/enum/statuses';

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
        { team: 'Planning', teamStatus: Statuses.Pending, feedback: '' },
        { team: 'SAC', teamStatus: Statuses.Pending, feedback: '' },
        { team: 'NT', teamStatus: NTStasuses.NotSent, feedback: '' },
      ]);
    }
  }, [status]);

  useEffect(() => {
    const updatedStatus = status.map((s) =>
      s.team === 'NT' &&
      !Object.values(NTStasuses).includes(s.teamStatus as NTStasuses)
        ? { ...s, teamStatus: NTStasuses.NotSent }
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

  return (
    <div className="flex flex-row justify-between rounded-lg border bg-white p-6 shadow-lg">
      {status.map((s) => (
        <div key={s.team} className="mb-6">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-800">{s.team}</label>
            <select
              value={s.teamStatus}
              onChange={(e) => handleStatusChange(s.team, e.target.value)}
              className="w-48 rounded-md border border-gray-300 px-4 py-2 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {s.team === 'NT'
                ? Object.values(NTStasuses).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))
                : Object.values(Statuses).map((status) => (
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
                className="mt-4 w-64 rounded-md border border-gray-300 p-4 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              ></textarea>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamStatuses;

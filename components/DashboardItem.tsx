import React from 'react';
import { HiUser } from 'react-icons/hi';
import ProgressBar from './ProgressBar';

interface DashboardItemProps {
  poNumber: string;
  progress: number;
  assignedTo: string;
  dueDate: string;
}

const DashboardItem: React.FC<DashboardItemProps> = ({ poNumber, progress, assignedTo, dueDate }) => {
  return (
    <div className="border border-black rounded p-4 mb-4 max-w-72">
      <h2>PO {poNumber}</h2>
      <ProgressBar progress={progress} />
      <div className="flex items-center mt-2">
        Assigned to: <HiUser className="ml-2" />
        <span>{assignedTo}</span>
      </div>
      <div className="mt-2">Due Date: {dueDate}</div>
    </div>
  );
};

export default DashboardItem;

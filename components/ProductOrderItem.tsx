import React from 'react';
import { HiUser } from 'react-icons/hi';
import ProgressBar from './ProgressBar';
import Link from 'next/link';

interface ProdcutOrderProps {
  poNumber: string;
  progress: number;
  assignedTo: string;
  dueDate: string;
}

const ProdcutOrder: React.FC<ProdcutOrderProps> = ({
  poNumber,
  progress,
  assignedTo,
  dueDate,
}) => {
  return (
    <Link href={`Dashboard/po/${poNumber}`}>
      <div className="mb-8 max-w-72 rounded border border-black p-4">
        <h2>PO {poNumber}</h2>
        <ProgressBar progress={progress} />
        <div className="mt-2 flex items-center">
          Assigned to: <HiUser className="ml-2" />
          <span>{assignedTo}</span>
        </div>
        <div className="mt-2">Due Date: {dueDate}</div>
      </div>
    </Link>
  );
};

export default ProdcutOrder;

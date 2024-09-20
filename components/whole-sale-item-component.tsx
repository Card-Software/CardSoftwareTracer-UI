import React from 'react';
import { HiUser } from 'react-icons/hi';
import ProgressBar from './progress-bar.component';
import Link from 'next/link';
import '../styles/WholeSaleItem.css';

interface WholeSaleItemProps {
  woNumber: string;
  progress: number;
  assignedTo: string;
  dueDate: string;
  href: string;
}

const WholeSaleItem: React.FC<WholeSaleItemProps> = ({
  woNumber,
  progress,
  assignedTo,
  dueDate,
  href,
}) => {
  return (
    <Link href={href}>
      <div className="wholesale-item relative mb-4 max-w-72 rounded border border-black p-4">
        <h2 className="text-lg ">WO {woNumber}</h2>
        {/* <ProgressBar progress={progress} /> */}
        <div className="mt-2 flex items-center">
          Assigned to: <HiUser className="ml-2" />
          <span className="ml-1">{assignedTo}</span>
        </div>
        <div className="mt-2">Due Date: {dueDate}</div>
      </div>
    </Link>
  );
};

export default WholeSaleItem;

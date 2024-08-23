// components/ActivityLogModal.tsx
import React from 'react';
import { ActivityLog } from '@/models/activity-log';
import { ActivityType } from '@/models/enum/activity-type';
import BaseModal from '../_base/base-modal.component';

interface ActivityLogModalProps {
  activityLogs: ActivityLog[];
  displayType: ActivityType;
  onClose: () => void;
}

const ActivityLogModal: React.FC<ActivityLogModalProps> = ({
  activityLogs,
  displayType,
  onClose,
}) => {
  activityLogs.sort((a, b) => {
    return new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime();
  }); // sort activity logs by timestamp
  return (
    <BaseModal
      title="Activity Log"
      onClose={onClose}
      isOpen={true}
      loading={false}
    >
      <ol className="relative border-l border-gray-200 dark:border-gray-700">
        {activityLogs
          .filter((log) => log.activityType === displayType)
          .map((log, index) => (
            <li key={index} className="mb-10 ml-6">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:flex dark:border-gray-600 dark:bg-gray-700">
                <time className="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">
                  {new Date(log.timeStamp).toLocaleString()}
                </time>
                {displayType === ActivityType.FileUpload && (
                  <div className=" text-sm font-normal text-gray-500 dark:text-gray-300">
                    {log.userFirstName} {log.userLastName} uploaded file{' '}
                    <span className="font-semibold">{log.fileName}</span> to{' '}
                    {log.section}.
                  </div>
                )}
                {displayType === ActivityType.StatusChange && (
                  <div className="mr-2 text-sm font-normal text-gray-500 dark:text-gray-300">
                    {log.userFirstName} {log.userLastName} updated status to{' '}
                    {'"'}
                    {log.teamStatus}
                    {'"'}.
                    {log.feedBack && (
                      <div className="mt-2 text-xs font-normal italic text-gray-500 dark:text-gray-300">
                        Feedback: {'"'}
                        {log.feedBack}
                        {'"'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
      </ol>
    </BaseModal>
  );
};

export default ActivityLogModal;

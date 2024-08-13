// components/ActivityLogModal.tsx
import React from 'react';
import styled from 'styled-components';
import { ActivityLog } from '@/models/activity-log';
import { ActivityType } from '@/models/enum/activity-type';
import { FaTimes } from 'react-icons/fa';

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
    <ModalWrapper className="open">
      <ModalOverlay onClick={onClose} />
      <ModalContent>
        <ModalHeader>
          <h1>Activity Log</h1>
          <button onClick={onClose} className="close-button">
            <FaTimes size={24} />
          </button>
        </ModalHeader>
        <ModalBody>
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
        </ModalBody>
        <ModalFooter>
          <CancelButton onClick={onClose}>Close</CancelButton>
        </ModalFooter>
      </ModalContent>
    </ModalWrapper>
  );
};

export default ActivityLogModal;

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 0;
  overflow: hidden;
  transition: width 0.3s;
  z-index: 1000;

  &.open {
    width: 40%;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const ModalContent = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  z-index: 1001;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px 0 0 8px;
`;

const ModalHeader = styled.div`
  background: #2d3748;
  color: #fff;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 8px;
`;

const ModalBody = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const ModalFooter = styled.div`
  padding: 20px;
  background: #2d3748;
  text-align: right;
  border-bottom-left-radius: 8px;
`;

const CancelButton = styled.button`
  background: #6b7280; /* bg-gray-500 */
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #4b5563; /* hover:bg-gray-600 */
  }
`;

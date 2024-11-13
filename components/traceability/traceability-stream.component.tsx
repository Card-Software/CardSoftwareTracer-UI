import React, { use, useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaFileExport, FaHistory, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { TracerStreamExtended } from '@/models/tracer-stream';
import SectionComponent from './section.component'; // Import the single section component
import '../../styles/components/traceability/traceability-stream.css'; // Styling for this component
import { Section } from '@/models/section';
import { SectionService } from '@/services/sections.service';

interface TraceabilityStreamProps {
  stream: TracerStreamExtended;
  allActivityLogs: any[]; // Pass in the activity logs
  onActivityLogClick: (activityType: string, streamId: string) => void;
  onExportClick: (stream: TracerStreamExtended) => void;
  onEditStream: (stream: TracerStreamExtended, mode: 'edit' | 'add') => void;
  onDeleteStream: (stream: TracerStreamExtended) => void;
  onSectionSave: (updatedSection: Section) => void;
  onSectionDelete: (section: Section) => void;
}

const TraceabilityStreamComponent: React.FC<TraceabilityStreamProps> = ({
  stream,
  allActivityLogs,
  onActivityLogClick,
  onExportClick,
  onEditStream,
  onDeleteStream,
  onSectionSave,
  onSectionDelete,
}) => {
  const [sectionServiceLoaded, setSectionServiceLoaded] = useState(false);
  useEffect(() => {
    // Initialize the singleton instance with the current stream data
    const sectionService = SectionService.getInstance(stream.sections, '1223', stream.id as string, '22255');
    console.log('Initialized Sections:', sectionService.getSections());

    setSectionServiceLoaded(true);
    // Cleanup on unmount: reset the singleton instance
    return () => {
      SectionService.resetInstance();
      console.log('SectionService instance has been reset');
    };
  }, [stream]);
  return (
    <React.Fragment key={stream.id}>
      <div className="stream-card">
        <div className="flex w-full flex-row justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-[var(--primary-color)]">Name:</h1>
            <p className="text-base text-gray-500">{stream.friendlyName}</p>

            <h1 className="text-xl font-bold text-[var(--primary-color)]">Product:</h1>
            <p className="text-base text-gray-500">{stream.product}</p>

            <h1 className="text-xl font-bold text-[var(--primary-color)]">Quantity:</h1>
            <p className="text-base text-gray-500">{stream.quantity}</p>
          </div>
          <div className="flex max-h-14">
            <button
              disabled={!allActivityLogs?.length}
              className="mb-2 rounded bg-[var(--primary-button)] px-4 py-2 font-bold text-white hover:bg-[var(--primary-button-hover)]"
              onClick={() => onActivityLogClick('FileUpload', stream.id as string)}
            >
              <FaHistory />
            </button>

            <button
              className="ml-2 rounded bg-[var(--primary-button)] px-4 py-2 font-bold text-white hover:bg-[var(--primary-button-hover)]"
              onClick={() => onExportClick(stream)}
            >
              <FaFileExport />
            </button>

            <button
              className="ml-2 rounded bg-[var(--primary-button)] px-4 py-2 font-bold text-white hover:bg-[var(--primary-button-hover)]"
              onClick={() => onEditStream(stream, 'edit')}
            >
              <FaPencilAlt />
            </button>

            <button
              className="ml-2 rounded bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-500"
              onClick={() => onDeleteStream(stream)}
            >
              <FaTrash />
            </button>
          </div>
        </div>

        <div className="section-container">
          {stream.sections.map((section, secIndex) => (
            <React.Fragment key={section.sectionId}>
              <div className="section-wrapper">
                <SectionComponent
                  serviceLoaded={sectionServiceLoaded}
                  section={section}
                  onSectionSave={onSectionSave}
                  onDelete={onSectionDelete}
                />
                {secIndex < stream.sections.length - 1 && (
                  <svg
                    className="section-arrow"
                    width="9"
                    height="15"
                    viewBox="0 0 9 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 2L7.5 7.5L2 13"
                      stroke="#8D8D8D"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Add New Section Button */}
        <div className="add-new-section" onClick={() => {}}>
          <button className="add-new-section-button">+ Add New Section</button>
        </div>
      </div>
    </React.Fragment>
  );
};

export default TraceabilityStreamComponent;

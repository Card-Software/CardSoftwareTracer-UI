import React, { use, useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTrash } from 'react-icons/fa';
import SectionModal from '@/components/modals/section-modal.component'; // Import the section modal
import { Section as SectionModel } from '@/models/section';
import '../../styles/components/traceability/section.css';
import { SectionService } from '@/services/sections.service';

interface SectionComponentProps {
  serviceLoaded: boolean;
  section: SectionModel;
  onSectionSave: (updatedSection: SectionModel) => void;
  onDelete: (section: SectionModel) => void;
}

const SectionComponent: React.FC<SectionComponentProps> = ({ serviceLoaded, section, onSectionSave, onDelete }) => {
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const sectionService = React.useRef<SectionService | null>(null);

  const handleSectionClick = () => {
    setIsSectionModalOpen(true);
    sectionService.current?.setEditingSection(section.sectionId);
  };

  const handleSaveSection = () => {
    setIsSectionModalOpen(false);
  };

  useEffect(() => {
    if (serviceLoaded) {
      sectionService.current = SectionService.getInstance();
    }
  }, [serviceLoaded]);

  return (
    <>
      <div
        className={`section-card ${section.isRequired ? 'section-required' : 'section-not-required'}`}
        onClick={handleSectionClick}
      >
        <div className="section-header">
          <div className="section-info">
            <strong>Section Name</strong>
            <p className="text-base text-gray-500">{section.sectionName}</p>
          </div>
          <div className="section-actions">
            {section.files.length > 0 ? <FaCheckCircle color="#0080fc" /> : <FaExclamationCircle color="red" />}
            <button
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering section click
                onDelete(section); // Call delete handler passed from parent
              }}
            >
              <FaTrash color="gray" />
            </button>
          </div>
        </div>

        <div className="card-details">
          <div className="section-description">
            <strong>Description</strong>
            <p className="text-base text-gray-500">{section.sectionDescription}</p>
          </div>

          {section.assignedUser && (
            <div className="detail-item">
              <strong>Assigned to:</strong> {section.assignedUser.firstName} {section.assignedUser.lastname}
            </div>
          )}

          {section.notes && section.notes.length > 0 && (
            <div className="detail-item">
              <strong>Notes:</strong>
              <ul>
                {section.notes.map((note) => (
                  <li key={note.id}>{note.content}</li>
                ))}
              </ul>
            </div>
          )}

          {section.teamLabels && section.teamLabels.length > 0 && (
            <div className="detail-item">
              <strong>Labels:</strong>
              <ul className="flex gap-2">
                {section.teamLabels.map((label) => (
                  <li key={label.id} className="label-item">
                    {label.labelName}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {isSectionModalOpen && (
        <SectionModal
          isOpen={isSectionModalOpen}
          onClose={() => setIsSectionModalOpen(false)}
          onSave={handleSaveSection}
          mode={'edit'}
        />
      )}
    </>
  );
};

export default SectionComponent;
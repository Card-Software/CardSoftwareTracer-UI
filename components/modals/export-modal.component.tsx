import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import LoadingOverlay from '../loading-overlay.component';
import { TracerStreamExtended } from '@/models/tracer-stream';
import { Section } from '@/models/section';
import { TeamLabel } from '@/models/team-label';
import BaseModal from '../_base/base-modal.component';
import TracerButton from '../tracer-button.component';

interface ExportModalProps {
  stream: TracerStreamExtended;
  isOpen: boolean;
  onClose: () => void;
  onExport: (selectedSections: Section[]) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  stream,
  onClose,
  onExport,
}) => {
  // #region States
  const [loading, setLoading] = useState(false);
  const [selectedSections, setSelectedSections] = useState<Section[]>([]);
  const [teamLabels, setTeamLabels] = useState<TeamLabel[]>([]);
  const [selectedTeamLabels, setSelectedTeamLabels] = useState<string[]>([]);
  // #endregion

  //#region UseEffect
  useEffect(() => {
    const sectionsWithFiles = stream.sections.filter(
      (section) => section.files.length > 0,
    );
    setSelectedSections(sectionsWithFiles);

    const labels = sectionsWithFiles.flatMap((section) => section.teamLabels);
    const distinctLabels = Array.from(
      new Set(labels.map((label) => label.id)),
    ).map((id) => labels.find((label) => label.id === id));
    setTeamLabels(distinctLabels as TeamLabel[]);
  }, [stream]);

  useEffect(() => {
    const sectionsWithSelectedLabels = stream.sections.filter((section) =>
      section.teamLabels.some((label) =>
        selectedTeamLabels.includes(label.id as string),
      ),
    );
    setSelectedSections(sectionsWithSelectedLabels);
  }, [selectedTeamLabels, stream.sections]);
  //#endregion

  // #region Handlers
  const handleSectionChange = (section: Section) => {
    setSelectedSections((prevSelected) =>
      prevSelected.includes(section)
        ? prevSelected.filter((s) => s !== section)
        : [...prevSelected, section],
    );
  };

  const handleTeamLabelChange = (teamLabel: TeamLabel) => {
    setSelectedTeamLabels((prevSelected) =>
      prevSelected.includes(teamLabel.id)
        ? prevSelected.filter((id) => id !== teamLabel.id)
        : [...prevSelected, teamLabel.id],
    );
  };

  const handleSelectAll = () => {
    setSelectedSections(
      stream.sections.filter((section) => section.files.length > 0),
    );
  };

  const handleDeselectAll = () => {
    setSelectedSections([]);
  };

  const handleExport = () => {
    setLoading(false);
    onExport(selectedSections);
  };
  // #endregion

  return (
    <BaseModal
      onClose={onClose}
      onSave={() => handleExport()}
      canSave={selectedSections.length > 0}
      isOpen={isOpen}
      loading={loading}
      title="Export"
    >
      <div className="tool-bar-buttons">
        <TracerButton onClick={handleSelectAll} name="Select All" />
        <button
          onClick={handleDeselectAll}
          className="rounded bg-red-500 text-white "
        >
          Deselect All
        </button>
      </div>
      <div className="mt-4">
        <h3>Sections</h3>
        {stream.sections.map((section) =>
          section.files.length > 0 ? (
            <div
              key={section.sectionId}
              className="flex items-center space-x-2"
            >
              <input
                type="checkbox"
                checked={selectedSections.includes(section)}
                onChange={() => handleSectionChange(section)}
              />
              <span>{section.sectionName}</span>
            </div>
          ) : null,
        )}
      </div>
      <div className="mt-4">
        <h3>Labels</h3>
        {teamLabels.map((label) => (
          <div key={label.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedTeamLabels.includes(label.id)}
              onChange={() => handleTeamLabelChange(label)}
            />
            <span>{label.labelName}</span>
          </div>
        ))}
      </div>
    </BaseModal>
  );
};

export default ExportModal;

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import LoadingOverlay from '../loading-overlay.component';
import { TracerStreamExtended } from '@/models/tracer-stream';
import { Section } from '@/models/section';
import { TeamLabel } from '@/models/team-label';

interface ExportModalProps {
  stream: TracerStreamExtended;
  onClose: () => void;
  onExport: (selectedSections: Section[]) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({
  stream,
  onClose,
  onExport,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedSections, setSelectedSections] = useState<Section[]>([]);
  const [teamLabels, setTeamLabels] = useState<TeamLabel[]>([]);
  const [selectedTeamLabels, setSelectedTeamLabels] = useState<string[]>([]);

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

  useEffect(() => {
    const sectionsWithSelectedLabels = stream.sections.filter((section) =>
      section.teamLabels.some((label) => selectedTeamLabels.includes(label.id)),
    );
    setSelectedSections(sectionsWithSelectedLabels);
  }, [selectedTeamLabels, stream.sections]);

  return (
    <ModalWrapper className="open">
      <LoadingOverlay show={loading} />
      <ModalOverlay onClick={onClose} />
      <ModalContent>
        <ModalHeader>
          <h1>Select Sections to Export</h1>
          <button onClick={onClose} className="close-button">
            <FaTimes size={24} />
          </button>
        </ModalHeader>
        <ModalBody>
          <div className="flex items-center justify-between">
            <Button onClick={handleSelectAll}>Select All</Button>
            <button
              onClick={handleDeselectAll}
              className="rounded bg-red-500 px-4 py-2 text-white"
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
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleExport}>Export</Button>
          <CancelButton
            className="bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            onClick={onClose}
          >
            Close
          </CancelButton>
        </ModalFooter>
      </ModalContent>
    </ModalWrapper>
  );
};

export default ExportModal;

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

  .section-name {
    flex: 1;
    font-size: 17px;
    margin-right: 10px;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
    color: #2d3748;
  }
`;

const ModalBody = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;

  .tracer-stream-name {
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    font-size: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
  }

  .section-description {
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    font-size: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
  }

  h3 {
    margin-top: 20px;
    font-size: 18px;
    color: #4a5568;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      padding: 10px 0;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
`;

const ModalFooter = styled.div`
  padding: 20px;
  background: #2d3748;
  text-align: right;
  border-bottom-left-radius: 8px;

  button:not(:last-child) {
    margin-right: 10px;
  }
`;

const Button = styled.button`
  background: rgb(15 118 110);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 10px;

  &:hover {
    background: rgb(13 148 136);
  }
`;

const CancelButton = styled.button`
  background: #6b7280; /* bg-gray-500 */
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 10px;

  &:hover {
    background: #4b5563; /* hover:bg-gray-600 */
  }
`;

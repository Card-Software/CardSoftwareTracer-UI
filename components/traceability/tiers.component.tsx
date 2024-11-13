import React, { useState } from 'react';
import TraceabilityStreamComponent from './traceability-stream.component'; // Import your tracer stream component
import { Section } from '@/models/section';
import { Tier } from '@/models/tier';
import { TracerStreamExtended } from '@/models/tracer-stream';
import '../../styles/components/traceability/tiers.css';

interface TiersComponentProps {
  tiers: Tier[]; // List of tiers
}

const TiersComponent: React.FC<TiersComponentProps> = ({ tiers }) => {
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null); // Store the selected tier

  const handleTierClick = (tier: Tier) => {
    setSelectedTier(tier); // Set the clicked tier
  };

  const handleCloseDetails = () => {
    setSelectedTier(null); // Close the details view
  };

  return (
    <div className="tiers-container">
      <div className="tiers-grid">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`tier-card ${selectedTier?.id === tier.id ? 'selected-tier' : ''}`} // Add 'selected-tier' class when the tier is selected
            onClick={() => handleTierClick(tier)}
          >
            <h3 className="tier-name">{tier.tierInfo.name}</h3>
            <p className="tier-description">{tier.tierInfo.description}</p>
          </div>
        ))}
      </div>

      {selectedTier && (
        <div className={`tier-details-expanded ${selectedTier ? 'open' : ''}`}>
          <button onClick={handleCloseDetails} className="close-details">
            Close
          </button>
          <div>{selectedTier.stream.friendlyName}</div>

          {selectedTier.stream ? (
            <TraceabilityStreamComponent
              stream={selectedTier.stream}
              allActivityLogs={[]}
              onActivityLogClick={function (activityType: string, streamId: string): void {
                throw new Error('Function not implemented.');
              }}
              onExportClick={function (stream: TracerStreamExtended): void {
                throw new Error('Function not implemented.');
              }}
              onEditStream={function (stream: TracerStreamExtended, mode: 'edit' | 'add'): void {
                throw new Error('Function not implemented.');
              }}
              onDeleteStream={function (stream: TracerStreamExtended): void {
                throw new Error('Function not implemented.');
              }}
              onSectionSave={function (updatedSection: Section): void {
                throw new Error('Function not implemented.');
              }}
              onSectionDelete={function (section: Section): void {
                throw new Error('Function not implemented.');
              }}
            /> // Show tracer stream if present
          ) : (
            <div className="tier-info">
              {/* Show connected tier details */}
              <h2>{selectedTier.tierInfo.name}</h2>
              <p>{selectedTier.tierInfo.description}</p>
              {/* You can load more details here */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TiersComponent;

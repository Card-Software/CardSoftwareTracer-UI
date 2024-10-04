import { useRouter } from 'next/router';
import { TeamLabel } from '@/models/team-label';
import { useEffect, useRef, useState } from 'react';
import { teamLabelProxy } from '@/proxies/team-label.proxy';
import { userAuthenticationService } from '@/services/user-authentication.service';
import LoadingOverlay from '@/components/loading-overlay.component';
import '@/styles/traceability-stream.css';
import { HiPlus } from 'react-icons/hi';
import TracerButton from '@/components/tracer-button.component';
import Layout from '@/app/layout';

const TeamLabels = () => {
  const router = useRouter();
  const [teamLabels, setTeamLabels] = useState<TeamLabel[]>([]);
  const [filteredTeamLabels, setFilteredTeamLabels] = useState<TeamLabel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasPageBeenRendered = useRef({ allTeamLabelsLoaded: false });

  useEffect(() => {
    const organization = userAuthenticationService.getOrganization();
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (organization) {
          const data = await teamLabelProxy.getTeamLabelsByOrganizationName(
            organization.name,
          );
          setTeamLabels(data);
          setFilteredTeamLabels(data);
        } else {
          console.error('Organization is null');
        }
      } catch (error) {
        console.error('Failed to fetch team labels', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!hasPageBeenRendered.current.allTeamLabelsLoaded) {
      hasPageBeenRendered.current.allTeamLabelsLoaded = true;
      fetchData();
    }
  }, []);

  const handleAddLabel = () => {
    router.push('/team-labels/details');
  };

  const handleLabelClick = (id: string) => {
    router.push(`/team-labels/details?id=${id}`);
  };

  return (
    <Layout>
      <LoadingOverlay show={isLoading} />
      <div className="tool-bar">
        <div className="tool-bar-title">
          <h1 className="text-3xl font-bold text-[var(--primary-color)]">
            Team Labels
          </h1>
        </div>
        <div className="tool-bar-buttons">
          <TracerButton
            name="Add Label"
            icon={<HiPlus />}
            onClick={handleAddLabel}
          />
        </div>
      </div>

      <div
        className="my-4 w-full border-b-4"
        style={{ borderColor: 'var(--primary-color)' }}
      ></div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTeamLabels.map((teamLabel) => (
          <div
            key={teamLabel.id}
            className="cursor-pointer rounded-lg border border-gray-300 p-4 shadow-md"
            onClick={() => handleLabelClick(teamLabel.id)}
          >
            <h2 className="text-lg font-bold text-gray-700">
              {teamLabel.labelName}
            </h2>
            <p className="text-sm text-gray-500">
              Owner: {teamLabel.owner.name}
            </p>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default TeamLabels;

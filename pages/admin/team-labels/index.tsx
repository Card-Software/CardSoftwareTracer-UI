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
    router.push('/team-labels/add');
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

      <div className="flex flex-row items-start justify-start">
        <div className="w-full overflow-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-400 text-white">
                <th className="border-b border-gray-300 px-4 py-2">
                  Label Name
                </th>
                <th className="border-b border-gray-300 px-4 py-2">Owner</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeamLabels.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="border-b border-gray-300 px-4 py-2 text-center"
                  >
                    No Team Labels Found
                  </td>
                </tr>
              ) : (
                filteredTeamLabels.map((teamLabel, index) => (
                  <tr
                    key={teamLabel.id}
                    className={`cursor-pointer ${
                      index % 2 === 0 ? 'bg-gray-100' : 'bg-white'
                    } hover:bg-gray-200`}
                    onClick={() =>
                      router.push(`/team-labels/details?id=${teamLabel.id}`)
                    }
                  >
                    <td className="border-b border-gray-300 px-4 py-2">
                      {teamLabel.labelName}
                    </td>
                    <td className="border-b border-gray-300 px-4 py-2 text-center">
                      {teamLabel.owner.name}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default TeamLabels;

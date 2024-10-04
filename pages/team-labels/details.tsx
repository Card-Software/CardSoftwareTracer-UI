import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { teamLabelProxy } from '@/proxies/team-label.proxy';
import Layout from '@/app/layout';
import LoadingOverlay from '@/components/loading-overlay.component';
import TracerButton from '@/components/tracer-button.component';
import { TeamLabel } from '@/models/team-label';
import { HiCheck } from 'react-icons/hi';

const TeamLabelDetails = () => {
  const router = useRouter();
  const { id } = router.query;  // Esto obtiene el ID desde la URL
  const [teamLabel, setTeamLabel] = useState<TeamLabel>({
    id: '',
    checked: false,
    timeChecked: new Date(),
    labelName: '',
    owner: { id: '', name: '' },
  });
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!id;  // Si existe un ID, estamos en modo de edición

  // Cargar el label si estamos en modo de edición
  useEffect(() => {
    const fetchTeamLabel = async () => {
      if (isEditMode && id) {
        setIsLoading(true);
        try {
          const data = await teamLabelProxy.getTeamLabelById(id as string);
          setTeamLabel(data);
        } catch (error) {
          console.error('Error fetching team label:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchTeamLabel();
  }, [id, isEditMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTeamLabel({ ...teamLabel, [name]: value });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (isEditMode) {
        // Lógica de actualización
        await teamLabelProxy.updateTeamLabel(teamLabel.id, teamLabel);
      } else {
        // Lógica de creación
        await teamLabelProxy.createTeamLabel(teamLabel);
      }
      router.push('/team-labels');  // Redirige al índice de Team Labels
    } catch (error) {
      console.error('Error saving team label:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <LoadingOverlay show={isLoading} />
      <div className="my-4">
        <h1 className="text-3xl font-bold text-[var(--primary-color)]">
          {isEditMode ? 'Edit Team Label' : 'Create New Team Label'}
        </h1>
      </div>
      <div className="my-4">
        <label className="block text-sm font-medium text-gray-700">Label Name</label>
        <input
          type="text"
          name="labelName"
          value={teamLabel.labelName}
          onChange={handleInputChange}
          className="input-custom"
        />
      </div>
      <div className="my-4">
        <label className="block text-sm font-medium text-gray-700">Owner Name</label>
        <input
          type="text"
          name="owner.name"
          value={teamLabel.owner.name}
          onChange={handleInputChange}
          className="input-custom"
        />
      </div>
      <div className="my-4">
        <TracerButton
          name={isEditMode ? 'Update Label' : 'Create Label'}
          icon={<HiCheck />}
          onClick={handleSubmit}
        />
      </div>
    </Layout>
  );
};

export default TeamLabelDetails;

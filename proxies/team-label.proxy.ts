import { TeamLabel } from '@/models/team-label';
import axiosInstance from '@/utils/axiosInstance';
class TeamLabelProxy {
  private controller = 'TeamLabel';

  //get all team labels by organization name
  async getTeamLabelsByOrganizationName(
    organizationName: string,
  ): Promise<TeamLabel[]> {
    try {
      const response = await axiosInstance.get(
        `${this.controller}/organization/${organizationName}`,
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const teamLabelProxy = new TeamLabelProxy();

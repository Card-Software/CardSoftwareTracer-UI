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

  async createTeamLabel(teamLabel: TeamLabel): Promise<TeamLabel> {
    try {
      const response = await axiosInstance.post(
        `${this.controller}`,
        teamLabel,
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // En el teamLabelProxy
  async getTeamLabelById(id: string): Promise<TeamLabel> {
    try {
      const response = await axiosInstance.get(`/TeamLabel/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team label:', error);
      throw error;
    }
  }

  async updateTeamLabel(
    id: string,
    updatedTeamLabel: TeamLabel,
  ): Promise<void> {
    try {
      await axiosInstance.put(`${this.controller}/${id}`, updatedTeamLabel);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteTeamLabel(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${this.controller}/${id}`);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const teamLabelProxy = new TeamLabelProxy();

import { TeamStatus } from '@/models/team-status';
import axiosInstance from '@/utils/axiosInstance';
class TeamStatusProxy {
  private controller = 'TeamStatus';

  async getAllTeamStatus(): Promise<TeamStatus[]> {
    try {
      const response = await axiosInstance.get(`${this.controller}/all`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTeamStatusById(id: string): Promise<TeamStatus> {
    try {
      const response = await axiosInstance.get(`${this.controller}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team status:', error);
      throw error;
    }
  }

  async createTeamStatus(teamStatus: TeamStatus): Promise<TeamStatus> {
    try {
      const response = await axiosInstance.post(
        `${this.controller}`,
        teamStatus,
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updateTeamStatus(
    id: string,
    updatedTeamStatus: TeamStatus,
  ): Promise<void> {
    try {
      await axiosInstance.put(`${this.controller}/${id}`, updatedTeamStatus);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteTeamStatus(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${this.controller}/${id}`);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const teamStatusProxy = new TeamStatusProxy();

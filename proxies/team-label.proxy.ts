import { TeamLabel } from '@/models/team-label';

class TeamLabelProxy {
  private baseUrl = process.env.NEXT_PUBLIC_TRACER_APP_API_URL || '';

  private controller = 'TeamLabel';

  //get all team labels by organization name
  async getTeamLabelsByOrganizationName(
    organizationName: string,
  ): Promise<TeamLabel[]> {
    const response = await fetch(
      `${this.baseUrl}${this.controller}/organization/${organizationName}`,
    );
    return await response.json();
  }

  //get by id
  async getById(id: string): Promise<TeamLabel> {
    const response = await fetch(`${this.baseUrl}${this.controller}/${id}`);
    return await response.json();
  }

  //create team label
  async createTeamLabel(teamLabel: TeamLabel): Promise<TeamLabel> {
    const response = await fetch(`${this.baseUrl}${this.controller}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamLabel),
    });
    return await response.json();
  }

  //update team label
  async updateTeamLabel(id: string, teamLabel: TeamLabel): Promise<TeamLabel> {
    const response = await fetch(`${this.baseUrl}${this.controller}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamLabel),
    });
    return await response.json();
  }

  //delete team label
  async deleteTeamLabel(id: string): Promise<void> {
    await fetch(`${this.baseUrl}${this.controller}/${id}`, {
      method: 'DELETE',
    });
  }
}

export const teamLabelProxy = new TeamLabelProxy();

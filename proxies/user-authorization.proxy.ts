import { Group } from '@/models/group';
import axiosInstance from '@/utils/axiosInstance';
class UserAuthorizationProxy {
  private controller = 'GroupsController';

  async getAllGroups(ownerRef: string): Promise<Group[]> {
    try {
      const response = await axiosInstance.get(
        `${this.controller}/${ownerRef}/all`,
      );
      return response.data;
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  }

  async updateGroup(id: string, updatedGroup: Group): Promise<void> {
    try {
      await axiosInstance.put(`${this.controller}/${id}`, updatedGroup);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createGroup(group: Group): Promise<Group> {
    try {
      const response = await axiosInstance.post(`${this.controller}`, group);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const userAuthorizationProxy = new UserAuthorizationProxy();

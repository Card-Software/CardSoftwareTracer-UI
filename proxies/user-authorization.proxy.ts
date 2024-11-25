import { Group } from '@/models/group';
import axiosInstance from '@/utils/axiosInstance';
class UserAuthorizationProxy {
  private controller = 'GroupsController';

  async getAllGroups(ownerRef: string): Promise<Group[]> {
    try {
      const response = await axiosInstance.get(`${this.controller}/all`);
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

  async getGroupById(id: string): Promise<Group> {
    try {
      const response = await axiosInstance.get(`${this.controller}/${id}`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteGroup(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${this.controller}/${id}`);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const userAuthorizationProxy = new UserAuthorizationProxy();

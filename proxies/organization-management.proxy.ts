import { Organization } from '@/models/organization';
import { User } from '@/models/user';
import axiosInstance from '@/utils/axiosInstance';

class OrganizationManagementProxy {
  private baseUrl = process.env.NEXT_PUBLIC_TRACER_APP_API_URL;

  //#region
  // Organization controller
  async GetOrganization(id: string): Promise<Organization> {
    try {
      const response = await axiosInstance.get(
        `OrganizationController/get/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  //#endregion

  //#region
  // User controller

  async GetUser(id: string): Promise<User> {
    try {
      const response = await axiosInstance.get(`UserController/get/${id}`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async UpdateUser(user: User): Promise<User> {
    try {
      const response = await axiosInstance.put(
        `UserController/update/${user.id}`,
        user,
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async GetAllUsers(): Promise<User[]> {
    try {
      const response = await axiosInstance.get('UserController/all');
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const organizationManagementProxy = new OrganizationManagementProxy();

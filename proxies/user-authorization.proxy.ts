import { Group } from '@/models/group';
import axiosInstance from '@/utils/axiosInstance';
class UserAuthorizationProxy {
  private baseUrl: string = process.env.NEXT_PUBLIC_TRACER_APP_API_URL || '';

  async getAllGroups(ownerRef: string): Promise<Group[]> {
    try {
      const response = await axiosInstance.get(`GroupsController/${ownerRef}/all`);
      return response.data;
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  }
}

export const userAuthorizationProxy = new UserAuthorizationProxy();

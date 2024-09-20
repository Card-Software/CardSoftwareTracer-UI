import { User } from '@/models/user';
import axiosInstance from '@/utils/axiosInstance';
class UserProxy {
  private baseUrl: string = process.env.NEXT_PUBLIC_TRACER_APP_API_URL || '';

  async updateUser(user: User): Promise<void> {
    try {
      const response = await axiosInstance.put(
        `UserController/update/${user.id}`,
        user,
      );
      return response.data;
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  }
}

export const userProxy = new UserProxy();

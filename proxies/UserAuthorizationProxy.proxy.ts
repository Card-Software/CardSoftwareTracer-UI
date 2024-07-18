import { Group } from '@/models/Group';
import { S3ObjectDto } from '@/models/S3ObjectDto';

class UserAuthorizationProxy {
  private baseUrl: string = process.env.NEXT_PUBLIC_TRACER_APP_API_URL || '';
  private deployedUrl: string =
    process.env.NEXT_PUBLIC_TRACER_APP_API_URL_DEPLOYED || '';

  async getAllGroups(ownerRef: string): Promise<Group[]> {
    const response = await fetch(
      `${this.deployedUrl}GroupsController/${ownerRef}/all`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    const data = await response.json();
    return data;
  }
}

export const userAuthorizationProxy = new UserAuthorizationProxy();
